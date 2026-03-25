// ── Answer key: left item → correct right option
const ANSWER_KEY = { '1': 'D', '2': 'C', '3': 'B', '4': 'A' };

let selectedLeft = null;
let connections = {}; // leftId -> rightId
const svg = document.getElementById('lines-svg');

function getDotCenter(dotEl) {
    const svgRect = document.getElementById('connector-area').getBoundingClientRect();
    const dotRect = dotEl.getBoundingClientRect();
    return {
        x: dotRect.left + dotRect.width / 2 - svgRect.left,
        y: dotRect.top + dotRect.height / 2 - svgRect.top
    };
}

function drawLine(leftId, rightId) {
    const ldot = document.getElementById('ldot-' + leftId);
    const rdot = document.getElementById('rdot-' + rightId);
    if (!ldot || !rdot) return;

    const from = getDotCenter(ldot);
    const to = getDotCenter(rdot);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('stroke', '#1a237e');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrowhead)');
    line.setAttribute('id', 'line-' + leftId);
    svg.appendChild(line);

    ldot.classList.add('connected');
    rdot.classList.add('connected');
}

function removeExistingConnection(leftId) {
    const existing = document.getElementById('line-' + leftId);
    if (existing) existing.remove();

    const prevRight = connections[leftId];
    if (prevRight) {
        // only remove connected class if no other left connects to this right
        const stillUsed = Object.entries(connections).some(([l, r]) => l !== leftId && r === prevRight);
        if (!stillUsed) {
            const rdot = document.getElementById('rdot-' + prevRight);
            if (rdot) rdot.classList.remove('connected');
        }
    }

    const ldot = document.getElementById('ldot-' + leftId);
    if (ldot) ldot.classList.remove('connected', 'selected');

    delete connections[leftId];
}

document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', function () {
        const side = this.dataset.side;
        const id = this.dataset.id;

        if (side === 'left') {
            if (selectedLeft === id) {
                // deselect
                this.classList.remove('selected');
                selectedLeft = null;
            } else {
                // deselect previous
                if (selectedLeft) {
                    const prev = document.getElementById('ldot-' + selectedLeft);
                    if (prev) prev.classList.remove('selected');
                }
                selectedLeft = id;
                this.classList.add('selected');
                document.getElementById('result-msg').textContent = '';
            }
        } else {
            // right side clicked
            if (selectedLeft !== null) {
                removeExistingConnection(selectedLeft);
                connections[selectedLeft] = id;
                drawLine(selectedLeft, id);

                const ldot = document.getElementById('ldot-' + selectedLeft);
                if (ldot) { ldot.classList.remove('selected'); ldot.classList.add('connected'); }

                selectedLeft = null;
                document.getElementById('result-msg').textContent = '';
            }
        }
    });
});

function resetLines() {
    // remove all lines
    Object.keys(connections).forEach(leftId => {
        const line = document.getElementById('line-' + leftId);
        if (line) line.remove();
    });
    connections = {};
    selectedLeft = null;
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('selected', 'connected'));
    document.getElementById('result-msg').textContent = '';
}

function checkAnswers() {
    let correct = 0;
    const total = 4;
    const lines = svg.querySelectorAll('line');

    // reset all line colors first
    lines.forEach(l => {
        const leftId = l.id.replace('line-', '');
        const rightId = connections[leftId];
        if (ANSWER_KEY[leftId] === rightId) {
            l.setAttribute('stroke', '#2e7d32');
            correct++;
        } else {
            l.setAttribute('stroke', '#c62828');
        }
    });

    if (Object.keys(connections).length < total) {
        document.getElementById('result-msg').textContent = `Please match all ${total} items first!`;
        document.getElementById('result-msg').style.color = '#e65100';
    } else if (correct === total) {
        document.getElementById('result-msg').textContent = `🎉 Perfect! All ${total} answers are correct!`;
        document.getElementById('result-msg').style.color = '#1b5e20';
    } else {
        document.getElementById('result-msg').textContent = `${correct} out of ${total} correct. Red lines = wrong. Try again!`;
        document.getElementById('result-msg').style.color = '#b71c1c';
    }
}

function redrawLinesOnResize() {
    const lineColors = {};
    svg.querySelectorAll('line').forEach(line => {
        const leftId = line.id.replace('line-', '');
        lineColors[leftId] = line.getAttribute('stroke') || '#1a237e';
    });

    svg.querySelectorAll('line').forEach(line => line.remove());

    Object.entries(connections).forEach(([leftId, rightId]) => {
        drawLine(leftId, rightId);
        const line = document.getElementById('line-' + leftId);
        if (lineColors[leftId] && line) {
            line.setAttribute('stroke', lineColors[leftId]);
        }
    });
}

function handleResponsiveRedraw() {
    if (Object.keys(connections).length > 0) {
        redrawLinesOnResize();
    }
}

window.addEventListener('resize', handleResponsiveRedraw);
window.addEventListener('orientationchange', handleResponsiveRedraw);
window.addEventListener('load', handleResponsiveRedraw);

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResponsiveRedraw);
}

const connectorArea = document.getElementById('connector-area');
if (connectorArea && 'ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(handleResponsiveRedraw);
    resizeObserver.observe(connectorArea);
}
