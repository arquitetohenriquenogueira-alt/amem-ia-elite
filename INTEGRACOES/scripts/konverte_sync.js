/**
 * AMÉM IA - KONVERTE SYNC (Protocolo Sumaúma)
 * Responsibility: Synchronize Hot Leads with Konverte API for recovery and automation.
 */

export const KonverteSync = {
    // Henrique, insira sua URL de Webhook ou API Key da Konverte aqui
    CONFIG: {
        WEBHOOK_URL: 'https://webhook.konverte.ai/v1/lead', // Placeholder padrão
        ACTIVE: true
    },

    /**
     * Envia um lead capturado para a Konverte
     * @param {Object} leadData { email, name, level, utm_source, utm_medium, utm_campaign }
     */
    async syncLead(leadData) {
        if (!this.CONFIG.ACTIVE) return;

        console.log(`[🚀] Nova: Sincronizando lead '${leadData.email}' com Konverte...`);

        try {
            // Formata o payload conforme padrão de mercado para ferramentas de CRM/Automação
            const payload = {
                event: 'lead_captured',
                data: {
                    email: leadData.email,
                    name: leadData.full_name || leadData.name,
                    spiritual_level: leadData.spiritual_level || leadData.level,
                    source: leadData.utm_source || 'direct',
                    medium: leadData.utm_medium || 'landing',
                    campaign: leadData.utm_campaign || 'elite',
                    project: 'Amém IA Elite',
                    timestamp: new Date().toISOString()
                }
            };

            // Envio via Beacon ou Fetch (Beacon é melhor para não travar a UI)
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(this.CONFIG.WEBHOOK_URL, blob);
            } else {
                await fetch(this.CONFIG.WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            console.log("[✅] Sincronização Konverte disparada com sucesso.");
            return true;
        } catch (error) {
            console.warn("[⚠️] Falha silenciosa no sync Konverte:", error.message);
            return false;
        }
    }
};
