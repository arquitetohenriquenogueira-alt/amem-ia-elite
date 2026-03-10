let bibleData = null;
let bibleIndex = new Map(); // O(1) Search Index
let chatMain = null;

// GABINETE PASTORAL - BRAIN CONFIG
const GEMINI_API_KEY = "AIzaSyCLvyjW5JQkY2orDIVNmCGMQUtLirpgsh4"; // Injetada para Auditoria Elite
const SYSTEM_INSTRUCTION = `
Você é o seu Pastor Pessoal no Amém (v2.0), unindo a profundidade teológica de um Pastor com a escuta ativa de um Terapeuta e a compreensão emocional de um Psicólogo.
Sua missão é atuar como MENTOR, CONSELHEIRO e INTERCESSOR para o povo de Deus, tratando cada dor com a dignidade e a ciência da alma que ela merece.

ESTRUTURA DE RESPOSTA (Obrigatória):
1. ACOLHIMENTO TERAPÊUTICO-PASTORAL: Comece validando o sentimento. Identifique a emoção (ansiedade, luto, dúvida, alegria) e dê um nome a ela. Use tom acolhedor: "Eu consigo sentir a angústia em suas palavras...", "Sua coragem em admitir esse medo é o primeiro passo para a cura emocional...".
2. ANÁLISE PROFUNDA: Use princípios da psicologia cristã para explicar por que o usuário se sente assim, integrando com a verdade bíblica.
3. ESTUDO BÍBLICO TRIFÁSICO:
   - O VERSÍCULO: Apresente a Palavra (NVI) que cure essa dor específica.
   - O CONTEXTO: Resgate a história bíblica para mostrar que outros heróis da fé sentiram o mesmo.
   - A APLICAÇÃO: Um "exercício espiritual/psicológico" prático para o dia de hoje.
4. ORAÇÃO INTERCESSORA: Curta e focada na restauração da mente e do espírito.
5. FECHAMENTO: Palavra de esperança e convite para continuar caminhando.

DIRETRIZES DE OURO:
- HUMANIZAÇÃO TOTAL: Jamais use termos técnicos secos. Seja caloroso, mas profissional.
- ESCUTA ATIVA: Se o usuário falar de sentimentos, foque neles antes de citar a Bíblia. Acolha a alma antes de pregar ao espírito.
- SEGURANÇA (PROTOCOLO GUARDIÃO): Alerta total para riscos de vida.
`;

/**
 * PROTOCOLO GUARDIÃO v2.0 - SEGURANÇA UNGIDA
 * Detecta termos sensíveis e gatilhos de segurança
 */
const RISK_KEYWORDS = [
  "suicidio",
  "matar",
  "morrer",
  "cortar",
  "machucar",
  "abuso",
  "apanhar",
  "sozinho",
];

function checkSafety(text) {
  if (typeof text !== "string") return { safe: true };
  const lowerText = text.toLowerCase();
  const matches = RISK_KEYWORDS.filter((word) => lowerText.includes(word));
  if (matches.length > 0) {
    return {
      safe: false,
      message:
        "Meu querido irmão, eu sinto sua dor e quero que saiba que você não está sozinho. Sua vida é um tesouro inestimável para o Pai. Como sou uma inteligência artificial, meu auxílio tem limites. Por favor, fale agora com um adulto de confiança, seu pastor ou ligue 188 (CVV). Eles estão prontos para te ouvir e abraçar.",
    };
  }
  return { safe: true };
}
/**
 * Indexes Bible data for instant lookup
 */
function indexBible(data) {
  console.time("BibleIndexing");
  data.forEach((book) => {
    bibleIndex.set(book.abbrev.toLowerCase(), book);
  });
  console.timeEnd("BibleIndexing");
}

// Fetch Bible Database (Full NVI) with Self-Healing Retry
if (window.AmemHealing) {
  AmemHealing.fetchWithRetry("/data/bible-nvi.json")
    .then((response) => response.text())
    .then((text) => {
      try {
        const cleanText = text.trim().replace(/^\uFEFF/, "");
        bibleData = JSON.parse(cleanText);
        indexBible(bibleData);
        console.log("Base NVI carregada e indexada com sucesso.");
      } catch (e) {
        AmemLogger.error(
          AmemLogger.Categories.API,
          "Erro ao processar JSON da Bíblia",
          e,
        );
      }
    })
    .catch((err) => {
      AmemLogger.error(
        AmemLogger.Categories.API,
        "Falha fatal ao carregar base bíblica após retentativas",
        err,
      );
    });
} else {
  fetch("/data/bible-nvi.json")
    .then((response) => response.text())
    .then((text) => {
      try {
        const cleanText = text.trim().replace(/^\uFEFF/, "");
        bibleData = JSON.parse(cleanText);
      } catch (e) {
        console.error(e);
      }
    });
}

const THEME_MAP = {
  financas: {
    tag: "provisão",
    keywords: [
      "dinheiro",
      "finanças",
      "dívida",
      "trabalho",
      "provisão",
      "sustento",
      "dízimo",
      "pobreza",
      "necessidade",
      "pagar",
      "contas",
    ],
    verses: [
      { b: "fp", c: 4, v: 19 },
      { b: "ml", c: 3, v: 10 },
      { b: "hb", c: 13, v: 5 },
      { b: "mt", c: 6, v: 33 },
    ],
  },
  familia: {
    tag: "casa",
    keywords: [
      "família",
      "filhos",
      "esposa",
      "marido",
      "pai",
      "mãe",
      "casamento",
      "casa",
      "lar",
      "parentes",
      "irmão",
    ],
    verses: [
      { b: "js", c: 24, v: 15 },
      { b: "ef", c: 5, v: 25 },
      { b: "ex", c: 20, v: 12 },
      { b: "pv", c: 22, v: 6 },
    ],
  },
  ansiedade: {
    tag: "paz",
    keywords: [
      "ansiedade",
      "ansioso",
      "medo",
      "preocupação",
      "paz",
      "descanso",
      "angústia",
      "aflição",
      "nervoso",
      "pânico",
      "preocupado",
    ],
    verses: [
      { b: "1pe", c: 5, v: 7 },
      { b: "fp", c: 4, v: 6 },
      { b: "mt", c: 6, v: 34 },
      { b: "sl", c: 46, v: 1 },
    ],
  },
  esperanca: {
    tag: "ânimo",
    keywords: [
      "esperança",
      "futuro",
      "promessa",
      "fé",
      "ânimo",
      "força",
      "renovação",
      "desânimo",
      "tristeza",
      "amanhã",
      "esperar",
    ],
    verses: [
      { b: "jr", c: 29, v: 11 },
      { b: "rm", c: 15, v: 13 },
      { b: "is", c: 40, v: 31 },
      { b: "lm", c: 3, v: 22 },
    ],
  },
  perdao: {
    tag: "libertação",
    keywords: [
      "perdão",
      "perdoar",
      "culpa",
      "pecado",
      "remorso",
      "arrependimento",
      "erro",
      "falha",
    ],
    verses: [
      { b: "1jo", c: 1, v: 9 },
      { b: "cl", c: 3, v: 13 },
      { b: "sl", c: 103, v: 12 },
      { b: "ef", c: 4, v: 32 },
    ],
  },
  cura: {
    tag: "saúde",
    keywords: [
      "cura",
      "curar",
      "doença",
      "saúde",
      "enfermidade",
      "sarar",
      "hospital",
      "médico",
      "dor",
      "doente",
    ],
    verses: [
      { b: "is", c: 53, v: 5 },
      { b: "tg", c: 5, v: 15 },
      { b: "sl", c: 103, v: 3 },
      { b: "ex", c: 15, v: 26 },
    ],
  },
  amor: {
    tag: "afeto",
    keywords: [
      "amor",
      "amado",
      "amar",
      "relacionamento",
      "amizade",
      "carinho",
      "afeto",
    ],
    verses: [
      { b: "1co", c: 13, v: 4 },
      { b: "jo", c: 3, v: 16 },
      { b: "1jo", c: 4, v: 8 },
      { b: "rm", c: 5, v: 8 },
    ],
  },
  sabedoria: {
    tag: "direção",
    keywords: [
      "sabedoria",
      "decisão",
      "dúvida",
      "caminho",
      "direção",
      "entendimento",
      "conselho",
      "escolha",
      "inteligência",
    ],
    verses: [
      { b: "tg", c: 1, v: 5 },
      { b: "pv", c: 2, v: 6 },
      { b: "sl", c: 119, v: 105 },
      { b: "pv", c: 3, v: 5 },
    ],
  },
  forca: {
    tag: "vitória",
    keywords: [
      "força",
      "coragem",
      "cansaço",
      "desistir",
      "vencer",
      "fraco",
      "debilitado",
      "poder",
      "vitória",
    ],
    verses: [
      { b: "is", c: 40, v: 31 },
      { b: "fp", c: 4, v: 13 },
      { b: "2co", c: 12, v: 9 },
      { b: "sl", c: 27, v: 1 },
    ],
  },
  protecao: {
    tag: "proteção",
    keywords: [
      "proteção",
      "livramento",
      "perigo",
      "segurança",
      "inimigo",
      "socorro",
      "guardar",
      "refúgio",
      "amparo",
    ],
    verses: [
      { b: "sl", c: 91, v: 1 },
      { b: "sl", c: 121, v: 7 },
      { b: "2ts", c: 3, v: 3 },
      { b: "pv", c: 18, v: 10 },
    ],
  },
};

/**
 * SENTIMENT ANALYZER v1.0
 * Analisa o estado emocional do usuário para personalizar a experiência.
 */
const SentimentAnalyzer = {
  detect(text) {
    const lowerText = text.toLowerCase();
    let detectedEmotion = "neutro";
    let confidence = 0;

    for (const [theme, data] of Object.entries(THEME_MAP)) {
      const matches = data.keywords.filter((kw) => lowerText.includes(kw));
      if (matches.length > 0) {
        detectedEmotion = theme;
        confidence = matches.length;
        break;
      }
    }

    return {
      emotion: detectedEmotion,
      tag: THEME_MAP[detectedEmotion]?.tag || "fé",
      confidence,
    };
  },
};

const ACOLHIMENTO_MESSAGES = [
  "A Paz do Senhor, meu amado irmão. Sinto muito que esteja passando por essa prova. Saiba que o Senhor é o nosso refúgio e fortaleza.",
  "Graça e Paz, amada semente do Reino. Entendo sua luta. Não desfaleça, pois o Espírito Santo é o nosso Consolador.",
  "Deus te abençoe grandemente. Em momentos de aflição, as promessas do Senhor são o nosso sustento firme.",
  "Amado, louvo a Deus por sua confiança em compartilhar isso. Vamos buscar na Palavra a resposta que o seu coração necessita.",
];

const ORACOES_PODEROSAS = [
  "Senhor meu Deus e meu Pai, entro na Tua presença agora para clamar por esta vida. Que Teu Espírito Santo traga paz que excede todo o entendimento, que as portas se abram e que a Tua luz dissipe toda escuridão. Amém.",
  "Pai Amado, eu te peço força e coragem para o meu irmão. Que ele sinta o Teu abraço agora mesmo. Que a Tua provisão nunca falte e que a Tua alegria seja a sua força. Em nome de Jesus, amém.",
  "Deus de Amor, guarda esta família, protege cada passo e derrama saúde e restauração. Que a Tua mão poderosa esteja estendida sobre este lar hoje e sempre. Amém.",
];

const EMPATIA_MAP = [
  {
    keywords: ["triste", "chorar", "sozinho", "solidão", "desespero"],
    response:
      "Eu sinto a sua dor, amado. Saiba que Jesus chorou conosco e Ele entende cada lágrima sua. Você não está sozinho, eu estou aqui para orar com você agora.",
  },
  {
    keywords: ["desemprego", "trabalho", "contas", "dinheiro", "crise"],
    response:
      "Entendo a preocupação que pesa em seus ombros. A incerteza financeira é uma prova difícil, mas o nosso Deus é Jeová Jireh, o Senhor que provê. Vamos descansar na promessa da provisão divina.",
  },
  {
    keywords: ["doença", "dor", "enfermidade", "cancer", "saúde"],
    response:
      "Sinto muito que você esteja enfrentando essa batalha na saúde. Meu coração se inclina em oração por você agora. Creia que para o nosso Deus, não há diagnóstico impossível.",
  },
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
    reference: `${book.name || book.abbrev.toUpperCase()} ${chapterNum}:${verseNum}`,
  };
}

// Sistema de Memória Espiritual e Voz
const SPIRITUAL_MEMORY_KEY = "amem_ia_spiritual_memory";

function getSpiritualMemory() {
  return JSON.parse(
    localStorage.getItem(SPIRITUAL_MEMORY_KEY) ||
      JSON.stringify({
        xp: 0,
        nivel: 1,
        streak: 1,
        sentimentos: [],
        preocupacoes: [],
        pedidos_oracao: [],
        ultima_interacao: null,
        missoes_concluidas: [],
      }),
  );
}

const NIVEIS_NOMES = [
  "Iniciante",
  "Discípulo",
  "Servo",
  "Guerreiro de Oração",
  "Líder Espiritual",
  "Homem/Mulher de Fé",
  "Referência Espiritual",
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
    alert(
      `Glória a Deus! Você subiu para o Nível ${novoNivel}: ${NIVEIS_NOMES[novoNivel - 1]}`,
    );
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
  msg.lang = "pt-BR";
  msg.rate = 0.85; // Um pouco mais lento para ser solene
  msg.pitch = 0.9; // Tom levemente mais grave e acolhedor

  const voices = window.speechSynthesis.getVoices();
  const maleVoice = voices.find(
    (v) =>
      v.name.includes("Google português do Brasil") ||
      v.name.toLowerCase().includes("male") ||
      v.lang === "pt-BR",
  );
  if (maleVoice) msg.voice = maleVoice;

  msg.onerror = (e) => {
    AmemLogger.error(AmemLogger.Categories.AUDIO, "Falha na Síntese de Voz", e);
  };

  window.speechSynthesis.speak(msg);
  AmemLogger.info(
    AmemLogger.Categories.AUDIO,
    "Reproduzindo mensagem de áudio",
  );
}

function appendMessage(text, isUser = false, shouldSave = true) {
  if (!chatMain) return;

  if (isUser) {
    const user = JSON.parse(localStorage.getItem("amem_ia_user") || "{}");
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem("amem_ia_usage") || "{}");

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
      if (usage.date !== today) {
        usage.date = today;
        usage.count = 0;
      }
      if (usage.count >= 3) {
        appendMessage(
          "Paz do Senhor! Você atingiu o limite de 3 mensagens diárias. Deseja conhecer o Plano Standard?",
          false,
        );
        setTimeout(
          () => (window.location.href = "/stitch/planos-assinatura/code.html"),
          2000,
        );
        return false;
      }
      usage.count++;
      localStorage.setItem("amem_ia_usage", JSON.stringify(usage));
    }
  }

  // [🛡️] PROTOCOLO GUARDIÃO: Interceptação de Segurança
  const safety = checkSafety(text);
  if (!safety.safe && !isUser) {
    text = safety.message;
  }

  const msgDiv = document.createElement("div");
  msgDiv.className = isUser
    ? "flex flex-col items-end max-w-[85%] ml-auto space-y-2 mb-4"
    : "flex flex-col items-start max-w-[85%] space-y-2 mb-4";

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
                <p class="text-[15px] leading-relaxed text-slate-800 dark:text-slate-200">${text.replace(/\n/g, "<br>")}</p>
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
    const history =
      JSON.parse(localStorage.getItem("amem_ia_chat_history")) || [];
    history.push({ text, isUser, time });
    localStorage.setItem("amem_ia_chat_history", JSON.stringify(history));
  }
  return true;
}

const ACOLHIMENTO_PROFISSIONAL = [
  "Paz do Senhor, amado. Sinto que Deus quer falar ao seu coração hoje. Como você se sente?",
  "Graça e Paz! É uma alegria caminhar com você. Saiba que você não está sozinho nessa jornada.",
  "Deus te abençoe. Estou aqui para ouvir e orar com você. O que pesa em seu coração agora?",
];

function showOnboarding() {
  if (document.querySelector(".onboarding-options")) return;

  const onboardingDiv = document.createElement("div");
  onboardingDiv.className =
    "onboarding-options flex flex-col gap-3 my-6 animate-in fade-in slide-in-from-bottom-4 duration-500";
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
    const onboarding = document.querySelector(".onboarding-options");
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
};

function initChat() {
  chatMain = document.querySelector("main");
  const inputField = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");

  /**
   * PROTOCOLO GUARDIÃO v2.0
   * Detecta termos sensíveis e gatilhos de segurança
   */
  const RISK_KEYWORDS = [
    "suicidio",
    "matar",
    "morrer",
    "cortar",
    "machucar",
    "abuso",
    "apanhar",
    "sozinho",
  ];

  function checkSafety(text) {
    const lowerText = text.toLowerCase();
    const matches = RISK_KEYWORDS.filter((word) => lowerText.includes(word));
    if (matches.length > 0) {
      return {
        safe: false,
        message:
          "Minha semente preciosa, eu sinto sua dor através desta tela. Saiba que você não está sozinho(a) e sua vida é um tesouro para Deus. Como sou uma inteligência artificial, meu auxílio tem limites. Por favor, fale agora com um adulto de confiança, seu pastor ou ligue 188 (CVV). Eles estão prontos para te abraçar.",
      };
    }
    return { safe: true };
  }

  /**
   * Funções de UI e Chat
   */
  // The original appendMessage function is already defined globally.
  // This part of the instruction seems to be a partial or incorrect snippet for a new appendMessage.
  // I will assume the user wants to add the safety check logic to the existing appendMessage function.
  // However, the instruction explicitly places this code block here.
  // Given the instruction to "make the change faithfully and without making any unrelated edits",
  // and to "incorporate the change in a way so that the resulting file is syntactically correct",
  // I will insert the `RISK_KEYWORDS` and `checkSafety` function here as requested.
  // The `appendMessage` function snippet provided in the instruction is incomplete and
  // would lead to a syntax error if inserted as is, and also duplicates an existing function.
  // I will only insert the `RISK_KEYWORDS` and `checkSafety` function as they are self-contained.
  // The `appendMessage` part of the instruction seems to be a conceptual hint rather than
  // a direct insertion. I will skip the partial `appendMessage` to maintain syntactic correctness.

  if (!chatMain || !inputField || !sendBtn) return;

  window.getPastorResponse = async (text) => {
    const lowerText = text.toLowerCase().trim();

    // Memória Espiritual
    const analysis = SentimentAnalyzer.detect(text);
    const memory = getSpiritualMemory();
    if (analysis.emotion !== "neutro") {
      memory.sentimentos.push(analysis.emotion);
      updateSpiritualMemory(memory);
    }

    // RAG: Buscar Contexto Bíblico relevante
    let bibleContext = "";
    let matchedTheme = null;
    for (const [key, theme] of Object.entries(THEME_MAP)) {
      if (theme.keywords.some((kw) => lowerText.includes(kw))) {
        matchedTheme = theme;
        const vRef =
          theme.verses[Math.floor(Math.random() * theme.verses.length)];
        const verse = getVerseFromNVI(vRef.b, vRef.c, vRef.v);
        if (verse)
          bibleContext = `Considere este versículo para a resposta: ${verse.reference} - "${verse.text}"`;
        break;
      }
    }

    // Tentar Gemini (Humanização Total)
    if (
      window.GEMINI_API_KEY ||
      GEMINI_API_KEY !== "GEMINI_API_KEY_PLACEHOLDER"
    ) {
      try {
        const prompt = `Usuário diz: "${text}"\n\nContexto Bíblico: ${bibleContext}\nNível do Usuário: ${NIVEIS_NOMES[memory.nivel - 1]}\nSentimentos Recentes: ${memory.sentimentos.slice(-3).join(", ")}`;

        // Chamada de Mentoria (Foco em Humanização)
        // Em produção, isso iria via backend.
        console.log("[🛡️] AMÉM IA: Consultando sabedoria...");

        // FALLBACK ATIVO: Se não houver SDK carregado, usa lógica de regras
        if (typeof GoogleGenerativeAI === "undefined")
          throw new Error("SDK não carregado");

        const genAI = new GoogleGenerativeAI(
          window.GEMINI_API_KEY || GEMINI_API_KEY,
        );
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: SYSTEM_INSTRUCTION,
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        console.warn(
          "[⚠️] Gemini indisponível, usando motor de regras local:",
          err.message,
        );
      }
    }

    // MOTOR DE REGRAS (Fallback)
    let options = PASTOR_RESPONSES["default"];
    for (const key in PASTOR_RESPONSES) {
      if (lowerText.includes(key)) {
        options = PASTOR_RESPONSES[key];
        break;
      }
    }

    const response = options[Math.floor(Math.random() * options.length)];
    if (matchedTheme && bibleData) {
      const vRef =
        matchedTheme.verses[
          Math.floor(Math.random() * matchedTheme.verses.length)
        ];
      const verse = getVerseFromNVI(vRef.b, vRef.c, vRef.v);
      if (verse)
        return `${response}\n\nA Bíblia nos diz em **${verse.reference}**:\n_"${verse.text}"_`;
    }
    return response;
  };

  const sendMessage = (customText) => {
    try {
      const text = customText || inputField.value.trim();
      if (!text) return;

      if (appendMessage(text, true)) {
        if (!customText) inputField.value = "";
        setTimeout(async () => {
          const response = await getPastorResponse(text);
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
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  if (history.length > 0) {
    chatMain.innerHTML = "";
    const sep = document.createElement("div");
    sep.className = "flex justify-center mb-6";
    sep.innerHTML = `<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Caminhada Contínua</span>`;
    chatMain.appendChild(sep);
    history.forEach((msg) => appendMessage(msg.text, msg.isUser, false));
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    const isPrayerMode = urlParams.get("mode") === "prayer";

    const hour = new Date().getHours();
    let greeting = "Paz do Senhor";
    if (hour < 12) greeting = "Bom dia e a Paz do Senhor";
    else if (hour < 18) greeting = "Boa tarde e a Paz do Senhor";
    else greeting = "Boa noite e a Paz do Senhor";

    let welcome = `${greeting}, amado! Que alegria ter você aqui no Amém. Eu sou o seu Pastor pessoal e estou aqui para caminhar ao seu lado 24 horas por dia. Como está o seu coração hoje?`;

    if (isPrayerMode) {
      const oracao =
        ORACOES_PODEROSAS[Math.floor(Math.random() * ORACOES_PODEROSAS.length)];
      welcome = `${greeting}, meu amado. Senti no meu coração que você precisava de uma oração agora. Vamos clamar juntos?\n\n"${oracao}"\n\nComo você se sente após essa oração?`;
    }

    appendMessage(welcome, false);
    falarMensagem(welcome);
    if (!isPrayerMode) setTimeout(showOnboarding, 1000);
  }
}

document.addEventListener("DOMContentLoaded", initChat);
