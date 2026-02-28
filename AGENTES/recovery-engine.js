/**
 * RECOVERY ENGINE - Autonomous Re-engagement for Amém IA
 * Responsibility: Track cancelled/inactive users and trigger 7-day recovery sequence.
 */

const AmemRecovery = {
    config: {
        sequence: [
            { day: 0, title: "Sentimos sua falta", message: "O Pastor IA ainda está aqui para você. Deus tem uma palavra especial hoje." },
            { day: 1, title: "Mensagem Especial", message: "Uma mensagem especial foi preparada para você hoje. Volte e veja." },
            { day: 3, title: "Sua Caminhada Espiritual", message: "Sua caminhada espiritual é importante. Estamos aqui com você." },
            { day: 5, title: "Milhares de Bênçãos", message: "Mais de milhares de pessoas estão sendo abençoadas diariamente. Volte também." },
            { day: 7, title: "Sua Jornada Continua", message: "Estamos esperando por você. Sua jornada continua." }
        ]
    },

    init: function() {
        console.log("♻️ Recovery Engine: Vigilância de re-engajamento iniciada.");
        this.processQueue();
    },

    /**
     * Checks all users for cancellation/inactivity and schedules notifications
     */
    processQueue: function() {
        const users = JSON.parse(localStorage.getItem('amem_ia_db_users')) || [];
        const now = new Date();

        users.forEach(user => {
            if (user.status === 'CANCELLED' || user.status === 'EXPIRED') {
                this.checkSequence(user, now);
            }
        });
    },

    /**
     * Determines which message to send based on days elapsed since status change
     */
    checkSequence: function(user, now) {
        const changeDate = new Date(user.statusChangeDate || user.lastAccess);
        const daysDiff = Math.floor((now - changeDate) / (1000 * 60 * 60 * 24));

        const nextStep = this.config.sequence.find(step => step.day === daysDiff);
        
        if (nextStep && (!user.lastRecoveryStep || user.lastRecoveryStep < nextStep.day)) {
            this.sendRecovery(user, nextStep);
        }
    },

    /**
     * Simulates sending a push notification and email
     */
    sendRecovery: function(user, step) {
        AmemLogger.info(AmemLogger.Categories.NOTIFICATIONS, `Recovery Triggered: Dia ${step.day} para ${user.name}`, {
            user: user.email,
            message: step.message
        });

        // Simulation of Push/Email sending
        console.log(`[PUSH/EMAIL] Enviando para ${user.email}: ${step.title} - ${step.message}`);

        // Update user record
        user.lastRecoveryStep = step.day;
        this.updateUserDB(user);

        // Visual feedback if current user is the one being recovered (for testing)
        const currentUser = JSON.parse(localStorage.getItem('amem_ia_user'));
        if (currentUser && currentUser.email === user.email) {
            this.showRecoveryBanner(step);
        }
    },

    updateUserDB: function(user) {
        let allUsers = JSON.parse(localStorage.getItem('amem_ia_db_users')) || [];
        const index = allUsers.findIndex(u => u.email === user.email);
        if (index !== -1) {
            allUsers[index] = user;
            localStorage.setItem('amem_ia_db_users', JSON.stringify(allUsers));
        }
    },

    showRecoveryBanner: function(step) {
        const banner = document.createElement('div');
        banner.className = 'fixed top-4 left-4 right-4 z-[200] bg-premium-gold text-[#050B18] p-4 rounded-2xl shadow-2xl animate-bounce';
        banner.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined">notifications_active</span>
                <div>
                    <h4 class="font-bold text-sm">${step.title}</h4>
                    <p class="text-[11px] leading-tight">${step.message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 8000);
    },

    /**
     * Interupts recovery if user reactivates
     */
    stopRecovery: function(userEmail) {
        let allUsers = JSON.parse(localStorage.getItem('amem_ia_db_users')) || [];
        const index = allUsers.findIndex(u => u.email === userEmail);
        if (index !== -1) {
            delete allUsers[index].lastRecoveryStep;
            localStorage.setItem('amem_ia_db_users', JSON.stringify(allUsers));
        }
    }
};

window.AmemRecovery = AmemRecovery;
document.addEventListener('DOMContentLoaded', () => AmemRecovery.init());
