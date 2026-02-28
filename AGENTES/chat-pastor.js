let bibleData = null;
let bibleIndex = new Map(); // O(1) Search Index
let chatMain = null;

/**
 * Indexes Bible data for instant lookup
 */
function indexBible(data) {
    console.time("BibleIndexing");
    data.forEach(book => {
        bibleIndex.set(book.abbrev.toLowerCase(), book);
    });
    console.timeEnd("BibleIndexing");
}

// Fetch Bible Database (Full NVI) with Self-Healing Retry
if (window.AmemHealing) {
    AmemHealing.fetchWithRetry('/data/bible-nvi.json')
        .then(response => response.text())
        .then(text => {
            try {
                const cleanText = text.trim().replace(/^\uFEFF/, '');
                bibleData = JSON.parse(cleanText);
                indexBible(bibleData);
                console.log("Base NVI carregada e indexada com sucesso.");
            } catch (e) {
                AmemLogger.error(AmemLogger.Categories.API, "Erro ao processar JSON da Bíblia", e);
            }
        })
        .catch(err => {
            AmemLogger.error(AmemLogger.Categories.API, 'Falha fatal ao carregar base bíblica após retentativas', err);
        });
} else {
    fetch('/data/bible-nvi.json')
        .then(response => response.text())
        .then(text => {
            try {
                const cleanText = text.trim().replace(/^\uFEFF/, '');
                bibleData = JSON.parse(cleanText);
            } catch (e) { console.error(e); }
        });
}

const THEME_MAP = {
    financas: {
        keywords: ['dinheiro', 'finanças', 'dívida', 'trabalho', 'provisão', 'sustento', 'dízimo', 'pobreza', 'necessidade', 'pagar', 'contas'],
        verses: [
            { b: 'fp', c: 4, v: 19 },
            { b: 'ml', c: 3, v: 10 },
            { b: 'hb', c: 13, v: 5 },
            { b: 'mt', c: 6, v: 33 }
        ]
    },
    familia: {
        keywords: ['família', 'filhos', 'esposa', 'marido', 'pai', 'mãe', 'casamento', 'casa', 'lar', 'parentes', 'irmão'],
        verses: [
            { b: 'js', c: 24, v: 15 },
            { b: 'ef', c: 5, v: 25 },
            { b: 'ex', c: 20, v: 12 },
            { b: 'pv', c: 22, v: 6 }
        ]
    },
    ansiedade: {
        keywords: ['ansiedade', 'ansioso', 'medo', 'preocupação', 'paz', 'descanso', 'angústia', 'aflição', 'nervoso', 'pânico', 'preocupado'],
        verses: [
            { b: '1pe', c: 5, v: 7 },
            { b: 'fp', c: 4, v: 6 },
            { b: 'mt', c: 6, v: 34 },
            { b: 'sl', c: 46, v: 1 }
        ]
    },
    esperanca: {
        keywords: ['esperança', 'futuro', 'promessa', 'fé', 'ânimo', 'força', 'renovação', 'desânimo', 'tristeza', 'amanhã', 'esperar'],
        verses: [
            { b: 'jr', c: 29, v: 11 },
            { b: 'rm', c: 15, v: 13 },
            { b: 'is', c: 40, v: 31 },
            { b: 'lm', c: 3, v: 22 }
        ]
    },
    perdao: {
        keywords: ['perdão', 'perdoar', 'culpa', 'pecado', 'remorso', 'arrependimento', 'erro', 'falha'],
        verses: [
            { b: '1jo', c: 1, v: 9 },
            { b: 'cl', c: 3, v: 13 },
            { b: 'sl', c: 103, v: 12 },
            { b: 'ef', c: 4, v: 32 }
        ]
    },
    cura: {
        keywords: ['cura', 'curar', 'doença', 'saúde', 'enfermidade', 'sarar', 'hospital', 'médico', 'dor', 'doente'],
        verses: [
            { b: 'is', c: 53, v: 5 },
            { b: 'tg', c: 5, v: 15 },
            { b: 'sl', c: 103, v: 3 },
            { b: 'ex', c: 15, v: 26 }
        ]
    },
    amor: {
        keywords: ['amor', 'amado', 'amar', 'relacionamento', 'amizade', 'carinho', 'afeto'],
        verses: [
            { b: '1co', c: 13, v: 4 },
            { b: 'jo', c: 3, v: 16 },
            { b: '1jo', c: 4, v: 8 },
            { b: 'rm', c: 5, v: 8 }
        ]
    },
    sabedoria: {
        keywords: ['sabedoria', 'decisão', 'dúvida', 'caminho', 'direção', 'entendimento', 'conselho', 'escolha', 'inteligência'],
        verses: [
            { b: 'tg', c: 1, v: 5 },
            { b: 'pv', c: 2, v: 6 },
            { b: 'sl', c: 119, v: 105 },
            { b: 'pv', c: 3, v: 5 }
        ]
    },
    forca: {
        keywords: ['força', 'coragem', 'cansaço', 'desistir', 'vencer', 'fraco', 'debilitado', 'poder', 'vitória'],
        verses: [
            { b: 'fp', c: 4, v: 13 },
            { b: 'is', c: 41, v: 10 },
            { b: 'ne', c: 8, v: 10 },
            { b: 'sl', c: 28, v: 7 }
        ]
    },
    protecao: {
        keywords: ['proteção', 'livramento', 'perigo', 'segurança', 'inimigo', 'socorro', 'guardar', 'refúgio', 'amparo'],
        verses: [
            { b: 'sl', c: 91, v: 1 },
            { b: 'sl', c: 121, v: 7 },
            { b: '2ts', c: 3, v: 3 },
            { b: 'pv', c: 18, v: 10 }
        ]
    }
};

const ACOLHIMENTO_MESSAGES = [
    "A Paz do Senhor, meu amado irmão. Sinto muito que esteja passando por essa prova. Saiba que o Senhor é o nosso refúgio e fortaleza.",
    "Graça e Paz, amada semente do Reino. Entendo sua luta. Não desfaleça, pois o Espírito Santo é o nosso Consolador.",
    "Deus te abençoe grandemente. Em momentos de aflição, as promessas do Senhor são o nosso sustento firme.",
    "Amado, louvo a Deus por sua confiança em compartilhar isso. Vamos buscar na Palavra a resposta que o seu coração necessita."
];

function getVerseFromNVI(bAbbrev, chapterNum, verseNum) {
    if (!bibleIndex.size && bibleData) indexBible(bibleData);
    
    const book = bibleIndex.get(bAbbrev.toLowerCase());
    if (!book) return null;
    
    const chapter = book.chapters[chapterNum - 1];
    if (!chapter) return null;
    
    const verse = chapter[verseNum - 1];
    if (!verse) return null;
    
    return {
        text: verse,
        reference: `${book.name || book.abbrev.toUpperCase()} ${chapterNum}:${verseNum}`
    };
}

// Sistema de Memória Espiritual e Voz
const SPIRITUAL_MEMORY_KEY = 'amem_ia_spiritual_memory';

function getSpiritualMemory() {
    return JSON.parse(localStorage.getItem(SPIRITUAL_MEMORY_KEY) || JSON.stringify({
        xp: 0,
        nivel: 1,
        streak: 1,
        sentimentos: [],
        preocupacoes: [],
        pedidos_oracao: [],
        ultima_interacao: null,
        missoes_concluidas: []
    }));
}

const NIVEIS_NOMES = [
    "Iniciante", "Discípulo", "Servo", "Guerreiro de Oração", 
    "Líder Espiritual", "Homem/Mulher de Fé", "Referência Espiritual"
];

function calculateLevel(xp) {
    // Ex: Nível 1: 0-100 XP, Nível 2: 101-300 XP, etc.
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 700) return 3;
    if (xp < 1500) return 4;
    if (xp < 3000) return 5;
    if (xp < 6000) return 6;
    return 7;
}

function addXP(amount) {
    const memory = getSpiritualMemory();
    memory.xp = (memory.xp || 0) + amount;
    const novoNivel = calculateLevel(memory.xp);
    if (novoNivel > memory.nivel) {
        // Notificação Premium (Simulação de sistema de Toast/Modal)
        console.log(`%c GLÓRIA A DEUS! %c Subiu para o Nível ${novoNivel}: ${NIVEIS_NOMES[novoNivel - 1]}`, "color: #D4AF37; font-weight: bold; font-size: 16px", "color: #3B82F6");
        // Futura implementação: showPremiumLevelUpModal(novoNivel);
        memory.nivel = novoNivel;
    }
    updateSpiritualMemory(memory);
}

function updateSpiritualMemory(updates) {
    const memory = getSpiritualMemory();
    const updated = { ...memory, ...updates };
    localStorage.setItem(SPIRITUAL_MEMORY_KEY, JSON.stringify(updated));
    return updated;
}

function falarMensagem(texto) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'pt-BR';
    msg.rate = 0.88;
    const voices = window.speechSynthesis.getVoices();
    
    // Prioridade para vozes neurais/naturais de alta qualidade
    const bestVoices = [
        v => v.name.includes('Neural') && v.lang.startsWith('pt-BR'),
        v => v.name.includes('Natural') && v.lang.startsWith('pt-BR'),
        v => v.name.includes('Google') && v.lang.startsWith('pt-BR'),
        v => v.lang.startsWith('pt-BR') && v.name.toLowerCase().includes('male'),
        v => v.lang.startsWith('pt-BR')
    ];

    let maleVoice = null;
    for (const filter of bestVoices) {
        maleVoice = voices.find(filter);
        if (maleVoice) break;
    }

    if (maleVoice) msg.voice = maleVoice;

    // Configurações para voz mais "Humana e Calma"
    msg.pitch = 0.92; // Levemente mais grave/acolhedor
    msg.rate = 0.88;  // Um pouco mais lento e pausado

    msg.onstart = () => {
        console.log("Pastor falando (Voz: " + (maleVoice ? maleVoice.name : "Padrão") + ")...");
        document.body.classList.add('pastor-speaking');
    };
    msg.onend = () => {
        document.body.classList.remove('pastor-speaking');
    };

    msg.onerror = (e) => {
        AmemLogger.error(AmemLogger.Categories.AUDIO, 'Falha na Síntese de Voz', e);
    };

    // Pequeno atraso para estabilidade
    setTimeout(() => {
        window.speechSynthesis.speak(msg);
    }, 100);
    AmemLogger.info(AmemLogger.Categories.AUDIO, 'Reproduzindo mensagem de áudio');
}

function appendMessage(text, isUser = false, shouldSave = true) {
    if (!chatMain) return;

    if (isUser) {
        const user = JSON.parse(localStorage.getItem('amem_ia_user') || '{}');
        const today = new Date().toDateString();
        const usage = JSON.parse(localStorage.getItem('amem_ia_usage') || '{}');

        // Atualizar Streak Espiritual
        const memory = getSpiritualMemory();
        if (memory.ultima_interacao !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (memory.ultima_interacao === yesterday.toDateString()) {
                memory.streak++;
            } else {
                memory.streak = 1;
            }
            memory.ultima_interacao = today;
            updateSpiritualMemory(memory);
        }

        // Ganhar XP por Mensagem
        addXP(10);

        if (!user.isPremium) {
            if (usage.date !== today) { usage.date = today; usage.count = 0; }
            if (usage.count >= 3) {
                appendMessage("Paz do Senhor! Você atingiu o limite de 3 mensagens diárias. Deseja conhecer o Plano Standard?", false);
                setTimeout(() => window.location.href = '/stitch/am_m_ia_planos_de_assinatura/code.html', 2000);
                return false;
            }
            usage.count++;
            localStorage.setItem('amem_ia_usage', JSON.stringify(usage));
        }
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = isUser
        ? "flex flex-col items-end max-w-[85%] ml-auto space-y-2 mb-4"
        : "flex flex-col items-start max-w-[85%] space-y-2 mb-4";

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isUser) {
        msgDiv.innerHTML = `
            <div class="bg-premium-gold/10 dark:bg-premium-gold/20 px-5 py-4 rounded-[1.4rem] rounded-br-sm shadow-sm border border-premium-gold/10">
                <p class="text-[15px] leading-relaxed text-slate-800 dark:text-slate-100">${text}</p>
            </div>
            <div class="flex items-center gap-1 mr-2">
                <span class="text-[10px] text-slate-400 font-medium">${time}</span>
                <span class="material-symbols-outlined text-[14px] text-premium-gold font-bold">done_all</span>
            </div>
        `;
    } else {
        msgDiv.innerHTML = `
            <div class="bg-amber-50 dark:bg-white/5 px-5 py-4 rounded-[1.4rem] rounded-tl-sm shadow-sm border border-amber-100/50 dark:border-white/10 group">
                <p class="text-[15px] leading-relaxed text-slate-800 dark:text-slate-200">${text.replace(/\n/g, '<br>')}</p>
                <div class="flex items-center gap-2 mt-3 pt-2 border-t border-amber-200/50 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                    <button onclick="falarMensagem('${text.replace(/'/g, "\\'")}'); addXP(15);" class="flex items-center gap-1 text-[9px] font-black text-premium-gold uppercase tracking-widest">
                        <span class="material-symbols-outlined text-[14px]">volume_up</span> Ouvir Pastor (+15 XP)
                    </button>
                </div>
            </div>
            <span class="text-[10px] text-slate-400 ml-2 font-medium">${time}</span>
        `;
    }

    chatMain.appendChild(msgDiv);
    chatMain.scrollTop = chatMain.scrollHeight;

    if (shouldSave) {
        const history = JSON.parse(localStorage.getItem('amem_ia_chat_history')) || [];
        history.push({ text, isUser, time });
        localStorage.setItem('amem_ia_chat_history', JSON.stringify(history));
    }
    return true;
}

const PASTOR_RESPONSES = {
    "bom dia": [
        "Bom dia! É uma alegria imensa falar com você. Como você está se sentindo nesta manhã abençoada? Posso orar com você por algo específico?",
        "Bom dia, amado(a). Que a paz do Senhor esteja em seu coração hoje. Como posso te auxiliar em sua jornada hoje?",
        "Bom dia! Que alegria ver sua disposição em buscar a palavra. Como amanheceu seu espírito hoje?"
    ],
    "boa tarde": [
        "Boa tarde! Que bom que você parou um momento para conversarmos. Como tem sido o seu dia?",
        "Boa tarde. Que a luz de Cristo continue guiando seus passos nesta tarde. Em que posso te ajudar?",
        "Boa tarde, meu irmão/irmã. Deseja compartilhar algo que aconteceu hoje?"
    ],
    "boa noite": [
        "Boa noite. É um momento precioso para entregarmos nossas preocupações a Deus. Como você está?",
        "Boa noite! Que a paz que excede todo o entendimento guarde seu sono. Gostaria de fazer uma oração antes de descansar?",
        "Boa noite. Terminou bem o seu dia? Estou aqui para te ouvir."
    ],
    "default": [
        "Compreendo perfeitamente o que você está sentindo. Deus conhece o seu coração e está ao seu lado.",
        "Essa é uma questão profunda e muito importante. O que a Bíblia nos diz é que nunca estamos sozinhos.",
        "Sinta-se abraçado pela graça divina. Como posso aprofundar nossa conversa sobre isso?"
    ]
};

const ACOLHIMENTO_PROFISSIONAL = [
    "Paz do Senhor, amado. Sinto que Deus quer falar ao seu coração hoje. Como você se sente?",
    "Graça e Paz! É uma alegria caminhar com você. Saiba que você não está sozinho nessa jornada.",
    "Deus te abençoe. Estou aqui para ouvir e orar com você. O que pesa em seu coração agora?"
];


function showOnboarding() {
    if (document.querySelector('.onboarding-options')) return;
    
    const onboardingDiv = document.createElement('div');
    onboardingDiv.className = "onboarding-options flex flex-col gap-3 my-6 animate-in fade-in slide-in-from-bottom-4 duration-500";
    onboardingDiv.innerHTML = `
        <p class="text-[11px] font-black text-premium-gold uppercase tracking-[0.2em] text-center mb-2">Paz do Senhor! Como você está hoje?</p>
        <div class="grid grid-cols-2 gap-2">
            <button onclick="handleAction('Estou Ansioso')" class="py-3 px-4 bg-white dark:bg-white/5 border border-premium-gold/20 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase hover:bg-premium-gold/5 transition-all">🙏 Ansioso</button>
            <button onclick="handleAction('Estou Triste')" class="py-3 px-4 bg-white dark:bg-white/5 border border-premium-gold/20 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase hover:bg-premium-gold/5 transition-all">😔 Triste</button>
            <button onclick="handleAction('Preciso de Oração')" class="py-3 px-4 bg-white dark:bg-white/5 border border-premium-gold/20 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase hover:bg-premium-gold/5 transition-all">✨ Oração</button>
            <button onclick="handleAction('Quero uma Direção')" class="py-3 px-4 bg-white dark:bg-white/5 border border-premium-gold/20 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase hover:bg-premium-gold/5 transition-all">📖 Direção</button>
        </div>
    `;
    chatMain.appendChild(onboardingDiv);
    chatMain.scrollTop = chatMain.scrollHeight;
}

window.handleAction = (texto) => {
    try {
        const onboarding = document.querySelector('.onboarding-options');
        if (onboarding) onboarding.remove();
        
        const success = appendMessage(texto, true);
        if (success) {
            setTimeout(() => {
                const response = getPastorResponse(texto);
                appendMessage(response, false);
                falarMensagem(response);
            }, 800);
        }
    } catch (err) {
        console.error("Erro no handleAction:", err);
    }
}

function initChat() {
    chatMain = document.querySelector('main');
    const inputField = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    if (!chatMain || !inputField || !sendBtn) return;

    window.getPastorResponse = (text) => {
        const lowerText = text.toLowerCase().trim();
        let options = PASTOR_RESPONSES["default"];
        
        for (const key in PASTOR_RESPONSES) {
            if (lowerText.includes(key)) {
                options = PASTOR_RESPONSES[key];
                break;
            }
        }
        
        const response = options[Math.floor(Math.random() * options.length)];
        
        // Memória e Bíblia (Mantendo lógica original integrada)
        const matchedTheme = Object.entries(THEME_MAP).find(([_, theme]) => theme.keywords.some(kw => lowerText.includes(kw)));
        if (matchedTheme && bibleData) {
            const theme = matchedTheme[1];
            const vRef = theme.verses[Math.floor(Math.random() * theme.verses.length)];
            const verse = getVerseFromNVI(vRef.b, vRef.c, vRef.v);
            if (verse) return `${response}\n\nA Bíblia nos diz em **${verse.reference}**:\n_"${verse.text}"_`;
        }

        return response;
    };


    const sendMessage = (customText) => {
        try {
            const text = customText || inputField.value.trim();
            if (!text) return;
            
            if (appendMessage(text, true)) {
                if (!customText) inputField.value = '';
                setTimeout(() => {
                    const response = getPastorResponse(text);
                    appendMessage(response, false);
                }, 800);
            }
        } catch (err) {
            console.error("Erro ao enviar mensagem:", err);
        }
    };

    // Expor para o escopo global para que os botões onclick funcionem
    window.sendMessage = sendMessage;

    sendBtn.onclick = (e) => { 
        if (e) e.preventDefault(); 
        sendMessage(); 
    };
    
    inputField.onkeydown = (e) => { 
        if (e.key === 'Enter') { 
            e.preventDefault(); 
            sendMessage(); 
        } 
    };

    const historyEnc = localStorage.getItem('amem_ia_chat_history');
    const history = historyEnc ? JSON.parse(historyEnc) : [];
    
    if (history.length > 0) {
        chatMain.innerHTML = '';
        const sep = document.createElement('div');
        sep.className = "flex justify-center mb-6";
        sep.innerHTML = `<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Caminhada Contínua</span>`;
        chatMain.appendChild(sep);
        history.forEach(msg => appendMessage(msg.text, msg.isUser, false));
    } else {
        const welcome = "Olá! Que alegria ter você aqui no Amém IA. Eu sou o seu Pastor pessoal e estou aqui para caminhar ao seu lado 24 horas por dia. Como está o seu coração hoje?";
        appendMessage(welcome, false);
        falarMensagem(welcome);
        setTimeout(showOnboarding, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initChat();
    // Garante que vozes sejam carregadas no Chrome antes de falar
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            const history = JSON.parse(localStorage.getItem('amem_ia_chat_history')) || [];
            if (history.length === 0) {
                const welcome = "Olá! Que alegria ter você aqui no Amém IA. Eu sou o seu Pastor pessoal e estou aqui para caminhar ao seu lado 24 horas por dia. Como está o seu coração hoje?";
                falarMensagem(welcome);
            }
        };
    }
});

