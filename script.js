/* Load the existing game implementation, then add the requested Snake and AI-card improvements. */
(() => {
    const legacyScript = document.createElement('script');
    legacyScript.src = 'https://raw.githubusercontent.com/syedsuhan921-netizen/VIBGYOR-/dc387cb95d29fda43095f73bb0d1aee28429d638/script.js';

    legacyScript.addEventListener('load', () => {
        const style = document.createElement('style');
        style.textContent = `
            .snake-controls {
                display: grid;
                grid-template-columns: repeat(3, 64px);
                grid-template-rows: repeat(2, 56px);
                gap: 8px;
                justify-content: center;
            }
            .snake-controls .arrow-btn {
                min-width: 64px;
                min-height: 56px;
                padding: 8px;
                border: 1px solid rgba(0,229,255,0.45);
                border-radius: 14px;
                background: rgba(0,229,255,0.18);
                color: inherit;
                font-size: 1.65rem;
                touch-action: manipulation;
            }
            .snake-controls .arrow-btn[data-dir="up"] { grid-column: 2; grid-row: 1; }
            .snake-controls .arrow-btn[data-dir="left"] { grid-column: 1; grid-row: 2; }
            .snake-controls .arrow-btn[data-dir="down"] { grid-column: 2; grid-row: 2; }
            .snake-controls .arrow-btn[data-dir="right"] { grid-column: 3; grid-row: 2; }
            .snake-controls .arrow-btn:hover,
            .snake-controls .arrow-btn:active {
                background: #00bcd4;
                color: #06131d;
            }
            .ai-detail { display: grid; gap: 14px; padding-top: 12px; line-height: 1.65; }
            .ai-detail h2 { color: #00e5ff; margin-bottom: 2px; }
            .ai-detail h3 { color: #7dd3fc; margin-bottom: 4px; }
            .ai-detail p, .ai-detail li { color: #d3dbe7; }
            body.light-mode .ai-detail p, body.light-mode .ai-detail li { color: #334155; }
            .ai-detail ul { padding-left: 22px; }
            .ai-detail a { color: #00e5ff; }
            body.light-mode .ai-detail a { color: #007f91; }
            .ai-note { font-size: .9rem; opacity: .85; }
            @media (max-width: 620px) {
                .snake-controls { grid-template-columns: repeat(3, 72px); grid-template-rows: repeat(2, 62px); }
                .snake-controls .arrow-btn { min-width: 72px; min-height: 62px; }
            }
        `;
        document.head.appendChild(style);

        // The original Snake game updates every 180 ms. Increase that interval to 320 ms.
        const nativeSetInterval = window.setInterval.bind(window);
        window.setInterval = (callback, delay, ...args) =>
            nativeSetInterval(callback, delay === 180 ? 320 : delay, ...args);

        const originalRenderGameModal = window.renderGameModal;
        window.renderGameModal = function (gameKey) {
            originalRenderGameModal(gameKey);
            if (gameKey !== 'snake') return;

            const directions = {
                up: ['↑', 'Move up'],
                left: ['←', 'Move left'],
                down: ['↓', 'Move down'],
                right: ['→', 'Move right']
            };
            document.querySelectorAll('#gameModalBody .arrow-btn[data-dir]').forEach(button => {
                const [label, accessibleName] = directions[button.dataset.dir];
                button.type = 'button';
                button.textContent = label;
                button.setAttribute('aria-label', accessibleName);
                button.title = accessibleName;
            });
            const restartButton = document.querySelector('#gameModalBody .game-shell > .play-now-btn');
            if (restartButton) {
                restartButton.type = 'button';
                restartButton.textContent = 'Restart Game';
            }
        };

        const aiGuides = {
            gemini: {
                title: 'Google Gemini',
                intro: 'Gemini is Google’s family of generative AI models and the assistant built around them. It can work with text, images, audio, video, and code, depending on the model and product.',
                models: 'The main model tiers are Gemini Pro (more capable for complex tasks), Gemini Flash (optimized for speed and efficiency), and Gemini Nano (smaller models designed for supported on-device tasks). Specific model versions and availability change over time.',
                working: 'Gemini models are trained on large collections of data to learn patterns and predict useful outputs. Multimodal versions can process more than text; the product may also use tools such as search or code execution when available.',
                merits: ['Useful across writing, summarizing, brainstorming, coding, and image or audio tasks.', 'Google product integration and a range of speed/capability tiers.', 'Some Nano-powered features can run on supported devices.'],
                limits: 'It can still make mistakes, misunderstand context, or produce outdated information. Check important claims and be mindful of what you share with any AI service.',
                link: 'https://ai.google.dev/gemini-api/docs/models'
            },
            chatgpt: {
                title: 'OpenAI ChatGPT',
                intro: 'ChatGPT is OpenAI’s conversational AI product, powered by different GPT model options. It can help explain topics, draft and revise writing, analyze information, and assist with coding.',
                models: 'OpenAI offers general-purpose GPT models, reasoning-focused models for more involved problems, and smaller or faster options. The available model names and capabilities vary by plan and are updated regularly; check OpenAI’s model catalog for the current list.',
                working: 'GPT models learn statistical patterns from training data and generate responses one piece at a time. Depending on the selected model and enabled features, ChatGPT may also analyze images or files, browse, or use other tools.',
                merits: ['Flexible for conversation, explanations, writing, analysis, and programming.', 'Different model choices can balance response speed and deeper reasoning.', 'A broad set of optional tools and multimodal features may be available.'],
                limits: 'Fluent answers are not guaranteed to be correct. Verify consequential advice, calculations, and citations; features depend on the selected model, plan, and settings.',
                link: 'https://platform.openai.com/docs/models'
            },
            claude: {
                title: 'Anthropic Claude',
                intro: 'Claude is Anthropic’s family of AI assistants and language models, designed for conversation, writing, analysis, and software development.',
                models: 'Claude models are commonly grouped into Opus (the most capable tier), Sonnet (a balance of capability and speed), and Haiku (a faster, lighter tier). Exact model versions and availability change, so consult Anthropic’s model page for current details.',
                working: 'Claude uses large neural language models trained to understand and generate text. Depending on the model and product, it can also work with images, long documents, and tools; safety training helps guide how it responds.',
                merits: ['Strong for drafting, editing, summarizing, and working through long documents.', 'The model tiers offer different speed and capability trade-offs.', 'Can be helpful for coding and structured analysis.'],
                limits: 'Claude can make factual errors and may miss details in lengthy material. Review outputs, especially code and high-impact decisions.',
                link: 'https://docs.anthropic.com/en/docs/about-claude/models/overview'
            },
            deepseek: {
                title: 'DeepSeek',
                intro: 'DeepSeek is an AI company whose models include general-purpose language models and models tuned for reasoning and technical tasks.',
                models: 'Notable model families include DeepSeek-V for general language and coding tasks and DeepSeek-R for reasoning-focused tasks. DeepSeek also publishes versions and distilled variants with different sizes and capabilities; names, releases, and access options evolve.',
                working: 'Like other language models, DeepSeek models generate text from learned patterns. Reasoning-focused versions are trained to spend more computation on multi-step problems. Some releases provide weights for developers to run or adapt under the applicable license.',
                merits: ['Can be useful for coding, technical questions, and multi-step reasoning.', 'Some model releases offer developers more control over deployment and experimentation.', 'Different sizes and variants can suit different resource constraints.'],
                limits: 'Quality, privacy, hosting, and licensing depend on the specific model and whether it is used through a hosted service or self-hosted. Independently verify important results.',
                link: 'https://github.com/deepseek-ai'
            },
            copilot: {
                title: 'GitHub Copilot',
                intro: 'GitHub Copilot is an AI coding assistant, not a single standalone model. It helps developers write, understand, test, and improve code inside supported development tools.',
                models: 'Copilot can offer different underlying models from providers such as OpenAI, Anthropic, and Google, depending on the feature, plan, and model selector available in your account. The catalog changes; see GitHub’s current documentation for supported models.',
                working: 'Copilot sends a prompt plus relevant context—such as nearby code, open files, or a chat question—to a selected model. The model generates suggestions or explanations, which the developer can review and accept, edit, or reject.',
                merits: ['Keeps coding help close to the editor and project context.', 'Can suggest code, explain unfamiliar files, and help draft tests or documentation.', 'Model choices can provide different strengths for particular tasks.'],
                limits: 'Suggestions may be incorrect, insecure, or inconsistent with a project’s requirements. Review and test generated code, and do not share secrets or sensitive data.',
                link: 'https://docs.github.com/en/copilot/reference/ai-models/supported-models'
            }
        };

        function showAIGuide(card) {
            const heading = card.querySelector('h4')?.textContent || '';
            const key = heading.toLowerCase().includes('gemini') ? 'gemini'
                : heading.toLowerCase().includes('chatgpt') ? 'chatgpt'
                : heading.toLowerCase().includes('claude') ? 'claude'
                : heading.toLowerCase().includes('deepseek') ? 'deepseek'
                : heading.toLowerCase().includes('copilot') ? 'copilot' : null;
            const guide = aiGuides[key];
            if (!guide) return;

            const modal = document.getElementById('gameModal');
            const modalBody = document.getElementById('gameModalBody');
            if (!modal || !modalBody) return;
            if (typeof window.closeGameModal === 'function') window.closeGameModal();
            modalBody.innerHTML = `
                <article class="ai-detail">
                    <h2>${guide.title}</h2>
                    <p>${guide.intro}</p>
                    <section><h3>Model families</h3><p>${guide.models}</p></section>
                    <section><h3>How it works</h3><p>${guide.working}</p></section>
                    <section><h3>Main merits</h3><ul>${guide.merits.map(item => `<li>${item}</li>`).join('')}</ul></section>
                    <section><h3>Things to keep in mind</h3><p>${guide.limits}</p></section>
                    <p class="ai-note">Model lineups and features change. For the latest official details, see <a href="${guide.link}" target="_blank" rel="noopener noreferrer">the provider’s documentation</a>.</p>
                </article>`;
            modal.classList.add('active');
        }

        // Capture card clicks before their old alert handlers; preserve the like buttons.
        document.addEventListener('click', event => {
            if (event.target.closest('#aiPage .like-btn')) return;
            const card = event.target.closest('#aiPage .full-sub-card');
            if (!card) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            showAIGuide(card);
        }, true);

        const closeButton = document.querySelector('#gameModal .modal-close');
        if (closeButton) closeButton.addEventListener('click', window.closeGameModal);
        // Dynamically loaded scripts may miss DOMContentLoaded, so bind game launchers now.
        if (typeof window.bindGameButtons === 'function') window.bindGameButtons();
    });

    legacyScript.addEventListener('error', () => {
        console.error('The existing VIBGYOR game script could not be loaded.');
    });
    document.head.appendChild(legacyScript);
})();
