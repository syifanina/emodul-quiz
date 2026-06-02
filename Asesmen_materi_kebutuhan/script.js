/**
 * ASESMEN MATERI GAYA — PREMIUM PRESENTATION & QUIZ LOGIC
 * Mengontrol navigasi slide, kuis interaktif 15 soal, preload,
 * autoplay, keyboard, touch gestures, fullscreen, drawer, dan sintesis audio SFX.
 */

// === STATE MANAGEMENT ===
let currentSlide = 1;
const totalSlides = 8;
let isAutoplay = false;
let autoplayTimer = null;
const autoplayDuration = 5000; // 5 Detik per slide

// Touch swipe variables
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50; // Minimum swipe distance in pixels

// Quiz state variables
let quizActive = false;
let currentQuestionIndex = 0;
let quizScore = 0;
let isOptionSelected = false;

// === 15 PILIHAN GANDA MAGNET QUESTIONS DATABASE ===
const quizQuestions = [
    {
        id: 1,
        question: "Setelah terjadinya kesepakatan dalam perniagaan atau perdagangan, kamu akan mendapatkan barang yang kamu inginkan dan penjual akan mendapat uang. Kegiatan perniagaan atau perdagangan ini disebut juga ….",
        options: {
            A: "jual beli",
            B: "barter",
            C: "perdagangan",
            D: "perniagaan"
        },
        answer: "A",
        explanation: "Pada teks dijelaskan bahwa setelah terjadi kesepakatan, pembeli mendapat barang dan penjual mendapat uang. Kegiatan tersebut disebut jual beli."
    },
    {
        id: 2,
        question: "Ketika kamu membutuhkan suatu barang, kamu akan menukarkan sejumlah uang untuk mendapatkan barang tersebut. Kegiatan tukar-menukar uang dan barang ini disebut ….",
        options: {
            A: "perniagaan",
            B: "penjualan",
            C: "penukaran",
            D: "barter"
        },
        answer: "A",
        explanation: "Perniagaan atau perdagangan adalah kegiatan tukar-menukar barang dan jasa berdasarkan kesepakatan. Dalam soal, kegiatan menukar uang dengan barang termasuk kegiatan perniagaan."
    },
    {
        id: 3,
        question: "Perhatikan ciri-ciri di bawah ini!\n\n1. Pembeli langsung membayar pada pemilik toko\n2. Barang dilengkapi label harga\n3. Barang yang dijual beraneka ragam atau lengkap\n4. Tidak ada tawar-menawar harga antara pembeli dan penjual\n5. Pembeli bisa menawar harga pada penjual\n\nCiri-ciri perniagaan atau perdagangan di pasar swalayan atau supermarket pada ciri di atas ditunjukkan oleh nomor ....",
        options: {
            A: "1, 3, dan 4",
            B: "1, 2, dan 3",
            C: "2, 3, dan 4",
            D: "3, 4, dan 5"
        },
        answer: "C",
        explanation: "Pasar swalayan atau supermarket biasanya memiliki barang yang lengkap, barang diberi label harga, dan tidak ada kegiatan tawar-menawar. Jadi, ciri-cirinya ditunjukkan oleh nomor 2, 3, dan 4."
    },
    {
        id: 4,
        question: "Kegiatan jual beli dapat dilakukan di lingkungan rumah dan lingkungan sekolah. Contoh jual beli yang bukan di lingkungan rumah adalah ....",
        options: {
            A: "koperasi sekolah",
            B: "toko",
            C: "warung",
            D: "pedagang keliling"
        },
        answer: "A",
        explanation: "Koperasi sekolah merupakan tempat jual beli yang ada di lingkungan sekolah, bukan di lingkungan rumah. Toko, warung, dan pedagang keliling dapat ditemukan di lingkungan rumah."
    },
    {
        id: 5,
        image: "assets/no5.png",
        question: "Perhatikan gambar berikut!\n\nKegiatan jual beli pada gambar di atas dilakukan di ....",
        options: {
            A: "pasar swalayan",
            B: "toko",
            C: "pasar tradisional",
            D: "pedagang keliling"
        },
        answer: "C",
        explanation: "Gambar menunjukkan kegiatan jual beli secara langsung antara pembeli dan penjual di pasar. Tempat seperti itu disebut pasar tradisional."
    },
    {
        id: 6,
        question: "Kegiatan tukar-menukar barang dengan barang disebut ....",
        options: {
            A: "jual",
            B: "beli",
            C: "tukar",
            D: "barter"
        },
        answer: "D",
        explanation: "Barter adalah kegiatan tukar-menukar barang dengan barang tanpa menggunakan uang."
    },
    {
        id: 7,
        question: "Suatu alat yang dijadikan sebagai alat tukar masa kini adalah ....",
        options: {
            A: "uang barang",
            B: "beras",
            C: "uang",
            D: "emas"
        },
        answer: "C",
        explanation: "Pada masa kini, alat tukar yang umum digunakan dalam kegiatan jual beli adalah uang."
    },
    {
        id: 8,
        question: "Uang kertas terbuat dari bahan ....",
        options: {
            A: "logam",
            B: "batu",
            C: "kertas",
            D: "aluminium"
        },
        answer: "C",
        explanation: "Uang kertas disebut uang kertas karena bentuknya berupa lembaran dan bahan dasarnya seperti kertas khusus."
    },
    {
        id: 9,
        question: "Fungsi utama uang adalah ....",
        options: {
            A: "tabungan",
            B: "alat pembayaran",
            C: "membeli seragam sekolah",
            D: "membayar SPP sekolah"
        },
        answer: "B",
        explanation: "Fungsi utama uang adalah sebagai alat pembayaran atau alat tukar dalam kegiatan jual beli. Pilihan C dan D hanya contoh penggunaan uang, bukan fungsi utamanya."
    },
    {
        id: 10,
        question: "Mengelola uang yang baik dilakukan dengan cara ....",
        options: {
            A: "seenaknya",
            B: "semaunya",
            C: "boros",
            D: "sesuai kebutuhan"
        },
        answer: "D",
        explanation: "Mengelola uang yang baik berarti menggunakan uang secara bijak, tidak boros, dan membeli barang sesuai kebutuhan."
    },
    {
        id: 11,
        question: "Pilihlah beberapa jawaban yang paling benar!\n\nSaat pergi ke pasar tradisional, di sana kita dapat menemukan ....",
        options: {
            A: "Penjual dan pembeli",
            B: "Larangan jual beli",
            C: "Barang yang diperjualbelikan",
            D: "Tawuran antar penjual"
        },
        answer: ["A", "C"],
        explanation: "Di pasar tradisional terdapat penjual, pembeli, dan barang yang diperjualbelikan. Larangan jual beli dan tawuran antar penjual bukan bagian dari kegiatan pasar tradisional."
    },
    {
        id: 12,
        question: "Pilihlah beberapa jawaban yang paling benar!\n\nSistem jual beli tidak selalu terjadi dalam bentuk tawar-menawar harga. Kondisi ini bisa kamu temukan di beberapa tempat perbelanjaan seperti pada gambar berikut, yaitu ....",
        options: {
            A: "Pasar tradisional",
            B: "Belanja online melalui laptop",
            C: "Pedagang di pasar tradisional",
            D: "Belanja online melalui handphone"
        },
        answer: ["B", "D"],
        explanation: "Belanja online biasanya menggunakan harga yang sudah ditetapkan oleh penjual, sehingga pembeli tidak selalu melakukan tawar-menawar. Sementara itu, pasar tradisional masih memungkinkan adanya tawar-menawar harga."
    },
    {
        id: 13,
        question: "Pilihlah beberapa jawaban yang paling benar!\n\nKegiatan jual beli dapat juga kamu temukan di lingkungan sekolah. Kegiatan jual beli apa saja yang bisa dilakukan di lingkungan sekolahmu ....",
        options: {
            A: "Koperasi Sekolah",
            B: "Kantin Sekolah",
            C: "Pedagang keliling",
            D: "Pasar Swalayan"
        },
        answer: ["A", "B"],
        explanation: "Koperasi sekolah dan kantin sekolah merupakan contoh kegiatan jual beli di lingkungan sekolah. Pedagang keliling dan pasar swalayan bukan termasuk tempat jual beli utama di lingkungan sekolah."
    },
    {
        id: 14,
        question: "Pilihlah beberapa jawaban yang paling benar!\n\nPerhatikan cerita berikut!\n\nIbu membeli sayur di pasar tradisional menggunakan uang tunai. Setelah itu, Ibu membayar belanja bulanan melalui transfer bank.\n\nBerdasarkan cerita tersebut, pernyataan yang benar adalah ....",
        options: {
            A: "Uang tunai yang digunakan Ibu termasuk uang kartal",
            B: "Transfer bank termasuk contoh penggunaan uang giral",
            C: "Uang tunai dan transfer bank termasuk kegiatan barter",
            D: "Uang giral hanya dapat digunakan dalam bentuk uang logam"
        },
        answer: ["A", "B"],
        explanation: "Uang tunai termasuk uang kartal karena berbentuk uang kertas atau uang logam. Transfer bank termasuk uang giral karena pembayarannya dilakukan melalui rekening bank. Cerita tersebut bukan barter karena tidak ada kegiatan tukar-menukar barang dengan barang."
    },
    {
        id: 15,
        question: "Pilihlah beberapa jawaban yang paling benar!\n\nPerhatikan pernyataan berikut!\n\n1. Ayah membayar bensin menggunakan uang kertas.\n2. Ibu membayar tagihan listrik melalui transfer bank.\n3. Kakak membeli minuman menggunakan QRIS.\n4. Dika menukar buku tulis dengan pensil milik temannya.\n\nPernyataan yang tepat berdasarkan jenis uang masa kini adalah ....",
        options: {
            A: "Pernyataan 1 termasuk penggunaan uang kartal",
            B: "Pernyataan 2 termasuk penggunaan uang barang",
            C: "Pernyataan 3 termasuk pembayaran digital",
            D: "Pernyataan 4 termasuk penggunaan uang giral"
        },
        answer: ["A", "C"],
        explanation: "Pernyataan 1 benar karena uang kertas termasuk uang kartal. Pernyataan 3 benar karena QRIS termasuk contoh pembayaran digital. Pernyataan 2 salah karena transfer bank termasuk uang giral, bukan uang barang. Pernyataan 4 salah karena menukar barang dengan barang termasuk barter."
    },
    {
        id: 16,
        question: "Alya lapar saat jam istirahat. Ia membeli nasi dan lauk agar tubuhnya memiliki tenaga. Berdasarkan tingkat kepentingannya, nasi dan lauk termasuk kebutuhan ______.",
        answer: ["primer", "pangan"],
        explanation: "Nasi dan lauk termasuk makanan. Makanan adalah kebutuhan primer karena diperlukan manusia untuk bertahan hidup."
    },
    {
        id: 17,
        question: "Beni memiliki uang terbatas. Ia harus memilih antara membeli jaket karena bajunya sangat tipis atau membeli gelang. Kebutuhan yang lebih penting untuk didahulukan adalah ______.",
        answer: ["jaket", "pakaian"],
        explanation: "Jaket termasuk pakaian atau sandang. Pakaian lebih penting daripada gelang karena berfungsi melindungi tubuh."
    },
    {
        id: 18,
        question: "Televisi dapat memberi hiburan di rumah, tetapi manusia tetap bisa hidup tanpa televisi. Berdasarkan tingkat kepentingannya, televisi termasuk kebutuhan ______.",
        answer: ["sekunder"],
        explanation: "Televisi bukan kebutuhan utama. Televisi termasuk kebutuhan sekunder karena sifatnya sebagai pelengkap kenyamanan hidup."
    },
    {
        id: 19,
        question: "Mobil mewah dibeli setelah kebutuhan makanan, pakaian, rumah, dan perlengkapan penting lainnya terpenuhi. Mobil mewah termasuk kebutuhan ______.",
        answer: ["tersier"],
        explanation: "Mobil mewah termasuk kebutuhan tersier karena bersifat mewah dan tidak wajib dipenuhi."
    },
    {
        id: 20,
        question: "Saat demam, Rani minum obat agar tubuhnya kembali sehat. Berdasarkan sifatnya, obat termasuk kebutuhan ______.",
        answer: ["jasmani"],
        explanation: "Obat berhubungan dengan kesehatan tubuh, sehingga termasuk kebutuhan jasmani."
    },
    {
        id: 21,
        question: "Doni merasa sedih. Ia mendapat nasihat dan kasih sayang dari orang tuanya sehingga hatinya lebih tenang. Berdasarkan sifatnya, kasih sayang termasuk kebutuhan ______.",
        answer: ["rohani"],
        explanation: "Kasih sayang berhubungan dengan perasaan, pikiran, dan jiwa, sehingga termasuk kebutuhan rohani."
    },
    {
        id: 22,
        question: "Buku, pensil, dan meja dapat dilihat serta disentuh. Berdasarkan bentuknya, benda-benda tersebut termasuk kebutuhan ______.",
        answer: ["material"],
        explanation: "Kebutuhan material adalah kebutuhan yang berwujud benda dan dapat disentuh."
    },
    {
        id: 23,
        question: "Rasa aman sangat penting bagi kehidupan, tetapi tidak dapat disentuh seperti benda. Berdasarkan bentuknya, rasa aman termasuk kebutuhan ______.",
        answer: ["immaterial"],
        explanation: "Rasa aman tidak berwujud benda, tetapi tetap dibutuhkan manusia."
    },
    {
        id: 24,
        question: "Seorang petani membutuhkan cangkul untuk bekerja di sawah. Berdasarkan subjeknya, cangkul tersebut termasuk kebutuhan ______.",
        answer: ["individu"],
        explanation: "Cangkul dibutuhkan oleh petani secara pribadi untuk pekerjaannya, sehingga termasuk kebutuhan individu."
    },
    {
        id: 25,
        question: "Jembatan digunakan oleh banyak warga untuk menyeberang sungai. Berdasarkan subjeknya, jembatan termasuk kebutuhan ______.",
        answer: ["bersama"],
        explanation: "Jembatan digunakan untuk kepentingan banyak orang, sehingga termasuk kebutuhan bersama."
    },
    {
        id: 26,
        question: "Saat haus, seseorang harus segera minum. Berdasarkan waktunya, minum saat haus termasuk kebutuhan ______.",
        answer: ["sekarang"],
        explanation: "Minum saat haus harus segera dipenuhi, sehingga termasuk kebutuhan sekarang."
    },
    {
        id: 27,
        question: "Lia menabung untuk membeli perlengkapan sekolah tahun depan. Berdasarkan waktunya, perlengkapan sekolah tahun depan termasuk kebutuhan ______.",
        answer: ["akan datang", "mendatang"],
        explanation: "Kebutuhan tersebut belum diperlukan saat ini, tetapi dipersiapkan untuk masa depan."
    },
    {
        id: 28,
        question: "Sebelum ada uang, seseorang menukar beras dengan ikan. Kegiatan menukar barang dengan barang disebut ______.",
        answer: ["barter"],
        explanation: "Barter adalah kegiatan pertukaran barang dengan barang sebelum manusia menggunakan uang."
    },
    {
        id: 29,
        question: "Ibu membayar sayur di pasar menggunakan uang kertas Rp10.000. Jenis uang yang digunakan ibu adalah uang ______.",
        answer: ["kartal"],
        explanation: "Uang kartal adalah uang yang digunakan secara langsung, contohnya uang kertas dan uang logam."
    },
    {
        id: 30,
        question: "Rafa membeli minuman dengan memindai QRIS melalui aplikasi di handphone. Jenis uang yang digunakan Rafa adalah uang ______.",
        answer: ["digital"],
        explanation: "QRIS digunakan melalui aplikasi atau perangkat digital, sehingga termasuk uang digital."
    }
];

// === WEB AUDIO API SYNTHESIZER FOR PREMIUM SFX ===
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play simple click sound
function playClickSFX() {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
        console.warn("Audio Context blocked or not supported:", e);
    }
}

// Play soft swoosh sound for slide transitions
function playSwooshSFX() {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.25);
        
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
        console.warn("Swoosh SFX error:", e);
    }
}

// Play cheerful double chime for correct answers
function playCorrectSFX() {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const now = audioCtx.currentTime;
        const freqs = [523.25, 659.25]; // C5 to E5 arpeggio
        
        freqs.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const start = now + index * 0.08;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.setValueAtTime(0.12, start);
            gainNode.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
            
            osc.start(start);
            osc.stop(start + 0.35);
        });
    } catch (e) {
        console.warn("Correct SFX error:", e);
    }
}

// Play lower coarse buzzer sound for wrong answers
function playWrongSFX() {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3 frequency
        osc.frequency.setValueAtTime(140, audioCtx.currentTime + 0.12); // drop down frequency
        
        gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.32);
    } catch (e) {
        console.warn("Wrong SFX error:", e);
    }
}

// Play success victory chime for the End Screen
function playSuccessSFX() {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major triad chord arpeggio)
        const now = audioCtx.currentTime;
        
        notes.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const start = now + index * 0.12;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.setValueAtTime(0.1, start);
            gainNode.gain.exponentialRampToValueAtTime(0.01, start + 0.45);
            
            osc.start(start);
            osc.stop(start + 0.5);
        });
    } catch (e) {
        console.warn("Success SFX error:", e);
    }
}

// === PRELOADING SLIDES SYSTEM ===
document.addEventListener("DOMContentLoaded", () => {
    // Preload slide images sequentially
    preloadSlides();
    
    // Generate navigation dots dynamically
    generateDots();
    
    // Generate slide drawer index items dynamically
    generateDrawerGrid();
    
    // Handle keyboard event listener
    document.addEventListener("keydown", handleKeyboard);
    
    // Handle Touch Gestures on Slides Wrapper
    const wrapper = document.getElementById("slidesWrapper");
    wrapper.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    wrapper.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    // Track Fullscreen Change events to update Fullscreen Toggle Button UI
    document.addEventListener("fullscreenchange", updateFullscreenButtonUI);
    document.addEventListener("webkitfullscreenchange", updateFullscreenButtonUI);
    
    // Load session state if it exists
    loadSessionState();
});

// Preloads all slide images by setting their real src
function preloadSlides() {
    for (let i = 1; i <= totalSlides; i++) {
        const slideEl = document.getElementById(`slide-${i}`);
        const imgEl = slideEl.querySelector("img");
        const src = imgEl.getAttribute("data-src");
        
        const tempImg = new Image();
        tempImg.src = src;
        
        tempImg.onload = () => {
            imgEl.src = src;
            imgEl.classList.add("loaded");
            const spinner = slideEl.querySelector(".slide-spinner");
            if (spinner) spinner.style.display = "none";
        };
    }
}

// === SCREEN AND TRANSITION FUNCTIONS ===

// Helper to automatically trigger Fullscreen mode on direct user click interactions
function requestFullscreenAutomatically() {
    const appContainer = document.getElementById("appContainer");
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        
        if (appContainer.requestFullscreen) {
            appContainer.requestFullscreen().catch(err => {
                console.log("Auto-fullscreen blocked or not supported:", err);
            });
        } else if (appContainer.webkitRequestFullscreen) {
            appContainer.webkitRequestFullscreen();
        }
    }
}

// Transition from Welcome Cover to Slide Presentation Screen
function startPresentation() {
    playClickSFX();
    
    quizActive = false;
    
    const coverScreen = document.getElementById("screen-cover");
    const presentationScreen = document.getElementById("screen-presentation");
    
    coverScreen.style.opacity = "0";
    coverScreen.style.transition = "opacity 0.4s ease";
    
    setTimeout(() => {
        coverScreen.classList.remove("active");
        coverScreen.style.display = "none";
        
        presentationScreen.style.display = "flex";
        presentationScreen.classList.add("active");
        presentationScreen.style.opacity = "0";
        
        // Reflow for transition
        void presentationScreen.offsetWidth;
        
        presentationScreen.style.transition = "opacity 0.4s ease";
        presentationScreen.style.opacity = "1";
        
        // Go to first slide initially
        goToSlide(1, 'next');
    }, 400);
}

// Jump directly to a specific slide index with custom transition direction
function goToSlide(index, direction = 'next') {
    if (index < 1 || index > totalSlides) return;
    
    const oldSlide = document.getElementById(`slide-${currentSlide}`);
    const newSlide = document.getElementById(`slide-${index}`);
    
    if (oldSlide && currentSlide !== index) {
        // Apply direction transitions classes
        oldSlide.classList.remove("active", "prev", "next");
        if (direction === 'next') {
            oldSlide.classList.add("prev");
        } else {
            oldSlide.classList.add("next");
        }
    }
    
    if (newSlide) {
        newSlide.classList.remove("active", "prev", "next");
        newSlide.classList.add("active");
        
        // Trigger lazy-load check if not loaded yet
        const img = newSlide.querySelector("img");
        if (img && !img.src) {
            img.src = img.getAttribute("data-src");
            img.onload = () => {
                img.classList.add("loaded");
                const spinner = newSlide.querySelector(".slide-spinner");
                if (spinner) spinner.style.display = "none";
            };
        }
    }
    
    currentSlide = index;
    
    // Play transition sound effect
    if (direction) {
        playSwooshSFX();
    }
    
    // Update toolbar indicator and footer elements
    updateUIElements();
    
    saveSessionState();
}

// Move forward in slideshow
function nextSlide() {
    if (currentSlide < totalSlides) {
        goToSlide(currentSlide + 1, 'next');
    } else {
        // Last slide finished -> Show Completion End Screen Popup
        showEndScreen();
    }
}

// Move backward in slideshow
function prevSlide() {
    if (currentSlide > 1) {
        goToSlide(currentSlide - 1, 'prev');
    }
}

// Updates headers, footers, buttons state, progress fills, and indicators
function updateUIElements() {
    // 1. Slide progress numbers indicator
    const indicator = document.getElementById("slideIndicator");
    indicator.textContent = `Slide ${currentSlide} / ${totalSlides}`;
    
    // 2. Linear progress bar fill percent
    const progressPercent = (currentSlide / totalSlides) * 100;
    document.getElementById("progressBar").style.width = `${progressPercent}%`;
    
    // 3. Navigation buttons active states
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    prevBtn.disabled = (currentSlide === 1);
    
    if (currentSlide === totalSlides) {
        nextBtn.innerHTML = `Selesai <span class="btn-arrow">🏁</span>`;
        nextBtn.style.background = "linear-gradient(135deg, var(--north-red), var(--north-red-dark))";
        nextBtn.style.boxShadow = "0 4px 0 #B22222";
    } else {
        nextBtn.innerHTML = `Lanjut <span class="btn-arrow">➡️</span>`;
        nextBtn.style.background = "linear-gradient(135deg, var(--south-blue), var(--south-blue-dark))";
        nextBtn.style.boxShadow = "0 4px 0 #1D549C";
    }
    
    // 4. Update Navigation bottom dots indicator
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, idx) => {
        if (idx === currentSlide - 1) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
    
    // 5. Update index drawer items active border
    const drawerCards = document.querySelectorAll(".drawer-card");
    drawerCards.forEach((card, idx) => {
        if (idx === currentSlide - 1) {
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }
    });
}

// Generates the bottom row circular navigation dots
function generateDots() {
    const container = document.getElementById("dotsIndicator");
    container.innerHTML = "";
    
    for (let i = 1; i <= totalSlides; i++) {
        const dot = document.createElement("div");
        dot.className = `dot ${i === 1 ? 'active' : ''}`;
        dot.title = `Lompat ke Slide ${i}`;
        dot.onclick = () => {
            playClickSFX();
            const direction = i > currentSlide ? 'next' : 'prev';
            goToSlide(i, direction);
        };
        container.appendChild(dot);
    }
}

// Generates the Grid of slides thumbnails in the slide jumping drawer
function generateDrawerGrid() {
    const grid = document.getElementById("drawerGrid");
    grid.innerHTML = "";
    
    for (let i = 1; i <= totalSlides; i++) {
        const card = document.createElement("div");
        card.className = `drawer-card ${i === 1 ? 'active' : ''}`;
        card.onclick = () => {
            playClickSFX();
            const direction = i > currentSlide ? 'next' : 'prev';
            goToSlide(i, direction);
            toggleSlideDrawer(false);
        };
        
        // Thumbnail Image container
        const preview = document.createElement("div");
        preview.className = "drawer-card-preview";
        
        const img = document.createElement("img");
        img.src = `assets/slide${i}.png`;
        img.alt = `Slide ${i}`;
        
        preview.appendChild(img);
        
        // Slide Number Label
        const numLabel = document.createElement("div");
        numLabel.className = "drawer-card-num";
        numLabel.textContent = `Slide ${i}`;
        
        card.appendChild(preview);
        card.appendChild(numLabel);
        grid.appendChild(card);
    }
}

// === AUTOPLAY MODE LOGIC ===
function toggleAutoplay() {
    playClickSFX();
    const btn = document.getElementById("autoplayBtn");
    
    if (isAutoplay) {
        // Pause Autoplay
        isAutoplay = false;
        clearInterval(autoplayTimer);
        autoplayTimer = null;
        btn.classList.remove("active");
        btn.querySelector(".btn-icon").textContent = "▶️";
        btn.querySelector(".btn-lbl").textContent = "Autoplay";
    } else {
        // Start Autoplay
        isAutoplay = true;
        btn.classList.add("active");
        btn.querySelector(".btn-icon").textContent = "⏸️";
        btn.querySelector(".btn-lbl").textContent = "Jeda";
        
        // Trigger cycle transition interval
        autoplayTimer = setInterval(() => {
            if (currentSlide < totalSlides) {
                nextSlide();
            } else {
                // Loop presentation back to slide 1
                goToSlide(1, 'next');
            }
        }, autoplayDuration);
    }
}

// Stop Autoplay immediately when user manually interacts
function stopAutoplayIfRunning() {
    if (isAutoplay) {
        toggleAutoplay();
    }
}

// Helper to hijack navigation button clicks to stop autoplay
const originalPrevSlide = prevSlide;
prevSlide = function() {
    stopAutoplayIfRunning();
    originalPrevSlide();
};

const originalNextSlide = nextSlide;
nextSlide = function() {
    stopAutoplayIfRunning();
    originalNextSlide();
};

// === INTERACTIVE DRAWER AND MODAL TOGGLERS ===

// Show or hide Navigation Help instruction modal overlay
function toggleHelpModal(show) {
    playClickSFX();
    const helpModal = document.getElementById("helpModal");
    if (show) {
        stopAutoplayIfRunning();
        helpModal.classList.add("show");
    } else {
        helpModal.classList.remove("show");
    }
}

// Open or close Slide Jump bottom index drawer list
function toggleSlideDrawer(show) {
    playClickSFX();
    const drawer = document.getElementById("drawerOverlay");
    if (show) {
        stopAutoplayIfRunning();
        drawer.classList.add("show");
    } else {
        drawer.classList.remove("show");
    }
}

// Show Completion Success End Screen Overlay
function showEndScreen() {
    stopAutoplayIfRunning();
    playSuccessSFX();
    
    const endScreen = document.getElementById("endScreen");
    endScreen.classList.add("show");
}

// Restarts presentation back to Slide 1 and resets overlays
function restartPresentation() {
    playClickSFX();
    document.getElementById("endScreen").classList.remove("show");
    goToSlide(1, 'prev');
}

// === INTERACTIVE CONTROLS: KEYBOARD SHORTCUTS & TOUCH SWIPES ===

// Handle Keyboard Navigation Keydown events
function handleKeyboard(e) {
    // Ignore keyboard shortcuts when user is typing in inputs or textareas
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        if (e.key === "Escape") {
            document.activeElement.blur();
        }
        return;
    }
    
    // If a modal or drawer is active, Escape will dismiss it
    if (e.key === "Escape") {
        document.getElementById("helpModal").classList.remove("show");
        document.getElementById("drawerOverlay").classList.remove("show");
        document.getElementById("explanationOverlay").classList.remove("show");
        return;
    }
    
    // Check if Quiz Screen is active
    if (quizActive) {
        switch (e.key) {
            case "ArrowRight":
                e.preventDefault();
                nextQuizQuestion();
                break;
            case "ArrowLeft":
                e.preventDefault();
                prevQuizQuestion();
                break;
        }
        
        switch (e.key.toUpperCase()) {
            case "A":
                e.preventDefault();
                selectOption("A");
                break;
            case "B":
                e.preventDefault();
                selectOption("B");
                break;
            case "C":
                e.preventDefault();
                selectOption("C");
                break;
            case "D":
                e.preventDefault();
                selectOption("D");
                break;
        }
        return;
    }
    
    // Only intercept presentation keys when the presentation screen is active
    const presentationActive = document.getElementById("screen-presentation").classList.contains("active");
    if (!presentationActive) return;
    
    switch (e.key) {
        case "ArrowRight":
        case " ": // Spacebar
            e.preventDefault();
            nextSlide();
            break;
        case "ArrowLeft":
            e.preventDefault();
            prevSlide();
            break;
        case "f":
        case "F":
            e.preventDefault();
            toggleFullscreen();
            break;
        case "a":
        case "A":
            e.preventDefault();
            toggleAutoplay();
            break;
        case "l":
        case "L":
            e.preventDefault();
            // Toggle slide drawer
            const drawerOpen = document.getElementById("drawerOverlay").classList.contains("show");
            toggleSlideDrawer(!drawerOpen);
            break;
        case "h":
        case "H":
            e.preventDefault();
            const helpOpen = document.getElementById("helpModal").classList.contains("show");
            toggleHelpModal(!helpOpen);
            break;
        case "q":
        case "Q":
            e.preventDefault();
            startQuizFromPresentation();
            break;
    }
}

// Handle Mobile Screen Touch Swipe gestures
function handleSwipe() {
    if (quizActive) return; // Disable swipe triggers during quiz screen
    
    const swipeDistance = touchEndX - touchStartX;
    
    // Swipe left (finger moves right to left) -> Go Next
    if (swipeDistance < -swipeThreshold) {
        nextSlide();
    }
    // Swipe right (finger moves left to right) -> Go Back
    else if (swipeDistance > swipeThreshold) {
        prevSlide();
    }
}

// === FULLSCREEN API CONTROLLER ===
function toggleFullscreen() {
    playClickSFX();
    const appContainer = document.getElementById("appContainer");
    
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        
        // Open Screen Fullscreen
        if (appContainer.requestFullscreen) {
            appContainer.requestFullscreen();
        } else if (appContainer.webkitRequestFullscreen) { /* Safari */
            appContainer.webkitRequestFullscreen();
        } else if (appContainer.msRequestFullscreen) { /* IE11 */
            appContainer.msRequestFullscreen();
        }
    } else {
        // Exit Screen Fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Updates browser Fullscreen button emoji in Toolbar Header
function updateFullscreenButtonUI() {
    const btn = document.getElementById("fullscreenBtn");
    const isFull = document.fullscreenElement || document.webkitFullscreenElement;
    
    if (btn) {
        if (isFull) {
            btn.querySelector(".btn-icon").textContent = "🔽";
            btn.title = "Keluar Layar Penuh (F)";
        } else {
            btn.querySelector(".btn-icon").textContent = "📺";
            btn.title = "Layar Penuh (F)";
        }
    }
}


// =============================================
// INTERACTIVE QUIZ ENGINE CODES
// =============================================

// Database Siswa Kelas 4 (Bisa diedit oleh Guru sesuai nomor absen)
const studentDatabase = {
    "1": "Aaliesha Shofwatunnisa Ahmad",
    "2": "Adhyastha Prasraya Mahaputra",
    "3": "Agha Dzakwan Viero",
    "4": "Alby Kamil Ardhani",
    "5": "Arkan Rasyad Pahrul",
    "6": "Arkananta Mahardika",
    "7": "Aydan Alarries Adidaya",
    "8": "Ayra Salsabila Pratiwi",
    "9": "El Ghfani Putra Aji",
    "10": "Fienna Aleesha Hadiyanto",
    "11": "Ghaniya Kaisafara Adji",
    "12": "Hizba Zyd Hamizan Ahmad",
    "13": "Ibrahim Aqila Zulkarnain",
    "14": "Kahfi Anarghya Cansera",
    "15": "Keenan Athaya Rasyid",
    "16": "Khairy Abimanyu Pambudi",
    "17": "La Reina Meccafaeya Shevian",
    "18": "Mirza Rizky Ukail",
    "19": "Muhammad Anwar Pulungan",
    "20": "Muhammad Athar Al-Fatih",
    "21": "Naura Falisha Azzahra",
    "22": "Nayla Azalia Akbar",
    "23": "Olivina Putri Cahyono",
    "24": "Rafaeyza Razka Prasetya",
    "25": "Rafazaky Abizar Zulkarnain",
    "26": "Raihan Nursaad Wardhana",
    "27": "Raka Ghailan Prhadana",
    "28": "Sabria Nur Latifah",
    "29": "Syatira Mampis Tuasa",
    "30": "Thaliefya Azzahra",
    "31": "Yumna Adelina Faldi",
    "32": "Zavier Shafaras Azka",
    "33": "Syifa Sabrina"
};

let currentStudentName = "";
let currentStudentAbsen = "";

// Dynamic Name Lookup for Attendance Number Input
function handleAbsenLookup(value) {
    const num = value.trim();
    const badge = document.getElementById("absenNameBadge");
    const startBtn = document.getElementById("startQuizBtn");
    
    if (!num) {
        badge.textContent = "Belum mengisi nomor absen";
        badge.style.background = "#F1F4F8";
        badge.style.color = "#718096";
        startBtn.style.opacity = "0.5";
        startBtn.style.pointerEvents = "none";
        return;
    }
    
    const name = studentDatabase[num];
    if (name) {
        badge.textContent = `Nama: ${name} ✅`;
        badge.style.background = "#EBFDF3";
        badge.style.color = "var(--green-dark)";
        startBtn.style.opacity = "1";
        startBtn.style.pointerEvents = "all";
    } else {
        badge.textContent = "Nomor absen tidak terdaftar ❌";
        badge.style.background = "#FFF5F5";
        badge.style.color = "var(--north-red)";
        startBtn.style.opacity = "0.5";
        startBtn.style.pointerEvents = "none";
    }
}

function openAbsenModal() {
    document.getElementById("absenInput").value = "";
    const badge = document.getElementById("absenNameBadge");
    badge.textContent = "Belum mengisi nomor absen";
    badge.style.background = "#F1F4F8";
    badge.style.color = "#718096";
    
    const startBtn = document.getElementById("startQuizBtn");
    startBtn.style.opacity = "0.5";
    startBtn.style.pointerEvents = "none";
    
    document.getElementById("absenModal").classList.add("show");
    setTimeout(() => document.getElementById("absenInput").focus(), 100);
}

function closeAbsenModal() {
    playClickSFX();
    document.getElementById("absenModal").classList.remove("show");
}

function confirmAbsenAndStart() {
    playClickSFX();
    
    const num = document.getElementById("absenInput").value.trim();
    const name = studentDatabase[num];
    
    if (name) {
        currentStudentName = name;
        currentStudentAbsen = num;
        
        // Hide Absen Modal
        document.getElementById("absenModal").classList.remove("show");
        
        const coverScreen = document.getElementById("screen-cover");
        const presScreen = document.getElementById("screen-presentation");
        const quizScreen = document.getElementById("screen-quiz");
        
        // Route seamlessly from active screen
        if (coverScreen.classList.contains("active")) {
            coverScreen.style.opacity = "0";
            coverScreen.style.transition = "opacity 0.4s ease";
            setTimeout(() => {
                coverScreen.classList.remove("active");
                coverScreen.style.display = "none";
                launchQuizScreen(quizScreen);
            }, 400);
        } else if (presScreen.classList.contains("active")) {
            presScreen.style.opacity = "0";
            presScreen.style.transition = "opacity 0.4s ease";
            setTimeout(() => {
                presScreen.classList.remove("active");
                presScreen.style.display = "none";
                launchQuizScreen(quizScreen);
            }, 400);
        } else {
            launchQuizScreen(quizScreen);
        }
    }
}

function launchQuizScreen(quizScreen) {
    quizScreen.style.display = "flex";
    quizScreen.classList.add("active");
    quizScreen.style.opacity = "0";
    void quizScreen.offsetWidth;
    quizScreen.style.transition = "opacity 0.4s ease";
    quizScreen.style.opacity = "1";
    initQuizState();
}

// Launch the Quiz screen directly from the Cover welcome page
function startQuizDirectly() {
    playClickSFX();
    openAbsenModal();
}

// Jump from Slide presentation header toolbar directly into Quiz Screen
function startQuizFromPresentation() {
    stopAutoplayIfRunning();
    playClickSFX();
    openAbsenModal();
}

// Jump from Slide end popup directly into Quiz Screen
function startQuizFromEndScreen() {
    document.getElementById("endScreen").classList.remove("show");
    startQuizFromPresentation();
}

// Transition back from Quiz Screen to Cover Welcome Page
function goToMainMenu() {
    playClickSFX();
    quizActive = false;
    
    try {
        localStorage.removeItem("asesmen_gaya_session");
    } catch (e) {}
    
    const activeScreen = document.querySelector(".screen.active");
    const coverScreen = document.getElementById("screen-cover");
    
    if (activeScreen) {
        activeScreen.style.opacity = "0";
        activeScreen.style.transition = "opacity 0.4s ease";
        
        setTimeout(() => {
            activeScreen.classList.remove("active");
            activeScreen.style.display = "none";
            
            coverScreen.style.display = "flex";
            coverScreen.classList.add("active");
            coverScreen.style.opacity = "0";
            
            void coverScreen.offsetWidth;
            
            coverScreen.style.transition = "opacity 0.4s ease";
            coverScreen.style.opacity = "1";
            
            // Reset slides pointer state
            currentSlide = 1;
        }, 400);
    }
}

// Global ANBK Answer Trackers
let studentAnswers = Array(15).fill(null);
let isUnsureFlags = Array(15).fill(false);
let studentAttempts = Array(15).fill(0);

// Initialize active quiz parameters
function initQuizState() {
    quizActive = true;
    currentQuestionIndex = 0;
    quizScore = 0;
    
    // Reset answers and flags arrays
    studentAnswers = Array(quizQuestions.length).fill(null);
    isUnsureFlags = Array(quizQuestions.length).fill(false);
    studentAttempts = Array(quizQuestions.length).fill(0);
    
    document.getElementById("quizScoreText").textContent = "0";
    
    saveSessionState();
    
    renderNumberGrid();
    loadQuestion();
}

// Renders the 1-15 circular buttons in the navigator grid
function renderNumberGrid() {
    const grid = document.getElementById("quizNumberGrid");
    if (!grid) return;
    grid.innerHTML = "";
    
    for (let i = 0; i < quizQuestions.length; i++) {
        const btn = document.createElement("button");
        btn.className = "num-btn";
        btn.textContent = i + 1;
        
        // Apply styling states
        if (i === currentQuestionIndex) {
            btn.classList.add("active");
        }
        if (studentAnswers[i] !== null) {
            btn.classList.add("answered");
        }
        if (isUnsureFlags[i]) {
            btn.classList.add("unsure");
        }
        
        btn.onclick = () => {
            playClickSFX();
            jumpToQuestion(i);
        };
        
        grid.appendChild(btn);
    }
}

// Jumps directly to a specific question index
function jumpToQuestion(index) {
    if (index < 0 || index >= quizQuestions.length) return;
    currentQuestionIndex = index;
    saveSessionState();
    loadQuestion();
}

// Pulls and loads question node template details
function loadQuestion() {
    const qData = quizQuestions[currentQuestionIndex];
    
    // Set Header indicators
    document.getElementById("quizQuestionIndicator").textContent = `Soal ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    
    // Set Top progress bar fill percentage
    const progressPercent = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById("progressBar").style.width = `${progressPercent}%`;
    
    // Handle Question Image
    const qImg = document.getElementById("quizQuestionImage");
    if (qData.image) {
        qImg.src = qData.image;
        qImg.style.display = "block";
    } else {
        qImg.src = "";
        qImg.style.display = "none";
    }
    
    // Inject Question text
    document.getElementById("quizQuestionText").textContent = qData.question;
    
    // Generate Options Cards in grid or Input Field for Isian
    const grid = document.getElementById("quizOptionsGrid");
    grid.innerHTML = "";
    
    const savedAnswer = studentAnswers[currentQuestionIndex];
    const isMultiSelect = Array.isArray(qData.answer);
    // For multi-select, savedAnswer is stored as a comma-joined string e.g. "A,C"
    const savedAnswerArr = isMultiSelect && savedAnswer ? savedAnswer.toString().split(",").map(s => s.trim().toUpperCase()) : [];
    const isAnswered = savedAnswer !== null && savedAnswer !== undefined && savedAnswer.toString().trim() !== "";
    const correctAnsStr = qData.answer ? (Array.isArray(qData.answer) ? qData.answer[0].toString().trim().toLowerCase() : qData.answer.toString().trim().toLowerCase()) : "";
    
    if (qData.options) {
        if (isMultiSelect) {
            // === MULTI-SELECT CHECKBOX MODE ===
            const correctAnswers = qData.answer.map(a => a.toString().trim().toUpperCase());
            let pendingSelections = isAnswered ? [...savedAnswerArr] : [];

            Object.keys(qData.options).forEach(letter => {
                const card = document.createElement("div");
                card.className = "option-card";
                card.setAttribute("data-letter", letter);
                card.style.cursor = isAnswered ? "default" : "pointer";
                card.style.userSelect = "none";

                const isThisCorrect = correctAnswers.includes(letter.toUpperCase());
                const isThisSelected = isAnswered
                    ? savedAnswerArr.includes(letter.toUpperCase())
                    : pendingSelections.includes(letter.toUpperCase());

                // Checkbox icon
                const checkbox = document.createElement("span");
                checkbox.className = "option-prefix";
                checkbox.style.fontSize = "1.1rem";
                checkbox.textContent = isThisSelected ? "☑" : "☐";
                checkbox.style.color = isThisSelected ? "#48BB78" : "";

                const text = document.createElement("span");
                text.className = "option-text";
                text.textContent = `${letter}. ${qData.options[letter]}`;

                if (isAnswered) {
                    if (isThisCorrect) {
                        card.style.background = "#C6F6D5";
                        card.style.borderColor = "#48BB78";
                        card.style.color = "#22543D";
                        checkbox.textContent = "☑";
                    } else if (isThisSelected && !isThisCorrect) {
                        card.style.background = "#FED7D7";
                        card.style.borderColor = "#FC8181";
                        card.style.color = "#742A2A";
                    } else {
                        card.style.opacity = "0.6";
                    }
                    card.onclick = null;
                } else {
                    if (isThisSelected) {
                        card.style.background = "#EBF8FF";
                        card.style.borderColor = "#4299E1";
                        card.style.color = "#2B6CB0";
                    }
                    card.onclick = () => {
                        playClickSFX();
                        const idx = pendingSelections.indexOf(letter.toUpperCase());
                        if (idx > -1) {
                            pendingSelections.splice(idx, 1);
                            card.style.background = "";
                            card.style.borderColor = "";
                            card.style.color = "";
                            checkbox.textContent = "☐";
                            checkbox.style.color = "";
                        } else {
                            pendingSelections.push(letter.toUpperCase());
                            card.style.background = "#EBF8FF";
                            card.style.borderColor = "#4299E1";
                            card.style.color = "#2B6CB0";
                            checkbox.textContent = "☑";
                            checkbox.style.color = "#48BB78";
                        }
                        // Update confirm button state
                        const confirmBtn = document.getElementById("multiSelectConfirmBtn");
                        if (confirmBtn) {
                            confirmBtn.disabled = pendingSelections.length === 0;
                            confirmBtn.style.opacity = pendingSelections.length === 0 ? "0.5" : "1";
                        }
                    };
                }

                card.appendChild(checkbox);
                card.appendChild(text);
                grid.appendChild(card);
            });

            // Confirm button for multi-select
            if (!isAnswered) {
                const confirmBtn = document.createElement("button");
                confirmBtn.id = "multiSelectConfirmBtn";
                confirmBtn.textContent = "✅ Konfirmasi Jawaban";
                confirmBtn.disabled = pendingSelections.length === 0;
                confirmBtn.style.cssText = `
                    margin-top: 14px; padding: 12px 28px; border-radius: 10px;
                    background: linear-gradient(135deg, #48BB78, #38A169); color: white;
                    font-weight: 800; font-size: 1rem; border: none; cursor: pointer;
                    width: 100%; opacity: ${pendingSelections.length === 0 ? "0.5" : "1"};
                    transition: opacity 0.2s, transform 0.1s;
                `;
                confirmBtn.onmouseenter = () => { if (!confirmBtn.disabled) confirmBtn.style.transform = "scale(1.02)"; };
                confirmBtn.onmouseleave = () => { confirmBtn.style.transform = "scale(1)"; };
                confirmBtn.onclick = () => {
                    if (pendingSelections.length === 0) return;
                    const answerStr = pendingSelections.sort().join(",");
                    handleMultiSelectAnswer(answerStr, correctAnswers);
                };
                grid.appendChild(confirmBtn);
            }

        } else {
            // === SINGLE SELECT MODE ===
            Object.keys(qData.options).forEach(letter => {
                const card = document.createElement("div");
                card.className = "option-card";
                card.setAttribute("data-letter", letter);
                
                if (isAnswered) {
                    const isThisStudentAnswer = savedAnswer.toString().toLowerCase() === letter.toLowerCase();
                    const isThisCorrectAnswer = correctAnsStr === letter.toLowerCase();
                    
                    if (isThisCorrectAnswer) {
                        card.style.background = "#C6F6D5";
                        card.style.borderColor = "#48BB78";
                        card.style.color = "#22543D";
                    } else if (isThisStudentAnswer) {
                        card.style.background = "#FED7D7";
                        card.style.borderColor = "#FC8181";
                        card.style.color = "#742A2A";
                    } else {
                        card.style.opacity = "0.6";
                    }
                    
                    if (isThisStudentAnswer) {
                        card.classList.add("selected");
                    }
                    // Lock option
                    card.onclick = null;
                    card.style.cursor = "default";
                } else {
                    card.onclick = () => selectOption(letter);
                }
                
                const prefix = document.createElement("span");
                prefix.className = "option-prefix";
                prefix.textContent = letter;
                
                const text = document.createElement("span");
                text.className = "option-text";
                text.textContent = qData.options[letter];
                
                card.appendChild(prefix);
                card.appendChild(text);
                grid.appendChild(card);
            });
        }
    } else if (qData.dragOptions) {
        // Drag and Drop hibrid (Drag & Drop + Click-to-Select) UI
        const container = document.createElement("div");
        container.className = "drag-drop-container";
        
        // Drop Zone Box
        const dropZone = document.createElement("div");
        dropZone.className = "drop-zone";
        if (savedAnswer) {
            dropZone.textContent = savedAnswer;
            dropZone.classList.add("filled");
            
            if (isAnswered) {
                const isCorrect = correctAnsStr === savedAnswer.toString().toLowerCase();
                dropZone.style.background = isCorrect ? "#C6F6D5" : "#FED7D7";
                dropZone.style.borderColor = isCorrect ? "#48BB78" : "#FC8181";
                dropZone.style.color = isCorrect ? "#22543D" : "#742A2A";
            }
        } else {
            dropZone.innerHTML = `<span class="drop-placeholder">👉 Taruh / Klik jawaban di sini 👈</span>`;
        }
        
        if (!isAnswered) {
            // Handle drag & drop events
            dropZone.ondragover = (e) => {
                e.preventDefault();
                dropZone.classList.add("drag-over");
            };
            
            dropZone.ondragleave = () => {
                dropZone.classList.remove("drag-over");
            };
            
            dropZone.ondrop = (e) => {
                e.preventDefault();
                dropZone.classList.remove("drag-over");
                const text = e.dataTransfer.getData("text/plain");
                if (text) {
                    selectDragAnswer(text);
                }
            };
            
            // Clear answer on click of drop zone (to reset)
            dropZone.onclick = () => {
                if (studentAnswers[currentQuestionIndex]) {
                    playClickSFX();
                    studentAnswers[currentQuestionIndex] = null;
                    saveSessionState();
                    loadQuestion();
                }
            };
        }
        
        // Draggable Options List
        const optionsList = document.createElement("div");
        optionsList.className = "drag-options-list";
        
        qData.dragOptions.forEach(opt => {
            const dragCard = document.createElement("div");
            dragCard.className = "drag-card";
            dragCard.textContent = opt;
            
            if (isAnswered) {
                dragCard.draggable = false;
                dragCard.style.opacity = "0.5";
                dragCard.style.cursor = "default";
                
                if (savedAnswer === opt) {
                    dragCard.classList.add("selected");
                    dragCard.style.opacity = "1";
                }
            } else {
                dragCard.draggable = true;
                if (savedAnswer === opt) dragCard.classList.add("selected");
                
                dragCard.ondragstart = (e) => {
                    e.dataTransfer.setData("text/plain", opt);
                    dragCard.classList.add("dragging");
                };
                dragCard.ondragend = () => dragCard.classList.remove("dragging");
                dragCard.onclick = () => {
                    playClickSFX();
                    selectDragAnswer(opt);
                };
            }
            
            optionsList.appendChild(dragCard);
        });
        
        container.appendChild(dropZone);
        container.appendChild(optionsList);
        grid.appendChild(container);
    } else {
        // Isian Singkat (Fill-in-the-blank) input UI
        const container = document.createElement("div");
        container.className = "isian-container";
        
        const input = document.createElement("input");
        input.type = "text";
        input.className = "isian-input";
        input.placeholder = "Tulis jawabanmu di sini...";
        input.value = savedAnswer || "";
        
        if (isAnswered) {
            input.readOnly = true;
            let isCorrect = false;
            if (Array.isArray(qData.answer)) {
                isCorrect = qData.answer.some(a => savedAnswer.toString().trim().toLowerCase() === a.toString().trim().toLowerCase());
            } else {
                isCorrect = savedAnswer.toString().trim().toLowerCase() === correctAnsStr;
            }
            input.style.background = isCorrect ? "#C6F6D5" : "#FED7D7";
            input.style.borderColor = isCorrect ? "#48BB78" : "#FC8181";
            input.style.color = isCorrect ? "#22543D" : "#742A2A";
        } else {
            input.onchange = (e) => {
                const val = e.target.value.trim();
                if(val) handleAnswerAttempt(val);
            };
        }
        
        container.appendChild(input);
        grid.appendChild(container);
        
        // Auto focus
        setTimeout(() => input.focus(), 100);
    }
    
    // Get footer control buttons
    const prevBtn = document.getElementById("quizPrevBtn");
    const nextBtn = document.getElementById("quizNextBtn");
    const submitBtn = document.getElementById("quizSubmitBtn");
    const unsureBtn = document.getElementById("quizUnsureBtn");
    
    // Back button state
    if (prevBtn) {
        prevBtn.disabled = (currentQuestionIndex === 0);
    }
    
    // Unsure (Ragu-Ragu) button styling highlight
    if (unsureBtn) {
        if (isUnsureFlags[currentQuestionIndex]) {
            unsureBtn.classList.add("active");
            unsureBtn.style.background = "#FFC738";
            unsureBtn.style.border = "3px solid var(--north-red)";
        } else {
            unsureBtn.classList.remove("active");
            unsureBtn.style.background = "var(--accent-gold)";
            unsureBtn.style.border = "none";
        }
    }
    
    // Show Selesai (Submit) button on the last question, otherwise show Lanjut (Next)
    if (currentQuestionIndex === quizQuestions.length - 1) {
        if (nextBtn) nextBtn.style.display = "none";
        if (submitBtn) submitBtn.style.display = "inline-block";
    } else {
        if (nextBtn) nextBtn.style.display = "inline-block";
        if (submitBtn) submitBtn.style.display = "none";
    }
    
    // ============================================
    // INSTANT FEEDBACK RENDERING (KJ & PEMBAHASAN)
    // ============================================
    const feedbackArea = document.getElementById("quizFeedbackArea");
    if (feedbackArea) {
        const currentAns = studentAnswers[currentQuestionIndex];
        const isAnsweredNow = currentAns !== null && currentAns !== undefined && currentAns.toString().trim() !== "";
        
        if (isAnsweredNow) {
            feedbackArea.style.display = "flex";
            let isCorrect = false;
            let correctAnsDisplay = "";

            if (Array.isArray(qData.answer)) {
                // Multi-select: compare sorted arrays
                const correctSorted = qData.answer.map(a => a.toString().trim().toUpperCase()).sort().join(",");
                const studentSorted = currentAns.toString().trim().toUpperCase().split(",").map(s => s.trim()).sort().join(",");
                isCorrect = correctSorted === studentSorted;
                correctAnsDisplay = qData.answer.join(" dan ");
            } else {
                const correctAnsStr = qData.answer.toString().trim().toLowerCase();
                isCorrect = currentAns.toString().trim().toLowerCase() === correctAnsStr;
                correctAnsDisplay = qData.answer;
            }

            feedbackArea.innerHTML = `
                <div style="margin-top: 10px; background: ${isCorrect ? '#F0FFF4' : '#FFF5F5'}; border: 2.5px solid ${isCorrect ? '#68D391' : '#FC8181'}; border-radius: 12px; padding: 16px; animation: fadeIn 0.3s ease;">
                    <div style="font-size: var(--fs-base); font-weight: 800; color: ${isCorrect ? '#22543D' : '#742A2A'}; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        ${isCorrect ? '✅ Jawabanmu Benar!' : '❌ Jawabanmu Salah'}
                    </div>
                    <div style="padding: 10px; background: white; border: 1.5px solid #E2E8F0; border-radius: 8px; font-weight: 800; color: #2D3748; margin-bottom: 12px; font-size: var(--fs-sm);">
                        Kunci Jawaban: <span style="color: #48BB78;">${correctAnsDisplay}</span>
                    </div>
                    ${qData.explanation ? `
                    <div style="background: #EBF8FF; border-left: 4px solid #4299E1; border-radius: 6px; padding: 10px 14px;">
                        <span style="font-size: 0.8rem; font-weight: 900; color: #2B6CB0; display: block; margin-bottom: 4px;">💡 PEMBAHASAN:</span>
                        <p style="font-weight: 700; color: #2C5282; margin: 0; line-height: 1.5; font-size: var(--fs-sm);">${qData.explanation}</p>
                    </div>
                    ` : ""}
                </div>
            `;
        } else {
            feedbackArea.style.display = "none";
            feedbackArea.innerHTML = "";
        }
    }

    // Sync Navigator active/answered rings
    renderNumberGrid();
}

// Centralized answer handler to manage the "1 retry" logic
function handleAnswerAttempt(studentAnsStr) {
    const qData = quizQuestions[currentQuestionIndex];
    const correctAnsStr = qData.answer ? (Array.isArray(qData.answer) ? qData.answer[0].toString().trim().toLowerCase() : qData.answer.toString().trim().toLowerCase()) : "";
    
    let isCorrect = false;
    if (Array.isArray(qData.answer)) {
        isCorrect = qData.answer.some(a => studentAnsStr.toString().trim().toLowerCase() === a.toString().trim().toLowerCase());
    } else {
        isCorrect = studentAnsStr.toString().trim().toLowerCase() === correctAnsStr;
    }

    if (isCorrect) {
        if (typeof playCorrectSFX === "function") playCorrectSFX();
        else playClickSFX();
        
        studentAnswers[currentQuestionIndex] = studentAnsStr;
        saveSessionState();
        loadQuestion();
    } else {
        // Wrong answer
        studentAttempts[currentQuestionIndex] = (studentAttempts[currentQuestionIndex] || 0) + 1;
        
        if (studentAttempts[currentQuestionIndex] < 2) {
            if (typeof playWrongSFX === "function") playWrongSFX();
            else playClickSFX(); 
            
            // Show try again message without locking
            const feedbackArea = document.getElementById("quizFeedbackArea");
            if (feedbackArea) {
                feedbackArea.style.display = "flex";
                feedbackArea.innerHTML = `
                    <div style="margin-top: 10px; background: #FFF5F5; border: 2.5px solid #FC8181; border-radius: 12px; padding: 16px; animation: shake 0.4s ease;">
                        <div style="font-size: var(--fs-base); font-weight: 800; color: #742A2A; display: flex; align-items: center; gap: 8px;">
                            ❌ Jawaban belum tepat. Ayo coba 1 kali lagi! Semangat! 💪
                        </div>
                    </div>
                `;
            }
        } else {
            // Second attempt failed, lock and show correct answer
            if (typeof playWrongSFX === "function") playWrongSFX();
            else playClickSFX();
            
            studentAnswers[currentQuestionIndex] = studentAnsStr;
            saveSessionState();
            loadQuestion();
        }
    }
}

// Stores selected option letter (ANBK-style free selection)
function selectOption(letter) {
    handleAnswerAttempt(letter);
}

// Handles multi-select answer submission (array-type questions)
function handleMultiSelectAnswer(answerStr, correctAnswers) {
    const correctSorted = correctAnswers.map(a => a.trim().toUpperCase()).sort().join(",");
    const studentSorted = answerStr.toUpperCase().split(",").map(s => s.trim()).sort().join(",");
    const isCorrect = correctSorted === studentSorted;

    studentAttempts[currentQuestionIndex] = (studentAttempts[currentQuestionIndex] || 0) + 1;

    if (isCorrect) {
        if (typeof playCorrectSFX === "function") playCorrectSFX();
        studentAnswers[currentQuestionIndex] = answerStr;
        saveSessionState();
        loadQuestion();
    } else {
        if (studentAttempts[currentQuestionIndex] < 2) {
            if (typeof playWrongSFX === "function") playWrongSFX();
            const feedbackArea = document.getElementById("quizFeedbackArea");
            if (feedbackArea) {
                feedbackArea.style.display = "flex";
                feedbackArea.innerHTML = `
                    <div style="margin-top: 10px; background: #FFF5F5; border: 2.5px solid #FC8181; border-radius: 12px; padding: 16px; animation: shake 0.4s ease;">
                        <div style="font-size: var(--fs-base); font-weight: 800; color: #742A2A; display: flex; align-items: center; gap: 8px;">
                            ❌ Jawaban belum tepat. Ayo coba 1 kali lagi! Semangat! 💪
                        </div>
                    </div>
                `;
            }
        } else {
            if (typeof playWrongSFX === "function") playWrongSFX();
            studentAnswers[currentQuestionIndex] = answerStr;
            saveSessionState();
            loadQuestion();
        }
    }
}

// Stores selected drag answer and triggers session auto-save
function selectDragAnswer(answer) {
    handleAnswerAttempt(answer);
}

// Toggles active question Unsure (Ragu-Ragu) flag
function toggleUnsureFlag() {
    playClickSFX();
    isUnsureFlags[currentQuestionIndex] = !isUnsureFlags[currentQuestionIndex];
    saveSessionState();
    loadQuestion();
}

// Navigates to the previous question
function prevQuizQuestion() {
    if (currentQuestionIndex > 0) {
        playClickSFX();
        currentQuestionIndex--;
        saveSessionState();
        loadQuestion();
    }
}

// Navigates to the next question
function nextQuizQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        playClickSFX();
        currentQuestionIndex++;
        saveSessionState();
        loadQuestion();
    }
}

// Triggers the submit confirmation modal showing stats
function checkSubmitQuiz() {
    playClickSFX();
    
    const answeredCount = studentAnswers.filter(ans => ans !== null).length;
    const unsureCount = isUnsureFlags.filter(flag => flag === true).length;
    
    document.getElementById("statAnswered").textContent = answeredCount;
    document.getElementById("statUnsure").textContent = unsureCount;
    
    document.getElementById("quizSubmitConfirmModal").classList.add("show");
}

// Closes the submit confirmation overlay
function closeSubmitConfirmModal() {
    playClickSFX();
    document.getElementById("quizSubmitConfirmModal").classList.remove("show");
}

// Evaluates the full quiz answers and updates scores at submission
function confirmSubmitQuiz() {
    playClickSFX();
    document.getElementById("quizSubmitConfirmModal").classList.remove("show");
    
    // Calculate score based on specific question types
    let rawScore = 0;
    for (let i = 0; i < quizQuestions.length; i++) {
        const studentAns = studentAnswers[i] ? studentAnswers[i].toString().trim() : "";
        
        let isCorrect = false;
        if (Array.isArray(quizQuestions[i].answer)) {
            // Multi-select: all selected answers must exactly match correct answers
            const correctSorted = quizQuestions[i].answer.map(a => a.toString().trim().toUpperCase()).sort().join(",");
            const studentSorted = studentAns.toUpperCase().split(",").map(s => s.trim()).sort().join(",");
            isCorrect = (correctSorted === studentSorted) && studentAns !== "";
        } else {
            const correctAns = quizQuestions[i].answer ? quizQuestions[i].answer.toString().trim().toLowerCase() : "";
            isCorrect = (studentAns.toLowerCase() === correctAns);
        }
        
        if (isCorrect) {
            rawScore += 1;
        }
    }
    
    // Final score formula: (jumlah benar ÷ 3) × 10  → maks 30 benar = 100
    quizScore = Math.round((rawScore / 3) * 10);
    document.getElementById("quizScoreText").textContent = quizScore;
    
    // Terminate active quiz status
    quizActive = false;
    
    // Automatically submit to Google Form in the background
    sendQuizToGoogleForm(true);
    
    try {
        localStorage.removeItem("asesmen_gaya_session");
    } catch (e) {}
    
    // Trigger success chime and show end screen
    showQuizEndScreen();
}

// Show the final quiz score report screen popup
function showQuizEndScreen() {
    playSuccessSFX();
    
    document.getElementById("quizFinalScore").textContent = `${quizScore} / 100 Poin ⭐`;
    
    // Pre-fill student name in reporting card
    const nameInput = document.getElementById("studentName");
    if (nameInput) {
        nameInput.value = currentStudentName ? `${currentStudentAbsen}. ${currentStudentName}` : "";
    }
    
    document.getElementById("quizEndScreen").classList.add("show");
}

// Reset quiz state and restart
function restartQuiz() {
    playClickSFX();
    document.getElementById("quizEndScreen").classList.remove("show");
    initQuizState();
}

// Prepares and builds Whatsapp score report URL links
function sendQuizToWhatsApp() {
    playClickSFX();
    const nameInput = document.getElementById("studentName");
    const name = nameInput.value.trim();
    
    if (!name) {
        alert("Silakan masukkan nama lengkapmu terlebih dahulu sebelum mengirim nilai! ✍️");
        nameInput.focus();
        return;
    }
    
    const message = `Halo Guru! 🏫\nSaya telah menyelesaikan Kuis Asesmen Materi Gaya.\n\n👤 Nama Lengkap: ${name}\n🏆 Skor Kuis: ${quizScore} / 100 Poin ⭐\n\nTerima kasih! 🧲`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    window.open(waUrl, "_blank");
}

// Automated submission method to Google Form in the background (Robust HTML Form targeted to Iframe)
function sendQuizToGoogleForm(isAuto = false) {
    if (!isAuto) playClickSFX();
    
    if (!currentStudentName) {
        if (!isAuto) alert("Identitas nomor absen siswa belum terdaftar! Silakan ulangi kuis. ❌");
        return;
    }
    
    // Google Form Integration Configuration (Real values automatically populated)
    const formId = "1FAIpQLSeQog7osSZyc_BsAsxMyYlxmXUXN0CsqBFrter4rMFfbGMFvA";
    const entryAbsen = "entry.822934128";
    const entryNama = "entry.1238989109";
    const entrySkor = "entry.2010049899";
    
    const submitUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
    
    // Ensure hidden background iframe exists
    let iframe = document.getElementById("hidden_iframe");
    if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "hidden_iframe";
        iframe.name = "hidden_iframe";
        iframe.style.display = "none";
        iframe.src = "about:blank";
        document.body.appendChild(iframe);
    }
    
    // Create hidden form element to POST data silently
    const hiddenForm = document.createElement("form");
    hiddenForm.method = "POST";
    hiddenForm.action = submitUrl;
    hiddenForm.target = "hidden_iframe"; // Send to the background iframe
    hiddenForm.style.display = "none";
    
    // Input 1: Absen
    const inputAbsen = document.createElement("input");
    inputAbsen.type = "hidden";
    inputAbsen.name = entryAbsen;
    inputAbsen.value = currentStudentAbsen;
    hiddenForm.appendChild(inputAbsen);
    
    // Input 2: Nama
    const inputNama = document.createElement("input");
    inputNama.type = "hidden";
    inputNama.name = entryNama;
    inputNama.value = currentStudentName;
    hiddenForm.appendChild(inputNama);
    
    // Input 3: Skor
    const inputSkor = document.createElement("input");
    inputSkor.type = "hidden";
    inputSkor.name = entrySkor;
    inputSkor.value = quizScore;
    hiddenForm.appendChild(inputSkor);
    
    // Submit form silently
    document.body.appendChild(hiddenForm);
    
    try {
        hiddenForm.submit();
        console.log("Background Google Form submission triggered.");
    } catch (e) {
        console.warn("Direct form submit error:", e);
    }
    
    // CRITICAL FIX: Do NOT remove the form element from DOM immediately.
    // Doing so synchronously causes modern browsers (Chrome/Safari) to abort the request.
    setTimeout(() => {
        if (document.body.contains(hiddenForm)) {
            document.body.removeChild(hiddenForm);
        }
    }, 2000);
    
    // Show success status on UI
    const statusText = document.getElementById("autoSubmitStatus");
    if (statusText) {
        statusText.style.display = "block";
        statusText.textContent = `✓ Nilai atas nama "${currentStudentName}" (Absen ${currentStudentAbsen}) berhasil terkirim otomatis ke Google Form Guru!`;
    }
    
    if (!isAuto) {
        alert(`🎉 Nilai atas nama "${currentStudentName}" (Absen ${currentStudentAbsen}) dengan Skor ${quizScore} BERHASIL dikirim otomatis ke Google Form Guru! Terima kasih! ✨`);
    } else {
        console.log("Automated background Google Form submission completed.");
    }
}

// === LOCAL STORAGE SESSION RECOVERY FUNCTIONS ===
function saveSessionState() {
    try {
        const state = {
            currentSlide: currentSlide,
            quizActive: quizActive,
            currentQuestionIndex: currentQuestionIndex,
            studentAnswers: studentAnswers,
            isUnsureFlags: isUnsureFlags,
            studentAttempts: studentAttempts,
            currentStudentName: currentStudentName,
            currentStudentAbsen: currentStudentAbsen
        };
        localStorage.setItem("asesmen_gaya_session", JSON.stringify(state));
    } catch (e) {
        console.warn("Could not save session state to localStorage:", e);
    }
}

function loadSessionState() {
    try {
        const saved = localStorage.getItem("asesmen_gaya_session");
        if (!saved) return;
        
        const state = JSON.parse(saved);
        
        // Restore student identity if it exists
        if (state.currentStudentName) {
            currentStudentName = state.currentStudentName;
            currentStudentAbsen = state.currentStudentAbsen;
        }
        
        // Restore slide presentation state
        if (state.currentSlide) {
            currentSlide = state.currentSlide;
        }
        
        // Restore quiz state
        if (state.quizActive) {
            quizActive = state.quizActive;
            currentQuestionIndex = state.currentQuestionIndex || 0;
            
            // Restore answers array
            if (state.studentAnswers && state.studentAnswers.length === quizQuestions.length) {
                studentAnswers = state.studentAnswers;
                isUnsureFlags = state.isUnsureFlags || Array(quizQuestions.length).fill(false);
                studentAttempts = state.studentAttempts || Array(quizQuestions.length).fill(0);
            } else {
                studentAnswers = Array(quizQuestions.length).fill(null);
                isUnsureFlags = Array(quizQuestions.length).fill(false);
                studentAttempts = Array(quizQuestions.length).fill(0);
            }
            
            // Seamlessly route to quiz screen if it was active
            const coverScreen = document.getElementById("screen-cover");
            const quizScreen = document.getElementById("screen-quiz");
            if (coverScreen && quizScreen) {
                coverScreen.classList.remove("active");
                coverScreen.style.display = "none";
                quizScreen.style.display = "flex";
                quizScreen.classList.add("active");
                quizScreen.style.opacity = "1";
            }
            
            renderNumberGrid();
            loadQuestion();
        } else if (state.currentSlide > 1) {
            // Restore to the saved slide in presentation
            const coverScreen = document.getElementById("screen-cover");
            const presentationScreen = document.getElementById("screen-presentation");
            if (coverScreen && presentationScreen) {
                coverScreen.classList.remove("active");
                coverScreen.style.display = "none";
                presentationScreen.style.display = "flex";
                presentationScreen.classList.add("active");
                presentationScreen.style.opacity = "1";
            }
            goToSlide(currentSlide, null); // Load silently without SFX transition
        }
    } catch (e) {
        console.warn("Could not load session state from localStorage:", e);
    }
}

// =============================================
// REVIEW PEMBAHASAN SCREEN
// =============================================

function openReviewScreen() {
    playClickSFX();

    // Hide quiz end overlay
    document.getElementById("quizEndScreen").classList.remove("show");

    // Hide quiz screen
    const quizScreen = document.getElementById("screen-quiz");
    if (quizScreen) {
        quizScreen.classList.remove("active");
        quizScreen.style.display = "none";
    }

    // Show review screen
    const reviewScreen = document.getElementById("screen-review");
    if (reviewScreen) {
        reviewScreen.style.display = "block";
        reviewScreen.classList.add("active");
        reviewScreen.scrollTop = 0;
    }

    renderReviewCards();
}

function closeReviewScreen() {
    playClickSFX();

    // Hide review screen
    const reviewScreen = document.getElementById("screen-review");
    if (reviewScreen) {
        reviewScreen.classList.remove("active");
        reviewScreen.style.display = "none";
    }

    // Show quiz end overlay again
    document.getElementById("quizEndScreen").classList.add("show");

    // Restore quiz screen
    const quizScreen = document.getElementById("screen-quiz");
    if (quizScreen) {
        quizScreen.style.display = "flex";
        quizScreen.classList.add("active");
    }
}

function renderReviewCards() {
    const container = document.getElementById("reviewQuestionsContainer");
    const summary = document.getElementById("reviewScoreSummary");
    if (!container) return;
    container.innerHTML = "";

    // Count correct answers
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    quizQuestions.forEach((q, i) => {
        const studentAns = studentAnswers[i];
        const studentAnsStr = studentAns !== null && studentAns !== undefined ? studentAns.toString().trim() : null;

        let isCorrect = false;
        if (studentAnsStr !== null) {
            if (Array.isArray(q.answer)) {
                // Multi-select: compare sorted arrays exactly
                const correctSorted = q.answer.map(a => a.toString().trim().toUpperCase()).sort().join(",");
                const studentSorted = studentAnsStr.toUpperCase().split(",").map(s => s.trim()).sort().join(",");
                isCorrect = correctSorted === studentSorted;
            } else {
                isCorrect = studentAnsStr.toLowerCase() === q.answer.toString().trim().toLowerCase();
            }
        }

        if (studentAns === null || studentAns === undefined) unansweredCount++;
        else if (isCorrect) correctCount++;
        else wrongCount++;
    });

    // Render summary bar
    summary.innerHTML = `
        <div style="text-align:center;">
            <span style="font-size:1.4rem; font-weight:900; color:#2D3748;">Skor Akhir:</span>
            <span style="font-size:1.8rem; font-weight:900; color:#4A90E2; margin-left:8px;">${quizScore} / 100 Poin ⭐</span>
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center; margin-top:10px;">
            <span style="background:#C6F6D5; color:#22543D; padding:6px 16px; border-radius:20px; font-weight:800;">✅ Benar: ${correctCount}</span>
            <span style="background:#FED7D7; color:#742A2A; padding:6px 16px; border-radius:20px; font-weight:800;">❌ Salah: ${wrongCount}</span>
            <span style="background:#E2E8F0; color:#4A5568; padding:6px 16px; border-radius:20px; font-weight:800;">⬜ Kosong: ${unansweredCount}</span>
        </div>
    `;

    // Render each question card
    quizQuestions.forEach((q, i) => {
        const studentAns = studentAnswers[i];
        const studentAnsStr = studentAns !== null && studentAns !== undefined ? studentAns.toString().trim() : null;
        const isMultiSelectQ = Array.isArray(q.answer);
        const correctAnswersArr = isMultiSelectQ ? q.answer.map(a => a.toString().trim().toUpperCase()) : [];
        const correctAnsStr = isMultiSelectQ ? "" : q.answer.toString().trim().toLowerCase();
        const correctAnsDisplay = isMultiSelectQ ? q.answer.join(" dan ") : q.answer;

        let isCorrect = false;
        if (studentAnsStr !== null) {
            if (isMultiSelectQ) {
                const correctSorted = correctAnswersArr.sort().join(",");
                const studentSorted = studentAnsStr.toUpperCase().split(",").map(s => s.trim()).sort().join(",");
                isCorrect = correctSorted === studentSorted;
            } else {
                isCorrect = studentAnsStr.toLowerCase() === correctAnsStr;
            }
        }

        const isUnanswered = studentAns === null || studentAns === undefined;

        // Card border color
        let cardBorderColor = isUnanswered ? "#CBD5E0" : isCorrect ? "#68D391" : "#FC8181";
        let cardBg = isUnanswered ? "#F7FAFC" : isCorrect ? "#F0FFF4" : "#FFF5F5";
        let statusIcon = isUnanswered ? "⬜" : isCorrect ? "✅" : "❌";
        let statusText = isUnanswered ? "Tidak Dijawab" : isCorrect ? "Benar" : "Salah";
        let statusColor = isUnanswered ? "#718096" : isCorrect ? "#22543D" : "#742A2A";
        let statusBg = isUnanswered ? "#EDF2F7" : isCorrect ? "#C6F6D5" : "#FED7D7";

        // Determine question type label
        let typeLabel = "";
        if (i < 15) typeLabel = "Pilihan Ganda";
        else typeLabel = "Isian Singkat";

        // Build options HTML (only for multiple choice)
        let optionsHTML = "";
        if (q.options && i < 15) {
            // Get student selected letters as array for multi-select
            const studentSelectedLetters = isMultiSelectQ && studentAnsStr
                ? studentAnsStr.toUpperCase().split(",").map(s => s.trim())
                : [];

            Object.entries(q.options).forEach(([key, val]) => {
                const keyUpper = key.toUpperCase();
                const keyLower = key.toLowerCase();
                const isThisCorrect = isMultiSelectQ
                    ? correctAnswersArr.includes(keyUpper)
                    : correctAnsStr === keyLower;
                const isThisStudentAnswer = isMultiSelectQ
                    ? studentSelectedLetters.includes(keyUpper)
                    : (studentAnsStr ? studentAnsStr.toLowerCase() === keyLower : false);

                let optBg = "white";
                let optBorder = "#E2E8F0";
                let optLabel = "";
                let optColor = "#2D3748";
                let optPrefix = isMultiSelectQ ? "☐ " : "";

                if (isThisCorrect && isThisStudentAnswer) {
                    optBg = "#C6F6D5";
                    optBorder = "#48BB78";
                    optLabel = isMultiSelectQ ? " ✅ Benar (KJ)" : " ✅ Benar!";
                    optColor = "#22543D";
                    optPrefix = isMultiSelectQ ? "☑ " : "";
                } else if (isThisCorrect) {
                    optBg = "#C6F6D5";
                    optBorder = "#48BB78";
                    optLabel = " ✅ KJ";
                    optColor = "#22543D";
                    optPrefix = isMultiSelectQ ? "☑ " : "";
                } else if (isThisStudentAnswer && !isThisCorrect) {
                    optBg = "#FED7D7";
                    optBorder = "#FC8181";
                    optLabel = " ❌ Jawabanmu";
                    optColor = "#742A2A";
                    optPrefix = isMultiSelectQ ? "☑ " : "";
                }

                optionsHTML += `
                    <div style="padding: 10px 14px; border: 2px solid ${optBorder}; border-radius: 8px; background: ${optBg}; font-weight: 800; color: ${optColor}; display: flex; justify-content: space-between; align-items: center;">
                        <span>${optPrefix}<b>${key}.</b> ${val}</span>
                        ${optLabel ? `<span style="font-size:0.8rem; white-space:nowrap; margin-left:8px;">${optLabel}</span>` : ""}
                    </div>
                `;
            });
        } else {
            // Isian singkat / drag & drop — show student answer vs correct answer
            const studentDisplayText = isUnanswered ? "<i style='color:#A0AEC0'>Tidak dijawab</i>" : `<b>${studentAns}</b>`;
            const correctDisplayText = Array.isArray(q.answer) ? q.answer.join(" / ") : q.answer;

            optionsHTML = `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div style="padding:10px 14px; border:2px solid ${isCorrect ? '#48BB78' : isUnanswered ? '#CBD5E0' : '#FC8181'}; border-radius:8px; background:${isCorrect ? '#C6F6D5' : isUnanswered ? '#EDF2F7' : '#FED7D7'}; font-weight:800; color:${isCorrect ? '#22543D' : isUnanswered ? '#718096' : '#742A2A'};">
                        ✏️ Jawabanmu: ${studentDisplayText}
                    </div>
                    <div style="padding:10px 14px; border:2px solid #48BB78; border-radius:8px; background:#C6F6D5; font-weight:800; color:#22543D;">
                        ✅ Kunci Jawaban: <b>${correctDisplayText}</b>
                    </div>
                </div>
            `;
        }

        // Question text (preserve newlines)
        const questionText = q.question.replace(/\n/g, "<br>");

        const card = document.createElement("div");
        card.style.cssText = `background:${cardBg}; border:2.5px solid ${cardBorderColor}; border-radius:16px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.05); animation: fadeIn 0.3s ease;`;
        card.innerHTML = `
            <!-- Card header -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <span style="background:#667EEA; color:white; padding:4px 12px; border-radius:20px; font-size:0.82rem; font-weight:900;">Soal ${i + 1}</span>
                    <span style="background:#E2E8F0; color:#4A5568; padding:4px 10px; border-radius:20px; font-size:0.8rem; font-weight:800;">${typeLabel}</span>
                </div>
                <span style="background:${statusBg}; color:${statusColor}; padding:4px 12px; border-radius:20px; font-size:0.85rem; font-weight:900;">${statusIcon} ${statusText}</span>
            </div>

            <!-- Image (if any) -->
            ${q.image ? `<img src="${q.image}" alt="Gambar soal ${i+1}" style="max-width:100%; border-radius:10px; margin-bottom:12px; border:2px solid #E2E8F0;">` : ""}

            <!-- Question text -->
            <p style="font-weight:700; color:#2D3748; font-size:var(--fs-base); line-height:1.65; margin:0 0 16px 0;">${questionText}</p>

            <!-- Options / Answer -->
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
                ${optionsHTML}
            </div>

            <!-- Pembahasan box -->
            ${q.explanation ? `
            <div style="background:#EBF8FF; border-left:4px solid #4299E1; border-radius:8px; padding:12px 16px;">
                <span style="font-size:0.82rem; font-weight:900; color:#2B6CB0; display:block; margin-bottom:6px;">💡 PEMBAHASAN:</span>
                <p style="font-weight:700; color:#2C5282; margin:0; line-height:1.6; font-size:var(--fs-sm);">${q.explanation}</p>
            </div>
            ` : ""}
        `;
        container.appendChild(card);
    });
}



let lastFetchedClassScores = [];

// Open passcode popup
function openTeacherLogin() {
    playClickSFX();
    document.getElementById("teacherPasscodeInput").value = "";
    document.getElementById("teacherLoginModal").classList.add("show");
    setTimeout(() => {
        document.getElementById("teacherPasscodeInput").focus();
    }, 150);
}

// Close passcode popup
function closeTeacherLogin() {
    playClickSFX();
    document.getElementById("teacherLoginModal").classList.remove("show");
}

// Verify entered passcode
function verifyTeacherPasscode() {
    const code = document.getElementById("teacherPasscodeInput").value.trim();
    // Passcode: guru15 or 123
    if (code === "guru15" || code === "123") {
        playSuccessSFX();
        document.getElementById("teacherLoginModal").classList.remove("show");
        openTeacherPanel();
    } else {
        playClickSFX();
        alert("Sandi Keamanan Salah! Akses ditolak. ❌");
        document.getElementById("teacherPasscodeInput").value = "";
        document.getElementById("teacherPasscodeInput").focus();
    }
}

// Route to Teacher Panel Screen
function openTeacherPanel() {
    // Hide Cover Screen
    const coverScreen = document.getElementById("screen-cover");
    if (coverScreen) {
        coverScreen.classList.remove("active");
        coverScreen.style.display = "none";
    }
    
    // Show Teacher Panel Screen
    const teacherScreen = document.getElementById("screen-teacher");
    if (teacherScreen) {
        teacherScreen.style.display = "block";
        teacherScreen.classList.add("active");
    }
    
    // Fetch latest class scores automatically
    fetchClassScores();
}

// Close Teacher Panel and return to Cover
function closeTeacherPanel() {
    playClickSFX();
    
    // Hide Teacher Screen
    const teacherScreen = document.getElementById("screen-teacher");
    if (teacherScreen) {
        teacherScreen.classList.remove("active");
        teacherScreen.style.display = "none";
    }
    
    // Show Cover Screen
    const coverScreen = document.getElementById("screen-cover");
    if (coverScreen) {
        coverScreen.style.display = "flex";
        coverScreen.classList.add("active");
    }
}

// Fetches the published Google Sheets CSV data in the background
function fetchClassScores() {
    const refreshBtn = document.getElementById("teacherRefreshBtn");
    const refreshIcon = document.getElementById("refreshIconSpan");
    const statusBadge = document.getElementById("connectionStatusBadge");
    
    // Start spin animation & disable button
    if (refreshIcon) refreshIcon.classList.add("spinning");
    if (refreshBtn) refreshBtn.disabled = true;
    if (statusBadge) {
        statusBadge.textContent = "Status: Mengambil Data... 🔄";
        statusBadge.style.background = "#FEFCBF"; // Yellowish background
        statusBadge.style.color = "#B7791F";
    }
    
    // Google Sheets CSV Link (Real spreadsheet published link)
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLrWu29edmaG0EnBtNJx9y9TLp6m3_B3nqG2UyhWkSmwJ2zn5WghGCvg2Ftyt0RJGW7DlCauTCf1hT/pub?gid=1869472487&single=true&output=csv";
    
    fetch(csvUrl + "&t=" + new Date().getTime()) // Prevent cache
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(csvText => {
            console.log("Successfully fetched CSV data.");
            const parsedRows = parseCSVText(csvText);
            
            // Map raw rows to structured database
            lastFetchedClassScores = mapCSVToStudents(parsedRows);
            
            // Render to dashboard
            renderTeacherDashboard();
            
            if (statusBadge) {
                statusBadge.textContent = "Status: Terhubung & Sinkron ✅";
                statusBadge.style.background = "#C6F6D5"; // Green background
                statusBadge.style.color = "#22543D";
            }
        })
        .catch(err => {
            console.error("Error loading student scores:", err);
            if (statusBadge) {
                statusBadge.textContent = "Status: Gagal Sinkronisasi ❌";
                statusBadge.style.background = "#FED7D7"; // Red background
                statusBadge.style.color = "#742A2A";
            }
            alert("Gagal memuat rekap nilai siswa! Pastikan Google Sheet Anda sudah di-Publish ke Web sebagai format CSV (.csv) seperti di Panduan. ⚠️");
            
            // Fallback empty render
            lastFetchedClassScores = mapCSVToStudents([]);
            renderTeacherDashboard();
        })
        .finally(() => {
            // Stop spin animation & enable button
            setTimeout(() => {
                if (refreshIcon) refreshIcon.classList.remove("spinning");
                if (refreshBtn) refreshBtn.disabled = false;
            }, 500);
        });
}

// Parses raw CSV text safely handling comma delimiters and quotes
function parseCSVText(text) {
    const lines = text.split("\n");
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) { // Skip header row
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = [];
        let cur = "";
        let insideQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                cols.push(cur.trim());
                cur = "";
            } else {
                cur += char;
            }
        }
        cols.push(cur.trim());
        rows.push(cols);
    }
    return rows;
}

// Maps parsed raw CSV rows to the master list of 33 class students
function mapCSVToStudents(rows) {
    const map = {};
    
    // Initialize master list from studentDatabase
    for (let num in studentDatabase) {
        map[num] = {
            absen: num,
            name: studentDatabase[num],
            completed: false,
            score: "-",
            timestamp: "-"
        };
    }
    
    // Parse Google Form structure: [Timestamp, Absen, Nama, Skor]
    // Absen is index 1, Name is index 2, Score is index 3
    rows.forEach(row => {
        if (row.length < 3) return; // Malformed row
        
        const timestamp = row[0] ? row[0].trim() : "-";
        const absenRaw = row[1] ? row[1].trim() : "";
        const nameRaw = row[2] ? row[2].trim() : "";
        const scoreRaw = row[3] ? row[3].trim() : "-";
        
        // Match by Absen Number first
        if (absenRaw && map[absenRaw]) {
            map[absenRaw].completed = true;
            map[absenRaw].score = scoreRaw;
            map[absenRaw].timestamp = timestamp;
        } else {
            // Fallback match: match by case-insensitive student name
            const searchName = nameRaw.toLowerCase().trim();
            for (let num in studentDatabase) {
                if (studentDatabase[num].toLowerCase().trim() === searchName) {
                    map[num].completed = true;
                    map[num].score = scoreRaw;
                    map[num].timestamp = timestamp;
                    break;
                }
            }
        }
    });
    
    // Convert map to flat array sorted by Absen Number
    return Object.values(map).sort((a, b) => parseInt(a.absen) - parseInt(b.absen));
}

// Renders lists and stats counters inside the dashboard
function renderTeacherDashboard() {
    const tableBody = document.getElementById("teacherTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    
    let completedCount = 0;
    let totalScoreSum = 0;
    
    lastFetchedClassScores.forEach(student => {
        if (student.completed) {
            completedCount++;
            const numericScore = parseFloat(student.score);
            if (!isNaN(numericScore)) {
                totalScoreSum += numericScore;
            }
        }
    });
    
    // Update Stats
    const unsubmittedCount = 33 - completedCount;
    const averageScore = completedCount > 0 ? (totalScoreSum / completedCount).toFixed(1) : "0.0";
    
    document.getElementById("statSubmissions").textContent = `${completedCount} / 33`;
    document.getElementById("statUnsubmitted").textContent = `${unsubmittedCount} Siswa`;
    document.getElementById("statClassAverage").textContent = `${averageScore} Poin`;
    
    // Render default table matching search/filters
    filterTeacherTable();
}

// Handles instant client-side searching and filtering of student scores
function filterTeacherTable() {
    const tableBody = document.getElementById("teacherTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    
    const searchVal = document.getElementById("teacherSearchInput").value.toLowerCase().trim();
    const filterVal = document.getElementById("teacherStatusFilter").value;
    
    lastFetchedClassScores.forEach(student => {
        // Search filter match
        const matchesSearch = student.name.toLowerCase().includes(searchVal) || student.absen.toString() === searchVal;
        
        // Status filter match
        let matchesStatus = true;
        if (filterVal === "completed") {
            matchesStatus = student.completed;
        } else if (filterVal === "unsubmitted") {
            matchesStatus = !student.completed;
        }
        
        if (matchesSearch && matchesStatus) {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #EDF2F7";
            
            // Status and styling elements
            let statusBadgeHtml = "";
            let scoreHtml = "";
            let rowBg = "white";
            
            if (student.completed) {
                statusBadgeHtml = `<span style="display: inline-block; background: #C6F6D5; color: #22543D; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Sudah ✅</span>`;
                scoreHtml = `<span style="font-weight: 900; color: #2B6CB0; font-size: 1.1rem;">${student.score}</span>`;
            } else {
                statusBadgeHtml = `<span style="display: inline-block; background: #FED7D7; color: #742A2A; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Belum ❌</span>`;
                scoreHtml = `<span style="color: #A0AEC0; font-weight: bold;">-</span>`;
                rowBg = "#FDFDFD";
            }
            
            tr.style.background = rowBg;
            
            tr.innerHTML = `
                <td style="padding: 12px 20px; text-align: center; font-weight: 800; color: #4A5568;">${student.absen}</td>
                <td style="padding: 12px 20px; font-weight: 800; color: #2D3748; text-align: left;">${student.name}</td>
                <td style="padding: 12px 20px; text-align: center;">${statusBadgeHtml}</td>
                <td style="padding: 12px 20px; text-align: center;">${scoreHtml}</td>
                <td style="padding: 12px 20px; text-align: center; color: #718096; font-size: 0.85rem; font-weight: bold;">${student.timestamp}</td>
            `;
            
            tableBody.appendChild(tr);
        }
    });
    
    // Show empty placeholder if no rows match filter/search
    if (tableBody.children.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td colspan="5" style="padding: 40px; text-align: center; font-weight: bold; color: #A0AEC0; font-size: 1rem;">
                🔍 Tidak ada data siswa yang cocok dengan filter pencarian.
            </td>
        `;
        tableBody.appendChild(tr);
    }
}
