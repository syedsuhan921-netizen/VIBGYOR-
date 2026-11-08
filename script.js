// Keep page navigation and games self-contained so external elements remain responsive.
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
    let currentGameKey = 'snake';

    const stopGame = () => {
        if (timer !== null) {
            clearInterval(timer);
            cancelAnimationFrame(timer);
        }
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
        currentGameKey = key;
        const games = {
            snake: () => {
                body.innerHTML = shell('🐍 Snake Game', 'Score: 0', `<p>Use on-screen arrows, keyboard arrows, or WASD.</p><div class="game-box"><div id="snakeBoard" class="snake-board" style="display:grid;grid-template-columns:repeat(10,22px);grid-template-rows:repeat(10,22px);justify-content:center;gap:1px;background:#222;padding:5px;border-radius:6px;"></div></div><div class="snake-controls" style="display:flex;gap:10px;justify-content:center;margin-top:10px;"><button class="arrow-btn" data-dir="up">↑</button><button class="arrow-btn" data-dir="left">←</button><button class="arrow-btn" data-dir="down">↓</button><button class="arrow-btn" data-dir="right">→</button></div><div style="text-align:center;margin-top:10px;">${button('Restart Game','restart')}</div>`);
                const board = document.getElementById('snakeBoard');
                const cells = [];
                for (let i = 0; i < 100; i++) { const cell = document.createElement('div'); cell.className = 'snake-cell'; cell.style.cssText = "width:22px;height:22px;background:#333;border-radius:2px;"; board.appendChild(cell); cells.push(cell); }
                
                state = { snake: [{x:4,y:5},{x:3,y:5},{x:2,y:5}], dir:{x:1,y:0}, next:{x:1,y:0}, food:{x:7,y:5}, score:0, over:false };
                
                const draw = () => {
                    cells.forEach((cell,i) => {
                        const cx = i % 10, cy = Math.floor(i / 10);
                        const isSnake = state.snake.some(p => p.x === cx && p.y === cy);
                        const isFood = state.food.x === cx && state.food.y === cy;
                        cell.style.background = isSnake ? '#00ffcc' : (isFood ? '#ff4757' : '#222');
                    });
                };

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
                    
                    if (bodyToCheck.some(p=>p.x===head.x&&p.y===head.y)) { 
                        state.over=true; 
                        document.getElementById('gameStatus').textContent=`Game Over · Score: ${state.score}`; 
                        clearInterval(timer); 
                        timer=null; 
                        return; 
                    }
                    
                    state.snake.unshift(head);
                    if(eating){
                        state.score+=10; 
                        document.getElementById('gameStatus').textContent=`Score: ${state.score}`; 
                        do {state.food={x:Math.floor(Math.random()*10),y:Math.floor(Math.random()*10)};} while(state.snake.some(p=>p.x===state.food.x&&p.y===state.food.y));
                    } else {
                        state.snake.pop();
                    }
                    draw();
                }, 280);
            },
            dragon: () => {
                body.innerHTML = shell('🐉 Dragon Jump','Score: 0',`<p>Tap Jump or press Space to dodge obstacles smoothly.</p><div id="dragonGame" class="dino-runner" style="height:180px; position:relative; background:#18181b; border-radius:8px; overflow:hidden; border:1px solid #333;"><span id="dragon" style="position:absolute; bottom:20px; left:25px; font-size:28px;">🐉</span><span id="dragonObstacle" style="position:absolute; bottom:20px; left:90%; font-size:24px;">🧱</span><div style="position:absolute; bottom:0; width:100%; height:20px; background:#27272a;"></div></div><div class="snake-controls" style="display:flex; gap:10px; justify-content:center; margin-top:12px;">${button('Jump','jump')}${button('Restart','restart')}</div>`);
                
                state = { score: 0, y: 0, velocity: 0, gravity: 0.8, lift: -11, obsX: 300, over: false };
                
                const jump = () => {
                    if (!state || state.over || state.y > 0) return;
                    state.velocity = state.lift;
                };
                state.jump = jump;

                keyHandler = e => { if (e.code === 'Space') { e.preventDefault(); jump(); } };
                window.addEventListener('keydown', keyHandler);

                const loop = () => {
                    if (!state || state.over) return;

                    state.velocity += state.gravity;
                    state.y -= state.velocity;
                    if (state.y < 0) { state.y = 0; state.velocity = 0; }

                    state.obsX -= 4.5;
                    if (state.obsX < -20) {
                        state.obsX = 320;
                        state.score++;
                        document.getElementById('gameStatus').textContent = `Score: ${state.score}`;
                    }

                    const dragonEl = document.getElementById('dragon');
                    const obsEl = document.getElementById('dragonObstacle');
                    if (dragonEl) dragonEl.style.bottom = (20 + state.y) + 'px';
                    if (obsEl) obsEl.style.left = state.obsX + 'px';

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
            gobang: () => {
                body.innerHTML=shell('⚫ Gobang','Turn: X',`<p>Connect five stones in a row to win.</p><div id="gobanBoard" style="display:grid; grid-template-columns:repeat(10,26px); gap:2px; justify-content:center; margin:15px 0;"></div><div style="text-align:center;">${button('Restart','restart')}</div>`);
                const board=document.getElementById('gobanBoard'), marks=Array(100).fill('');let turn='X',done=false;
                for(let i=0;i<100;i++){const b=document.createElement('button');b.type='button';b.className='goban-cell empty';b.dataset.index=i;b.style.cssText="width:26px;height:26px;background:#222;color:#fff;border:1px solid #444;font-size:12px;font-weight:bold;cursor:pointer;";board.appendChild(b);}
                state={play:i=>{if(done||marks[i])return;marks[i]=turn;const cell=board.children[i];cell.textContent=turn;cell.style.color=turn==='X'?'#00ffcc':'#ff4757';const r=Math.floor(i/10),c=i%10;let won=false;for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){let count=1;for(const sign of[-1,1]){let y=r+dr*sign,x=c+dc*sign;while(y>=0&&y<10&&x>=0&&x<10&&marks[y*10+x]===turn){count++;y+=dr*sign;x+=dc*sign;}}if(count>=5)won=true;}if(won){done=true;document.getElementById('gameStatus').textContent=`${turn} Wins!`;}else if(marks.every(Boolean)){done=true;document.getElementById('gameStatus').textContent='Draw!';}else{turn=turn==='X'?'O':'X';document.getElementById('gameStatus').textContent=`Turn: ${turn}`;}}};
            },
            tictactoe: () => {
                body.innerHTML=shell('⭕ Tic-Tac-Toe','Turn: X',`<div id="tttBoard" style="display:grid; grid-template-columns:repeat(3,60px); gap:6px; justify-content:center; margin:15px 0;"></div><div style="text-align:center;">${button('Restart','restart')}</div>`);
                const board=document.getElementById('tttBoard'),cells=Array(9).fill(''),wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];let turn='X',done=false;
                for(let i=0;i<9;i++){const b=document.createElement('button');b.type='button';b.style.cssText="width:60px;height:60px;background:#222;color:#fff;border:1px solid #444;font-size:24px;font-weight:bold;cursor:pointer;";b.dataset.index=i;board.appendChild(b);}
                state={play:i=>{if(done||cells[i])return;cells[i]=turn;const b=board.children[i];b.textContent=turn;b.style.color=turn==='X'?'#00ffcc':'#ff4757';const win=wins.some(line=>line.every(n=>cells[n]===turn));if(win){done=true;document.getElementById('gameStatus').textContent=`${turn} Wins!`;}else if(cells.every(Boolean)){done=true;document.getElementById('gameStatus').textContent='Draw!';}else{turn=turn==='X'?'O':'X';document.getElementById('gameStatus').textContent=`Turn: ${turn}`;}}};
            },
            memory: () => {
                body.innerHTML=shell('🧠 Memory Match','Moves: 0',`<div id="memoryBoard" style="display:grid; grid-template-columns:repeat(4,55px); gap:8px; justify-content:center; margin:15px 0;"></div><div style="text-align:center;">${button('New Game','restart')}</div>`);
                const values=['🍉','🍊','🍋','🍇','🍒','🍓','🍉','🍊','🍋','🍇','🍒','🍓'].sort(()=>Math.random()-.5),board=document.getElementById('memoryBoard');let open=[],moves=0,lock=false,matches=0;
                values.forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.style.cssText="width:55px;height:55px;background:#222;color:#fff;border:1px solid #444;font-size:22px;cursor:pointer;border-radius:6px;";b.textContent='?';b.dataset.index=i;board.appendChild(b);});
                state={flip:i=>{if(lock)return;const b=board.children[i];if(b.classList.contains('matched')||open.includes(i))return;b.textContent=values[i];open.push(i);if(open.length===2){moves++;document.getElementById('gameStatus').textContent=`Moves: ${moves}`;const pair=open.slice();if(values[pair[0]]===values[pair[1]]){pair.forEach(n=>{board.children[n].classList.add('matched');board.children[n].style.background='#10b981';});matches++;open=[];if(matches===values.length/2){document.getElementById('gameStatus').textContent=`Won in ${moves} moves!`;}}else{lock=true;setTimeout(()=>{pair.forEach(n=>{if(board.children[n])board.children[n].textContent='?';});open=[];lock=false;},600);}}}};
            },
            guess: () => {
                body.innerHTML=shell('🎯 Guess Number','6 tries',`<p>Guess a number from 1 to 20.</p><div class="guess-box" style="text-align:center;margin-top:15px;"><input id="guessInput" type="number" min="1" max="20" inputmode="numeric" placeholder="1-20" style="padding:8px;width:100px;background:#222;color:#fff;border:1px solid #444;border-radius:4px;"><button class="guess-btn" data-action="guess" style="padding:8px 14px;margin-left:6px;background:#00adb5;color:#fff;border:none;border-radius:4px;cursor:pointer;">Guess</button><p id="guessResult" style="margin:12px 0;">I picked a number. Good luck!</p>${button('New Game','restart')}</div>`);
                state={target:Math.floor(Math.random()*20)+1,tries:0,done:false,guess:()=>{const input=document.getElementById('guessInput'),n=Number(input.value),result=document.getElementById('guessResult');if(!n||n<1||n>20){result.textContent='Enter 1 to 20.';return;}if(state.done)return;state.tries++;if(n===state.target){result.textContent=`Correct in ${state.tries} tries!`;document.getElementById('gameStatus').textContent=`Solved!`;state.done=true;}else if(state.tries>=6){result.textContent=`Game over! It was ${state.target}.`;document.getElementById('gameStatus').textContent=`Failed`;state.done=true;}else result.textContent=`${n<state.target?'Too low':'Too high'} (${6-state.tries} left)`;}};
            },
            quiz: () => {
                const questions=[['Which language makes web pages interactive?',['HTML','CSS','JavaScript'],'JavaScript'],['What does AI stand for?',['Artificial Intelligence','Automated Internet','Advanced Input'],'Artificial Intelligence'],['Which company created ChatGPT?',['Google','OpenAI','Apple'],'OpenAI']];
                body.innerHTML=shell('❓ Quick Quiz','Question 1 of 3',`<div id="quizBox" style="margin:15px 0;"></div><div style="text-align:center;">${button('Play Again','restart')}</div>`);state={index:0,score:0,answer:i=>{if(i===questions[state.index][2])state.score++;state.index++;if(state.index>=questions.length){document.getElementById('gameStatus').textContent=`Score: ${state.score}/${questions.length}`;document.getElementById('quizBox').innerHTML='<p>Quiz complete! Press Play Again.</p>';return;}show();}};
                function show(){const q=questions[state.index],box=document.getElementById('quizBox');document.getElementById('gameStatus').textContent=`Q ${state.index+1} of ${questions.length} · Score: ${state.score}`;box.innerHTML=`<h3 style="margin-bottom:10px;">${q[0]}</h3><div class="quiz-options" style="display:flex;flex-direction:column;gap:8px;">${q[1].map((x,i)=>`<button type="button" class="quiz-option" data-choice="${i}" style="padding:10px;background:#222;color:#fff;border:1px solid #444;border-radius:6px;cursor:pointer;text-align:left;">${x}</button>`).join('')}</div>`;}show();
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
        const dir=event.target.closest('[data-dir]');if(dir&&state.setDir){state.setDir({up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}[dir.dataset.dir]);return;}
        const action=event.target.closest('[data-action]')?.dataset.action;
        if(action==='restart'){launch(currentGameKey);return;}
        if(action==='jump'&&state.jump){state.jump();return;}
        if(action==='guess'&&state.guess){state.guess();return;}
        const cell=event.target.closest('[data-index]');if(cell){const i=Number(cell.dataset.index);if(state.play)state.play(i);else if(state.flip)state.flip(i);}
        const choice=event.target.closest('[data-choice]');if(choice&&state.answer)state.answer(Number(choice.dataset.choice));
    },true);

    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal.classList.contains('active'))window.closeGameModal();});
})();
 
