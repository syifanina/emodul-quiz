document.addEventListener('DOMContentLoaded', () => {
    const tfCells = document.querySelectorAll('.tf-cell');
    const activityInputs = document.querySelectorAll('.activity-input');
    const checkBtn = document.getElementById('btn-check');
    const resetBtn = document.getElementById('btn-reset');
    const studentNameInput = document.getElementById('student-name');
    const schoolNameInput = document.getElementById('school-name');
    const resultMsg = document.getElementById('result-msg');
    const scoreBox = document.getElementById('score-box');
    const scoreValue = document.getElementById('score-value');

    const clickAudio = document.getElementById('click-audio');
    const correctAudio = document.getElementById('correct-audio');
    const wrongAudio = document.getElementById('wrong-audio');
    const typingAudio = document.getElementById('typing-audio');

    // Interactive True/False cells
    tfCells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (checkBtn.classList.contains('locked')) return; // do not allow changes after check

            if (clickAudio) { clickAudio.currentTime = 0; clickAudio.play().catch(e=>{}); }

            const row = cell.closest('.tf-question-row');
            // clear both
            row.querySelectorAll('.tf-cell').forEach(c => {
                c.classList.remove('checked');
                c.textContent = '';
            });
            
            // set current
            cell.classList.add('checked');
            cell.textContent = '✓';
            
            updateSubmitButtonState();
        });
    });

    activityInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (typingAudio) { typingAudio.currentTime = 0; typingAudio.play().catch(e=>{}); }
            updateSubmitButtonState();
        });
    });

    studentNameInput.addEventListener('input', () => {
        if (typingAudio) { typingAudio.currentTime = 0; typingAudio.play().catch(e=>{}); }
        updateSubmitButtonState();
    });
    
    schoolNameInput.addEventListener('input', () => {
        if (typingAudio) { typingAudio.currentTime = 0; typingAudio.play().catch(e=>{}); }
        updateSubmitButtonState();
    });

    function updateSubmitButtonState() {
        if (checkBtn.classList.contains('locked')) return;

        const tfRows = document.querySelectorAll('.tf-question-row');
        let allTfFilled = true;
        tfRows.forEach(row => {
            if (!row.querySelector('.tf-cell.checked')) {
                allTfFilled = false;
            }
        });

        let allInputsFilled = true;
        activityInputs.forEach(input => {
            if (input.value.trim() === '') allInputsFilled = false;
        });

        const isInfoFilled = studentNameInput.value.trim() !== '' && schoolNameInput.value.trim() !== '';

        if (allTfFilled && allInputsFilled && isInfoFilled) {
            checkBtn.disabled = false;
            checkBtn.style.opacity = '1';
            checkBtn.style.cursor = 'pointer';
        } else {
            checkBtn.disabled = true;
            checkBtn.style.opacity = '0.5';
            checkBtn.style.cursor = 'not-allowed';
        }
    }

    updateSubmitButtonState();

    checkBtn.addEventListener('click', async () => {
        if (clickAudio) { clickAudio.currentTime = 0; clickAudio.play().catch(e=>{}); }
        
        checkBtn.classList.add('locked');
        checkBtn.style.opacity = '0.5';
        checkBtn.style.pointerEvents = 'none';
        resetBtn.style.opacity = '0.5';
        resetBtn.style.pointerEvents = 'none';
        
        let tfCorrectCount = 0;
        let inputsCorrectCount = 0;
        const totalTf = 10;
        const totalInputs = 16;
        const totalQuestions = totalTf + totalInputs;

        // Grade T/F
        const tfRows = document.querySelectorAll('.tf-question-row');
        for (let row of tfRows) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 300));

            const correctVal = row.dataset.correct;
            const checkedCell = row.querySelector('.tf-cell.checked');

            let isCorrect = false;
            if (checkedCell) {
                if (checkedCell.dataset.val === correctVal) {
                    isCorrect = true;
                    checkedCell.classList.add('correct-ans');
                } else {
                    checkedCell.classList.add('wrong-ans');
                    const correctCell = row.querySelector(`.tf-cell[data-val="${correctVal}"]`);
                    if (correctCell) correctCell.classList.add('correct-ans');
                }
            } else {
                const correctCell = row.querySelector(`.tf-cell[data-val="${correctVal}"]`);
                if (correctCell) correctCell.classList.add('correct-ans');
            }

            if (isCorrect) {
                tfCorrectCount++;
                if (correctAudio) { correctAudio.currentTime = 0; correctAudio.play().catch(e=>{}); }
            } else {
                if (wrongAudio) { wrongAudio.currentTime = 0; wrongAudio.play().catch(e=>{}); }
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Grade Inputs
        for (let input of activityInputs) {
            input.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const userVal = input.value.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
            const possibleAnswersRaw = input.dataset.answers.split('|');
            
            const isCorrect = possibleAnswersRaw.some(ans => {
                const cleanAns = ans.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
                return cleanAns === userVal;
            });

            const hintContainer = input.nextElementSibling;
            hintContainer.innerHTML = '';
            input.disabled = true;

            if (isCorrect) {
                inputsCorrectCount++;
                input.classList.add('correct-input');
                if (correctAudio) { correctAudio.currentTime = 0; correctAudio.play().catch(e=>{}); }
            } else {
                input.classList.add('wrong-input');
                // Show exactly 2 hints
                const hint1 = document.createElement('span');
                hint1.className = 'ac-hint';
                hint1.textContent = possibleAnswersRaw[0].trim();
                hintContainer.appendChild(hint1);
                
                if (possibleAnswersRaw.length > 1) {
                    const hint2 = document.createElement('span');
                    hint2.className = 'ac-hint';
                    hint2.textContent = possibleAnswersRaw[1].trim();
                    hintContainer.appendChild(hint2);
                }
                if (wrongAudio) { wrongAudio.currentTime = 0; wrongAudio.play().catch(e=>{}); }
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Finish calculation
        resetBtn.style.opacity = '1';
        resetBtn.style.pointerEvents = 'auto';

        const finalScore = (tfCorrectCount * 2) + (inputsCorrectCount * 5);
        scoreValue.textContent = finalScore;
        scoreBox.style.display = 'block';
        scoreBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

        resultMsg.style.display = 'block';
        if (finalScore === 100) {
            resultMsg.textContent = '🎉 Perfect! All answers are correct!';
            resultMsg.className = 'result-msg correct';
        } else {
            const totalCorrect = tfCorrectCount + inputsCorrectCount;
            resultMsg.textContent = `You got ${totalCorrect} out of ${totalQuestions} correct. Try again!`;
            resultMsg.className = 'result-msg incorrect';
        }

        // ── POST DATA TO GOOGLE FORM WEBHOOK ──
        const studentName = studentNameInput ? studentNameInput.value.trim() : 'Unknown';
        const schoolName = schoolNameInput ? schoolNameInput.value.trim() : 'Unknown';
        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSev_uVlKedPmqM3bJdCVo5UTZIjEcFSTWsA5bLyKehuSMbfDg/formResponse';

        const formParams = new URLSearchParams();
        formParams.append('entry.1851321911', studentName);
        formParams.append('entry.205104832', schoolName);
        formParams.append('entry.1128056621', finalScore);
        formParams.append('entry.670618183', 'Formative Assessment Lesson 5');

        fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(() => console.log('Successfully recorded score to Google Forms.'))
            .catch(error => console.error('Error recording score:', error.message));

    });

    resetBtn.addEventListener('click', () => {
        if (clickAudio) { clickAudio.currentTime = 0; clickAudio.play().catch(e=>{}); }
        
        checkBtn.classList.remove('locked');
        
        tfCells.forEach(cell => {
            cell.classList.remove('checked', 'correct-ans', 'wrong-ans');
            cell.textContent = '';
        });

        activityInputs.forEach(input => {
            input.value = '';
            input.disabled = false;
            input.classList.remove('correct-input', 'wrong-input');
            input.nextElementSibling.innerHTML = '';
        });

        scoreBox.style.display = 'none';
        resultMsg.style.display = 'none';

        updateSubmitButtonState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
