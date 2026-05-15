document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const hotspots = document.querySelectorAll('.hotspot');

    // Function to play audio and highlight
    function playWord(word) {
        if (!word) return;

        // Reset all before playing new
        hotspots.forEach(h => h.classList.remove('active'));

        // Update audio source and play
        audio.src = `${word}.MP3`;
        
        audio.play().catch(err => {
            console.warn(`Audio for "${word}" not found. Highlight will stay for 2 seconds.`);
            // Fallback: if audio doesn't exist, show highlight for 2 seconds
            setTimeout(() => {
                hotspots.forEach(h => h.classList.remove('active'));
            }, 2000);
        });

        // Highlight corresponding hotspot
        hotspots.forEach(h => {
            if (h.dataset.word === word) h.classList.add('active');
        });
    }

    // Add click listeners
    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', () => playWord(hotspot.dataset.word));
    });

    // Reset when audio ends
    audio.addEventListener('ended', () => {
        hotspots.forEach(h => h.classList.remove('active'));
    });
});
