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
    const questionCards = document.querySelectorAll('.question-card:not(.example-card)');
    const sec2Inputs = document.querySelectorAll('.sec2-answer-input');
    const studentNameInput = document.getElementById('student-name');
    const schoolNameInput = document.getElementById('school-name');
    const scoreBox = document.getElementById('score-box');
    const scoreValue = document.getElementById('score-value');
    const quizActions = document.getElementById('quiz-actions');

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
     * Add event listeners to all option items of active question cards
     */
    questionCards.forEach(card => {
        const options = card.querySelectorAll('.option-item');
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Ignore if card is disabled (after check) or already selected
                if (option.classList.contains('disabled')) return;

                playSound(clickAudio);

                // Deselect other options in this card
                options.forEach(opt => opt.classList.remove('selected'));

                // Select current option
                option.classList.add('selected');

                // Check if all questions have been answered
                updateCheckButtonState();
            });
        });
    });

    /**
     * Add event listeners to Section II inputs
     */
    sec2Inputs.forEach(input => {
        // Play typing sound on keydown (skip modifier keys)
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') return;
            if (typingAudio) {
                typingAudio.currentTime = 0;
                typingAudio.play().catch(err => { });
            }
        });

        input.addEventListener('input', function () {
            this.classList.remove('correct', 'wrong');
            const row = this.closest('.sec2-row');
            if (row) {
                const fb = row.querySelector('.sec2-feedback-icon');
                const hint = row.querySelector('.sec2-correct-hint');
                if (fb) fb.textContent = '';
                if (hint) {
                    hint.textContent = '';
                    hint.style.display = 'none';
                }
            }
            updateCheckButtonState();
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
     * Enable/disable the "Check Answers" button depending on completion
     */
    function updateCheckButtonState() {
        let allAnswered = true;

        if (studentNameInput && studentNameInput.value.trim() === '') {
            allAnswered = false;
        }
        if (schoolNameInput && schoolNameInput.value.trim() === '') {
            allAnswered = false;
        }

        questionCards.forEach(card => {
            if (!card.querySelector('.option-item.selected')) {
                allAnswered = false;
            }
        });

        sec2Inputs.forEach(input => {
            if (input.value.trim() === '') {
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

        // Lock button interaction
        checkBtn.disabled = true;
        resetBtn.style.pointerEvents = 'none';
        resetBtn.style.opacity = '0.5';

        let correctCount = 0;
        let pgPoints = 0;
        let isianPoints = 0;
        const totalQuestions = questionCards.length + sec2Inputs.length;

        // Evaluate each card
        for (let i = 0; i < questionCards.length; i++) {
            const card = questionCards[i];
            const correctAnswer = card.dataset.correct;
            const selectedOption = card.querySelector('.option-item.selected');
            const userChoice = selectedOption ? selectedOption.dataset.opt : null;

            // Scroll to the card being checked to guide user focus
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 350));

            // Visual check highlighting
            const allOptions = card.querySelectorAll('.option-item');
            allOptions.forEach(option => {
                const optKey = option.dataset.opt;
                option.classList.add('disabled'); // Disable future clicks

                if (optKey === correctAnswer) {
                    option.classList.add('correct');
                } else if (option.classList.contains('selected') && optKey !== correctAnswer) {
                    option.classList.add('incorrect');
                }
            });

            if (userChoice === correctAnswer) {
                correctCount++;
                pgPoints += 2;
                playSound(correctAudio);
            } else {
                playSound(incorrectAudio);
            }

            // Quick pause before checking the next card
            await new Promise(resolve => setTimeout(resolve, 700));
        }

        // Evaluate Section II
        for (let i = 0; i < sec2Inputs.length; i++) {
            const input = sec2Inputs[i];
            const row = input.closest('.sec2-row');

            // Scroll to the row being checked
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            await new Promise(resolve => setTimeout(resolve, 350));

            const userAnswer = input.value.trim().toUpperCase();
            const correctAnswer = input.dataset.answer.toUpperCase();
            const displayAnswer = input.dataset.answer;

            const fb = row ? row.querySelector('.sec2-feedback-icon') : null;
            const hint = row ? row.querySelector('.sec2-correct-hint') : null;

            input.disabled = true;

            if (userAnswer === correctAnswer) {
                correctCount++;
                isianPoints += 3;
                input.classList.add('correct');
                if (fb) { fb.textContent = '✓'; fb.style.color = '#2e7d32'; }
                playSound(correctAudio);
            } else {
                input.classList.add('wrong');
                if (fb) { fb.textContent = '✗'; fb.style.color = '#c62828'; }
                if (hint) { hint.textContent = displayAnswer; hint.style.display = 'block'; }
                playSound(incorrectAudio);
            }

            await new Promise(resolve => setTimeout(resolve, 700));
        }

        // Show result message
        resultMsg.style.display = 'block';
        if (correctCount === totalQuestions) {
            resultMsg.textContent = '🎉 Perfect! All answers are correct!';
            resultMsg.className = 'result-msg correct';
        } else {
            resultMsg.textContent = `You got ${correctCount} out of ${totalQuestions} correct. Try again!`;
            resultMsg.className = 'result-msg incorrect';
        }

        // Calculate and show score
        const totalPoints = pgPoints + isianPoints;
        const finalScore = totalPoints * 2;
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

        // Hide action buttons
        quizActions.style.display = 'none';

        // ---- PENGIRIMAN KE GOOGLE FORM ----
        const studentName = studentNameInput ? studentNameInput.value.trim() : 'Unknown';
        const schoolName = schoolNameInput ? schoolNameInput.value.trim() : 'Unknown';

        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScISa-PAh0JZaeXy74trsDSc7gOP-vPWSA1EMd4pBIBivjwaA/formResponse';

        const formParams = new URLSearchParams();
        // Asumsi urutan pertanyaan di Google Form: Nama, Sekolah, Nilai, Nama Asesmen
        formParams.append('entry.2104605437', studentName);
        formParams.append('entry.832712923', schoolName);
        formParams.append('entry.1178711606', finalScore);
        formParams.append('entry.1153784634', 'Formative Assessment Lesson 1');

        fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(() => console.log('Berhasil mengirim data ke Google Form'))
            .catch(error => console.error('Error saat mengirim data!', error.message));

        // Unlock reset button (even though it's hidden, keep the state unlock logic)
        resetBtn.style.pointerEvents = 'auto';
        resetBtn.style.opacity = '1';

        // Scroll down to score box
        setTimeout(() => {
            scoreBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });

    /**
     * Reset quiz state
     */
    resetBtn.addEventListener('click', () => {
        playSound(clickAudio);

        // Hide result and score box, show action buttons
        resultMsg.style.display = 'none';
        scoreBox.style.display = 'none';
        quizActions.style.display = 'flex';

        // Clear all feedback classes and enable options
        questionCards.forEach(card => {
            const options = card.querySelectorAll('.option-item');
            options.forEach(option => {
                option.classList.remove('selected', 'correct', 'incorrect', 'disabled');
            });
        });

        // Reset Section II inputs
        sec2Inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'wrong');
            input.disabled = false;

            const row = input.closest('.sec2-row');
            if (row) {
                const fb = row.querySelector('.sec2-feedback-icon');
                const hint = row.querySelector('.sec2-correct-hint');
                if (fb) fb.textContent = '';
                if (hint) {
                    hint.textContent = '';
                    hint.style.display = 'none';
                }
            }
        });

        // Reset Name and School Input
        if (studentNameInput) {
            studentNameInput.value = '';
            studentNameInput.disabled = false;
        }
        if (schoolNameInput) {
            schoolNameInput.value = '';
            schoolNameInput.disabled = false;
        }

        // Re-evaluate check button
        updateCheckButtonState();

        // Scroll back to top
        const scrollContainer = document.getElementById('quiz-container');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});
