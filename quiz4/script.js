// ─────────────────────────────────────────────
//  QUIZ 4 — Drag-and-Drop Fill-in-the-Blank
//  "Let's Do Gymnastic"
// ─────────────────────────────────────────────

// ── STATE ──
let draggedWordId    = null;
let draggedWordText  = null;
let draggedWordColor = null;   // ← chip background colour

// dropZoneMap: { dropZoneId → { wordId, color } }
const dropZoneMap = {};

// ── TOUCH STATE ──
let touchGhost          = null;
let touchDragWordId     = null;
let touchDragWordText   = null;
let touchDragWordColor  = null;   // ← chip colour for touch
let touchSourceDropZone = null;


// ─────────────────────────────────────────────
//  MOUSE DRAG EVENTS
// ─────────────────────────────────────────────

function dragStart(event) {
    const el = event.currentTarget;

    draggedWordId    = el.id;
    draggedWordText  = el.textContent.replace(/\s+/g, ' ').trim();
    draggedWordColor = el.dataset.color || '#c8c8c8';

    el.classList.add('dragging');

    event.dataTransfer.setData('text/plain',  draggedWordText);
    event.dataTransfer.setData('wordId',      draggedWordId);
    event.dataTransfer.setData('wordColor',   draggedWordColor);
    event.dataTransfer.effectAllowed = 'move';
}

function allowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
    event.dataTransfer.dropEffect = 'move';
}

document.addEventListener('dragleave', function (event) {
    if (event.target.classList && event.target.classList.contains('drop-zone')) {
        event.target.classList.remove('drag-over');
    }
});

function dropWord(event) {
    event.preventDefault();
    const zone = event.currentTarget;
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
    draggedWordId    = null;
    draggedWordText  = null;
    draggedWordColor = null;

    clearFeedback();
}

/** Allow dragging a word back out of a filled zone */
function dragFromZone(event) {
    const zone     = event.currentTarget;
    const span     = zone.querySelector('.dropped-word');
    const wordText = span ? span.textContent.replace(/\s+/g, ' ').trim() : '';
    const wordId   = zone.dataset.wordId  || '';
    const wordColor = zone.dataset.wordColor || '#c8c8c8';

    draggedWordId    = wordId;
    draggedWordText  = wordText;
    draggedWordColor = wordColor;

    event.dataTransfer.setData('text/plain', wordText);
    event.dataTransfer.setData('wordId',    wordId);
    event.dataTransfer.setData('wordColor', wordColor);
    event.dataTransfer.effectAllowed = 'move';

    clearDropZone(zone);
    markChipUsed(wordId, false);
    clearFeedback();
}

document.addEventListener('dragend', function (event) {
    if (event.target.classList && event.target.classList.contains('word-chip')) {
        event.target.classList.remove('dragging');
    }
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    draggedWordId    = null;
    draggedWordText  = null;
    draggedWordColor = null;
});


// ─────────────────────────────────────────────
//  TOUCH DRAG EVENTS
// ─────────────────────────────────────────────

function touchStart(event) {
    const el = event.currentTarget;

    if (el.classList.contains('word-chip') && !el.classList.contains('used')) {
        touchDragWordId     = el.id;
        touchDragWordText   = el.textContent.replace(/\s+/g, ' ').trim();
        touchDragWordColor  = el.dataset.color || '#c8c8c8';
        touchSourceDropZone = null;
        el.classList.add('dragging');
    } else if (el.classList.contains('drop-zone') && el.classList.contains('filled')) {
        const span          = el.querySelector('.dropped-word');
        touchDragWordText   = span ? span.textContent.replace(/\s+/g, ' ').trim() : '';
        touchDragWordId     = el.dataset.wordId   || '';
        touchDragWordColor  = el.dataset.wordColor || '#c8c8c8';
        touchSourceDropZone = el.id;
    } else {
        return;
    }

    createTouchGhost(touchDragWordText, touchDragWordColor);
    moveTouchGhost(event.touches[0]);
    event.preventDefault();
}

function touchMove(event) {
    if (!touchDragWordText) return;
    moveTouchGhost(event.touches[0]);
    event.preventDefault();

    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    const zoneUnder = getDropZoneUnderTouch(event.touches[0]);
    if (zoneUnder) zoneUnder.classList.add('drag-over');
}

function touchEnd(event) {
    if (!touchDragWordText) return;
    removeTouchGhost();
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));

    const touch     = event.changedTouches[0];
    const zoneUnder = getDropZoneUnderTouch(touch);

    if (zoneUnder) {
        returnWordFromZone(zoneUnder.id);
        if (touchSourceDropZone) {
            clearDropZone(document.getElementById(touchSourceDropZone));
        } else {
            markChipUsed(touchDragWordId, true);
        }
        placeWordInZone(zoneUnder, touchDragWordText, touchDragWordId, touchDragWordColor);
    } else {
        if (touchSourceDropZone) {
            const srcZone = document.getElementById(touchSourceDropZone);
            if (srcZone) clearDropZone(srcZone);
            markChipUsed(touchDragWordId, false);
        }
        if (touchDragWordId) {
            const chip = document.getElementById(touchDragWordId);
            if (chip) chip.classList.remove('dragging');
        }
    }

    if (touchDragWordId) {
        const chip = document.getElementById(touchDragWordId);
        if (chip) chip.classList.remove('dragging');
    }

    touchDragWordId     = null;
    touchDragWordText   = null;
    touchDragWordColor  = null;
    touchSourceDropZone = null;
    clearFeedback();
}

function createTouchGhost(text, color) {
    removeTouchGhost();
    touchGhost = document.getElementById('touch-ghost');
    if (!touchGhost) {
        touchGhost = document.createElement('div');
        touchGhost.id = 'touch-ghost';
        document.body.appendChild(touchGhost);
    }
    touchGhost.textContent = text;
    touchGhost.style.background = color || '#fff9c4';
    touchGhost.style.display    = 'block';
}

function moveTouchGhost(touch) {
    if (!touchGhost) return;
    touchGhost.style.left = (touch.clientX - 40) + 'px';
    touchGhost.style.top  = (touch.clientY - 22) + 'px';
}

function removeTouchGhost() {
    const g = document.getElementById('touch-ghost');
    if (g) g.style.display = 'none';
}

function getDropZoneUnderTouch(touch) {
    for (const zone of document.querySelectorAll('.drop-zone')) {
        const rect = zone.getBoundingClientRect();
        if (
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top  &&
            touch.clientY <= rect.bottom
        ) return zone;
    }
    return null;
}


// ─────────────────────────────────────────────
//  ZONE HELPERS
// ─────────────────────────────────────────────

/**
 * Place a word in a drop zone and colour it like its chip.
 */
function placeWordInZone(zone, wordText, wordId, wordColor) {
    zone.classList.add('filled');
    zone.classList.remove('correct', 'incorrect', 'drag-over');
    zone.dataset.wordId    = wordId;
    zone.dataset.wordColor = wordColor;

    // Apply chip colour as background
    zone.style.background  = wordColor || '#c8c8c8';
    zone.style.borderColor = '';       // let CSS handle the border

    zone.innerHTML = '';
    const span = document.createElement('span');
    span.className   = 'dropped-word';
    span.textContent = wordText;
    zone.appendChild(span);

    // Allow dragging back out
    zone.setAttribute('draggable', 'true');
    zone.setAttribute('ondragstart', 'dragFromZone(event)');

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
    delete zone.dataset.wordId;
    delete zone.dataset.wordColor;
    zone.style.background  = '';   // reset inline colour
    zone.style.borderColor = '';
    zone.innerHTML         = '';
    if (dropZoneMap[zone.id]) delete dropZoneMap[zone.id];
}

function markChipUsed(wordId, used) {
    if (!wordId) return;
    const chip = document.getElementById(wordId);
    if (!chip) return;
    if (used) chip.classList.add('used');
    else chip.classList.remove('used', 'dragging');
}


// ─────────────────────────────────────────────
//  CHECK ANSWERS
// ─────────────────────────────────────────────

function checkAnswers() {
    const zones = document.querySelectorAll('.drop-zone[data-answer]');
    let correct = 0;
    const total = zones.length;

    zones.forEach(zone => {
        if (!zone.classList.contains('filled')) return;
        const expected = (zone.dataset.answer || '').toLowerCase().trim();
        const placed   = zone.querySelector('.dropped-word')
            ? zone.querySelector('.dropped-word').textContent.replace(/\s+/g, ' ').toLowerCase().trim()
            : '';
        if (placed === expected) {
            zone.classList.add('correct');
            zone.classList.remove('incorrect');
            zone.style.background = '#c8e6c9';   // green tint for correct
            correct++;
        } else {
            zone.classList.add('incorrect');
            zone.classList.remove('correct');
            zone.style.background = '#ffcdd2';   // red tint for incorrect
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


// ─────────────────────────────────────────────
//  RESET
// ─────────────────────────────────────────────

function resetQuiz() {
    document.querySelectorAll('.drop-zone[data-answer]').forEach(clearDropZone);
    for (const key in dropZoneMap) delete dropZoneMap[key];
    document.querySelectorAll('.word-chip').forEach(chip => {
        chip.classList.remove('used', 'dragging');
    });
    clearFeedback();
}

function clearFeedback() {
    const msg = document.getElementById('result-msg');
    if (msg) msg.textContent = '';
    document.querySelectorAll('.drop-zone').forEach(z => {
        z.classList.remove('correct', 'incorrect');
        // Restore chip colour if filled
        if (z.classList.contains('filled') && z.dataset.wordColor) {
            z.style.background = z.dataset.wordColor;
        }
    });
}
