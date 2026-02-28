/**
 * Self-Healing & Auto-Correction Engine for Amém IA
 * Building resilient applications through proactive recovery.
 */

const RECOVERY_LIMIT = 3; // Prevent infinite recovery loops
const recoveryAttempts = new Map();

const SelfHealing = {
    /**
     * Resets a specific storage key if corrupted
     */
    fixStorage: (key, defaultValue) => {
        try {
            const data = localStorage.getItem(key);
            if (data) JSON.parse(data);
        } catch (e) {
            AmemLogger.warn(AmemLogger.Categories.SYSTEM, `Corrupção detectada em ${key}. Corrigindo...`, e);
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return true;
        }
        return false;
    },

    /**
     * Wrapper for fetch with automatic retry
     */
    fetchWithRetry: async (url, options = {}, retries = 2) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response;
        } catch (e) {
            if (retries > 0) {
                AmemLogger.warn(AmemLogger.Categories.API, `Falha no fetch (${url}). Tentando novamente...`, { remaining: retries });
                return await SelfHealing.fetchWithRetry(url, options, retries - 1);
            }
            throw e;
        }
    },

    /**
     * Checks for redirect loops or broken navigation states
     */
    validateNav: () => {
        const path = window.location.pathname;
        const attempts = (recoveryAttempts.get(path) || 0) + 1;
        recoveryAttempts.set(path, attempts);

        if (attempts > RECOVERY_LIMIT) {
            AmemLogger.error(AmemLogger.Categories.SYSTEM, 'Loop de recuperação detectado. Forçando retorno à Home.', { path });
            window.location.href = '/stitch/am_m_ia_modo_sementinha_2/code.html';
        }
    }
};

// Initial Health Check
(function initSelfHealing() {
    // 1. Storage Integrity
    SelfHealing.fixStorage('amem_ia_spiritual_memory', { xp: 0, nivel: 1, streak: 1, sentimentos: [] });
    SelfHealing.fixStorage('amem_ia_user', { name: "Amado", church: "Amigo do Amém IA", isPremium: false });
    SelfHealing.fixStorage('amem_ia_chat_history', []);

    // 2. Global Error Hook enhancement
    window.addEventListener('unhandledrejection', event => {
        AmemLogger.error(AmemLogger.Categories.SYSTEM, 'Promise Rejeitada (Unhandled)', event.reason);
        // Attempt recovery if it was a critical fetch
        if (event.reason && event.reason.message && event.reason.message.includes('fetch')) {
             AmemLogger.info(AmemLogger.Categories.SYSTEM, 'Iniciando rotina de recuperação de rede...');
        }
    });

    console.log("🛡️ Sistema Self-Healing Ativo e Vigilante.");
})();

window.AmemHealing = SelfHealing;
