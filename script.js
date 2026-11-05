// Define navigation immediately: inline buttons must work even while game code loads.
window.showPage = function (pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;
    document.querySelectorAll('.page-view').forEach(item => { item.style.display = 'none'; });
    page.style.display = 'block';
    window.scrollTo(0, 0);
};

window.toggleTheme = function () {
    document.body.classList.toggle('light-mode');
};

window.showMessage = function () {
    alert('Welcome to VIBGYOR Technologies! Click any category card to open its dedicated full page.');
};

(() => {
    const aiGuides = {
        gemini: {
            title: 'Google Gemini',
            intro: 'Gemini is Google’s family of generative AI models and the assistant built around them. Depending on the model, it can work with text, images, audio, video, and code.',
            models: 'Gemini model options include Pro models for more complex tasks, Flash models designed for speed and efficiency, and Nano models for supported on-device tasks. Versions and availability change over time.',
            how: 'Gemini models learn patterns from large training datasets and generate likely useful outputs. Multimodal versions can process more than text, and some products can use tools such as search when enabled.',
            merits: ['Can assist with writing, summaries, brainstorming, coding, and multimodal tasks.', 'Different model tiers balance capability, speed, and device needs.', 'Integrates with Google products and services where supported.'],
            limits: 'Gemini can make mistakes or provide outdated information. Verify important claims and be thoughtful about the information you share.',
            url: 'https://ai.google.dev/gemini-api/docs/models'
        },
        chatgpt: {
            title: 'OpenAI ChatGPT',
            intro: 'ChatGPT is OpenAI’s conversational AI product, powered by different GPT model options. It can help explain topics, draft writing, analyze information, and assist with coding.',
            models: 'OpenAI provides general-purpose GPT models, reasoning-focused models for more involved problems, and smaller or faster options. The available model names and capabilities vary by plan and change regularly.',
            how: 'GPT models learn patterns from data and generate a response piece by piece. Depending on the selected model and enabled features, ChatGPT may also analyze images or files, browse, or use other tools.',
            merits: ['Flexible for conversation, explanations, writing, analysis, and programming.', 'Model choices can balance response speed and deeper reasoning.', 'Optional tools and multimodal features are available in supported plans.'],
            limits: 'Fluent answers are not guaranteed to be correct. Verify important advice, calculations, and sources; features vary by model and plan.',
            url: 'https://platform.openai.com/docs/models'
        },
        claude: {
            title: 'Anthropic Claude',
            intro: 'Claude is Anthropic’s family of AI assistants and language models for conversation, writing, analysis, and software development.',
            models: 'Claude models are commonly grouped into Opus (highest capability), Sonnet (a balance of capability and speed), and Haiku (a faster, lighter tier). Specific model versions and availability evolve.',
            how: 'Claude uses neural language models trained to understand and generate text. Depending on the model and product, it can also work with images, long documents, and tools; safety training helps guide responses.',
            merits: ['Useful for drafting, editing, summarizing, and analyzing long documents.', 'Model tiers provide different speed and capability trade-offs.', 'Can help with coding and structured analysis.'],
            limits: 'Claude can make factual errors or miss details. Review outputs, especially code and high-impact decisions.',
            url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview'
        },
        deepseek: {
            title: 'DeepSeek',
            intro: 'DeepSeek is an AI company whose models include general-purpose language models and models focused on reasoning and technical tasks.',
            models: 'DeepSeek model families include general language and coding models as well as reasoning-focused models. There are also different sizes and variants; exact releases and access options evolve.',
            how: 'DeepSeek models generate text from learned patterns. Reasoning-focused versions are trained to spend more computation on multi-step problems. Some releases provide weights for developers to run or adapt under their license.',
            merits: ['Can be useful for coding, technical questions, and multi-step reasoning.', 'Some releases let developers experiment with self-hosting or adapting models.', 'Different model sizes can suit different hardware and resource limits.'],
            limits: 'Quality, privacy, hosting, and licensing depend on the specific model and service. Independently verify important results.',
            url: 'https://github.com/deepseek-ai'
        },
        copilot: {
            title: 'GitHub Copilot',
            intro: 'GitHub Copilot is an AI coding assistant—not one single model—that helps developers write, understand, test, and improve code in supported development tools.',
            models: 'Depending on the feature, plan, and model selector, Copilot may offer models from providers such as OpenAI, Anthropic, and Google. The available catalog changes over time.',
            how: 'Copilot sends a prompt and relevant context, such as nearby code or open files, to a selected AI model. The model generates suggestions or explanations for a developer to review, edit, accept, or reject.',
            merits: ['Provides coding help inside supported editors and GitHub experiences.', 'Can suggest code, explain files, and help draft tests or documentation.', 'Model choices can provide different strengths for different tasks.'],
            limits: 'Suggestions may be incorrect, insecure, or unsuitable for your project. Review and test generated code; do not share secrets or sensitive data.',
            url: 'https://docs.github.com/en/copilot/reference/ai-models/supported-models'
        }
    };

    function closeModal() {
        const modal = document.getElementById('gameModal');
        if (modal) modal.classList.remove('active');
        const body = document.getElementById('gameModalBody');
        if (body) body.innerHTML = '';
        if (typeof window.stopActiveGame === 'function') window.stopActiveGame();
    }

    function openAiGuide(card) {
        const name = card.querySelector('h4')?.textContent?.toLowerCase() || '';
        const key = name.includes('gemini') ? 'gemini'
            : name.includes('chatgpt') ? 'chatgpt'
            : name.includes('claude') ? 'claude'
            : name.includes('deepseek') ? 'deepseek'
            : name.includes('copilot') ? 'copilot' : null;
        const guide = aiGuides[key];
        const modal = document.getElementById('gameModal');
        const body = document.getElementById('gameModalBody');
        if (!guide || !modal || !body) return;
        body.innerHTML = `<article class="ai-detail">
            <h2>${guide.title}</h2><p>${guide.intro}</p>
            <section><h3>Model families</h3><p>${guide.models}</p></section>
            <section><h3>How it works</h3><p>${guide.how}</p></section>
            <section><h3>Main merits</h3><ul>${guide.merits.map(item => `<li>${item}</li>`).join('')}</ul></section>
            <section><h3>Things to keep in mind</h3><p>${guide.limits}</p></section>
            <p class="ai-note">Model lineups change. See <a href="${guide.url}" target="_blank" rel="noopener noreferrer">the provider’s documentation</a> for current details.</p>
        </article>`;
        modal.classList.add('active');
    }

    document.addEventListener('click', event => {
        // Close only when the explicit close control or the backdrop is clicked.
        if (event.target.closest('#gameModal .modal-close') || event.target.id === 'gameModal') {
            closeModal();
            return;
        }
        const aiCard = event.target.closest('#aiPage .full-sub-card');
        if (!aiCard || event.target.closest('.like-btn')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        openAiGuide(aiCard);
    }, true);

    const style = document.createElement('style');
    style.textContent = `
        .snake-controls { display:grid; grid-template-columns:repeat(3,64px); grid-template-rows:repeat(2,56px); gap:8px; justify-content:center; }
        .snake-controls .arrow-btn { min-width:64px; min-height:56px; padding:8px; border:1px solid rgba(0,229,255,.45); border-radius:14px; background:rgba(0,229,255,.18); color:inherit; font-size:1.65rem; touch-action:manipulation; }
        .snake-controls .arrow-btn[data-dir="up"] { grid-column:2; grid-row:1; }
        .snake-controls .arrow-btn[data-dir="left"] { grid-column:1; grid-row:2; }
        .snake-controls .arrow-btn[data-dir="down"] { grid-column:2; grid-row:2; }
        .snake-controls .arrow-btn[data-dir="right"] { grid-column:3; grid-row:2; }
        .ai-detail { display:grid; gap:14px; padding-top:12px; line-height:1.65; }
        .ai-detail h2 { color:#00e5ff; }
        .ai-detail h3 { color:#7dd3fc; margin-bottom:4px; }
        .ai-detail p,.ai-detail li { color:#d3dbe7; }
        body.light-mode .ai-detail p,body.light-mode .ai-detail li { color:#334155; }
        .ai-detail ul { padding-left:22px; }
        .ai-detail a { color:#00e5ff; }
        body.light-mode .ai-detail a { color:#007f91; }
        .ai-note { font-size:.9rem; opacity:.85; }
        @media(max-width:620px) { .snake-controls { grid-template-columns:repeat(3,72px); grid-template-rows:repeat(2,62px); } .snake-controls .arrow-btn { min-width:72px; min-height:62px; } }
    `;
    document.head.appendChild(style);

    // Ensure the modal close button works even if the existing game script hasn't loaded.
    document.addEventListener('DOMContentLoaded', () => {
        const closeButton = document.querySelector('#gameModal .modal-close');
        if (closeButton) closeButton.addEventListener('click', closeModal);
    });

    // Load the existing game code after synchronous navigation is ready.
    const legacyScript = document.createElement('script');
    legacyScript.src = 'https://raw.githubusercontent.com/syedsuhan921-netizen/VIBGYOR-/dc387cb95d29fda43095f73bb0d1aee28429d638/script.js';
    legacyScript.addEventListener('load', () => {
        // Snake's original 180 ms interval is slowed to 320 ms.
        const nativeSetInterval = window.setInterval.bind(window);
        window.setInterval = (callback, delay, ...args) => nativeSetInterval(callback, delay === 180 ? 320 : delay, ...args);

        const originalRender = window.renderGameModal;
        window.renderGameModal = function (gameKey) {
            originalRender(gameKey);
            if (gameKey !== 'snake') return;
            const labels = { up: ['↑', 'Move up'], left: ['←', 'Move left'], down: ['↓', 'Move down'], right: ['→', 'Move right'] };
            document.querySelectorAll('#gameModalBody .arrow-btn[data-dir]').forEach(button => {
                const [label, accessibleName] = labels[button.dataset.dir];
                button.type = 'button'; button.textContent = label;
                button.setAttribute('aria-label', accessibleName); button.title = accessibleName;
            });
            const restart = document.querySelector('#gameModalBody .game-shell > .play-now-btn');
            if (restart) { restart.type = 'button'; restart.textContent = 'Restart Game'; }
        };
        if (typeof window.bindGameButtons === 'function') window.bindGameButtons();
    });
    legacyScript.addEventListener('error', () => console.error('Game script failed to load; page navigation remains available.'));
    document.head.appendChild(legacyScript);
})();
