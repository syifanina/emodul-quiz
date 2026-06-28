document.addEventListener('DOMContentLoaded', () => {
    // Audio elements
    const clickAudio = document.getElementById('audio-click');
    const correctAudio = document.getElementById('audio-correct');
    const incorrectAudio = document.getElementById('audio-incorrect');
    const typingAudio = document.getElementById('audio-typing');

    // UI elements
    const checkBtn = document.getElementById('btn-check');
    const resetBtn = document.getElementById('btn-reset');
    const resultMsg = document.getElementById('result-msg');
    const studentNameInput = document.getElementById('student-name');
    const schoolNameInput = document.getElementById('school-name');
    const scoreBox = document.getElementById('score-box');
    const scoreValue = document.getElementById('score-value');
    const quizActions = document.getElementById('quiz-actions');

    // Active Interactive items
    const questionCards = document.querySelectorAll('.question-card:not(.example-card)');
    const tfRows = document.querySelectorAll('.tf-row');

    /**
     * Helper function to play sound safely
     */
    function playSound(audio) {
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio playback prevented:', e));
        }
    }

    /**
     * Add event listeners to all option items of active multiple choice question cards
     */
    questionCards.forEach(card => {
        const options = card.querySelectorAll('.option-item');
        options.forEach(option => {
            option.addEventListener('click', () => {
                if (option.classList.contains('disabled')) return;
                playSound(clickAudio);
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                updateCheckButtonState();
            });
        });
    });

    /**
     * Add event listeners to True/False table checkboxes
     */
    tfRows.forEach(row => {
        const cells = row.querySelectorAll('.tf-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                if (cell.classList.contains('disabled')) return;
                playSound(clickAudio);
                
                // Deselect other cells in this row
                cells.forEach(c => {
                    c.classList.remove('checked');
                    c.textContent = '';
                });
                
                // Select this one
                cell.classList.add('checked');
                cell.textContent = '✓';
                
                updateCheckButtonState();
            });
        });
    });

    /**
     * Add event listener to Student Name and School inputs
     */
    function playTypingSound(e) {
        if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') return;
        if (typingAudio) {
            typingAudio.currentTime = 0;
            typingAudio.play().catch(err => { });
        }
    }

    if (studentNameInput) {
        studentNameInput.addEventListener('input', updateCheckButtonState);
        studentNameInput.addEventListener('keydown', playTypingSound);
    }
    if (schoolNameInput) {
        schoolNameInput.addEventListener('input', updateCheckButtonState);
        schoolNameInput.addEventListener('keydown', playTypingSound);
    }

    /**
     * Enable/disable the "Check Answers" button depending on quiz completion
     */
    function updateCheckButtonState() {
        let allAnswered = true;

        if (studentNameInput && studentNameInput.value.trim() === '') {
            allAnswered = false;
        }
        if (schoolNameInput && schoolNameInput.value.trim() === '') {
            allAnswered = false;
        }

        // Part I cards answered
        questionCards.forEach(card => {
            if (!card.querySelector('.option-item.selected')) {
                allAnswered = false;
            }
        });

        // Part II TF table answered
        tfRows.forEach(row => {
            if (!row.querySelector('.tf-cell.checked')) {
                allAnswered = false;
            }
        });

        if (allAnswered) {
            checkBtn.disabled = false;
            checkBtn.style.opacity = '1';
            checkBtn.style.cursor = 'pointer';
        } else {
            checkBtn.disabled = true;
            checkBtn.style.opacity = '0.5';
            checkBtn.style.cursor = 'not-allowed';
        }
    }

    // Initialize button state
    updateCheckButtonState();

    /**
     * Check answers event listener
     */
    checkBtn.addEventListener('click', async () => {
        playSound(clickAudio);

        // Lock button interactions
        checkBtn.disabled = true;
        resetBtn.style.pointerEvents = 'none';
        resetBtn.style.opacity = '0.5';

        // Lock Student info inputs
        if (studentNameInput) studentNameInput.disabled = true;
        if (schoolNameInput) schoolNameInput.disabled = true;

        let correctCount = 0;
        let pgPoints = 0;
        let tfPoints = 0;

        const totalQuestions = questionCards.length + tfRows.length; // 10 + 10 = 20

        // ── 1. EVALUATE PART I (Multiple Choice Cards) ──
        for (let i = 0; i < questionCards.length; i++) {
            const card = questionCards[i];
            const correctAnswer = card.dataset.correct;
            const selectedOption = card.querySelector('.option-item.selected');
            const userChoice = selectedOption ? selectedOption.dataset.opt : null;

            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 350));

            const allOptions = card.querySelectorAll('.option-item');
            allOptions.forEach(option => {
                const optKey = option.dataset.opt;
                option.classList.add('disabled');

                if (optKey === correctAnswer) {
                    option.classList.add('correct');
                } else if (option.classList.contains('selected') && optKey !== correctAnswer) {
                    option.classList.add('incorrect');
                }
            });

            if (userChoice === correctAnswer) {
                correctCount++;
                pgPoints += 4; // 10 questions * 4 = 40 max
                playSound(correctAudio);
            } else {
                playSound(incorrectAudio);
            }

            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // ── 2. EVALUATE PART II (True/False Table) ──
        for (let i = 0; i < tfRows.length; i++) {
            const row = tfRows[i];
            const correctVal = row.dataset.correct; // "true" or "false"
            const selectedCell = row.querySelector('.tf-cell.checked');
            const userVal = selectedCell ? selectedCell.dataset.val : null;

            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 350));

            const allCells = row.querySelectorAll('.tf-cell');
            allCells.forEach(cb => {
                cb.classList.add('disabled'); // lock
                
                // Show visual feedback on the user's choice
                if (cb.classList.contains('checked')) {
                    if (cb.dataset.val === correctVal) {
                        cb.classList.add('correct-ans');
                    } else {
                        cb.classList.add('wrong-ans');
                        cb.textContent = '✗';
                    }
                }
                
                // Also highlight the correct answer if user got it wrong
                if (!cb.classList.contains('checked') && cb.dataset.val === correctVal && userVal !== correctVal) {
                    cb.classList.add('correct-ans');
                    cb.classList.add('checked'); // Force check mark on the correct one
                    cb.textContent = '✓';
                }
            });

            if (userVal === correctVal) {
                correctCount++;
                tfPoints += 6; // 10 questions * 6 = 60 max
                playSound(correctAudio);
            } else {
                playSound(incorrectAudio);
            }

            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Calculate and Show Total Score
        const finalScore = pgPoints + tfPoints; // Max 100
        scoreValue.textContent = finalScore;

        scoreBox.classList.remove('score-red', 'score-yellow', 'score-light-green', 'score-blue');
        if (finalScore <= 50) {
            scoreBox.classList.add('score-red');
        } else if (finalScore <= 69) {
            scoreBox.classList.add('score-yellow');
        } else if (finalScore <= 85) {
            scoreBox.classList.add('score-light-green');
        } else {
            scoreBox.classList.add('score-blue');
        }

        scoreBox.style.display = 'flex';

        // Overall Feedback Message
        resultMsg.style.display = 'block';
        if (correctCount === totalQuestions) {
            resultMsg.textContent = '🎉 Perfect! All answers are correct!';
            resultMsg.className = 'result-msg correct';
        } else {
            resultMsg.textContent = `You got ${correctCount} out of ${totalQuestions} correct. Try again!`;
            resultMsg.className = 'result-msg incorrect';
        }

        // Hide action controls during scorecard view
        quizActions.style.display = 'none';

        // ── POST DATA TO GOOGLE FORM WEBHOOK ──
        const studentName = studentNameInput ? studentNameInput.value.trim() : 'Unknown';
        const schoolName = schoolNameInput ? schoolNameInput.value.trim() : 'Unknown';
        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfBs7pM_9iUvpdpd3TmYyVfx5_HmqJ5dJJ7lGH8xb7cJJIbTQ/formResponse';
        // Sheets URL: https://docs.google.com/spreadsheets/d/1X9nzlhYNEtx9ECbsj_DzNNoC8CvoAnBCOUO9MCGrWtU/edit?usp=sharing

        const formParams = new URLSearchParams();
        formParams.append('entry.820403889', studentName);
        formParams.append('entry.648908067', schoolName);
        formParams.append('entry.1113888061', finalScore);
        formParams.append('entry.859318530', 'Formative Assessment Lesson 8');

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

        // Unlock reset interaction
        resetBtn.style.pointerEvents = 'auto';
        resetBtn.style.opacity = '1';

        setTimeout(() => {
            scoreBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });

    /**
     * Reset quiz back to initial state
     */
    resetBtn.addEventListener('click', () => {
        playSound(clickAudio);

        // Reset UI widgets visibility
        resultMsg.style.display = 'none';
        scoreBox.style.display = 'none';
        quizActions.style.display = 'flex';

        // Reset Multiple Choice Cards
        questionCards.forEach(card => {
            const options = card.querySelectorAll('.option-item');
            options.forEach(option => {
                option.classList.remove('selected', 'correct', 'incorrect', 'disabled');
            });
        });

        // Reset True/False Table
        tfRows.forEach(row => {
            const cells = row.querySelectorAll('.tf-cell');
            cells.forEach(c => {
                c.classList.remove('checked', 'correct-ans', 'wrong-ans', 'disabled');
                c.textContent = '';
            });
        });

        // Reset Student credentials
        if (studentNameInput) {
            studentNameInput.value = '';
            studentNameInput.disabled = false;
        }
        if (schoolNameInput) {
            schoolNameInput.value = '';
            schoolNameInput.disabled = false;
        }

        // Recheck answers button state
        updateCheckButtonState();

        const scrollContainer = document.getElementById('quiz-container');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});
