const container = document.querySelector('.container');
const movesDisplay = document.querySelector('.moves span');
const missesDisplay = document.querySelector('.misses span');
const scoreDisplay = document.querySelector('.score span');
const congratsCard = document.querySelector('.congrats-card');
const congratsPlayerNameDisplay = document.querySelector('#congratsPlayerName');
const playerNameDisplay = document.querySelector('#playerName'); // For the header display
const restartButton = document.querySelector('.restart-button'); // For win screen restart
const timerDisplay = document.getElementById('timer');
const pauseButton = document.querySelector('.pause-button');
const pauseOverlay = document.querySelector('.pause-overlay'); // New: for pause visual feedback

// Changed card values to emojis for better visual appeal
const cardValues = ["🍎", "🍊", "🍇", "🍋", "🍓", "🥝", "🍉", "🍒", "🍍", "🥭", "🍑", "🍐", "🥥"];

let gameCards = [];
let selectedCards = [];
let lockBoard = false;
let moves = 0;
let misses = 0;
let score = 0;
let myName = "Player";
let timeLeft = 60;
let timerInterval = null;
let isPaused = false;
let difficulty = 'medium';
let totalPairs = 10;
let timeLimit = 60;

// --Sound Effects---
const soundFlip = new Audio('sounds/flip.mp3');
const soundMatch = new Audio('sounds/match.mp3');
const soundMismatch = new Audio('sounds/mismatch.mp3');
const soundWin = new Audio('sounds/win.mp3');
const soundLose = new Audio('sounds/lose.mp3');

playerNameDisplay.innerText = localStorage.getItem('myName') || "Player";


function setGridColumns() {
    let columns;
    if (totalPairs === 6) {
        columns = 4;
    } else if (totalPairs === 10) {
        columns = 5;
    } else if (totalPairs === 13) {
        columns = 6;
    } else {
        columns = 5;
    }
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = timeLimit;
    timerDisplay.innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            lockBoard = true;
            showLoseScreen();
        }
    }, 1000);
}


function stopTimer() {
    clearInterval(timerInterval);
}


function resumeTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            lockBoard = true;
            showLoseScreen();
        }
    }, 1000);
}


function generateAndDisplayCards() {
    container.innerHTML = '';
    gameCards = [];
    selectedCards = [];
    lockBoard = true;
    moves = 0;
    misses = 0;
    score = 0;
    movesDisplay.innerText = moves;
    missesDisplay.innerText = misses;
    scoreDisplay.innerText = score;

    setGridColumns();

    const duplicatedCardValues = cardValues.slice(0, totalPairs).flatMap(v => [v, v]);
    const shuffledValues = shuffleArray(duplicatedCardValues);

    const entranceDelayPerCard = 80;
    const cardEntranceDuration = 1000;

    shuffledValues.forEach((value, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = value;
        card.id = `card-${index}`;

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        cardBack.innerText = value;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        card.style.animationDelay = `${index * entranceDelayPerCard}ms`;
        card.classList.add('animated');

        gameCards.push(card);
        container.appendChild(card);
    });

    const totalCards = totalPairs * 2;
    const maxEntranceTime = (totalCards > 0 ? (totalCards - 1) * entranceDelayPerCard : 0) + cardEntranceDuration;

    setTimeout(() => {
        const revealFlipDelay = 20;
        gameCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('isClicked');
            }, index * revealFlipDelay);
        });

        // The duration of the .card-inner flip transition is 0.8s (800ms)
        const revealFlipTransitionDuration = 800;

        // Calculate when the reveal flip animation is finished for all cards
        const maxRevealFlipTime = (totalCards > 0 ? (totalCards - 1) * revealFlipDelay : 0) + revealFlipTransitionDuration;

        const memorizationTime = 100; // Reduced to 1.2 seconds for memorization

        setTimeout(() => {
            const hideFlipDelay = 20;
            gameCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.remove('isClicked'); // Flip card face-down
                }, index * hideFlipDelay);
            });

            // The duration of the .card-inner flip transition is 0.8s (800ms)
            const hideFlipTransitionDuration = 800;
            const maxHideFlipTime = (totalCards > 0 ? (totalCards - 1) * hideFlipDelay : 0) + hideFlipTransitionDuration;


            setTimeout(() => {
                gameCards.forEach(card => card.addEventListener('click', flipCard));
                lockBoard = false;
                startTimer();
            }, maxHideFlipTime);

        }, maxRevealFlipTime + memorizationTime);

    }, maxEntranceTime + 200); // 200ms buffer after all cards have flown in
}

function flipCard() {
    if (lockBoard || this.classList.contains('isClicked') || this.classList.contains('matched')) {
        return;
    }

    soundFlip.play();

    this.classList.add('isClicked');
    selectedCards.push(this);

    if (selectedCards.length === 2) {
        moves++;
        movesDisplay.innerText = moves;
        lockBoard = true;
        checkForMatch();
    }
}

/* Checks if the two selected cards are a match.*/
function checkForMatch() {
    const [cardOne, cardTwo] = selectedCards;
    const isMatch = cardOne.dataset.value === cardTwo.dataset.value;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

/* Handles logic for matched cards (increment score, remove event listeners, add 'matched' class).*/
function disableCards() {
    score++;
    scoreDisplay.innerText = score;

    soundMatch.play();

    selectedCards[0].removeEventListener('click', flipCard);
    selectedCards[1].removeEventListener('click', flipCard);

    selectedCards[0].classList.add('matched');
    selectedCards[1].classList.add('matched');

    setTimeout(() => {
        resetBoard();
        checkWinCondition();
    }, 1500);
}

/* Handles logic for unmatched cards (increment misses, apply 'shake' animation, unflip cards).*/
function unflipCards() {
    misses++;
    missesDisplay.innerText = misses;

    soundMismatch.play();

    const cardOne = selectedCards[0];
    const cardTwo = selectedCards[1];

    cardOne.classList.add('shake');
    cardTwo.classList.add('shake');

    cardOne.addEventListener('animationend', function handler(event) {

        if (event.animationName === 'shake') {
            cardOne.classList.remove('isClicked', 'shake');
            cardTwo.classList.remove('isClicked', 'shake');
            cardOne.removeEventListener('animationend', handler);
            resetBoard();
        }
    }, { once: true });
}

/* Resets the selected cards array and unlocks the board.*/
function resetBoard() {
    selectedCards = [];
    lockBoard = false;
}

/* Checks if the game has been won.*/
function checkWinCondition() {
    if (score === totalPairs) {
        stopTimer();
        showWinScreen();
    }
}

/* Displays the win screen and saves player's score to the leaderboard. */
function showWinScreen() {
    soundWin.play();
    congratsCard.classList.add('display');

    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
    });

    setTimeout(() => {
        confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.8, x: 0.2 },
            scalar: 0.9
        });
    }, 300);

    setTimeout(() => {
        confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.8, x: 0.8 },
            scalar: 0.9
        });
    }, 600);

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const x = randomInRange(0.1, 0.9);
        confetti(Object.assign({}, defaults, { particleCount: 2, origin: { x: x, y: Math.random() - 0.2 } }));
    }, 50);

    const timeTaken = timeLimit - timeLeft;
    congratsPlayerNameDisplay.innerText = `${myName}, You won! 🎉`;
    document.querySelector('#finalTime').innerText = `Time Taken: ${timeTaken}s`;
    document.querySelector('#finalMoves').innerText = `Moves: ${moves}`;
    document.querySelector('#finalMisses').innerText = `Misses: ${misses}`;

    saveToLeaderboard({
        name: myName,
        moves,
        time: timeTaken,
        difficulty,
        date: new Date().toLocaleDateString()
    });
}

/* Displays the lose screen.*/
function showLoseScreen() {
    soundLose.play();
    const loseCard = document.querySelector('.lose-card');
    loseCard.classList.add('display');

    const timeTaken = timeLimit;
    document.querySelector('#losePlayerName').innerText = `${myName}, You lost! 😞`;
    document.querySelector('#loseFinalTime').innerText = `Time Taken: ${timeTaken}s`;
    document.querySelector('#loseFinalMoves').innerText = `Moves: ${moves}`;
    document.querySelector('#loseFinalMisses').innerText = `Misses: ${misses}`;

    lockBoard = true;
}


function saveToLeaderboard(entry) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push(entry);

    leaderboard.sort((a, b) => a.time - b.time || a.moves - b.moves);

    leaderboard = leaderboard.slice(0, 5);

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

/* Restarts the game from the start screen. */
function restartGame() {
    congratsCard.classList.remove('display');
    document.querySelector('.lose-card').classList.remove('display');

    stopTimer();

    container.innerHTML = '';

    const startScreen = document.querySelector('.start-screen');
    startScreen.style.display = 'flex';
    startScreen.style.animation = 'fadeIn 1s forwards';

    const nameInput = document.getElementById('nameInput');
    nameInput.value = myName;

    const difficultySelect = document.getElementById('difficulty');
    difficultySelect.value = difficulty;
}


// --- Event Listeners ---

restartButton.addEventListener('click', restartGame);
document.querySelector('.lose-card .restart-button').addEventListener('click', restartGame);

pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseButton.innerText = isPaused ? '▶️ Resume' : '⏸ Pause';

    if (isPaused) {
        lockBoard = true;
        stopTimer();
        pauseOverlay.classList.add('active');
    } else {
        lockBoard = false;
        resumeTimer();
        pauseOverlay.classList.remove('active');
    }
});

const startScreen = document.querySelector('.start-screen');
const startBtn = document.getElementById('startBtn');
const nameInput = document.getElementById('nameInput');

startBtn.addEventListener('click', () => {
    const nameValue = nameInput.value.trim();
    const difficultySelect = document.getElementById('difficulty');
    difficulty = difficultySelect.value;

    if (nameValue) {
        myName = nameValue;
        localStorage.setItem('myName', myName);
        playerNameDisplay.innerText = myName;

        if (difficulty === 'easy') {
            totalPairs = 6;
            timeLimit = 90;
        } else if (difficulty === 'medium') {
            totalPairs = 10;
            timeLimit = 60;
        } else if (difficulty === 'hard') {
            totalPairs = 13;
            timeLimit = 45;
        }

        setGridColumns();

        startScreen.style.animation = 'fadeOut 1s forwards';
        setTimeout(() => {
            startScreen.style.display = 'none';
            generateAndDisplayCards();
        }, 1000);
    } else {
        const msg = "Please enter your name to continue.";
        const existingMsg = document.querySelector('.start-card .error-message');
        if (!existingMsg) {
            const errorMsg = document.createElement('p');
            errorMsg.classList.add('error-message');
            errorMsg.style.color = 'red';
            errorMsg.style.marginTop = '10px';
            errorMsg.innerText = msg;
            startBtn.parentNode.insertBefore(errorMsg, startBtn);
        }
    }
});

const viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');
const leaderboardCard = document.querySelector('.leaderboard-card');
const leaderboardList = document.querySelector('#leaderboardList tbody');
const closeLeaderboardBtn = document.querySelector('.close-leaderboard');

viewLeaderboardBtn.addEventListener('click', showLeaderboard);
closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardCard.classList.add('hidden');
});

/** Populates and displays the leaderboard. */
function showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardList.innerHTML = '';

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<tr><td colspan="5">No entries yet! Play a game!</td></tr>';
    } else {
        leaderboard.forEach((entry, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}</td>
            <td>${entry.time}s</td>
            <td>${entry.moves}</td>
        `;
            leaderboardList.appendChild(tr);
        });
    }
    leaderboardCard.classList.remove('hidden');
}
