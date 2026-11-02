function showPage(pageId) {
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    window.scrollTo(0, 0);
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function showMessage() {
    alert('Welcome to VIBGYOR Technologies! Click any category card to open its dedicated full page.');
}

let activeGameTimer = null;
let activeKeyHandler = null;

function stopActiveGame() {
    if (activeGameTimer) {
        clearInterval(activeGameTimer);
        activeGameTimer = null;
    }
    if (activeKeyHandler) {
        window.removeEventListener('keydown', activeKeyHandler);
        activeKeyHandler = null;
    }
}

function closeGameModal() {
    const modal = document.getElementById('gameModal');
    if (modal) modal.classList.remove('active');
    stopActiveGame();
    const modalBody = document.getElementById('gameModalBody');
    if (modalBody) modalBody.innerHTML = '';
}

function renderGameModal(gameKey) {
    const modalBody = document.getElementById('gameModalBody');
    const modal = document.getElementById('gameModal');
    if (!modalBody || !modal) return;

    stopActiveGame();

    const templates = {
        snake: `
            <div class="game-shell">
                <div class="game-header">
                    <h2 class="game-title">🐍 Snake Game</h2>
                    <div class="game-score" id="snakeScore">Score: 0</div>
                </div>
                <div class="game-box">
                    <div id="snakeBoard" class="snake-board" aria-label="Snake board"></div>
                </div>
                <div class="snake-controls">
                    <button class="arrow-btn" data-dir="up">↑ Up</button>
                    <button class="arrow-btn" data-dir="left">← Left</button>
                    <button class="arrow-btn" data-dir="down">↓ Down</button>
                    <button class="arrow-btn" data-dir="right">→ Right</button>
                </div>
                <button class="play-now-btn" onclick="startSnakeGame();">Play Now</button>
            </div>
        `,
        dragon: `
            <div class="game-shell">
                <div class="game-header">
                    <h2 class="game-title">🐉 Dragon Jump</h2>
                    <div class="game-score" id="dragonScore">Score: 0</div>
                </div>
                <div id="dragonGame" class="dino-runner" tabindex="0">
                    <div id="dragon" class="dragon">🐉</div>
                    <div id="dragonObstacle" class="obstacle"></div>
                    <div class="ground"></div>
                </div>
                <div class="snake-controls">
                    <button class="play-now-btn" onclick="startDragonGame();">Play Now</button>
                    <button class="arrow-btn" onclick="jumpDragon();">Jump</button>
                </div>
            </div>
        `,
        gobang: `
            <div class="game-shell">
                <div class="game-header">
                    <h2 class="game-title">⚫ Gobang</h2>
                    <div class="game-score" id="gobanStatus">Turn: X</div>
                </div>
                <div class="game-box">
                    <div id="gobanBoard" class="goban-board"></div>
                </div>
                <button class="play-now-btn" onclick="resetGobang();">Restart</button>
            </div>
        `,
        tictactoe: `
            <div class="game-shell">
                <div class="game-header">
                    <h2 class="game-title">⭕ Tic-Tac-Toe</h2>
                    <div class="game-score" id="tttStatus">Turn: X</div>
                </div>
                <div class="game-box">
                    <div id="tttBoard" class="ttt-board"></div>
                </div>
                <button class="play-now-btn" onclick="startTicTacToe();">Restart</button>
            </div>
        `,
        memory: `
            <div class="game-shell">
                <div class="game-header">
                    <h2 class="game-title">🧠 Memory Match</h2>
                    <div class="game-score" id="memoryStatus">Moves: 0</div>
                </div>
                <div class="game-box">
                    <div id="memoryBoard" class="memory-board"></div>
                </div>
                <button class="play-now-btn" onclick="startMemoryMatch();">Restart</button>
            </div>
        `,
        guess: `
            <div class="game-shell">
                <div class="game-header">
                    <h2 class="game-title">🎯 Guess Number</h2>
                    <div class="game-score" id="guessStatus">Try to guess</div>
                </div>
                <div class="guess-box">
                    <input id="guessInput" class="guess-input" type="number" min="1" max="20" placeholder="Enter 1 to 20" />
                    <button class="guess-btn" onclick="submitGuess();">Guess</button>
                    <p id="guessResult">I picked a number between 1 and 20.</p>
                    <button class="play-now-btn" onclick="startGuessNumber();">New Game</button>
                </div>
            </div>
        `,
        quiz: `
            <div class="game-shell">
                <div class="game-header">
                    <h2 class="game-title">❓ Quick Quiz</h2>
                    <div class="game-score" id="quizScore">Score: 0</div>
                </div>
                <div id="quizBox"></div>
            </div>
        `
    };

    modalBody.innerHTML = templates[gameKey] || templates.quiz;
    modal.classList.add('active');

    switch (gameKey) {
        case 'snake':
            startSnakeGame();
            break;
        case 'dragon':
            startDragonGame();
            break;
        case 'gobang':
            resetGobang();
            break;
        case 'tictactoe':
            startTicTacToe();
            break;
        case 'memory':
            startMemoryMatch();
            break;
        case 'guess':
            startGuessNumber();
            break;
        case 'quiz':
            setupQuiz();
            break;
        default:
            setupQuiz();
            break;
    }
}

function bindGameButtons() {
    const gameButtons = document.querySelectorAll('.game-launch-btn');
    gameButtons.forEach(button => {
        button.addEventListener('click', () => renderGameModal(button.dataset.game));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindGameButtons();
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) modalClose.addEventListener('click', closeGameModal);
});

function startSnakeGame() {
    const board = document.getElementById('snakeBoard');
    if (!board) return;

    board.innerHTML = '';
    const boardSize = 10;
    const cells = [];

    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'snake-cell';
        board.appendChild(cell);
        cells.push(cell);
    }

    let snake = [
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 2, y: 5 }
    ];
    let direction = { x: 1, y: 0 };
    let nextDirection = { x: 1, y: 0 };
    let food = { x: 7, y: 5 };
    let score = 0;
    let running = true;

    const scoreEl = document.getElementById('snakeScore');

    function updateScore() {
        if (scoreEl) scoreEl.textContent = `Score: ${score}`;
    }

    function placeFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * boardSize),
                y: Math.floor(Math.random() * boardSize)
            };
        } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        food = newFood;
    }

    function renderBoard() {
        const filled = Array(boardSize * boardSize).fill(false);
        snake.forEach(seg => {
            const idx = seg.y * boardSize + seg.x;
            if (idx >= 0 && idx < filled.length) filled[idx] = true;
        });

        cells.forEach((cell, index) => {
            cell.classList.remove('snake', 'food');
            if (filled[index]) cell.classList.add('snake');
            if (index === food.y * boardSize + food.x) cell.classList.add('food');
        });
    }

    function tick() {
        if (!running) return;
        direction = nextDirection;
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        const hitWall = head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize;
        const hitSelf = snake.some(seg => seg.x === head.x && seg.y === head.y);

        if (hitWall || hitSelf) {
            running = false;
            alert('Game over! Snake crashed.');
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            placeFood();
            updateScore();
        } else {
            snake.pop();
        }

        renderBoard();
    }

    function handleDirectionChange(nextDir) {
        const isOpposite = direction.x + nextDir.x === 0 && direction.y + nextDir.y === 0;
        if (!isOpposite) nextDirection = nextDir;
    }

    activeKeyHandler = (event) => {
        const map = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
            w: { x: 0, y: -1 },
            s: { x: 0, y: 1 },
            a: { x: -1, y: 0 },
            d: { x: 1, y: 0 }
        };

        const dir = map[event.key] || map[event.key.toLowerCase()];
        if (dir) handleDirectionChange(dir);
    };

    window.addEventListener('keydown', activeKeyHandler);
    document.querySelectorAll('.arrow-btn').forEach(button => {
        const dirMap = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        button.addEventListener('click', () => handleDirectionChange(dirMap[button.dataset.dir]));
    });

    updateScore();
    renderBoard();
    activeGameTimer = setInterval(tick, 180);
}

function startDragonGame() {
    const dragon = document.getElementById('dragon');
    const obstacle = document.getElementById('dragonObstacle');
    const runner = document.getElementById('dragonGame');
    if (!dragon || !obstacle || !runner) return;

    let dragonBottom = 30;
    let velocity = 0;
    let gravity = 0.8;
    let score = 0;
    let gameOver = false;
    let obstacleX = runner.clientWidth + 30;

    const scoreEl = document.getElementById('dragonScore');

    function updateScore() {
        if (scoreEl) scoreEl.textContent = `Score: ${score}`;
    }

    function jump() {
        if (gameOver) return;
        if (dragonBottom <= 30) velocity = 12;
    }

    function checkCollision() {
        const dragonRect = dragon.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        return !(dragonRect.right < obstacleRect.left + 6 || dragonRect.left > obstacleRect.right - 6 || dragonRect.bottom < obstacleRect.top + 10 || dragonRect.top > obstacleRect.bottom - 4);
    }

    function tick() {
        if (gameOver) return;

        velocity -= gravity;
        dragonBottom += velocity;

        if (dragonBottom < 30) {
            dragonBottom = 30;
            velocity = 0;
        }

        obstacleX -= 5;
        if (obstacleX < -40) {
            obstacleX = runner.clientWidth + 40;
            score += 10;
            updateScore();
        }

        dragon.style.bottom = `${dragonBottom}px`;
        obstacle.style.left = `${obstacleX}px`;

        if (checkCollision()) {
            gameOver = true;
            alert('Game over! Dragon hit an obstacle.');
            return;
        }
    }

    dragon.style.bottom = `${dragonBottom}px`;
    obstacle.style.left = `${obstacleX}px`;
    updateScore();

    activeKeyHandler = (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            jump();
        }
    };

    window.addEventListener('keydown', activeKeyHandler);
    activeGameTimer = setInterval(tick, 30);
    window.jumpDragon = jump;
}

function resetGobang() {
    const board = document.getElementById('gobanBoard');
    if (!board) return;

    board.innerHTML = '';
    const boardSize = 15;
    let currentPlayer = 'X';
    let winner = null;

    const statusEl = document.getElementById('gobanStatus');
    if (statusEl) statusEl.textContent = 'Turn: X';

    function checkWin(boardState, row, col, value, size) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dx, dy] of directions) {
            let count = 1;
            let r = row + dx;
            let c = col + dy;

            while (r >= 0 && r < size && c >= 0 && c < size && boardState[r * size + c] === value) {
                count += 1;
                r += dx;
                c += dy;
            }

            r = row - dx;
            c = col - dy;
            while (r >= 0 && r < size && c >= 0 && c < size && boardState[r * size + c] === value) {
                count += 1;
                r -= dx;
                c -= dy;
            }

            if (count >= 5) return true;
        }

        return false;
    }

    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'goban-cell empty';

        cell.addEventListener('click', () => {
            if (winner || cell.textContent) return;

            cell.textContent = currentPlayer;
            cell.classList.remove('empty');
            cell.classList.add(currentPlayer.toLowerCase());

            const row = Math.floor(i / boardSize);
            const col = i % boardSize;
            const boardState = Array.from(board.children).map(item => item.textContent || '');

            if (checkWin(boardState, row, col, currentPlayer, boardSize)) {
                winner = currentPlayer;
                if (statusEl) statusEl.textContent = `Winner: ${winner}`;
                alert(`Player ${winner} wins!`);
                return;
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (statusEl) statusEl.textContent = `Turn: ${currentPlayer}`;
        });

        board.appendChild(cell);
    }
}

function startTicTacToe() {
    const board = document.getElementById('tttBoard');
    if (!board) return;

    board.innerHTML = '';
    const cells = Array(9).fill('');
    let currentPlayer = 'X';
    let winner = null;

    const statusEl = document.getElementById('tttStatus');
    if (statusEl) statusEl.textContent = 'Turn: X';

    function checkWin(arr) {
        const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];

        for (const [a,b,c] of lines) {
            if (arr[a] && arr[a] === arr[b] && arr[a] === arr[c]) return arr[a];
        }

        return null;
    }

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'ttt-cell';
        cell.addEventListener('click', () => {
            if (winner || cells[i]) return;
            cells[i] = currentPlayer;
            cell.textContent = currentPlayer;

            const result = checkWin(cells);
            if (result) {
                winner = result;
                if (statusEl) statusEl.textContent = `Winner: ${winner}`;
                alert(`Player ${winner} wins!`);
                return;
            }

            const isDraw = cells.every(Boolean);
            if (isDraw) {
                if (statusEl) statusEl.textContent = 'Draw!';
                alert('Draw game!');
                return;
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (statusEl) statusEl.textContent = `Turn: ${currentPlayer}`;
        });

        board.appendChild(cell);
    }
}

function startMemoryMatch() {
    const board = document.getElementById('memoryBoard');
    if (!board) return;

    board.innerHTML = '';
    const symbols = ['🍉', '🍊', '🍋', '🍇', '🍒', '🍓', '🍋', '🍉', '🍊', '🍇', '🍒', '🍓'];
    const shuffled = [...symbols].sort(() => Math.random() - 0.5);
    let flipped = [];
    let matched = 0;
    let moves = 0;
    let lock = false;

    const statusEl = document.getElementById('memoryStatus');
    if (statusEl) statusEl.textContent = 'Moves: 0';

    const buildCard = (value, index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'memory-card';
        card.textContent = '?';
        card.dataset.value = value;
        card.dataset.index = index;

        card.addEventListener('click', () => {
            if (lock || card.classList.contains('matched') || flipped.includes(card)) return;
            card.textContent = value;
            flipped.push(card);

            if (flipped.length === 2) {
                moves += 1;
                if (statusEl) statusEl.textContent = `Moves: ${moves}`;
                lock = true;

                const [first, second] = flipped;
                if (first.dataset.value === second.dataset.value) {
                    first.classList.add('matched');
                    second.classList.add('matched');
                    matched += 2;
                    flipped = [];
                    lock = false;

                    if (matched === shuffled.length) {
                        alert('You matched everything! Great job!');
                    }
                } else {
                    setTimeout(() => {
                        first.textContent = '?';
                        second.textContent = '?';
                        flipped = [];
                        lock = false;
                    }, 700);
                }
            }
        });

        return card;
    };

    shuffled.forEach((value, index) => {
        board.appendChild(buildCard(value, index));
    });
}

function startGuessNumber() {
    const input = document.getElementById('guessInput');
    const result = document.getElementById('guessResult');
    const status = document.getElementById('guessStatus');
    if (!input || !result || !status) return;

    let target = Math.floor(Math.random() * 20) + 1;
    let attempts = 0;
    let finished = false;

    status.textContent = 'Guessing...';
    result.textContent = 'I picked a number between 1 and 20.';
    input.value = '';
    input.disabled = false;

    window.submitGuess = function () {
        if (finished) return;

        const guess = Number(input.value);
        if (!guess || guess < 1 || guess > 20) {
            result.textContent = 'Please enter a number from 1 to 20.';
            return;
        }

        attempts += 1;

        if (guess < target) {
            result.textContent = 'Too low! Try a higher number.';
        } else if (guess > target) {
            result.textContent = 'Too high! Try a lower number.';
        } else {
            finished = true;
            result.textContent = `Correct! You guessed it in ${attempts} attempts.`;
            status.textContent = 'You win!';
            input.disabled = true;
            return;
        }

        if (attempts >= 6) {
            finished = true;
            result.textContent = `Out of attempts! The number was ${target}.`;
            status.textContent = 'Game over';
            input.disabled = true;
        } else {
            status.textContent = `Attempts: ${attempts}`;
        }
    };
}

function setupQuiz() {
    const quizBox = document.getElementById('quizBox');
    if (!quizBox) return;

    const questions = [
        {
            question: 'Which language is most used for interactive websites?',
            options: ['HTML', 'CSS', 'JavaScript', 'SQL'],
            answer: 'JavaScript'
        },
        {
            question: 'Which company created ChatGPT?',
            options: ['Google', 'OpenAI', 'Microsoft', 'Meta'],
            answer: 'OpenAI'
        },
        {
            question: 'What does AI stand for?',
            options: ['Advanced Interface', 'Artificial Intelligence', 'Automated Input', 'Algorithmic Index'],
            answer: 'Artificial Intelligence'
        },
        {
            question: 'Which of these is a game genre?',
            options: ['Action', 'Water', 'Cloud', 'Pen'],
            answer: 'Action'
        }
    ];

    let score = 0;
    let currentIndex = 0;

    function showQuestion() {
        const question = questions[currentIndex];

        if (!question) {
            quizBox.innerHTML = `<h3>Quiz complete!</h3><p class="game-status">Final score: ${score}/${questions.length}</p><button class="play-now-btn" onclick="setupQuiz();">Play again</button>`;
            return;
        }

        quizBox.innerHTML = `
            <div class="game-status">Question ${currentIndex + 1}/${questions.length}</div>
            <h3>${question.question}</h3>
            <div class="quiz-options">
                ${question.options.map(option => `<button class="quiz-option" data-answer="${option}">${option}</button>`).join('')}
            </div>
        `;

        document.querySelectorAll('.quiz-option').forEach(button => {
            button.addEventListener('click', () => {
                const selected = button.dataset.answer;
                if (selected === question.answer) score += 1;

                const scoreEl = document.getElementById('quizScore');
                if (scoreEl) scoreEl.textContent = `Score: ${score}`;

                currentIndex += 1;
                showQuestion();
            });
        });
    }

    const scoreEl = document.getElementById('quizScore');
    if (scoreEl) scoreEl.textContent = 'Score: 0';
    showQuestion();
}

window.addEventListener('click', (event) => {
    const modal = document.getElementById('gameModal');
    if (modal && modal.classList.contains('active') && event.target === modal) {
        closeGameModal();
    }
});

window.jumpDragon = function () {
    const dragon = document.getElementById('dragon');
    if (!dragon) return;
    const currentBottom = Number(dragon.style.bottom.replace('px', '')) || 30;
    if (currentBottom <= 30) {
        const runner = document.getElementById('dragonGame');
        const gameState = runner ? runner.__dragonState : null;
        if (gameState) {
            gameState.velocity = 12;
        } else if (window.__dragonVelocity !== undefined) {
            window.__dragonVelocity = 12;
        }
    }
};

window.addEventListener('load', () => {
    bindGameButtons();
});
