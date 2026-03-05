/**
 * AMÉM IA - ROUTE GUARD (Protocolo Sumaúma)
 * Garante que páginas premium só sejam acessadas por membros ativos.
 */
import { AuthService } from './auth_service.js';

export const RouteGuard = {
    async protect() {
        try {
            const session = await AuthService.getSession();
            if (!session) {
                console.log("[🛡️] Sem sessão. Redirecionando para login...");
                window.location.href = '/FRONTEND/login.html';
                return;
            }

            const { data: profile, error } = await AuthService.getProfile();
            
            if (error || !profile) {
                console.error("[!] Erro ao carregar perfil:", error);
                return;
            }

            // Bloqueio de acesso Ungidos
            const isPremiumPage = window.location.pathname.includes('ungidos') || 
                window.location.pathname.includes('abencoado');
            
            if (isPremiumPage && profile.plan !== 'abencoado') {
                console.warn("[🚫] Acesso Negado. Usuário sem plano Ungido.");
                window.location.href = '/FRONTEND/stitch/am_m_ia_planos_de_assinatura/code.html?reason=premium_required';
            }

        } catch (err) {
            console.error("[!] Erro no RouteGuard:", err);
        }
    }
};

// Execução automática para scripts que importam o guard
// RouteGuard.protect();
