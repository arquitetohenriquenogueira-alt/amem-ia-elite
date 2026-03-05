/**
 * Simple Authentication Simulation for Amém IA
 */

function initAuth() {
    // Find buttons and links containing profile icons
    const elements = document.querySelectorAll('button, a');
    elements.forEach(el => {
        const icon = el.querySelector('.material-symbols-outlined');
        if (icon && (icon.textContent.trim() === 'account_circle' || icon.textContent.trim() === 'person')) {
            el.addEventListener('click', handleAuthClick);
        }
    });

    function handleAuthClick(e) {
        e.preventDefault();
        const user = localStorage.getItem('amem_ia_user');

        if (user) {
            const logout = confirm(`Olá, ${JSON.parse(user).name}! Deseja sair da sua conta?`);
            if (logout) {
                AmemLogger.info(AmemLogger.Categories.AUTH, 'Usuário realizou Logout', { user: JSON.parse(user).name });
                localStorage.removeItem('amem_ia_user');
                alert('Você saiu da sua conta.');
                window.location.reload();
            }
        } else {
            AmemLogger.info(AmemLogger.Categories.AUTH, 'Tentativa de acesso ao Perfil (Não Logado)');
            window.location.href = '/stitch/auth-v2/code.html';
        }
    }
}



document.addEventListener('DOMContentLoaded', initAuth);
