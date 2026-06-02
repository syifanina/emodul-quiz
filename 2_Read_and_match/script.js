class LineManager {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.lines = [];
        this.exampleLine = null;
        window.addEventListener('resize', () => this.redraw());
        // Scroll listener removed: SVG is now inside scroll content and moves natively
        
        // Initial redraw to set height
        setTimeout(() => this.redraw(), 100);
    }

    createLine(sourceId, targetId, color = '#e53935', isExample = false) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('fill', 'none');
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-linecap', 'round');
        line.dataset.source = sourceId;
        line.dataset.target = targetId;
        
        if (isExample) {
            this.exampleLine = { sourceId, targetId, element: line };
        } else {
            this.lines.push({ sourceId, targetId, element: line });
        }
        
        this.svg.appendChild(line);
        this.updateLinePath(line, sourceId, targetId);
    }

    updateLinePath(lineElement, sourceId, targetId) {
        const source = document.getElementById(sourceId);
        const target = document.getElementById(targetId);
        if (!source || !target) return;

        const svgRect = this.svg.getBoundingClientRect();
        const srcRect = source.getBoundingClientRect();
        const trgRect = target.getBoundingClientRect();

        const x1 = srcRect.left + srcRect.width / 2 - svgRect.left;
        const y1 = srcRect.top + srcRect.height / 2 - svgRect.top;
        const x2 = trgRect.left + trgRect.width / 2 - svgRect.left;
        const y2 = trgRect.top + trgRect.height / 2 - svgRect.top;

        // Curved path
        const cp1x = x1 + (x2 - x1) * 0.5;
        const cp1y = y1;
        const cp2x = x1 + (x2 - x1) * 0.5;
        const cp2y = y2;

        lineElement.setAttribute('d', `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`);
    }

    redraw() {
        const container = document.getElementById('quiz-container');
        if (container) {
            // Ensure SVG covers the full scrollable height
            this.svg.style.height = container.scrollHeight + 'px';
        }
        
        if (this.exampleLine) {
            this.updateLinePath(this.exampleLine.element, this.exampleLine.sourceId, this.exampleLine.targetId);
        }
        this.lines.forEach(line => {
            this.updateLinePath(line.element, line.sourceId, line.targetId);
        });
    }

    removeLine(sourceId) {
        const index = this.lines.findIndex(l => l.sourceId === sourceId);
        if (index > -1) {
            this.svg.removeChild(this.lines[index].element);
            this.lines.splice(index, 1);
        }
    }

    removeAllLines() {
        this.lines.forEach(line => this.svg.removeChild(line.element));
        this.lines = [];
    }

    setLineColor(sourceId, color) {
        const line = this.lines.find(l => l.sourceId === sourceId);
        if (line) {
            line.element.setAttribute('stroke', color);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const lineManager = new LineManager('svg-overlay');
    
    // Draw example line
    lineManager.createLine('dot-ex-src', 'dot-ex-target', '#e53935', true);

    const sourceDots = document.querySelectorAll('.source-dot:not(.example-connected)');
    const targetDots = document.querySelectorAll('.target-dot:not(.example-connected)');
    const checkBtn = document.getElementById('btn-check');
    const resetBtn = document.getElementById('btn-reset');
    const resultMsg = document.getElementById('result-msg');

    let selectedSource = null;
    let connections = {}; // sourceId: targetOpt (A to J)
    const correctAnswers = { 1: 'B', 2: 'C', 3: 'A', 4: 'E', 5: 'D', 6: 'G', 7: 'F', 8: 'I', 9: 'J', 10: 'H' };
    
    const clickSound = new Audio('assets/click.MP3');

    sourceDots.forEach(dot => {
        dot.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("Audio play failed:", e));
            
            if (selectedSource === dot) {
                dot.classList.remove('active');
                selectedSource = null;
            } else {
                if (selectedSource) selectedSource.classList.remove('active');
                dot.classList.add('active');
                selectedSource = dot;
            }
        });
    });

    targetDots.forEach(dot => {
        dot.addEventListener('click', () => {
            if (!selectedSource) return;
            
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("Audio play failed:", e));

            const sourceId = selectedSource.id;
            const qNum = selectedSource.dataset.id;
            const targetOpt = dot.dataset.opt;

            // Remove existing connection from this source
            lineManager.removeLine(sourceId);
            
            // Remove existing connection to this target
            for (let sId in connections) {
                if (connections[sId] === targetOpt) {
                    lineManager.removeLine(sId);
                    document.getElementById(sId).classList.remove('connected');
                    delete connections[sId];
                }
            }

            // Create new connection
            connections[sourceId] = targetOpt;
            
            // Get color from the dot itself
            const dotColor = getComputedStyle(selectedSource).getPropertyValue('--dot-color').trim() || '#e53935';
            lineManager.createLine(sourceId, dot.id, dotColor);
            
            selectedSource.classList.remove('active');
            selectedSource.classList.add('connected');
            selectedSource = null;

            updateSubmitButtonState();
        });
    });

    function updateSubmitButtonState() {
        const totalQuestions = Object.keys(correctAnswers).length;
        const totalConnected = Object.keys(connections).length;
        if (totalConnected === totalQuestions) {
            checkBtn.style.opacity = '1';
            checkBtn.style.pointerEvents = 'auto';
            checkBtn.style.cursor = 'pointer';
        } else {
            checkBtn.style.opacity = '0.5';
            checkBtn.style.pointerEvents = 'none';
            checkBtn.style.cursor = 'not-allowed';
        }
    }
    
    // Initialize button state
    updateSubmitButtonState();

    checkBtn.addEventListener('click', async () => {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log(e));
        
        const totalQuestions = Object.keys(correctAnswers).length;
        
        // Lock buttons
        checkBtn.style.opacity = '0.5';
        checkBtn.style.pointerEvents = 'none';
        resetBtn.style.opacity = '0.5';
        resetBtn.style.pointerEvents = 'none';

        let correctCount = 0;
        const correctAudio = document.getElementById('correct-audio');
        const wrongAudio = document.getElementById('wrong-audio');

        for (let sId in connections) {
            const qNum = document.getElementById(sId).dataset.id;
            const targetOpt = connections[sId];
            const isCorrect = targetOpt === correctAnswers[qNum];
            
            const sourceDot = document.getElementById(sId);
            const targetDot = document.getElementById('target-' + targetOpt);
            const imageBox = sourceDot.closest('.image-item').querySelector('.image-box');
            const optionPill = targetDot.closest('.option-item').querySelector('.option-pill');
            const lineData = lineManager.lines.find(l => l.sourceId === sId);

            // Auto scroll to current image
            imageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Apply focus effect
            imageBox.classList.add('checking-focus');
            optionPill.classList.add('checking-focus');
            if (lineData) lineData.element.setAttribute('stroke-width', '7');
            
            if (isCorrect) {
                correctCount++;
                lineManager.setLineColor(sId, '#2e7d32'); // Green
                if (correctAudio) { correctAudio.currentTime = 0; correctAudio.play().catch(e => {}); }
            } else {
                lineManager.setLineColor(sId, '#c62828'); // Red
                if (wrongAudio) { wrongAudio.currentTime = 0; wrongAudio.play().catch(e => {}); }
            }
            
            // Wait 600ms before next
            await new Promise(resolve => setTimeout(resolve, 600));

            // Remove focus effect
            imageBox.classList.remove('checking-focus');
            optionPill.classList.remove('checking-focus');
            if (lineData) lineData.element.setAttribute('stroke-width', '3');
        }

        // Unlock reset button
        resetBtn.style.opacity = '1';
        resetBtn.style.pointerEvents = 'auto';

        resultMsg.style.display = 'block';

        if (correctCount === totalQuestions) {
            resultMsg.textContent = '🎉 Perfect! All matches are correct!';
            resultMsg.className = 'result-msg correct';
        } else {
            resultMsg.textContent = `You got ${correctCount} out of ${totalQuestions} correct. Try again!`;
            resultMsg.className = 'result-msg incorrect';
        }
        
        // Disable interaction
        sourceDots.forEach(d => d.style.pointerEvents = 'none');
        targetDots.forEach(d => d.style.pointerEvents = 'none');
    });

    resetBtn.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log(e));
        
        connections = {};
        lineManager.removeAllLines();
        sourceDots.forEach(dot => {
            dot.classList.remove('active', 'connected');
            dot.style.pointerEvents = 'auto';
        });
        targetDots.forEach(dot => {
            dot.style.pointerEvents = 'auto';
        });
        
        resultMsg.style.display = 'none';
        selectedSource = null;
        updateSubmitButtonState();
    });
});
