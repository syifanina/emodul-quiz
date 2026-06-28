document.addEventListener('DOMContentLoaded', () => {
    const bowl = document.getElementById('target-bowl');
    const items = document.querySelectorAll('.item-card');
    const svg = document.getElementById('lines-svg');
    const checkBtn = document.getElementById('btn-check');
    const resetBtn = document.getElementById('btn-reset');
    const resultMsg = document.getElementById('result-msg');
    const grid = document.getElementById('match-grid');

    // Audio elements
    const clickSound = document.getElementById('click-audio');
    const correctSound = document.getElementById('correct-audio');
    const wrongSound = document.getElementById('wrong-audio');

    let selectedItem = null;
    let connections = {}; // format: { '1': { line: svgElement, type: 'fruit', element: DOMElement } }

    const totalFruits = Array.from(items).filter(i => i.dataset.type === 'fruit').length;

    function playSound(audio) {
        if (!audio) return;
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio error:', e));
    }

    // 1. Select an item
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            playSound(clickSound);

            const id = item.dataset.id;
            
            // Allow removing connection if clicked again
            if (connections[id]) {
                removeConnection(id);
                updateCheckButtonState();
                return;
            }

            // Deselect previous
            if (selectedItem) {
                selectedItem.classList.remove('selected');
            }

            // Select new
            if (selectedItem !== item) {
                selectedItem = item;
                item.classList.add('selected');
                bowl.classList.add('active-target');
            } else {
                // Toggle off
                selectedItem = null;
                bowl.classList.remove('active-target');
            }
        });
    });

    // 2. Click the bowl to connect
    bowl.addEventListener('click', () => {
        if (!selectedItem) return;
        
        playSound(clickSound);
        const id = selectedItem.dataset.id;
        const type = selectedItem.dataset.type;

        // Draw line
        const line = createLine(selectedItem, bowl);
        svg.appendChild(line);

        connections[id] = { line, type, element: selectedItem };

        // Reset selection visual temporarily
        selectedItem.classList.remove('selected');
        bowl.classList.remove('active-target');

        selectedItem.classList.add('connected');
        selectedItem = null;
        updateCheckButtonState();
    });

    // Deselect if clicking outside
    document.addEventListener('click', () => {
        if (selectedItem) {
            selectedItem.classList.remove('selected');
            selectedItem = null;
            bowl.classList.remove('active-target');
        }
    });

    function removeConnection(id) {
        const conn = connections[id];
        if (conn && conn.line) {
            conn.line.remove();
        }
        if (conn && conn.element) {
            conn.element.classList.remove('connected', 'correct', 'wrong', 'missed');
        }
        delete connections[id];
        resultMsg.textContent = "";
    }

    function createLine(el1, el2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        updateLinePosition(line, el1, el2);
        line.classList.add('draw-line');
        return line;
    }

    function updateLinePosition(line, el1, el2) {
        // Get relative to grid
        const gridRect = grid.getBoundingClientRect();
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        const x1 = rect1.left + rect1.width / 2 - gridRect.left;
        const y1 = rect1.top + rect1.height / 2 - gridRect.top;
        const x2 = rect2.left + rect2.width / 2 - gridRect.left;
        const y2 = rect2.top + rect2.height / 2 - gridRect.top;

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
    }

    // Update lines on window resize
    window.addEventListener('resize', () => {
        for (const id in connections) {
            const conn = connections[id];
            updateLinePosition(conn.line, conn.element, bowl);
        }
    });

    function initExample() {
        const exampleItem = document.querySelector('.item-card[data-id="1"]'); // Apple / Tomato
        if (!exampleItem) return;
        
        // If already exists, do nothing
        if (connections['1']) return;

        const line = createLine(exampleItem, bowl);
        svg.appendChild(line);
        connections['1'] = { line, type: exampleItem.dataset.type, element: exampleItem };
        exampleItem.classList.add('connected');
        
        // Disable clicking on the example
        exampleItem.style.pointerEvents = 'none';
    }

    window.addEventListener('load', () => {
        initExample();
        updateCheckButtonState();
    });

    function updateCheckButtonState() {
        const connIds = Object.keys(connections);
        // Tombol hanya aktif jika jumlah koneksi sudah sama atau lebih dari total buah (termasuk contoh)
        if (connIds.length >= totalFruits) {
            checkBtn.style.opacity = '1';
            checkBtn.style.pointerEvents = 'auto';
            checkBtn.style.cursor = 'pointer';
        } else {
            checkBtn.style.opacity = '0.5';
            checkBtn.style.pointerEvents = 'none';
            checkBtn.style.cursor = 'not-allowed';
        }
    }
    
    updateCheckButtonState();

    // CHECK LOGIC: Sequential "sistem koreksi satu satu"
    checkBtn.addEventListener('click', async () => {
        playSound(clickSound);
        
        const connIds = Object.keys(connections);
        if (connIds.length === 0) return;

        // Lock buttons
        checkBtn.style.opacity = '0.5';
        checkBtn.style.pointerEvents = 'none';
        resetBtn.style.opacity = '0.5';
        resetBtn.style.pointerEvents = 'none';

        let correctFruitCount = 0;
        let anyWrong = false;

        // Check one by one sequentially
        for (let i = 0; i < connIds.length; i++) {
            const id = connIds[i];
            const conn = connections[id];
            
            // Wait a bit before checking this item
            await new Promise(resolve => setTimeout(resolve, 600));

            if (conn.type === 'fruit') {
                conn.line.classList.add('correct');
                conn.element.classList.add('correct');
                conn.element.classList.remove('wrong');
                conn.line.classList.remove('wrong');
                playSound(correctSound);
                correctFruitCount++;
            } else {
                conn.line.classList.add('wrong');
                conn.element.classList.add('wrong');
                conn.element.classList.remove('correct');
                conn.line.classList.remove('correct');
                playSound(wrongSound);
                anyWrong = true;
            }
        }

        // Check if user missed any fruits
        let missedCount = 0;
        let missedLines = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.dataset.type === 'fruit') {
                const id = item.dataset.id;
                if (!connections[id]) {
                    // User missed this fruit!
                    await new Promise(resolve => setTimeout(resolve, 600));
                    
                    const missedLine = createLine(item, bowl);
                    missedLine.classList.add('missed');
                    svg.appendChild(missedLine);
                    missedLines.push({ line: missedLine, item: item });
                    
                    item.classList.add('missed');
                    playSound(correctSound); // Play correct sound since it's a fruit
                    
                    missedCount++;
                    anyWrong = true;
                }
            }
        }
        
        // Save missed lines to connection array so they get cleared on reset/resize
        missedLines.forEach((data, index) => {
            connections['missed_' + index] = { line: data.line, type: 'missed', element: data.item };
        });

        // Wait a little bit after checking all before showing final message
        await new Promise(resolve => setTimeout(resolve, 500));

        // Unlock reset button
        resetBtn.style.opacity = '1';
        resetBtn.style.pointerEvents = 'auto';

        if (correctFruitCount === totalFruits && !anyWrong) {
            resultMsg.textContent = "Perfect! What a delicious fruit salad!";
            resultMsg.style.color = "#16a34a";
            playSound(correctSound);
        } else if (!anyWrong && correctFruitCount < totalFruits) {
            resultMsg.textContent = "Good start, but you missed some fruits!";
            resultMsg.style.color = "#2563eb";
        } else {
            resultMsg.textContent = "Oops! You added some vegetables. Try again!";
            resultMsg.style.color = "#dc2626";
        }
    });

    // RESET LOGIC
    resetBtn.addEventListener('click', () => {
        playSound(clickSound);
        for (const id in connections) {
            removeConnection(id);
        }
        connections = {};
        if (selectedItem) {
            selectedItem.classList.remove('selected');
            selectedItem = null;
        }
        bowl.classList.remove('active-target');
        resultMsg.textContent = "";
        
        // Restore example
        initExample();
        updateCheckButtonState();
    });

});
