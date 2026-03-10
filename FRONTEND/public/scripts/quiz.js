// import { AuthService } from './auth_service.js'
// import { KonverteSync } from './konverte_sync.js'

const QuizEngine = {
    currentStep: 0,
    answers: [],
    flow: null,

    async init() {
        console.log("[🛡️] AMÉM IA: Inicializando diagnóstico...");
        const container = document.getElementById('quiz-container');
        container.innerHTML = '<p class="text-center py-12 animate-pulse">Consultando fundamentos...</p>';

        try {
            // Caminho corrigido para dentro da raiz do servidor (FRONTEND)
            const response = await fetch('./public/data/QUIZ_FLOW.json');
            this.flow = await response.json();
            this.renderQuestion();
        } catch (error) {
            console.error("[❌] Erro ao carregar flow do quiz:", error);
            container.innerHTML = '<p class="text-center py-12 text-red-500">Erro ao carregar o Quiz. Tente novamente.</p>';
        }
    },

    renderQuestion() {
        const container = document.getElementById('quiz-container');
        if (!this.flow || this.currentStep >= this.flow.questions.length) {
            this.renderLeadCapture();
            return;
        }

        const question = this.flow.questions[this.currentStep];
        container.innerHTML = `
            <div class="animate-fade-in">
                <p class="text-white/50 uppercase tracking-widest text-12 mb-2">Pergunta ${question.id} de ${this.flow.questions.length}</p>
                <h2 class="text-24 font-black uppercase mb-8">${question.text}</h2>
                <div class="grid gap-4">
                    ${question.options.map((opt, index) => `
                        <button onclick="QuizEngine.handleAnswer('${opt.value}')" 
                                class="bg-white/5 border border-white/10 hover:border-premium-gold p-6 rounded-2xl text-left transition-all hover:bg-white/10 group">
                            <div class="flex items-center justify-between">
                                <span class="font-bold">${opt.text}</span>
                                <span class="material-symbols-outlined text-premium-gold opacity-0 group-hover:opacity-100">arrow_forward</span>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    handleAnswer(value) {
        this.answers.push(value);
        this.currentStep++;
        this.renderQuestion();
    },

    renderLeadCapture() {
        const container = document.getElementById('quiz-container');
        container.innerHTML = `
            <div class="animate-fade-in text-center max-w-sm mx-auto">
                <span class="material-symbols-outlined text-premium-gold text-48 mb-4">mail</span>
                <h2 class="text-24 font-black uppercase mb-4 text-slate-900 dark:text-white">Seu Plano está Pronto!</h2>
                <p class="text-slate-600 dark:text-white/50 mb-8">Receba seu roteiro de intimidade agora.</p>
                
                <form onsubmit="QuizEngine.handleLeadSubmit(event)" class="grid gap-4">
                    <input type="text" id="lead-name" placeholder="Seu Nome Completo" required 
                           class="bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 p-5 rounded-xl focus:border-premium-gold outline-none text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-white/30">
                    <input type="email" id="lead-email" placeholder="Seu Melhor E-mail" required 
                           class="bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 p-5 rounded-xl focus:border-premium-gold outline-none text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-white/30">
                    
                    <button type="submit" class="btn-premium shimmer-gold py-5 rounded-xl font-black uppercase tracking-widest text-navy-deep shadow-xl">
                        Ver Meu Resultado
                    </button>
                </form>
            </div>
        `;
    },

    async handleLeadSubmit(event) {
        event.preventDefault();
        const name = document.getElementById('lead-name').value;
        const email = document.getElementById('lead-email').value;

        // Bloquear botão
        const btn = event.target.querySelector('button');
        btn.disabled = true;
        btn.innerText = 'Processando...';

        // Salvar localmente
        localStorage.setItem('amem_ia_lead', JSON.stringify({ name, email }));

        // Capturar Nível para o Lead
        const counts = {};
        this.answers.forEach(val => counts[val] = (counts[val] || 0) + 1);
        let resultKey = 'ungidos'; // [MÉTODO NOGUEIRA] Sementinha -> Ungidos
        if (counts['arvore'] >= 2) resultKey = 'arvore';
        else if (counts['broto'] >= 2 || (counts['arvore'] && counts['broto'])) resultKey = 'broto';

        this.showResult(resultKey);
    },

    async showResult(resultKey) {
        if (!this.flow || !this.flow.results[resultKey]) {
            console.error("[❌] Resultado não encontrado:", resultKey);
            return;
        }
        const result = this.flow.results[resultKey];
        const container = document.getElementById('quiz-container');

        // Segmentação Estratégica Ungidos
        const utmParams = `?utm_source=quiz&utm_medium=funnel&utm_campaign=ungidos&utm_content=${resultKey}`;
        const checkoutUrl = `https://checkout.ticto.app/O06B610DB${utmParams}`;

        container.innerHTML = `
            <div class="animate-fade-in text-center py-8">
                <div class="mb-6 flex justify-center">
                    <div class="p-5 rounded-full bg-premium-gold/20 ring-8 ring-premium-gold/5">
                        <span class="material-symbols-outlined text-80 text-premium-gold symbol-filled">workspace_premium</span>
                    </div>
                </div>
                <h2 class="text-32 font-black uppercase mb-4 leading-none tracking-tighter text-slate-900 dark:text-white">${result.title}</h2>
                <div class="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-3xl mb-8">
                    <p class="text-18 text-slate-700 dark:text-white/80 leading-relaxed font-bold italic">"${result.description}"</p>
                </div>
                
                <a href="${checkoutUrl}" 
                   class="btn-premium shimmer-gold w-full h-24 rounded-[32px] text-24 font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl transition-transform active:scale-[0.95]">
                    <span class="material-symbols-outlined text-32">bolt</span>
                    ${result.cta}
                </a>
                <p class="mt-8 text-12 text-slate-400 dark:text-white/30 uppercase tracking-[0.4em] font-black">Liderança Espiritual Elite</p>
            </div>
        `;

        // Salvar perfil no cache para uso posterior no app
        localStorage.setItem('amem_ia_profile', resultKey);
    }
};

// Export para o Window (Garantia CEO)
window.QuizEngine = QuizEngine;
export { QuizEngine };
