// Preload GIF assets so there's no delay when Play is clicked
const GIF_URLS = [
    'https://lh3.googleusercontent.com/d/1ICmpf0JuS0LtlfYWDZkIA5b_SJrZOSM3?v=2',
    'https://lh3.googleusercontent.com/d/1c6xpi6jme8q47x9znSDF2a-BUCA4X-ub?v=2'
];

// We will store the preloaded Blobs here
const GIF_CACHE = {};
const GIF_STATIC = {};

window.addEventListener('load', () => {
    GIF_URLS.forEach(url => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                GIF_CACHE[url] = blob;
                const blobUrl = URL.createObjectURL(blob);
                const tempImg = new Image();
                tempImg.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = tempImg.naturalWidth;
                    canvas.height = tempImg.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(tempImg, 0, 0);
                    const staticUrl = canvas.toDataURL('image/png');
                    GIF_STATIC[url] = staticUrl;
                    
                    // Freeze images that are currently displaying this GIF
                    document.querySelectorAll('.gif-image').forEach(img => {
                        if (img.getAttribute('data-gif') === url && !img.parentElement.classList.contains('playing')) {
                            img.src = staticUrl;
                        }
                    });
                };
                tempImg.src = blobUrl;
            })
            .catch(err => console.error('Error preloading GIF:', err));
    });

    // Shuffle Task Cards
    const taskGrid = document.querySelector('.task-cards-container');
    if (taskGrid) {
        const cards = Array.from(taskGrid.children);
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            taskGrid.appendChild(cards[j]); // appendChild moves the element to the end
        }
    }
});

let selectedJob = null;
let selectedTask = null;
let isChecking = false;

function handleCardClick(element, type) {
    if (isChecking) return; // Prevent clicks while checking
    if (element.classList.contains('matched')) return; // Ignore already matched cards
    if (element.classList.contains('flipped')) {
        // Allow unselecting if it's not matched yet
        element.classList.remove('flipped');
        if (type === 'job') selectedJob = null;
        if (type === 'task') selectedTask = null;
        return;
    }

    // Flip the clicked card
    element.classList.add('flipped');
    
    // Play sound if available
    const clickAudio = document.getElementById('click-audio');
    if (clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(e => console.log('Audio play blocked:', e));
    }

    // Register selection
    if (type === 'job') {
        if (selectedJob && selectedJob !== element) {
            selectedJob.classList.remove('flipped'); // Unflip previous
        }
        selectedJob = element;
    } else if (type === 'task') {
        if (selectedTask && selectedTask !== element) {
            selectedTask.classList.remove('flipped'); // Unflip previous
        }
        selectedTask = element;
    }

    // Check for match if both are selected
    if (selectedJob && selectedTask) {
        isChecking = true;
        const jobMatch = selectedJob.getAttribute('data-match');
        const taskMatch = selectedTask.getAttribute('data-match');

        if (jobMatch === taskMatch) {
            // Match found!
            setTimeout(() => {
                const correctAudio = document.getElementById('correct-audio');
                if (correctAudio) {
                    correctAudio.currentTime = 0;
                    correctAudio.play().catch(e => console.log('Audio blocked:', e));
                }

                selectedJob.classList.add('matched');
                selectedTask.classList.add('matched');

                // Reset selection
                selectedJob = null;
                selectedTask = null;
                isChecking = false;
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                const wrongAudio = document.getElementById('wrong-audio');
                if (wrongAudio) {
                    wrongAudio.currentTime = 0;
                    wrongAudio.play().catch(e => console.log('Audio blocked:', e));
                }

                selectedJob.classList.remove('flipped');
                selectedTask.classList.remove('flipped');
                
                // Reset selection
                selectedJob = null;
                selectedTask = null;
                isChecking = false;
            }, 800);
        }
    }
}

function playGifAudio(audioId, container, gifSrc, pngSrc) {
    const audio = document.getElementById(audioId);
    const imgElement = container.querySelector('.gif-image');
    
    // Prevent triggering multiple times while already playing
    if (container.classList.contains('playing')) return;
    
    if (audio && imgElement) {
        let url;
        let isBlob = false;
        // Use preloaded Blob to prevent network delay, and create a new object URL to force replay
        if (GIF_CACHE[gifSrc]) {
            url = URL.createObjectURL(GIF_CACHE[gifSrc]);
            isBlob = true;
        } else {
            url = gifSrc + '?t=' + new Date().getTime();
        }
        
        // Hide play button
        container.classList.add('playing');
        imgElement.src = url;
        
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Audio play blocked:', e);
            });
        }
        
        let audioEnded = false;
        let timeEnded = false;
        
        const finish = () => {
            if (audioEnded && timeEnded) {
                imgElement.src = GIF_STATIC[gifSrc] || pngSrc || gifSrc;
                container.classList.remove('playing');
                if (isBlob) {
                    URL.revokeObjectURL(url);
                }
            }
        };
        
        // Swap back to static PNG and show play button when audio finishes AND minimum time passes
        audio.onended = () => {
            audioEnded = true;
            finish();
        };
        
        setTimeout(() => {
            timeEnded = true;
            // If audio hasn't played or failed
            if (audio.paused || audio.ended) {
                audioEnded = true;
            }
            finish();
        }, 5000); // Wait at least 5 seconds for the GIF
    }
}
