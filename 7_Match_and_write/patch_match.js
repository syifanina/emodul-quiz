const fs = require('fs');

let html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Match and Write – Quiz</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div class="page">
        <img src="https://lh3.googleusercontent.com/d/1Wtb9UWtvVhVA13B0HLBagfyx1bD1LU5x" class="top-border" alt="Top Border">
        <img src="https://lh3.googleusercontent.com/d/19NE3XzidRxaYa56e4OBOdI38n3nYJhwK" class="bottom-border" alt="Bottom Border">

        <header class="module-header">
            <!-- I will just reuse the title-badge of Match and Write or general. Let's use the old one from 7_Match_and_write -->
            <img src="https://lh3.googleusercontent.com/d/1_jKA98dWiaiJLr-O5Bzuf8KAsBS1AMLd" alt="Match and Write" class="title-badge">
            <div class="instructions">
                <p class="en">Look at the picture of fruits and vegetables and match them to the right activity! Look at the example</p>
                <div class="separator"></div>
                <p class="id">Perhatikan gambar buah-buahan dan sayur-sayuran di bawah ini dan cocokkan dengan aktivitas yang sesuai! Perhatikan contoh berikut!</p>
            </div>
        </header>

        <div class="scroll-content" id="quiz-container">
            <!-- QUIZ QUESTIONS -->
            <div class="match-grid">
                <!-- Center Box -->
                <div class="center-box">
                    <div class="room-list">
                        <div class="room-item target-box" id="target-A" data-opt="A"><span>(A)</span> WASH</div>
                        <div class="room-item target-box" id="target-B" data-opt="B"><span>(B)</span> PEEL</div>
                        <div class="room-item target-box" id="target-C" data-opt="C"><span>(C)</span> CHOP</div>
                        <div class="room-item target-box" id="target-D" data-opt="D"><span>(D)</span> CUT</div>
                        <div class="room-item target-box" id="target-E" data-opt="E"><span>(E)</span> SLICE</div>
                        <div class="room-item target-box" id="target-F" data-opt="F"><span>(F)</span> SCOOP THE FLESH OF</div>
                        <div class="room-item target-box" id="target-G" data-opt="G"><span>(G)</span> REMOVE THE STEM OF</div>
                        <div class="room-item target-box" id="target-H" data-opt="H"><span>(H)</span> DICE</div>
                    </div>
                </div>

                <!-- Box 2: broccoli (CUT - D) -->
                <div class="item-box" id="box-2" style="grid-area: 1 / 1 / 2 / 2; border-color: #ea580c;">
                    <div class="item-num" style="background: #ea580c;">2</div>
                    <img src="png-7-match/broccoli.png" alt="Question 2">
                    <div class="item-name">The broccoli</div>
                    <div class="answer-badge" id="badge-2" data-id="2">?</div>
                </div>

                <!-- Box 3: garlic (CHOP - C) -->
                <div class="item-box" id="box-3" style="grid-area: 1 / 2 / 2 / 3; border-color: #16a34a;">
                    <div class="item-num" style="background: #16a34a;">3</div>
                    <img src="png-7-match/garlic.png" alt="Question 3">
                    <div class="item-name">The garlic</div>
                    <div class="answer-badge" id="badge-3" data-id="3">?</div>
                </div>

                <!-- Box 4: strawberry (REMOVE STEM - G) -->
                <div class="item-box" id="box-4" style="grid-area: 1 / 3 / 2 / 4; border-color: #2563eb;">
                    <div class="item-num" style="background: #2563eb;">4</div>
                    <img src="png-7-match/strawberry.png" alt="Question 4">
                    <div class="item-name">The strawberry</div>
                    <div class="answer-badge" id="badge-4" data-id="4">?</div>
                </div>

                <!-- Box 5: grapes (REMOVE STEM - G) -->
                <div class="item-box" id="box-5" style="grid-area: 2 / 1 / 3 / 2; border-color: #7e22ce;">
                    <div class="item-num" style="background: #7e22ce;">5</div>
                    <img src="png-7-match/grapes.png" alt="Question 5">
                    <div class="item-name">The grapes</div>
                    <div class="answer-badge" id="badge-5" data-id="5">?</div>
                </div>

                <!-- Box 1: spinach (WASH - A) EXAMPLE -->
                <div class="item-box filled" id="box-1" style="grid-area: 2 / 3 / 3 / 4; border-color: #ca8a04; --badge-color: #ca8a04; pointer-events: none;">
                    <div class="item-num" style="background: #ca8a04;">1</div>
                    <img src="png-7-match/spinach.png" alt="Question 1">
                    <div class="item-name">The spinach</div>
                    <div class="answer-badge" id="badge-1" data-id="1">A</div>
                </div>

                <!-- Box 6: eggplant (PEEL - B) -->
                <div class="item-box" id="box-6" style="grid-area: 3 / 1 / 4 / 2; border-color: #dc2626;">
                    <div class="item-num" style="background: #dc2626;">6</div>
                    <img src="png-7-match/eggplant.png" alt="Question 6">
                    <div class="item-name">The eggplant</div>
                    <div class="answer-badge" id="badge-6" data-id="6">?</div>
                </div>

                <!-- Box 7: melon (SLICE - E) -->
                <div class="item-box" id="box-7" style="grid-area: 3 / 3 / 4 / 4; border-color: #16a34a;">
                    <div class="item-num" style="background: #16a34a;">7</div>
                    <img src="png-7-match/melon.png" alt="Question 7">
                    <div class="item-name">The melon</div>
                    <div class="answer-badge" id="badge-7" data-id="7">?</div>
                </div>

                <!-- Box 8: orange (PEEL - B) -->
                <div class="item-box" id="box-8" style="grid-area: 4 / 1 / 5 / 2; border-color: #ea580c;">
                    <div class="item-num" style="background: #ea580c;">8</div>
                    <img src="png-7-match/orange.png" alt="Question 8">
                    <div class="item-name">The orange</div>
                    <div class="answer-badge" id="badge-8" data-id="8">?</div>
                </div>

                <!-- Box 9: potato (DICE - H) -->
                <div class="item-box" id="box-9" style="grid-area: 4 / 2 / 5 / 3; border-color: #2563eb;">
                    <div class="item-num" style="background: #2563eb;">9</div>
                    <img src="png-7-match/potato.png" alt="Question 9">
                    <div class="item-name">The potato</div>
                    <div class="answer-badge" id="badge-9" data-id="9">?</div>
                </div>

                <!-- Box 10: avocado (SCOOP THE FLESH OF - F) -->
                <div class="item-box" id="box-10" style="grid-area: 4 / 3 / 5 / 4; border-color: #16a34a;">
                    <div class="item-num" style="background: #16a34a;">10</div>
                    <img src="png-7-match/avocado.png" alt="Question 10">
                    <div class="item-name">The avocado</div>
                    <div class="answer-badge" id="badge-10" data-id="10">?</div>
                </div>

            </div>

            <!-- WRITING SECTION -->
            <div class="write-section" style="margin-top: 40px; width: 100%;">
                <div class="instructions" style="margin-bottom: 20px;">
                    <p class="en">Now complete the sentences with your work from matching exercise. Look at the example!</p>
                    <div class="separator"></div>
                    <p class="id">Sekarang lengkapi kalimat di bawah ini dari hasil mencocokkan yang telah kamu kerjakan! Perhatikan contoh!</p>
                </div>

                <div class="write-container">
                    <div class="write-row example-row">
                        <div class="number-badge">1</div>
                        <div class="write-content">
                            <span class="example-label" style="font-weight: 800; color: #dc2626;">Example:</span> <strong style="font-size: 14px; text-transform: capitalize;"><u>Wash the spinach</u></strong>
                        </div>
                    </div>
                    <div class="write-row">
                        <div class="number-badge">2</div>
                        <div class="write-content"><input type="text" class="write-input" id="write-input-2" data-answer="cut the broccoli" placeholder="....." autocomplete="off" autocorrect="off" spellcheck="false" style="width: 100%;"></div>
                    </div>
                    <div class="write-row">
                        <div class="number-badge">3</div>
                        <div class="write-content"><input type="text" class="write-input" id="write-input-3" data-answer="chop the garlic" placeholder="....." autocomplete="off" autocorrect="off" spellcheck="false" style="width: 100%;"></div>
                    </div>
                    <div class="write-row">
                        <div class="number-badge">4</div>
                        <div class="write-content"><input type="text" class="write-input" id="write-input-4" data-answer="remove the stem of the strawberry|pull the leaf of the strawberry" placeholder="....." autocomplete="off" autocorrect="off" spellcheck="false" style="width: 100%;"></div>
                    </div>
                    <div class="write-row">
                        <div class="number-badge">5</div>
                        <div class="write-content"><input type="text" class="write-input" id="write-input-5" data-answer="remove the stem of the grapes" placeholder="....." autocomplete="off" autocorrect="off" spellcheck="false" style="width: 100%;"></div>
                    </div>
                    <div class="write-row">
                        <div class="number-badge">6</div>
                        <div class="write-content"><input type="text" class="write-input" id="write-input-6" data-answer="peel the eggplant" placeholder="....." autocomplete="off" autocorrect="off" spellcheck="false" style="width: 100%;"></div>
                    </div>
                    <div class="write-row">
                        <div class="number-badge">7</div>
                        <div class="write-content"><input type="text" class="write-input" id="write-input-7" data-answer="slice the melon" placeholder="....." autocomplete="off" autocorrect="off" spellcheck="false" style="width: 100%;"></div>
                    </div>
                    <div class="write-row">
                        <div class="number-badge">8</div>
                        <div class="write-content"><input type="text" class="write-input" id="write-input-8" data-answer="peel the orange" placeholder="....." autocomplete="off" autocorrect="off" spellcheck="false" style="width: 100%;"></div>
                    </div>
                    <div class="write-row">
                        <div class="number-badge">9</div>
                        <div class="write-content"><input type="text" class="write-input" id="write-input-9" data-answer="dice the potato" placeholder="....." autocomplete="off" autocorrect="off" spellcheck="false" style="width: 100%;"></div>
                    </div>
                    <div class="write-row">
                        <div class="number-badge">10</div>
                        <div class="write-content"><input type="text" class="write-input" id="write-input-10" data-answer="scoop the flesh of the avocado" placeholder="....." autocomplete="off" autocorrect="off" spellcheck="false" style="width: 100%;"></div>
                    </div>
                </div>
            </div>

            <div class="bottom-padding"></div>
            <div id="result-msg" class="result-msg"></div>
            <div class="btn-row">
                <button id="btn-reset" class="reset-btn">
                    <img src="https://lh3.googleusercontent.com/d/1QP5h4jt3BS33S4P80ZNMi2_UiFL67t6w" alt="Reset">
                </button>
                <button id="btn-check" class="check-btn">
                    <img src="https://lh3.googleusercontent.com/d/1fi-nC3J3tTuwxejkFW6Aq3p7OE7hym_C" alt="Check Answer">
                </button>
            </div>
        </div>

        <audio id="click-audio" src="../7_Look_and_write/assets/click.MP3" preload="auto"></audio>
        <audio id="correct-audio" src="../7_Look_and_write/assets/correct_sound.MP3" preload="auto"></audio>
        <audio id="wrong-audio" src="../7_Look_and_write/assets/incorrect_sound.MP3" preload="auto"></audio>
        <audio id="typing-audio" src="../7_Look_and_write/assets/typing.MP3" preload="auto"></audio>
    </div>

    <script src="script.js"></script>
</body>
</html>`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully wrote index.html');
