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
    alert("Welcome to VIBGYOR Technologies! Click any category card to open its dedicated full page.");
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
    document.getElementById('gameModal').classList.remove('active');
    stopActiveGame();
    document.getElementById('gameModalBody').innerHTML = '';
}

function renderGameModal(gameKey) {
    const modalBody = document.getElementById('gameModalBody');
    const modal = document.getElementById('gameModal');

    if (!modalBody || !modal) return;
    stopActiveGame();

    const gameTemplates = {
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

    modalBody.innerHTML = gameTemplates[gameKey] || gameTemplates.quiz;
    modal.classList.add('active');

    if (gameKey === 'snake') {
        startSnakeGame();
    } else if (gameKey === 'dragon') {
        startDragonGame();
    } else if (gameKey === 'gobang') {
        resetGobang();
    } else if (gameKey === 'quiz') {
        setupQuiz();
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
    const modalCloseBtn = document.querySelector('.modal-close');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeGameModal);
    }
});

function startSnakeGame() {
    const board = document.getElementById('snakeBoard');
    if (!board) return;

    const boardSize = 12;
    const cells = [];
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'snake-cell';
        cells.push(cell);
        board.appendChild(cell);
    }

    const initialSnake = [
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 2, y: 5 }
    ];

    let snake = initialSnake.map(segment => ({ ...segment }));
    let direction = { x: 1, y: 0 };
    let nextDirection = { x: 1, y: 0 };
    let food = { x: 8, y: 5 };
    let score = 0;
    let running = true;

    function updateScore() {
        const scoreEl = document.getElementById('snakeScore');
        if (scoreEl) scoreEl.textContent = `Score: ${score}`;
    }

    function randomFood() {
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
        const emptyCells = Array(boardSize * boardSize).fill(false);
        snake.forEach((seg, index) => {
            const cellIndex = seg.y * boardSize + seg.x;
            if (cellIndex >= 0 && cellIndex < emptyCells.length) {
                emptyCells[cellIndex] = true;
            }
        });

        cells.forEach((cell, index) => {
            cell.classList.remove('snake', 'food');
            if (emptyCells[index]) {
                cell.classList.add('snake');
            }
            if (index === food.y * boardSize + food.x) {
                cell.classList.add('food');
            }
        });
    }

    function tick() {
        if (!running) return;
        direction = nextDirection;
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        const hitsWall = head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize;
        const hitsSelf = snake.some(seg => seg.x === head.x && seg.y === head.y);

        if (hitsWall || hitsSelf) {
            running = false;
            alert('Game over! Snake crashed.');
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            randomFood();
            updateScore();
        } else {
            snake.pop();
        }

        renderBoard();
    }

    function handleDirectionChange(nextDir) {
        const currentX = direction.x;
        const currentY = direction.y;
        const nextX = nextDir.x;
        const nextY = nextDir.y;
        if ((currentX + nextX === 0 && currentY + nextY === 0) || (currentX === 0 && currentY === 0)) {
            return;
        }
        const isOpposite = (currentX === -nextX && currentY === -nextY) || (currentX === 0 && nextX === 0 && currentY === -nextY) || (currentY === 0 && nextY === 0 && currentX === -nextX);
        if (!isOpposite) {
            nextDirection = nextDir;
        }
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
    document.querySelectorAll('.arrow-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const dirMap = {
                up: { x: 0, y: -1 },
                down: { x: 0, y: 1 },
                left: { x: -1, y: 0 },
                right: { x: 1, y: 0 }
            };
            handleDirectionChange(dirMap[button.dataset.dir]);
        });
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
    let obstacleX = runner.clientWidth;

    const scoreEl = document.getElementById('dragonScore');

    function updateScore() {
        if (scoreEl) scoreEl.textContent = `Score: ${score}`;
    }

    function jump() {
        if (gameOver) return;
        if (dragonBottom <= 30) {
            velocity = 12;
        }
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
            obstacleX = runner.clientWidth + 30;
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
    const cells = [];
    const boardSize = 15;
    let currentPlayer = 'X';
    let winner = null;

    const statusEl = document.getElementById('gobanStatus');
    if (statusEl) statusEl.textContent = 'Turn: X';

    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('button');
        cell.className = 'goban-cell empty';
        cell.type = 'button';
        cell.dataset.index = String(i);
        cell.addEventListener('click', () => {
            if (winner || cell.textContent) return;
            cell.textContent = currentPlayer;
            cell.classList.remove('empty');
            cell.classList.add(currentPlayer.toLowerCase());
            const row = Math.floor(i / boardSize);
            const col = i % boardSize;
            const boardState = Array.from(board.children).map(child => child.textContent || '');
            const value = currentPlayer;
            if (checkWin(boardState, row, col, value, boardSize)) {
                winner = value;
                if (statusEl) statusEl.textContent = `Winner: ${winner}`;
                alert(`Player ${winner} wins!`);
                return;
            }
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (statusEl) statusEl.textContent = `Turn: ${currentPlayer}`;
        });
        board.appendChild(cell);
        cells.push(cell);
    }

    function checkWin(boardState, row, col, value, size) {
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1]
        ];

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

        document.querySelectorAll('.quiz-option').forEach((button) => {
            button.addEventListener('click', () => {
                const selected = button.dataset.answer;
                if (selected === question.answer) {
                    score += 1;
                }
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
