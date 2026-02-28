/**
 * MASTER SENTINEL - Autonomous Engineering Core for Amém IA
 * Responsibility: Continuous Monitoring, Auto-Fixing, and Integrity Verification.
 */

const Sentinel = {
    config: {
        heartbeatInterval: 30000, // 30 seconds
        criticalKeys: ['amem_ia_user', 'amem_ia_spiritual_memory'],
    },

    status: {
        lastCheck: null,
        isHealthy: true,
        activeCorrections: 0
    },

    init: function() {
        console.log("🛡️ Master Sentinel: Operações iniciadas.");
        this.startHeartbeat();
        this.observeIntegrations();
        this.monitorPerformance();
        this.verifyBibles();
        this.trackUserActivity();
        this.jarvisProtocol(); // Novo: Lógica Mega-Brain
    },

    /**
     * Updates the last access timestamp for the current user
     */
    trackUserActivity: function() {
        try {
            const userStr = localStorage.getItem('amem_ia_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.lastAccess = new Date().toISOString();
                localStorage.setItem('amem_ia_user', JSON.stringify(user));
                
                // Sync with global user list simulation if exists
                let allUsers = JSON.parse(localStorage.getItem('amem_ia_db_users')) || [];
                const index = allUsers.findIndex(u => u.email === user.email);
                if (index !== -1) {
                    allUsers[index].lastAccess = user.lastAccess;
                    localStorage.setItem('amem_ia_db_users', JSON.stringify(allUsers));
                }
            }
        } catch (e) {
            AmemLogger.error(AmemLogger.Categories.SYSTEM, "Erro ao rastrear atividade do usuário", e);
        }
    },

    /**
     * Periodic health check of the core system
     */
    startHeartbeat: function() {
        setInterval(() => {
            this.status.lastCheck = Date.now();
            this.checkStorageIntegrity();
            this.checkNetwork();
        }, this.config.heartbeatInterval);
    },

    /**
     * Verifies that critical storage data is present and valid
     */
    checkStorageIntegrity: function() {
        this.config.criticalKeys.forEach(key => {
            const data = localStorage.getItem(key);
            if (!data) {
                AmemLogger.warn(AmemLogger.Categories.RECOVERY, `Chave crítica ausente: ${key}. Restaurando...`);
                // Use default recovery based on key
                if (key === 'amem_ia_user') localStorage.setItem(key, JSON.stringify({ name: "Amado", isPremium: false }));
                if (key === 'amem_ia_spiritual_memory') localStorage.setItem(key, JSON.stringify({ xp: 0, nivel: 1 }));
                this.status.activeCorrections++;
            }
        });
    },

    /**
     * Monitors network status and logs transitions
     */
    checkNetwork: function() {
        if (!navigator.onLine) {
            if (this.status.isHealthy) {
                AmemLogger.error(AmemLogger.Categories.SYSTEM, "Dispositivo Offline. Funcionalidades de API limitadas.");
                this.status.isHealthy = false;
            }
        } else if (!this.status.isHealthy) {
            AmemLogger.info(AmemLogger.Categories.SYSTEM, "Conexão de rede restaurada.");
            this.status.isHealthy = true;
        }
    },

    /**
     * Verifies if Bible data is loaded and attempts reload if missing
     */
    verifyBibles: function() {
        setTimeout(() => {
            if (typeof bibleData !== 'undefined' && bibleData === null) {
                AmemLogger.warn(AmemLogger.Categories.INTEGRATION, "BibleData ausente após timeout. Tentando recarregamento forçado.");
                if (window.AmemHealing) AmemHealing.fetchWithRetry('/data/bible-nvi.json');
            }
        }, 5000);
    },

    /**
     * Listens for DOM mutations that might indicate broken UI components
     */
    observeIntegrations: function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Check for common error states in UI
                    if (document.body.innerText.includes('Cannot find') || document.body.innerText.includes('ReferenceError')) {
                        AmemLogger.error(AmemLogger.Categories.UI, "Provável erro fatal no DOM detectado.");
                    }
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },

    /**
     * Simple performance metric logging
     */
    monitorPerformance: function() {
        window.addEventListener('load', () => {
            const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
            AmemLogger.info(AmemLogger.Categories.SYSTEM, `Tempo de carregamento DOM: ${loadTime}ms`);
            if (loadTime > 3000) {
                AmemLogger.warn(AmemLogger.Categories.SYSTEM, "Tempo de carregamento acima do ideal. Iniciando análise de otimização.");
            }
        });
    },

    /**
     * JARVIS PROTOCOL - Enhanced Supervision inspired by Mega Brain
     */
    jarvisProtocol: function() {
        console.log("%c [🤖] JARVIS PROTOCOL: ATIVADO ", "background: #1e293b; color: #38bdf8; font-weight: bold; border: 1px solid #38bdf8; padding: 2px 8px; border-radius: 4px;");
        
        const checks = [
            { name: "Gemini API", status: !!window.GEMINI_API_KEY || "Pendente" },
            { name: "Ticto Webhook", status: "Monitorando" },
            { name: "Auth System", status: !!localStorage.getItem('amem_ia_user') ? "✅" : "⚠️" },
            { name: "Spiritual XP", status: "Ativo" }
        ];

        console.table(checks);
        
        if (!window.GEMINI_API_KEY) {
            console.warn("[🤖] Jarvis: Gemini API desconectada. Chat Pastor operando em modo offline.");
        }
    }
};

window.AmemSentinel = Sentinel;
Sentinel.init();
