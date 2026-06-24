document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.getElementById('btn-check');
    const resetBtn = document.getElementById('btn-reset');
    const resultMsg = document.getElementById('result-msg');
    const inputs = document.querySelectorAll('.fruit-input');

    // Audio elements
    const clickSound = document.getElementById('click-audio');
    const typingSound = document.getElementById('typing-audio');
    const correctSound = document.getElementById('correct-audio');
    const wrongSound = document.getElementById('wrong-audio');

    function playSound(audio) {
        if (!audio) return;
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio error:', e));
    }

    // The correct fruits from the previous Look and Match lesson
    // We check the base name so we can accept "a melon" or just "melon"
    const validFruits = ['melon', 'avocado', 'papaya', 'pineapple', 'dragonfruit'];

    function normalizeText(text) {
        let t = text.toLowerCase().trim();
        // Remove 'a ' or 'an ' if they typed the article
        if (t.startsWith('a ')) {
            t = t.substring(2).trim();
        } else if (t.startsWith('an ')) {
            t = t.substring(3).trim();
        }
        // Remove remaining spaces to handle 'dragon fruit' vs 'dragonfruit'
        return t.replace(/\s+/g, '');
    }

    // CHECK LOGIC
    checkBtn.addEventListener('click', async () => {
        playSound(clickSound);
        
        let allFilled = true;
        inputs.forEach(input => {
            if (input.value.trim() === '') {
                allFilled = false;
            }
        });

        if (!allFilled) {
            resultMsg.textContent = "Please fill in all the blanks!";
            resultMsg.style.color = "#dc2626";
            return;
        }

        // Lock buttons
        checkBtn.style.opacity = '0.5';
        checkBtn.style.pointerEvents = 'none';
        resetBtn.style.opacity = '0.5';
        resetBtn.style.pointerEvents = 'none';

        let correctCount = 0;
        let anyWrong = false;
        
        // Track which fruits have been used to prevent duplicates
        let usedFruits = new Set();

        // Check one by one sequentially
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            input.classList.remove('correct', 'wrong');
            
            await new Promise(resolve => setTimeout(resolve, 600));

            const rawVal = input.value;
            const normalizedVal = normalizeText(rawVal);

            // Is it a valid fruit from the list?
            if (validFruits.includes(normalizedVal)) {
                // Is it already used?
                if (usedFruits.has(normalizedVal)) {
                    // Duplicate! Mark as wrong.
                    input.classList.add('wrong');
                    playSound(wrongSound);
                    anyWrong = true;
                } else {
                    // Correct!
                    usedFruits.add(normalizedVal);
                    input.classList.add('correct');
                    playSound(correctSound);
                    correctCount++;
                }
            } else {
                // Not a valid fruit (or typo)
                input.classList.add('wrong');
                playSound(wrongSound);
                anyWrong = true;
            }
        }

        // Wait a little before showing final message
        await new Promise(resolve => setTimeout(resolve, 500));

        // Unlock buttons
        checkBtn.style.opacity = '1';
        checkBtn.style.pointerEvents = 'auto';
        resetBtn.style.opacity = '1';
        resetBtn.style.pointerEvents = 'auto';

        if (correctCount === 5 && !anyWrong) {
            resultMsg.textContent = "Perfect! Now say it to your friend!";
            resultMsg.style.color = "#16a34a";
            playSound(correctSound);
        } else {
            resultMsg.textContent = "Oops! Check your answers and try again.";
            resultMsg.style.color = "#dc2626";
            playSound(wrongSound);
        }
    });

    // RESET LOGIC
    resetBtn.addEventListener('click', () => {
        playSound(clickSound);
        
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'wrong');
        });
        
        resultMsg.textContent = "";
    });

    // Remove red/green highlight and play typing sound when user starts typing again
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            playSound(typingSound);
            input.classList.remove('correct', 'wrong');
            resultMsg.textContent = "";
        });
    });

});
