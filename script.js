/* ==========================================
   VIBGYOR TECHNOLOGIES - MASTER SCRIPT
   Full Navigation, Settings, & Games
========================================== */

window.showPage = function (pageId) {
  const pages = document.querySelectorAll('.page-view');
  pages.forEach(page => {
    page.style.display = 'none';
  });

  const target = document.getElementById(pageId);
  if (target) {
    target.style.display = 'block';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.toggleTheme = function () {
  document.body.classList.toggle('light-mode');
};

window.showMessage = function () {
  alert('Welcome to VIBGYOR Technologies! Click any category card to open its dedicated full page.');
};

window.toggleLike = function (btn) {
  if (!btn) return;
  const span = btn.querySelector('span');
  if (!span) return;

  let count = parseInt(span.textContent || '0', 10);

  if (btn.classList.contains('liked')) {
    count--;
    btn.classList.remove('liked');
    btn.style.background = '';
  } else {
    count++;
    btn.classList.add('liked');
    btn.style.background = 'rgba(0, 229, 255, 0.2)';
  }

  span.textContent = count;
};

(() => {
  const modal = document.getElementById('gameModal');
  const body = document.getElementById('gameModalBody');
  if (!modal || !body) return;

  let timer = null;
  let keyHandler = null;
  let state = null;
  let currentGameKey = 'snake';

  const stopGame = () => {
    if (timer !== null) {
      clearInterval(timer);
      cancelAnimationFrame(timer);
    }
    timer = null;

    if (keyHandler) {
      window.removeEventListener('keydown', keyHandler);
    }
    keyHandler = null;
    state = null;
  };

  window.stopActiveGame = stopGame;
  window.closeGameModal = () => {
    stopGame();
    modal.classList.remove('active');
    body.innerHTML = '';
  };

  const shell = (title, status, content) => `
    <div class="game-shell">
      <div class="game-header">
        <h2 class="game-title">${title}</h2>
        <div class="game-score" id="gameStatus">${status}</div>
      </div>
      ${content}
    </div>
  `;

  const launchGame = (key) => {
    stopGame();
    currentGameKey = key;

    const games = {
      snake: () => {
        body.innerHTML = shell(
          '🐍 Snake Game',
          'Score: 0',
          `
            <p>Use on-screen arrows or keyboard arrows.</p>
            <div class="game-box">
              <div id="snakeBoard" class="snake-board"></div>
            </div>
            <div class="snake-controls">
              <button type="button" class="arrow-btn" data-dir="up">↑</button>
              <button type="button" class="arrow-btn" data-dir="left">←</button>
              <button type="button" class="arrow-btn" data-dir="down">↓</button>
              <button type="button" class="arrow-btn" data-dir="right">→</button>
            </div>
          `
        );

        const board = document.getElementById('snakeBoard');
        const cells = [];

        for (let i = 0; i < 100; i += 1) {
          const cell = document.createElement('div');
          cell.className = 'snake-cell';
          board.appendChild(cell);
          cells.push(cell);
        }

        state = {
          snake: [{ x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }],
          dir: { x: 1, y: 0 },
          next: { x: 1, y: 0 },
          food: { x: 7, y: 5 },
          score: 0,
          over: false,
          setDir: function (d) {
            if (!(state.dir.x + d.x === 0 && state.dir.y + d.y === 0)) {
              state.next = d;
            }
          }
        };

        const draw = () => {
          cells.forEach((cell, i) => {
            const x = i % 10;
            const y = Math.floor(i / 10);
            const isSnake = state.snake.some(part => part.x === x && part.y === y);
            const isFood = state.food.x === x && state.food.y === y;
            cell.style.background = isSnake ? '#00ffcc' : (isFood ? '#ff4757' : '#222');
          });
        };

        keyHandler = (event) => {
          const dMap = {
            arrowup: { x: 0, y: -1 },
            w: { x: 0, y: -1 },
            arrowdown: { x: 0, y: 1 },
            s: { x: 0, y: 1 },
            arrowleft: { x: -1, y: 0 },
            a: { x: -1, y: 0 },
            arrowright: { x: 1, y: 0 },
            d: { x: 1, y: 0 }
          };
          const move = dMap[event.key.toLowerCase()];
          if (move) {
            event.preventDefault();
            state.setDir(move);
          }
        };

        window.addEventListener('keydown', keyHandler);
        draw();

        timer = setInterval(() => {
          if (!state || state.over) return;

          state.dir = state.next;
          const head = {
            x: (state.snake[0].x + state.dir.x + 10) % 10,
            y: (state.snake[0].y + state.dir.y + 10) % 10
          };

          const eating = head.x === state.food.x && head.y === state.food.y;
          const bodyToCheck = eating ? state.snake : state.snake.slice(0, -1);

          if (bodyToCheck.some(part => part.x === head.x && part.y === head.y)) {
            state.over = true;
            document.getElementById('gameStatus').textContent = `Game Over · Score: ${state.score}`;
            clearInterval(timer);
            timer = null;
            return;
          }

          state.snake.unshift(head);

          if (eating) {
            state.score += 10;
            document.getElementById('gameStatus').textContent = `Score: ${state.score}`;
            do {
              state.food = {
                x: Math.floor(Math.random() * 10),
                y: Math.floor(Math.random() * 10)
              };
            } while (state.snake.some(part => part.x === state.food.x && part.y === state.food.y));
          } else {
            state.snake.pop();
          }

          draw();
        }, 220);
      },

      dragon: () => {
        body.innerHTML = shell(
          '🐉 Dragon Jump',
          'Score: 0',
          `
            <p>Tap Jump or press Space to dodge obstacles.</p>
            <div id="dragonGame" class="dino-runner">
              <div class="dragon" id="dragon">🐉</div>
              <div class="obstacle" id="dragonObstacle"></div>
              <div class="ground"></div>
            </div>
            <div style="text-align:center; margin-top:15px;">
              <button type="button" class="play-now-btn" data-action="jump">Jump</button>
            </div>
          `
        );

        state = {
          score: 0,
          y: 0,
          velocity: 0,
          gravity: 0.8,
          lift: -11,
          obsX: 300,
          over: false,
          jump: function () {
            if (!state || state.over || state.y > 0) return;
            state.velocity = state.lift;
          }
        };

        keyHandler = (event) => {
          if (event.code === 'Space') {
            event.preventDefault();
            state.jump();
          }
        };
        window.addEventListener('keydown', keyHandler);

        const loop = () => {
          if (!state || state.over) return;

          state.velocity += state.gravity;
          state.y -= state.velocity;
          if (state.y < 0) {
            state.y = 0;
            state.velocity = 0;
          }

          state.obsX -= 4.5;
          if (state.obsX < -20) {
            state.obsX = 320;
            state.score += 1;
            document.getElementById('gameStatus').textContent = `Score: ${state.score}`;
          }

          const dragonEl = document.getElementById('dragon');
          const obsEl = document.getElementById('dragonObstacle');

          if (dragonEl) dragonEl.style.bottom = `${20 + state.y}px`;
          if (obsEl) obsEl.style.left = `${state.obsX}px`;

          if (state.obsX < 55 && state.obsX > 20 && state.y < 30) {
            state.over = true;
            document.getElementById('gameStatus').textContent = `Game Over · Score: ${state.score}`;
            cancelAnimationFrame(timer);
            timer = null;
            return;
          }

          timer = requestAnimationFrame(loop);
        };

        timer = requestAnimationFrame(loop);
      },

      tictactoe: () => {
        body.innerHTML = shell('⭕ Tic-Tac-Toe', 'Turn: X', '<div id="tttBoard" class="ttt-board"></div>');

        const board = document.getElementById('tttBoard');
        const cells = Array(9).fill('');
        const wins = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          [0, 4, 8], [2, 4, 6]
        ];
        let turn = 'X';
        let done = false;

        for (let i = 0; i < 9; i += 1) {
          const cell = document.createElement('button');
          cell.type = 'button';
          cell.className = 'ttt-cell';
          cell.dataset.index = i;
          board.appendChild(cell);
        }

        state = {
          play: (i) => {
            if (done || cells[i]) return;
            cells[i] = turn;
            const cell = board.children[i];
            if (cell) {
              cell.textContent = turn;
              cell.style.color = turn === 'X' ? '#00ffcc' : '#ff4757';
            }

            const win = wins.some(line => line.every(index => cells[index] === turn));
            if (win) {
              done = true;
              document.getElementById('gameStatus').textContent = `Winner: ${turn}`;
            } else {
              turn = turn === 'X' ? 'O' : 'X';
              document.getElementById('gameStatus').textContent = `Turn: ${turn}`;
            }
          }
        };
      },

      memory: () => {
        body.innerHTML = shell('🧠 Memory Match', 'Moves: 0', '<div id="memoryBoard" class="memory-board"></div>');

        const values = ['🍉', '🍊', '🍋', '🍇', '🍒', '🍓', '🍉', '🍊', '🍋', '🍇', '🍒', '🍓'].sort(() => Math.random() - 0.5);
        const board = document.getElementById('memoryBoard');
        let open = [];
        let moves = 0;
        let lock = false;

        values.forEach((value, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'memory-card';
          button.dataset.index = index;
          button.textContent = '❔';
          board.appendChild(button);
        });

        state = {
          flip: (index) => {
            if (lock) return;
            const card = board.children[index];
            if (!card || card.classList.contains('matched') || open.includes(index)) return;

            card.textContent = values[index];
            open.push(index);

            if (open.length === 2) {
              moves += 1;
              document.getElementById('gameStatus').textContent = `Moves: ${moves}`;
              lock = true;

              setTimeout(() => {
                const firstIndex = open[0];
                const secondIndex = open[1];

                if (values[firstIndex] === values[secondIndex]) {
                  board.children[firstIndex].classList.add('matched');
                  board.children[secondIndex].classList.add('matched');
                } else {
                  board.children[firstIndex].textContent = '❔';
                  board.children[secondIndex].textContent = '❔';
                }

                open = [];
                lock = false;
              }, 600);
            }
          }
        };
      },

      guess: () => {
        body.innerHTML = shell(
          '🎯 Guess Number',
          'Tries: 0',
          `
            <p>Guess a number from 1 to 20.</p>
            <div class="guess-box">
              <input id="guessInput" class="guess-input" type="number" min="1" max="20" />
              <button type="button" class="guess-btn" data-action="guess">Guess</button>
            </div>
          `
        );

        state = {
          target: Math.floor(Math.random() * 20) + 1,
          tries: 0,
          guess: function () {
            const input = document.getElementById('guessInput');
            if (!input) return;

            const value = Number(input.value);
            if (value < 1 || value > 20 || Number.isNaN(value)) {
              alert('Enter a valid number from 1 to 20.');
              return;
            }

            state.tries += 1;
            const result = document.getElementById('gameStatus');
            if (value === state.target) {
              result.textContent = `Correct! ${state.tries} tries`;
            } else {
              result.textContent = value > state.target ? 'Too high' : 'Too low';
            }
          }
        };
      },

      quiz: () => {
        const questions = [
          ['Which language makes web pages interactive?', ['HTML', 'CSS', 'JavaScript'], 2],
          ['What does AI stand for?', ['Automated Internet', 'Artificial Intelligence', 'Advanced Input'], 1],
          ['What does CSS stand for?', ['Computer Style Syntax', 'Cascading Style Sheets', 'Creative Style System'], 1]
        ];

        let qIndex = 0;
        body.innerHTML = shell('❓ Quick Quiz', 'Question 1 of 3', '<div id="quizBox" class="quiz-options"></div>');

        const showQuestion = () => {
          const q = questions[qIndex];
          const box = document.getElementById('quizBox');
          document.getElementById('gameStatus').textContent = `Question ${qIndex + 1} of ${questions.length}`;
          if (!box) return;

          box.innerHTML = '';
          q[1].forEach((option, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quiz-option';
            btn.dataset.choice = idx;
            btn.textContent = option;
            box.appendChild(btn);
          });
        };

        state = {
          answer: (choiceIndex) => {
            const correctIndex = questions[qIndex][2];
            if (choiceIndex === correctIndex) {
              alert('Correct!');
            } else {
              alert('Not quite. Try again!');
            }

            qIndex += 1;
            if (qIndex < questions.length) {
              showQuestion();
            } else {
              document.getElementById('gameStatus').textContent = 'Quiz Complete';
              body.innerHTML += '<div style="margin-top: 15px; text-align:center;"><button type="button" class="play-now-btn" data-action="restart">Play Again</button></div>';
            }
          }
        };

        showQuestion();
      }
    };

    (games[key] || games.snake)();
    modal.classList.add('active');
  };

  document.addEventListener('click', (event) => {
    const launchButton = event.target.closest('.game-launch-btn');
    if (launchButton) {
      event.preventDefault();
      launchGame(launchButton.dataset.game);
      return;
    }

    if (event.target.closest('#gameModal .modal-close') || event.target === modal) {
      window.closeGameModal();
      return;
    }

    if (!body.contains(event.target) || !state) return;

    const dir = event.target.closest('[data-dir]');
    if (dir && state.setDir) {
      const dirs = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
      };
      state.setDir(dirs[dir.dataset.dir]);
      return;
    }

    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'restart') {
      launchGame(currentGameKey);
      return;
    }
    if (action === 'jump' && state.jump) {
      state.jump();
      return;
    }
    if (action === 'guess' && state.guess) {
      state.guess();
      return;
    }

    const cell = event.target.closest('[data-index]');
    if (cell) {
      const index = Number(cell.dataset.index);
      if (state.play) state.play(index);
      else if (state.flip) state.flip(index);
      return;
    }

    const choice = event.target.closest('[data-choice]');
    if (choice && state.answer) {
      state.answer(Number(choice.dataset.choice));
    }
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      window.closeGameModal();
    }
  });
})();
