/* =====================================
   PAGE NAVIGATION
===================================== */

const pages = document.querySelectorAll(".page");

function showPage(pageId) {
    pages.forEach(page => page.classList.remove("active"));

    const target = document.getElementById(pageId);

    if (target) {
        target.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (pageId === "letterPage") {
        typeMessage();
    }
}

document.getElementById("startButton").addEventListener("click", () => {
    showPage("game");
});

document.getElementById("lastButton").addEventListener("click", () => {
    showPage("ending");
});

document.getElementById("againButton").addEventListener("click", () => {
    resetGame();
    resetGift();
    resetLetter();
    showPage("welcome");
});


/* =====================================
   BACKGROUND PARTICLES
===================================== */

const particleContainer = document.getElementById("particles");
const heartContainer = document.getElementById("floating-hearts");

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

function createParticles() {
    if (reducedMotion) return;

    particleContainer.innerHTML = "";

    const particleCount = window.innerWidth < 600 ? 45 : 85;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("span");

        particle.className = Math.random() > 0.65
            ? "particle star"
            : "particle";

        const size = Math.random() * 3 + 1;

        particle.style.left = Math.random() * 100 + "%";
        particle.style.width = size + "px";
        particle.style.height = size + "px";
        particle.style.animationDuration =
            Math.random() * 12 + 9 + "s";

        particle.style.animationDelay =
            -Math.random() * 20 + "s";

        particleContainer.appendChild(particle);
    }
}

createParticles();


/* =====================================
   FLOATING HEART PARTICLES
===================================== */

let heartInterval = null;

function createFloatingHeart() {
    if (reducedMotion) return;

    const heart = document.createElement("span");

    const heartSymbols = ["♡", "♥", "♡", "ღ", "୨୧", "❤"];

    heart.className = "heart-particle";
    heart.textContent =
        heartSymbols[Math.floor(Math.random() * heartSymbols.length)];

    heart.style.left = Math.random() * 100 + "%";
    heart.style.fontSize = Math.random() * 17 + 12 + "px";
    heart.style.animationDuration = Math.random() * 5 + 7 + "s";

    heartContainer.appendChild(heart);

    heart.addEventListener("animationend", () => {
        heart.remove();
    });
}

function startFloatingHearts() {
    if (reducedMotion || heartInterval) return;

    // Tambahkan beberapa love saat halaman mulai dibuka.
    for (let i = 0; i < 12; i++) {
        setTimeout(createFloatingHeart, i * 180);
    }

    // Love baru muncul secara berkala.
    heartInterval = setInterval(createFloatingHeart, 450);
}

function stopFloatingHearts() {
    clearInterval(heartInterval);
    heartInterval = null;
}

startFloatingHearts();


/* =====================================
   MEMORY MATCHING GAME - PHOTO VERSION
===================================== */

// Simpan 8 foto berbeda di folder "foto".
// Setiap foto akan muncul pada dua kartu.

const photos = [
    "foto/foto 1.jpeg",
    "foto/foto 2.jpeg",
    "foto/foto 3.jpeg",
    "foto/foto 4.jpeg"
];

const board = document.getElementById("board");
const movesElement = document.getElementById("moves");
const pairsElement = document.getElementById("pairs");
const gameNote = document.getElementById("gameNote");

let deck = [];
let firstCard = null;
let locked = false;
let moves = 0;
let matchedPairs = 0;
let mismatchTimer = null;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function resetGame() {
    clearTimeout(mismatchTimer);

    deck = shuffle(
        [...photos, ...photos].map((photo, index) => ({
            photo,
            id: index,
            open: false,
            matched: false
        }))
    );

    firstCard = null;
    locked = false;
    moves = 0;
    matchedPairs = 0;

    movesElement.textContent = "0";
    pairsElement.textContent = "0 / 8";
    gameNote.textContent = "Cari dua kartu yang cocok ✨";

    renderBoard();
}

function renderBoard() {
    board.innerHTML = "";

    deck.forEach((card, index) => {
        const button = document.createElement("button");

        button.className = "tile";

        if (card.open) {
            button.classList.add("open");
        }

        if (card.matched) {
            button.classList.add("matched");
        }

        if (card.open || card.matched) {
            const img = document.createElement("img");

            img.src = card.photo;
            img.alt = "Foto pasangan " + (photos.indexOf(card.photo) + 1);
            img.draggable = false;

            // Jika nama/path foto salah, tampilkan pesan
            // supaya masalahnya mudah diketahui.
            img.addEventListener("error", () => {
                img.alt = "Foto tidak ditemukan: " + card.photo;
            });

            button.appendChild(img);
        } else {
            button.textContent = "?";
        }

        button.setAttribute(
            "aria-label",
            card.open || card.matched
                ? "Kartu foto " + (photos.indexOf(card.photo) + 1)
                : "Kartu tertutup"
        );

        button.setAttribute(
            "aria-pressed",
            String(card.open || card.matched)
        );

        button.disabled = card.matched;

        button.addEventListener("click", () => {
            flipCard(index);
        });

        board.appendChild(button);
    });
}

function flipCard(index) {
    const card = deck[index];

    if (locked || card.open || card.matched) {
        return;
    }

    card.open = true;
    renderBoard();

    if (firstCard === null) {
        firstCard = index;
        return;
    }

    moves++;
    movesElement.textContent = moves;

    const first = deck[firstCard];
    const second = deck[index];

    if (first.photo === second.photo) {
        first.matched = true;
        second.matched = true;

        matchedPairs++;
        firstCard = null;

        pairsElement.textContent = matchedPairs + " / 8";

        gameNote.textContent = [
            "Nice! Satu pasangan ketemu ✨",
            "Good job, lanjut pelan-pelan 🌷",
            "Kamu makin dekat dengan hadiahnya ♡"
        ][Math.floor(Math.random() * 3)];

        renderBoard();

        if (matchedPairs === photos.length) {
            gameNote.textContent =
                "Semua pasangan ketemu! Hadiahmu menunggu 💗";

            setTimeout(() => {
                showPage("giftPage");
            }, 1100);
        }
    } else {
        locked = true;

        gameNote.textContent =
            "Belum cocok, nggak apa-apa. Coba lagi ♡";

        mismatchTimer = setTimeout(() => {
            first.open = false;
            second.open = false;

            firstCard = null;
            locked = false;

            renderBoard();
        }, 850);
    }
}

document.getElementById("restartButton").addEventListener(
    "click",
    resetGame
);

resetGame();


/* =====================================
   GIFT ANIMATION
===================================== */

const giftButton = document.getElementById("giftButton");
const giftEmoji = document.getElementById("giftEmoji");
const giftHint = document.getElementById("giftHint");
const openLetterButton = document.getElementById("openLetterButton");

let giftOpened = false;

function openGift() {
    if (giftOpened) return;

    giftOpened = true;

    giftButton.classList.remove("opening");

    // Jalankan ulang animasi hadiah.
    void giftButton.offsetWidth;

    giftButton.classList.add("opening");
    giftEmoji.textContent = "💝";

    giftHint.textContent =
        "A little reminder, just for you ♡";

    openLetterButton.classList.remove("hidden");

    // Efek love saat hadiah dibuka.
    for (let i = 0; i < 12; i++) {
        setTimeout(createFloatingHeart, i * 100);
    }
}

giftButton.addEventListener("click", openGift);

openLetterButton.addEventListener("click", () => {
    showPage("letterPage");
});

function resetGift() {
    giftOpened = false;

    giftEmoji.textContent = "🎁";
    giftHint.textContent = "Tekan kotak hadiahnya ♡";

    openLetterButton.classList.add("hidden");
    giftButton.classList.remove("opening");
}


/* =====================================
   TYPING LETTER ANIMATION
===================================== */

const messageText =
`Ga kerasa ya ternyata udah mau ujian tka, noyaaa semangat yaa ujiannya Jangan lupa sebelum ujian baca doa biar dilancarin, dan jangan lupa belajar biar bisa ngerjain soal-soalnya!! DEMI USU🫰🏻, aku tunggu di pintu 4 USU yaa nantii🫣

Jangan ragu ngerjainnya yaaa, noya pasti bisaa kok, jangan lupa belajar jugaa, semoga nanti bisa dapetin hasil yang terbaik yang bikin noya senenggg.
 
Jangan terlalu stress yaww, bawa enjoy aja biar ngerjainnya juga enak, aku percaya noya pasti bisa, apapun hasilnya nanti, itu udah yg terbaik gabole bilang yg ngga² apalagi sampe nyalain diri sendiri, BIG NO ya!!! ❌

Semoga nilainya sesuai sama ekspektasi Noya ya, dan kalo nilainya kecil jangan langsung sedih, emosi, ataupun marah, yang paling penting noya udah berusaha sampai sejauh ini, tetapp semangatt yaa belajarnya #NoyaAnakAmbis

Semangattt teruss yaww katanya mau jadi c i o🤭
Semoga dilancarin sampai selesai.`;

const letterContent = document.getElementById("letterContent");

let typingStarted = false;
let typingTimer = null;

function typeMessage() {
    if (typingStarted) return;

    typingStarted = true;
    letterContent.textContent = "";

    let index = 0;

    function typeNextCharacter() {
        if (index >= messageText.length) {
            return;
        }

        letterContent.textContent += messageText[index];
        index++;

        typingTimer = setTimeout(typeNextCharacter, 18);
    }

    typeNextCharacter();
}

function resetLetter() {
    clearTimeout(typingTimer);

    typingStarted = false;
    letterContent.textContent = "";
}


/* =====================================
   TOAST NOTIFICATION
===================================== */

const toast = document.getElementById("toast");

let toastTimer = null;

function showToast(message) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}


/* =====================================
   COPY ENCOURAGEMENT MESSAGE
===================================== */

const copyButton = document.getElementById("copyButton");

const shortReminder =
    "Kamu nggak harus punya semua jawaban hari ini. " +
    "Istirahat kalau capek, mulai lagi kalau sudah siap. " +
    "Langkah kecil tetap berarti. ♡";

copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(shortReminder);

        showToast("Reminder berhasil disalin ♡");
    } catch (error) {
        // Alternatif jika fitur clipboard tidak tersedia.
        const textarea = document.createElement("textarea");

        textarea.value = shortReminder;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        let copied = false;

        try {
            copied = document.execCommand("copy");
        } catch (copyError) {
            copied = false;
        }

        textarea.remove();

        if (copied) {
            showToast("Reminder berhasil disalin ♡");
        } else {
            showToast("Silakan salin pesan secara manual.");
        }
    }
});