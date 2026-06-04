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
    const sec2Inputs = document.querySelectorAll('.sec2-order-input');
    const sec3Inputs = document.querySelectorAll('.cloze-input');

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
                // Ignore if card is disabled (after checking answers) or already selected
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
            const row = this.closest('.sec2-order-row');
            if (row) {
                const fb = row.querySelector('.sec2-fb-badge');
                const hint = row.querySelector('.sec2-hint-text');
                if (fb) fb.textContent = '';
                if (hint) {
                    hint.textContent = input.dataset.answer;
                    hint.style.display = 'none';
                }
            }
            updateCheckButtonState();
        });
    });

    /**
     * Add event listeners to Section III cloze inputs
     */
    sec3Inputs.forEach(input => {
        // Play typing sound on keydown
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') return;
            if (typingAudio) {
                typingAudio.currentTime = 0;
                typingAudio.play().catch(err => { });
            }
        });

        input.addEventListener('input', function () {
            this.classList.remove('correct', 'wrong');
            const line = this.closest('.notebook-line');
            if (line) {
                const fb = line.querySelector('.cloze-fb-badge');
                const hint = line.querySelector('.cloze-hint-text');
                if (fb) fb.textContent = '';
                if (hint) {
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

        // Part II inputs answered
        sec2Inputs.forEach(input => {
            if (input.value.trim() === '') {
                allAnswered = false;
            }
        });

        // Part III inputs answered
        sec3Inputs.forEach(input => {
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
     * Check answers event listener with beautiful visual feedback
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
        let sec2Points = 0;
        let sec3Points = 0;

        const totalQuestions = questionCards.length + sec2Inputs.length + sec3Inputs.length; // 10 + 10 + 10 = 30

        // ── 1. EVALUATE PART I (Multiple Choice Cards) ──
        for (let i = 0; i < questionCards.length; i++) {
            const card = questionCards[i];
            const correctAnswer = card.dataset.correct;
            const selectedOption = card.querySelector('.option-item.selected');
            const userChoice = selectedOption ? selectedOption.dataset.opt : null;

            // Scroll focusing
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 350));

            // Highlight Correct and Wrong answers
            const allOptions = card.querySelectorAll('.option-item');
            allOptions.forEach(option => {
                const optKey = option.dataset.opt;
                option.classList.add('disabled'); // Disable future interactions

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

            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // ── 2. EVALUATE PART II (Ordering Numbers) ──
        for (let i = 0; i < sec2Inputs.length; i++) {
            const input = sec2Inputs[i];
            const row = input.closest('.sec2-order-row');

            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            await new Promise(resolve => setTimeout(resolve, 350));

            const userAnswer = input.value.trim();
            const correctVal = input.dataset.answer.trim();
            const fb = row ? row.querySelector('.sec2-fb-badge') : null;
            const hint = row ? row.querySelector('.sec2-hint-text') : null;

            input.disabled = true;

            if (userAnswer === correctVal) {
                correctCount++;
                sec2Points += 3;
                input.classList.add('correct');
                if (fb) {
                    fb.textContent = '✓';
                    fb.style.color = '#16a34a';
                }
                playSound(correctAudio);
            } else {
                input.classList.add('wrong');
                if (fb) {
                    fb.textContent = '✗';
                    fb.style.color = '#dc2626';
                }
                if (hint) {
                    hint.style.display = 'block';
                }
                playSound(incorrectAudio);
            }

            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // ── 3. EVALUATE PART III (Cloze notebook story text matching) ──
        for (let i = 0; i < sec3Inputs.length; i++) {
            const input = sec3Inputs[i];
            const line = input.closest('.notebook-line');

            if (line) {
                line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            await new Promise(resolve => setTimeout(resolve, 350));

            // Advanced Text Normalization to handle kid's typos/different standard spellings
            const normalizeStr = (str) => {
                return str
                    .toLowerCase()
                    .replace(/['’\.]/g, '') // Remove periods & apostrophes
                    .replace(/\s+/g, ' ')   // Collapse multi-spaces
                    .trim();
            };

            const userAnswer = normalizeStr(input.value);
            const correctAnswers = input.dataset.answer.split('|').map(normalizeStr);
            const displayAnswer = input.dataset.answer.split('|')[0];

            const fb = line ? line.querySelector('.cloze-fb-badge') : null;
            const hint = line ? line.querySelector('.cloze-hint-text') : null;

            input.disabled = true;

            if (correctAnswers.includes(userAnswer)) {
                correctCount++;
                sec3Points += 5;
                input.classList.add('correct');
                if (fb) {
                    fb.textContent = '✓';
                    fb.style.color = '#10b981';
                }
                playSound(correctAudio);
            } else {
                input.classList.add('wrong');
                if (fb) {
                    fb.textContent = '✗';
                    fb.style.color = '#ef4444';
                }
                if (hint) {
                    hint.textContent = `Correct: "${displayAnswer}"`;
                    hint.style.display = 'block';
                }
                playSound(incorrectAudio);
            }

            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Calculate and Show Total Score
        const totalPoints = pgPoints + sec2Points + sec3Points; // Max: 20 + 30 + 50 = 100
        const finalScore = totalPoints; // Out of 100
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
        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdtemCGfzSFLv45uHKSmEZ2yKH4BV-8rHEsQ98NPT-8t8f1XA/formResponse';

        const formParams = new URLSearchParams();
        formParams.append('entry.1970944865', studentName);
        formParams.append('entry.27135579', schoolName);
        formParams.append('entry.358221920', finalScore);
        formParams.append('entry.712576228', 'Formative Assessment Lesson 3');

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

        // Smooth scroll to scorecard
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

        // Reset Section II inputs
        sec2Inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'wrong');
            input.disabled = false;

            const row = input.closest('.sec2-order-row');
            if (row) {
                const fb = row.querySelector('.sec2-fb-badge');
                const hint = row.querySelector('.sec2-hint-text');
                if (fb) fb.textContent = '';
                if (hint) {
                    hint.style.display = 'none';
                }
            }
        });

        // Reset Section III inputs
        sec3Inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'wrong');
            input.disabled = false;

            const line = input.closest('.notebook-line');
            if (line) {
                const fb = line.querySelector('.cloze-fb-badge');
                const hint = line.querySelector('.cloze-hint-text');
                if (fb) fb.textContent = '';
                if (hint) {
                    hint.style.display = 'none';
                }
            }
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

        // Scroll back to top smoothly
        const scrollContainer = document.getElementById('quiz-container');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});
