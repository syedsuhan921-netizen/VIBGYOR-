// Keep page navigation and games self-contained so a blocked external script cannot
// leave the Games card or Play Now buttons unresponsive.
window.showPage = function (pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;
    document.querySelectorAll('.page-view').forEach(item => { item.style.display = 'none'; });
    page.style.display = 'block';
    window.scrollTo(0, 0);
};
window.toggleTheme = () => document.body.classList.toggle('light-mode');
window.showMessage = () => alert('Welcome to VIBGYOR Technologies! Click any category card to open its dedicated full page.');

(() => {
    const modal = document.getElementById('gameModal');
    const body = document.getElementById('gameModalBody');
    if (!modal || !body) return;

    let timer = null;
    let keyHandler = null;
    let state = null;
    const stopGame = () => {
        if (timer !== null) clearInterval(timer);
        timer = null;
        if (keyHandler) window.removeEventListener('keydown', keyHandler);
        keyHandler = null;
        state = null;
    };
    window.stopActiveGame = stopGame;
    window.closeGameModal = () => {
        stopGame();
        modal.classList.remove('active');
        body.innerHTML = '';
    };

    const shell = (title, status, content) => `<div class="game-shell"><div class="game-header"><h2 class="game-title">${title}</h2><div class="game-score" id="gameStatus">${status}</div></div>${content}</div>`;
    const button = (label, action, extra = '') => `<button type="button" class="play-now-btn" data-action="${action}" ${extra}>${label}</button>`;

    function launch(key) {
        stopGame();
        const games = {
            snake: () => {
                body.innerHTML = shell('🐍 Snake Game', 'Score: 0', `<p>Use the arrow buttons, keyboard arrows, or WASD. The edges wrap around.</p><div class="game-box"><div id="snakeBoard" class="snake-board" style="grid-template-columns:repeat(10,22px);grid-template-rows:repeat(10,22px)"></div></div><div class="snake-controls"><button class="arrow-btn" data-dir="up" aria-label="Move up">↑</button><button class="arrow-btn" data-dir="left" aria-label="Move left">←</button><button class="arrow-btn" data-dir="down" aria-label="Move down">↓</button><button class="arrow-btn" data-dir="right" aria-label="Move right">→</button></div>${button('Restart Game','restart')}</div>`);
                const board = document.getElementById('snakeBoard');
                const cells = [];
                for (let i = 0; i < 100; i++) { const cell = document.createElement('div'); cell.className = 'snake-cell'; board.appendChild(cell); cells.push(cell); }
                state = { snake: [{x:4,y:5},{x:3,y:5},{x:2,y:5}], dir:{x:1,y:0}, next:{x:1,y:0}, food:{x:7,y:5}, score:0, over:false };
                const draw = () => cells.forEach((cell,i) => { cell.classList.toggle('snake', state.snake.some(p => p.x === i%10 && p.y === Math.floor(i/10))); cell.classList.toggle('food', state.food.x === i%10 && state.food.y === Math.floor(i/10)); });
                const setDir = d => { if (state && !(state.dir.x + d.x === 0 && state.dir.y + d.y === 0)) state.next = d; };
                state.setDir = setDir;
                const directions = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
                keyHandler = e => { const k=e.key.toLowerCase(); const d={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}[k]; if(d){e.preventDefault();setDir(directions[d]);} };
                window.addEventListener('keydown', keyHandler);
                draw();
                timer = setInterval(() => {
                    if (!state || state.over) return;
                    state.dir = state.next;
                    const head = {x:(state.snake[0].x+state.dir.x+10)%10,y:(state.snake[0].y+state.dir.y+10)%10};
                    const eating = head.x===state.food.x && head.y===state.food.y;
                    const bodyToCheck = eating ? state.snake : state.snake.slice(0,-1);
                    if (bodyToCheck.some(p=>p.x===head.x&&p.y===head.y)) { state.over=true; document.getElementById('gameStatus').textContent=`Game over · Score: ${state.score}`; clearInterval(timer); timer=null; return; }
                    state.snake.unshift(head);
                    if(eating){state.score+=10; document.getElementById('gameStatus').textContent=`Score: ${state.score}`; do {state.food={x:Math.floor(Math.random()*10),y:Math.floor(Math.random()*10)};} while(state.snake.some(p=>p.x===state.food.x&&p.y===state.food.y));} else state.snake.pop();
                    draw();
                }, 300);
            },
            dragon: () => {
                body.innerHTML = shell('🐉 Dragon Jump','Score: 0',`<p>Tap Jump or press Space to avoid incoming obstacles smoothly.</p><div id="dragonGame" class="dino-runner" style="height:200px; position:relative; overflow:hidden;"><span id="dragon" class="dragon" style="position:absolute; bottom:30px; left:20px; transition:none;">🐉</span><span id="dragonObstacle" class="obstacle" style="position:absolute; bottom:30px; left:80%"></span><div class="ground" style="position:absolute; bottom:0; width:100%; height:30px;"></div></div><div class="snake-controls">${button('Jump','jump')}${button('Restart','restart')}</div>`);
                
                state = { score: 0, dragonY: 30, velocity: 0, gravity: 0.6, lift: -10, obstacleX: 80, over: false };
                
                const jump = () => {
                    if (!state || state.over) return;
                    state.velocity = state.lift;
                };
                state.jump = jump;

                keyHandler = e => { if (e.code === 'Space') { e.preventDefault(); jump(); } };
                window.addEventListener('keydown', keyHandler);

                timer = setInterval(() => {
                    if (!state || state.over) return;

                    // Smooth physics calculations
                    state.velocity += state.gravity;
                    state.dragonY -= state.velocity; // Moving upwards decreases bottom style offset
                    
                    if (state.dragonY < 30) {
                        state.dragonY = 30;
                        state.velocity = 0;
                    }

                    // Move obstacle
                    state.obstacleX -= 2.5;
                    const obstacleEl = document.getElementById('dragonObstacle');
                    const dragonEl = document.getElementById('dragon');
                    
                    if (obstacleEl) obstacleEl.style.left = state.obstacleX + '%';
                    if (dragonEl) dragonEl.style.bottom = state.dragonY + 'px';

                    // Collision detection & scoring
                    if (state.obstacleX < 12 && state.obstacleX > 2 && state.dragonY < 65) {
                        state.over = true;
                        document.getElementById('gameStatus').textContent = `Game over · Score: ${state.score}`;
                        clearInterval(timer);
                        timer = null;
                        return;
                    }

                    if (state.obstacleX < 0) {
                        state.obstacleX = 95;
                        state.score++;
                        document.getElementById('gameStatus').textContent = `Score: ${state.score}`;
                    }
                }, 30);
            },
            gobang: () => {
                body.innerHTML=shell('⚫ Gobang','Turn: X',`<p>Take turns; connect five stones to win.</p><div id="gobanBoard" class="goban-board" style="grid-template-columns:repeat(10,24px)"></div>${button('Restart','restart')}`);
                const board=document.getElementById('gobanBoard'), marks=Array(100).fill('');let turn='X',done=false;
                for(let i=0;i<100;i++){const b=document.createElement('button');b.type='button';b.className='goban-cell empty';b.dataset.index=i;b.style.width='24px';b.style.height='24px';board.appendChild(b);}
                state={play:i=>{if(done||marks[i])return;marks[i]=turn;const cell=board.children[i];cell.textContent=turn;cell.classList.add(turn.toLowerCase());const r=Math.floor(i/10),c=i%10;let won=false;for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){let count=1;for(const sign of[-1,1]){let y=r+dr*sign,x=c+dc*sign;while(y>=0&&y<10&&x>=0&&x<10&&marks[y*10+x]===turn){count++;y+=dr*sign;x+=dc*sign;}}if(count>=5)won=true;}if(won){done=true;document.getElementById('gameStatus').textContent=`${turn} wins!`;}else if(marks.every(Boolean)){done=true;document.getElementById('gameStatus').textContent='Draw!';}else{turn=turn==='X'?'O':'X';document.getElementById('gameStatus').textContent=`Turn: ${turn}`;}}};
            },
            tictactoe: () => {
                body.innerHTML=shell('⭕ Tic-Tac-Toe','Turn: X',`<div id="tttBoard" class="ttt-board"></div>${button('Restart','restart')}`);
                const board=document.getElementById('tttBoard'),cells=Array(9).fill(''),wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];let turn='X',done=false;
                for(let i=0;i<9;i++){const b=document.createElement('button');b.type='button';b.className='ttt-cell';b.dataset.index=i;board.appendChild(b);}
                state={play:i=>{if(done||cells[i])return;cells[i]=turn;board.children[i].textContent=turn;const win=wins.some(line=>line.every(n=>cells[n]===turn));if(win){done=true;document.getElementById('gameStatus').textContent=`${turn} wins!`;}else if(cells.every(Boolean)){done=true;document.getElementById('gameStatus').textContent='Draw!';}else{turn=turn==='X'?'O':'X';document.getElementById('gameStatus').textContent=`Turn: ${turn}`;}}};
            },
            memory: () => {
                body.innerHTML=shell('🧠 Memory Match','Moves: 0',`<div id="memoryBoard" class="memory-board"></div>${button('New Game','restart')}`);
                // Included proper watermelon emoji 🍉 along with other balanced items
                const values=['🍉','🍊','🍋','🍇','🍒','🍓','🍉','🍊','🍋','🍇','🍒','🍓'].sort(()=>Math.random()-.5),board=document.getElementById('memoryBoard');let open=[],moves=0,lock=false;
                values.forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.className='memory-card';b.textContent='?';b.dataset.index=i;board.appendChild(b);});
                state={flip:i=>{if(lock)return;const b=board.children[i];if(b.classList.contains('matched')||open.includes(i))return;b.textContent=values[i];open.push(i);if(open.length===2){moves++;document.getElementById('gameStatus').textContent=`Moves: ${moves}`;const pair=open.slice();if(values[pair[0]]===values[pair[1]]){pair.forEach(n=>board.children[n].classList.add('matched'));open=[];}else{lock=true;setTimeout(()=>{pair.forEach(n=>{if(board.children[n])board.children[n].textContent='?';});open=[];lock=false;},650);}}}};
            },
            guess: () => {
                body.innerHTML=shell('🎯 Guess Number','6 tries',`<p>Guess a number from 1 to 20.</p><div class="guess-box"><input id="guessInput" class="guess-input" type="number" min="1" max="20" inputmode="numeric" placeholder="1 to 20"><button class="guess-btn" data-action="guess">Guess</button><p id="guessResult" aria-live="polite">I picked a number. Good luck!</p>${button('New Game','restart')}</div>`);
                state={target:Math.floor(Math.random()*20)+1,tries:0,done:false,guess:()=>{const input=document.getElementById('guessInput'),n=Number(input.value),result=document.getElementById('guessResult');if(!n||n<1||n>20){result.textContent='Enter a number from 1 to 20.';return;}if(state.done)return;state.tries++;if(n===state.target){result.textContent=`Correct! You got it in ${state.tries} ${state.tries===1?'try':'tries'}.`;state.done=true;}else if(state.tries>=6){result.textContent=`Game over — the number was ${state.target}.`;state.done=true;}else result.textContent=`${n<state.target?'Too low':'Too high'} — ${6-state.tries} tries left.`;}};
            },
            quiz: () => {
                const questions=[['Which language makes web pages interactive?',['HTML','CSS','JavaScript'],'JavaScript'],['What does AI stand for?',['Artificial Intelligence','Automated Internet','Advanced Input'],'Artificial Intelligence'],['Which company created ChatGPT?',['Google','OpenAI','Apple'],'OpenAI']];
                body.innerHTML=shell('❓ Quick Quiz','Question 1 of 3',`<div id="quizBox"></div>${button('Play Again','restart')}`);state={index:0,score:0,answer:i=>{if(i===questions[state.index][2])state.score++;state.index++;if(state.index>=questions.length){document.getElementById('gameStatus').textContent=`Score: ${state.score}/${questions.length}`;document.getElementById('quizBox').innerHTML='<p>Quiz complete! Press Play Again to try once more.</p>';return;}show();}};
                function show(){const q=questions[state.index],box=document.getElementById('quizBox');document.getElementById('gameStatus').textContent=`Question ${state.index+1} of ${questions.length} · Score: ${state.score}`;box.innerHTML=`<h3>${q[0]}</h3><div class="quiz-options">${q[1].map((x,i)=>`<button type="button" class="quiz-option" data-choice="${i}">${x}</button>`).join('')}</div>`;}show();
            }
        };
        (games[key] || games.snake)();
        modal.classList.add('active');
    }

    document.addEventListener('click', event => {
        const launchButton=event.target.closest('.game-launch-btn');
        if(launchButton){event.preventDefault();event.stopImmediatePropagation();launch(launchButton.dataset.game);return;}
        if(event.target.closest('#gameModal .modal-close')||event.target===modal){window.closeGameModal();return;}
        if(!body.contains(event.target)||!state)return;
        const dir=event.target.closest('[data-dir]');if(dir&&state.setDir){state.setDir({up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[dir.dataset.dir]);return;}
        const action=event.target.closest('[data-action]')?.dataset.action;
        if(action==='restart'){launch(document.querySelector('.game-launch-btn[data-game]')?.dataset.game || 'snake');return;}
        if(action==='jump'&&state.jump){state.jump();return;}
        if(action==='guess'&&state.guess){state.guess();return;}
        const cell=event.target.closest('[data-index]');if(cell){const i=Number(cell.dataset.index);if(state.play)state.play(i);else if(state.flip)state.flip(i);}
        const choice=event.target.closest('[data-choice]');if(choice&&state.answer)state.answer(Number(choice.dataset.choice));
    },true);

    // Close with Escape and keep keyboard controls available for the active game.
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal.classList.contains('active'))window.closeGameModal();});
})();
                
