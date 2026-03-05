/**
 * AMÉM IA - CONFIGURAÇÃO DE ATIVOS ELITE
 * Centraliza nomes de canais, links sociais e canais de suporte.
 */
const AMEM_IA_CONFIG = {
    social: {
        instagram: {
            name: "Amém Oficial", 
            url: "https://instagram.com/amemia_oficial",
            backup: "@amemia_app"
        },
        tiktok: {
            name: "Amém Oficial",
            url: "https://tiktok.com/@amemia_oficial",
            elite: "amemia_oficial" // Mantendo chave técnica mas rótulo pode mudar se necessário
        },
        youtube: "https://youtube.com/@amemia"
    },
    support: {
        email: "suporte@amemia.com.br",
        registration_email: "zonadigitalprime@gmail.com.br",
        whatsapp: "https://wa.me/5500000000000",
        helpdesk: "https://ajuda.amemia.com.br"
    }
};

window.AMEM_IA_CONFIG = AMEM_IA_CONFIG;
export { AMEM_IA_CONFIG };
