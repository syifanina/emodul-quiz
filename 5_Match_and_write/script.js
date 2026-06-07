document.addEventListener('DOMContentLoaded', () => {
    const itemBoxes = document.querySelectorAll('.item-box');
    const targetBoxes = document.querySelectorAll('.target-box');
    const writeInputs = document.querySelectorAll('.write-input');
    const checkBtn = document.getElementById('btn-check');
    const resetBtn = document.getElementById('btn-reset');
    const resultMsg = document.getElementById('result-msg');

    let selectedSource = null;
    let connections = {'1': 'H'}; // Item 1 is an example
    
    // Exact mapping from user spec
    const correctAnswers = {
        '1': 'H', '2': 'D', '3': 'B', '4': 'G',
        '5': 'H', '6': 'A', '7': 'C', '8': 'B',
        '9': 'E', '10': 'D', '11': 'G', '12': 'F',
        '13': 'A', '14': 'E'
    };
    
    // Room colors for the badges
    const roomColors = {
        'A': '#ca8a04', 'B': '#2563eb', 'C': '#7e22ce', 'D': '#dc2626',
        'E': '#2563eb', 'F': '#16a34a', 'G': '#ea580c', 'H': '#7e22ce'
    };
    
    const clickSound = document.getElementById('click-audio');
    const typingAudio = document.getElementById('typing-audio');

    // Removed Global click sound

    itemBoxes.forEach(box => {
        box.style.cursor = 'pointer';
        box.addEventListener('click', () => {
            if(clickSound) { clickSound.currentTime = 0; clickSound.play().catch(e=>{}); }
            
            if (selectedSource === box) {
                box.classList.remove('active-source');
                selectedSource = null;
            } else {
                if (selectedSource) selectedSource.classList.remove('active-source');
                box.classList.add('active-source');
                selectedSource = box;
            }
        });
    });

    targetBoxes.forEach(target => {
        target.addEventListener('click', () => {
            if (!selectedSource) return;
            if(clickSound) { clickSound.currentTime = 0; clickSound.play().catch(e=>{}); }

            const badge = selectedSource.querySelector('.answer-badge');
            const sourceId = badge.dataset.id;
            const targetOpt = target.dataset.opt;

            // Update badge
            badge.textContent = targetOpt;
            selectedSource.style.setProperty('--badge-color', roomColors[targetOpt] || '#3b82f6');
            selectedSource.classList.add('filled');
            
            // Save connection
            connections[sourceId] = targetOpt;
            
            // Reset selection
            selectedSource.classList.remove('active-source');
            selectedSource = null;

            updateSubmitButtonState();
            
            // Small bounce effect on target
            target.classList.add('active-target');
            setTimeout(() => target.classList.remove('active-target'), 200);
        });
    });

    writeInputs.forEach(input => {
        input.addEventListener('input', updateSubmitButtonState);
        input.addEventListener('keypress', () => {
            if (typingAudio) { typingAudio.currentTime = 0; typingAudio.play().catch(e=>{}); }
        });
    });

    function updateSubmitButtonState() {
        const totalMatchQuestions = Object.keys(correctAnswers).length;
        const totalConnected = Object.keys(connections).length;
        
        let allInputsFilled = true;
        writeInputs.forEach(input => {
            if (input.value.trim() === '') allInputsFilled = false;
        });

        if (totalConnected === totalMatchQuestions && allInputsFilled) {
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
        if(clickSound) { clickSound.currentTime = 0; clickSound.play().catch(e=>{}); }
        
        const totalMatch = Object.keys(correctAnswers).length;
        const totalWrite = writeInputs.length;
        const totalQuestions = totalMatch + totalWrite;
        
        // Lock buttons
        checkBtn.style.opacity = '0.5';
        checkBtn.style.pointerEvents = 'none';
        resetBtn.style.opacity = '0.5';
        resetBtn.style.pointerEvents = 'none';

        let correctCount = 0;
        const correctAudio = document.getElementById('correct-audio');
        const wrongAudio = document.getElementById('wrong-audio');

        // --- MATCH CHECK ---
        for (let sId in connections) {
            const targetOpt = connections[sId];
            const isCorrect = targetOpt === correctAnswers[sId];
            
            const badge = document.getElementById('badge-' + sId);
            const imageBox = badge.closest('.item-box');

            // Auto scroll to current image
            imageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Apply focus effect
            imageBox.classList.add('checking-focus');
            
            if (isCorrect) {
                correctCount++;
                imageBox.style.setProperty('--badge-color', '#2e7d32'); // Green
                if (correctAudio) { correctAudio.currentTime = 0; correctAudio.play().catch(e => {}); }
            } else {
                imageBox.style.setProperty('--badge-color', '#c62828'); // Red
                if (wrongAudio) { wrongAudio.currentTime = 0; wrongAudio.play().catch(e => {}); }
            }
            
            // Wait 600ms before next
            await new Promise(resolve => setTimeout(resolve, 600));

            // Remove focus effect
            imageBox.classList.remove('checking-focus');
        }

        // --- WRITE CHECK ---
        for (let input of writeInputs) {
            input.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const userVal = input.value.trim();
            const possibleAnswers = input.dataset.answer.split('|').map(a => a.trim());
            
            // Check correctness ignoring caps and punctuation
            const cleanUser = userVal.toLowerCase().replace(/[^a-z0-9 ]/g, '');
            const isCorrect = possibleAnswers.some(ans => {
                const cleanAns = ans.toLowerCase().replace(/[^a-z0-9 ]/g, '');
                return cleanUser === cleanAns;
            });

            // existing feedback icons / hints
            let icon = input.nextElementSibling;
            if (!icon || !icon.classList.contains('feedback-icon')) {
                icon = document.createElement('span');
                icon.className = 'feedback-icon';
                input.parentNode.insertBefore(icon, input.nextSibling);
            }
            
            let hint = input.parentNode.querySelector('.hint-box');
            if (hint) hint.remove();

            input.disabled = true; // lock input

            if (isCorrect) {
                correctCount++;
                input.classList.add('correct-input');
                input.classList.remove('wrong-input');
                icon.textContent = '✓';
                icon.className = 'feedback-icon correct';
                if (correctAudio) { correctAudio.currentTime = 0; correctAudio.play().catch(e=>{}); }
            } else {
                input.classList.add('wrong-input');
                input.classList.remove('correct-input');
                icon.textContent = '✗';
                icon.className = 'feedback-icon wrong';
                
                hint = document.createElement('div');
                hint.className = 'hint-box';
                hint.textContent = 'Answer: ' + possibleAnswers[0];
                input.parentNode.appendChild(hint);
                
                if (wrongAudio) { wrongAudio.currentTime = 0; wrongAudio.play().catch(e=>{}); }
            }
            
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Unlock reset button
        resetBtn.style.opacity = '1';
        resetBtn.style.pointerEvents = 'auto';

        resultMsg.style.display = 'block';

        if (correctCount === totalQuestions) {
            resultMsg.textContent = '🎉 Perfect! All answers are correct!';
            resultMsg.className = 'result-msg correct';
            resultMsg.style.color = '#166534';
        } else {
            resultMsg.textContent = `You got ${correctCount} out of ${totalQuestions} correct. Try again!`;
            resultMsg.className = 'result-msg incorrect';
            resultMsg.style.color = '#991b1b';
        }
        
        // Disable interaction
        itemBoxes.forEach(b => b.style.pointerEvents = 'none');
        targetBoxes.forEach(b => b.style.pointerEvents = 'none');
    });

    resetBtn.addEventListener('click', () => {
        if(clickSound) { clickSound.currentTime = 0; clickSound.play().catch(e=>{}); }
        
        connections = {'1': 'H'};
        itemBoxes.forEach(box => {
            if (box.id === 'box-1') return; // Skip example
            
            box.classList.remove('active-source', 'filled');
            box.style.pointerEvents = 'auto';
            const badge = box.querySelector('.answer-badge');
            if (badge) badge.textContent = '?';
        });
        targetBoxes.forEach(box => {
            box.style.pointerEvents = 'auto';
        });

        writeInputs.forEach(input => {
            input.value = '';
            input.disabled = false;
            input.classList.remove('correct-input', 'wrong-input');
            let icon = input.nextElementSibling;
            if (icon && icon.classList.contains('feedback-icon')) icon.remove();
            let hint = input.parentNode.querySelector('.hint-box');
            if (hint) hint.remove();
        });
        
        resultMsg.style.display = 'none';
        selectedSource = null;
        updateSubmitButtonState();
        
        // scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
