/**
 * AMÉM IA - QUIZ ENGINE (Protocolo Sumaúma)
 * Responsibility: Handle user choices and determine spiritual maturity level.
 */

import { AuthService } from './auth_service.js'

const QuizEngine = {
    currentStep: 0,
    answers: [],
    flow: null,

    async init() {
        console.log("[🧠] BRIAN: Inicializando motor de Quiz...");
        const container = document.getElementById('quiz-container');
        container.innerHTML = '<p class="text-center py-12 animate-pulse">Carregando DNA espiritual...</p>';

        try {
            const response = await fetch('/MARKETING/QUIZ_FLOW.json');
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
            this.showResult();
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

    async showResult() {
        // Lógica simples: o valor que mais aparece define o nível
        const counts = {};
        this.answers.forEach(val => counts[val] = (counts[val] || 0) + 1);
        
        let resultKey = 'sementinha';
        if (counts['arvore'] >= 2) resultKey = 'arvore';
        else if (counts['broto'] >= 2 || (counts['arvore'] && counts['broto'])) resultKey = 'broto';

        const result = this.flow.results[resultKey];
        const container = document.getElementById('quiz-container');

        // PERSISTÊNCIA REAL NO SUPABASE
        try {
            await AuthService.updateSpiritualLevel(resultKey);
            console.log(`[✅] Nível ${resultKey} persistido no Supabase.`);
        } catch (e) {
            console.warn("[⚠️] Falha ao salvar no banco (usuário pode não estar logado):", e.message);
        }

        container.innerHTML = `
            <div class="animate-fade-in text-center py-8">
                <span class="material-symbols-outlined text-80 text-premium-gold mb-6">workspace_premium</span>
                <h2 class="text-32 font-black uppercase mb-4">${result.title}</h2>
                <p class="text-18 text-white/70 mb-12">${result.description}</p>
                
                <a href="https://checkout.ticto.app/O06B610DB" 
                   class="btn-premium shimmer-gold w-full h-20 rounded-2xl text-20 font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl">
                    <span class="material-symbols-outlined">bolt</span>
                    ${result.cta}
                </a>
                <p class="mt-8 text-12 text-white/30 uppercase tracking-[0.2em]">Liberação imediata no plano Elite</p>
            </div>
        `;

        // Salvar perfil no cache para uso posterior no app
        localStorage.setItem('amem_ia_profile', resultKey);
    }
};

window.QuizEngine = QuizEngine;
