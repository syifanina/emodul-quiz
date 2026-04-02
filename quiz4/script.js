// ─────────────────────────────────────────────
//  QUIZ 4 — Drag-and-Drop (Mouse + Touch)
//  Touch scroll fix: listeners registered with
//  { passive: false } so preventDefault() works.
// ─────────────────────────────────────────────

// ── STATE ──
let draggedWordId    = null;
let draggedWordText  = null;
let draggedWordColor = null;

const dropZoneMap = {}; // { dropZoneId → { wordId, color } }

// ── TOUCH STATE ──
let touchGhost          = null;
let touchDragWordId     = null;
let touchDragWordText   = null;
let touchDragWordColor  = null;
let touchSourceDropZone = null;  // zone id if dragging FROM a filled zone
let isDragging          = false; // true while a touch-drag is active


// ─────────────────────────────────────────────
//  BOOTSTRAP — register all listeners after DOM ready
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

    // -- Word chips: touchstart with { passive: false } --
    document.querySelectorAll('.word-chip:not(.chip-disabled)').forEach(function (chip) {
        chip.addEventListener('touchstart', onChipTouchStart, { passive: false });
    });

    // -- Filled drop zones: touchstart (registered dynamically in placeWordInZone) --

    // -- Document-level: touchmove blocks scroll only while drag active --
    document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });

    // -- Document-level: touchend to finalize drop --
    document.addEventListener('touchend', onDocumentTouchEnd, { passive: false });

});


// ─────────────────────────────────────────────
//  MOUSE DRAG EVENTS
// ─────────────────────────────────────────────

function dragStart(event) {
    const el = event.currentTarget;
    draggedWordId    = el.id;
    draggedWordText  = el.textContent.trim();
    draggedWordColor = el.dataset.color || '#c8c8c8';
    el.classList.add('dragging');

    event.dataTransfer.setData('text/plain', draggedWordText);
    event.dataTransfer.setData('wordId',     draggedWordId);
    event.dataTransfer.setData('wordColor',  draggedWordColor);
    event.dataTransfer.effectAllowed = 'move';
}

function allowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
    event.dataTransfer.dropEffect = 'move';
}

function dropWord(event) {
    event.preventDefault();
    const zone      = event.currentTarget;
    zone.classList.remove('drag-over');

    const wordText  = event.dataTransfer.getData('text/plain');
    const wordId    = event.dataTransfer.getData('wordId');
    const wordColor = event.dataTransfer.getData('wordColor') || '#c8c8c8';
    if (!wordText) return;

    returnWordFromZone(zone.id);
    returnWordFromZoneByWordId(wordId);
    placeWordInZone(zone, wordText, wordId, wordColor);
    markChipUsed(wordId, true);

    if (draggedWordId) {
        const chip = document.getElementById(draggedWordId);
        if (chip) chip.classList.remove('dragging');
    }
    draggedWordId = draggedWordText = draggedWordColor = null;
    clearFeedback();
}

/** Drag out of a filled zone back to somewhere else */
function dragFromZone(event) {
    const zone      = event.currentTarget;
    const span      = zone.querySelector('.dropped-word');
    const wordText  = span ? span.textContent.trim() : '';
    const wordId    = zone.dataset.wordId   || '';
    const wordColor = zone.dataset.wordColor || '#c8c8c8';

    draggedWordId    = wordId;
    draggedWordText  = wordText;
    draggedWordColor = wordColor;

    event.dataTransfer.setData('text/plain', wordText);
    event.dataTransfer.setData('wordId',     wordId);
    event.dataTransfer.setData('wordColor',  wordColor);
    event.dataTransfer.effectAllowed = 'move';

    clearDropZone(zone);
    markChipUsed(wordId, false);
    clearFeedback();
}

document.addEventListener('dragleave', function (e) {
    if (e.target.classList && e.target.classList.contains('drop-zone'))
        e.target.classList.remove('drag-over');
});

document.addEventListener('dragend', function (e) {
    if (e.target.classList && e.target.classList.contains('word-chip'))
        e.target.classList.remove('dragging');
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    draggedWordId = draggedWordText = draggedWordColor = null;
});


// ─────────────────────────────────────────────
//  TOUCH EVENTS  (passive: false — must be
//  registered via addEventListener, not inline)
// ─────────────────────────────────────────────

function onChipTouchStart(event) {
    const el = event.currentTarget;
    if (el.classList.contains('used') || el.classList.contains('chip-disabled')) return;

    touchDragWordId     = el.id;
    touchDragWordText   = el.textContent.trim();
    touchDragWordColor  = el.dataset.color || '#c8c8c8';
    touchSourceDropZone = null;
    isDragging          = true;

    el.classList.add('dragging');
    createTouchGhost(touchDragWordText, touchDragWordColor);
    moveTouchGhost(event.touches[0]);

    // Prevent page scroll while drag starts
    event.preventDefault();
}

function onFilledZoneTouchStart(event) {
    const zone = event.currentTarget;
    if (!zone.classList.contains('filled')) return;

    const span          = zone.querySelector('.dropped-word');
    touchDragWordText   = span ? span.textContent.trim() : '';
    touchDragWordId     = zone.dataset.wordId   || '';
    touchDragWordColor  = zone.dataset.wordColor || '#c8c8c8';
    touchSourceDropZone = zone.id;
    isDragging          = true;

    createTouchGhost(touchDragWordText, touchDragWordColor);
    moveTouchGhost(event.touches[0]);

    event.preventDefault();
}

function onDocumentTouchMove(event) {
    if (!isDragging) return;   // allow normal page scroll when not dragging
    event.preventDefault();    // block scroll during drag

    moveTouchGhost(event.touches[0]);

    // Highlight target zone under finger
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    const zoneUnder = getDropZoneUnderTouch(event.touches[0]);
    if (zoneUnder) zoneUnder.classList.add('drag-over');
}

function onDocumentTouchEnd(event) {
    if (!isDragging) return;

    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    removeTouchGhost();

    const touch     = event.changedTouches[0];
    const zoneUnder = getDropZoneUnderTouch(touch);

    if (zoneUnder) {
        // Something was already in the target — return it first
        returnWordFromZone(zoneUnder.id);

        if (touchSourceDropZone) {
            // Dragged from a filled zone → clear source zone
            clearDropZone(document.getElementById(touchSourceDropZone));
        } else {
            // Dragged from word bank → mark chip used
            markChipUsed(touchDragWordId, true);
        }

        placeWordInZone(zoneUnder, touchDragWordText, touchDragWordId, touchDragWordColor);

    } else {
        // Dropped on nothing → return word to bank
        if (touchSourceDropZone) {
            clearDropZone(document.getElementById(touchSourceDropZone));
        }
        markChipUsed(touchDragWordId, false);
    }

    // Clean up chip dragging style
    if (touchDragWordId) {
        const chip = document.getElementById(touchDragWordId);
        if (chip) chip.classList.remove('dragging');
    }

    touchDragWordId = touchDragWordText = touchDragWordColor = null;
    touchSourceDropZone = null;
    isDragging = false;
    clearFeedback();
}


// ─────────────────────────────────────────────
//  GHOST ELEMENT
// ─────────────────────────────────────────────

function createTouchGhost(text, color) {
    let ghost = document.getElementById('touch-ghost');
    if (!ghost) {
        ghost = document.createElement('div');
        ghost.id = 'touch-ghost';
        document.body.appendChild(ghost);
    }
    ghost.textContent    = text;
    ghost.style.background = color || '#fff9c4';
    ghost.style.display  = 'block';
    touchGhost = ghost;
}

function moveTouchGhost(touch) {
    if (!touchGhost) return;
    touchGhost.style.left = (touch.clientX - 60) + 'px';
    touchGhost.style.top  = (touch.clientY - 24) + 'px';
}

function removeTouchGhost() {
    const g = document.getElementById('touch-ghost');
    if (g) g.style.display = 'none';
    touchGhost = null;
}

function getDropZoneUnderTouch(touch) {
    for (const zone of document.querySelectorAll('.drop-zone')) {
        const r = zone.getBoundingClientRect();
        if (touch.clientX >= r.left && touch.clientX <= r.right &&
            touch.clientY >= r.top  && touch.clientY <= r.bottom) {
            return zone;
        }
    }
    return null;
}


// ─────────────────────────────────────────────
//  ZONE HELPERS
// ─────────────────────────────────────────────

function placeWordInZone(zone, wordText, wordId, wordColor) {
    zone.classList.add('filled');
    zone.classList.remove('correct', 'incorrect', 'drag-over');
    zone.dataset.wordId    = wordId;
    zone.dataset.wordColor = wordColor;
    zone.style.background  = wordColor || '#c8c8c8';
    zone.style.borderColor = '';

    zone.innerHTML = '';
    const span = document.createElement('span');
    span.className   = 'dropped-word';
    span.textContent = wordText;
    zone.appendChild(span);

    // Mouse: allow dragging back out
    zone.setAttribute('draggable', 'true');
    zone.setAttribute('ondragstart', 'dragFromZone(event)');

    // Touch: allow dragging back out
    zone.removeEventListener('touchstart', onFilledZoneTouchStart);
    zone.addEventListener('touchstart', onFilledZoneTouchStart, { passive: false });

    dropZoneMap[zone.id] = { wordId, wordColor };
}

function returnWordFromZone(zoneId) {
    const entry = dropZoneMap[zoneId];
    if (!entry) return;
    const zone = document.getElementById(zoneId);
    if (zone) clearDropZone(zone);
    markChipUsed(entry.wordId, false);
    delete dropZoneMap[zoneId];
}

function returnWordFromZoneByWordId(wordId) {
    for (const [zoneId, entry] of Object.entries(dropZoneMap)) {
        if (entry.wordId === wordId) {
            const zone = document.getElementById(zoneId);
            if (zone) clearDropZone(zone);
            delete dropZoneMap[zoneId];
            break;
        }
    }
}

function clearDropZone(zone) {
    zone.classList.remove('filled', 'correct', 'incorrect', 'drag-over');
    zone.removeAttribute('draggable');
    zone.removeAttribute('ondragstart');
    zone.removeEventListener('touchstart', onFilledZoneTouchStart);
    delete zone.dataset.wordId;
    delete zone.dataset.wordColor;
    zone.style.background  = '';
    zone.style.borderColor = '';
    zone.innerHTML         = '';
    if (dropZoneMap[zone.id]) delete dropZoneMap[zone.id];
}

function markChipUsed(wordId, used) {
    if (!wordId) return;
    const chip = document.getElementById(wordId);
    if (!chip) return;
    if (used) chip.classList.add('used');
    else      chip.classList.remove('used', 'dragging');
}


// ─────────────────────────────────────────────
//  CHECK & RESET
// ─────────────────────────────────────────────

function checkAnswers() {
    const zones = document.querySelectorAll('.drop-zone[data-answer]');
    let correct = 0;
    const total = zones.length;

    zones.forEach(zone => {
        if (!zone.classList.contains('filled')) return;
        const expected = (zone.dataset.answer || '').toLowerCase().trim();
        const placed   = zone.querySelector('.dropped-word')
            ? zone.querySelector('.dropped-word').textContent.toLowerCase().trim()
            : '';

        if (placed === expected) {
            zone.classList.add('correct');
            zone.classList.remove('incorrect');
            zone.style.background = '#c8e6c9';
            correct++;
        } else {
            zone.classList.add('incorrect');
            zone.classList.remove('correct');
            zone.style.background = '#ffcdd2';
        }
    });

    const filled = Object.keys(dropZoneMap).length;
    const msg    = document.getElementById('result-msg');

    if (filled < total) {
        msg.textContent = `Please fill in all blanks! (${filled}/${total} filled)`;
        msg.style.color = '#e65100';
    } else if (correct === total) {
        msg.textContent = `🎉 Excellent! All ${total} answers correct!`;
        msg.style.color = '#1b5e20';
    } else {
        msg.textContent = `You got ${correct} out of ${total} correct. Try again!`;
        msg.style.color = '#b71c1c';
    }
}

function resetQuiz() {
    document.querySelectorAll('.drop-zone[data-answer]').forEach(clearDropZone);
    for (const k in dropZoneMap) delete dropZoneMap[k];
    document.querySelectorAll('.word-chip').forEach(c => c.classList.remove('used', 'dragging'));
    clearFeedback();
}

function clearFeedback() {
    const msg = document.getElementById('result-msg');
    if (msg) msg.textContent = '';
    document.querySelectorAll('.drop-zone').forEach(z => {
        z.classList.remove('correct', 'incorrect');
        if (z.classList.contains('filled') && z.dataset.wordColor) {
            z.style.background = z.dataset.wordColor;
        }
    });
}
