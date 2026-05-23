// Instruction Cards Data
const cardData = [
    { img: "https://lh3.googleusercontent.com/d/1CHWbs-AJnsbCeVLoDss1aCHKpY-paUwL", gif: "../Say_and_do_1/assets/touch_head.gif" },
    { img: "https://lh3.googleusercontent.com/d/1-zklMNHvPxZTK9KDCK0L99qAuI9KBnqh", gif: "../Say_and_do_1/assets/bend_knees.gif" },
    { img: "https://lh3.googleusercontent.com/d/1tNSxdewnPVnZ_4ML5CdScz3XCWxgMBgh", gif: "../Say_and_do_1/assets/open_mouth.gif" },
    { img: "https://lh3.googleusercontent.com/d/1NVxCiCEIjlXY3HrHnG3AKJfd1YqRPcO3", gif: "../Say_and_do_1/assets/stretch_arms.gif" },
    { img: "https://lh3.googleusercontent.com/d/17UIOwrQCbnf01AKJoJHTtEzQCPzSafQs", gif: "../Say_and_do_1/assets/cross_your_legs.gif" },
    { img: "https://lh3.googleusercontent.com/d/1Eo8rlAK-etSxnSDzxSGohgJRtjYvfIbr", gif: "../Say_and_do_1/assets/comb_hair.gif" },
    { img: "https://lh3.googleusercontent.com/d/1OoC4xyTbs_KsbNuK7X8qVf99eb8EIl8s", gif: "../Say_and_do_1/assets/stomp_feet.gif" },
    { img: "https://lh3.googleusercontent.com/d/11QQ6O4OEMKql_SRXbXf6v5rk2OSfi1lV", gif: "../Say_and_do_1/assets/close_eyes.gif" },
    { img: "https://lh3.googleusercontent.com/d/1zdBuCEROwcejDrYe0Vqw7vKKOWSBBQJZ", gif: "../Say_and_do_1/assets/point_your_nose.gif" },
    { img: "https://lh3.googleusercontent.com/d/1NnbhaA6GBBPSpcRYN9vzmgEHcEWKibM3", gif: "../Say_and_do_1/assets/wave_hand.gif" },
    { img: "https://lh3.googleusercontent.com/d/1ZGKPVSdTWhtUigBmRT83CoPHGEilPy2l", gif: "../Say_and_do_1/assets/touch_elbow.gif" },
    { img: "https://lh3.googleusercontent.com/d/1Iq3ulB--TfDdjAvzRnP9uDSiBgsjOdZ0", gif: "../Say_and_do_1/assets/lift_shoulders.gif" }
];

// Game State
let currentCardIndex = 0;
let shuffledCards = [];
let currentRole = "Partner"; // Partner shuffles, Student performs
let player1Name = "Student 1";
let player2Name = "Student 2";
let currentPartner = "";
let currentStudent = "";

// DOM Elements
const nameScreen = document.getElementById('name-screen');
// const startScreen = document.getElementById('start-screen');
const shuffleScreen = document.getElementById('shuffle-screen');
const cardScreen = document.getElementById('card-screen');
const feedbackScreen = document.getElementById('feedback-screen');
const endScreen = document.getElementById('end-screen');
const uiInfo = document.getElementById('ui-info');

const p1Input = document.getElementById('p1-name');
const p2Input = document.getElementById('p2-name');
const submitNamesBtn = document.getElementById('submit-names-btn');

const instructionImage = document.getElementById('instruction-image');
const controlLabel = document.getElementById('control-label');
const shuffleTrigger = document.getElementById('click-to-shuffle');
const shuffleImage = document.getElementById('shuffle-image');
const shuffleLabel = document.querySelector('.shuffle-label');
const currentRoleText = document.getElementById('current-role');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');

const feedbackTitle = document.getElementById('feedback-title');
const demoContainer = document.getElementById('demonstration-container');
const feedbackGif = document.getElementById('feedback-gif');
const feedbackCardImg = document.getElementById('feedback-card-img');
const roleSwitchReminder = document.getElementById('role-switch-reminder');

// const startBtn = document.getElementById('start-btn');
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const shuffleSound = document.getElementById('shuffle-audio');
const tadaSound = document.getElementById('tada-audio');
const typingSound = document.getElementById('typing-audio');
const clickSound = document.getElementById('click-audio');
const correctSound = document.getElementById('correct-audio');
const incorrectSound = document.getElementById('wrong-audio');

function checkNamesFilled(e) {
    if (e && e.type === 'input') {
        typingSound.currentTime = 0;
        typingSound.play().catch(err => console.log("Audio play failed:", err));
    }
    if (p1Input.value.trim() !== '' && p2Input.value.trim() !== '') {
        submitNamesBtn.disabled = false;
        submitNamesBtn.classList.remove('disabled');
        submitNamesBtn.classList.add('bounce');
    } else {
        submitNamesBtn.disabled = true;
        submitNamesBtn.classList.add('disabled');
        submitNamesBtn.classList.remove('bounce');
    }
}

// Initialize Game
function initGame() {
    shuffledCards = [...cardData].sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    currentRole = "Partner";
    p1Input.value = '';
    p2Input.value = '';
    checkNamesFilled();
    showScreen(nameScreen);
    uiInfo.classList.add('hidden');
}

function showScreen(screen) {
    [nameScreen, shuffleScreen, cardScreen, feedbackScreen, endScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
}

function updateProgress() {
    const total = shuffledCards.length;
    const current = currentCardIndex + 1;
    progressText.innerText = `Card ${current} / ${total}`;
    progressFill.style.width = `${(current / total) * 100}%`;
    
    // Assign names based on role
    if (currentRole === "Partner") {
        currentPartner = player1Name;
        currentStudent = player2Name;
    } else {
        currentPartner = player2Name;
        currentStudent = player1Name;
    }
    
    currentRoleText.innerText = currentPartner;
}

function startRound() {
    updateProgress();
    showScreen(shuffleScreen);
    
    // Initial state: show trigger, hide shuffling card
    shuffleTrigger.classList.remove('hidden');
    shuffleImage.classList.add('hidden');
    
    // Prompt the partner to shuffle
    shuffleLabel.innerText = `${currentPartner}, tap the cards to shuffle for ${currentStudent}!`;
}

function startShuffle() {
    shuffleTrigger.classList.add('hidden');
    shuffleImage.classList.remove('hidden');
    shuffleLabel.innerText = `Shuffling cards...`;
    
    shuffleSound.currentTime = 0;
    shuffleSound.play().catch(e => console.log("Audio play failed:", e));

    let shuffleCount = 0;
    const totalShuffleTime = 1500; // 1.5 seconds
    const shuffleIntervalTime = 100;
    
    const shuffleInterval = setInterval(() => {
        const randomCard = cardData[Math.floor(Math.random() * cardData.length)];
        shuffleImage.src = randomCard.img;
        shuffleCount += shuffleIntervalTime;
        
        if (shuffleCount >= totalShuffleTime) {
            clearInterval(shuffleInterval);
            
            // Stop shuffle sound and play tada
            shuffleSound.pause();
            tadaSound.currentTime = 0;
            tadaSound.play().catch(e => console.log("Audio play failed:", e));
            
            revealCard();
        }
    }, shuffleIntervalTime);
}

function revealCard() {
    const card = shuffledCards[currentCardIndex];
    instructionImage.src = card.img;
    controlLabel.innerText = `${currentPartner}, is the action correct?`;
    showScreen(cardScreen);
}

function handleFeedback(isCorrect) {
    const card = shuffledCards[currentCardIndex];
    
    // Reset display
    demoContainer.classList.add('hidden');
    feedbackCardImg.src = card.img;
    
    if (isCorrect) {
        correctSound.currentTime = 0;
        correctSound.play().catch(e => console.log("Audio play failed:", e));
        feedbackTitle.innerText = "Great job! 👏";
        feedbackTitle.style.color = "#22c55e";
        // Confetti!
        if (typeof confetti === 'function') {
            try {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } catch (e) {}
        }
    } else {
        incorrectSound.currentTime = 0;
        incorrectSound.play().catch(e => console.log("Audio play failed:", e));
        feedbackTitle.innerText = "Almost! Try again.";
        feedbackTitle.style.color = "#ef4444";
    }

    // Always show GIF if available
    if (card.gif) {
        feedbackGif.src = card.gif;
        demoContainer.classList.remove('hidden');
    }

    // Role switch logic
    roleSwitchReminder.classList.remove('hidden');
    showScreen(feedbackScreen);
}

function nextCard() {
    currentCardIndex++;
    
    // Switch role for the new round
    currentRole = (currentRole === "Partner") ? "Student" : "Partner";
    
    if (currentCardIndex < shuffledCards.length) {
        updateProgress();
        startRound();
    } else {
        showScreen(endScreen);
    }
}

// Event Listeners
p1Input.addEventListener('input', checkNamesFilled);
p2Input.addEventListener('input', checkNamesFilled);

submitNamesBtn.addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log("Audio play failed:", e));
    if (p1Input.value.trim() === '' || p2Input.value.trim() === '') return;
    player1Name = p1Input.value.trim();
    player2Name = p2Input.value.trim();
    uiInfo.classList.remove('hidden');
    startRound();
});

// startBtn.addEventListener('click', () => {
//     startRound();
// });

shuffleTrigger.addEventListener('click', () => {
    startShuffle();
});

correctBtn.addEventListener('click', () => handleFeedback(true));
wrongBtn.addEventListener('click', () => handleFeedback(false));

nextBtn.addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log("Audio play failed:", e));
    nextCard();
});

restartBtn.addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log("Audio play failed:", e));
    initGame();
});

// Run
initGame();
