/**
 * Simple Prayer Diary Logic for Amém IA
 */

function initDiary() {
    const prayerContainer = document.getElementById('diary-main');
    const fabAdd = document.getElementById('fab-add');


    if (!prayerContainer || !fabAdd) return;

    // Load prayers from localStorage
    let prayers = JSON.parse(localStorage.getItem('amem_ia_prayers')) || [
        { id: 1, title: "Oração pela Família", text: "Pedido de proteção, união e sabedoria...", date: "20 de Outubro", urgent: true, answered: false },
        { id: 2, title: "Saúde de Maria", text: "Intercessão pela recuperação completa...", date: "18 de Outubro", urgent: false, answered: false },
        { id: 3, title: "Direcionamento Profissional", text: "Buscando a vontade de Deus...", date: "15 de Outubro", urgent: false, answered: false }
    ];

    const renderPrayers = () => {
        // Find if respondidas tab is active
        const isAnsweredTab = document.getElementById('tab-respondidas')?.classList.contains('text-premium-gold');
        const filter = isAnsweredTab ? true : false;


        const filtered = prayers.filter(p => p.answered === filter);

        prayerContainer.innerHTML = '';

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = "prayer-card p-5 space-y-4";

            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-premium-gold tracking-widest uppercase mb-0.5">${p.urgent ? 'Causa Urgente' : 'Pedido de Oração'}</span>
                        <h3 class="font-serif text-xl text-deep-navy leading-tight">${p.title}</h3>
                    </div>
                    <div class="flex flex-col items-end gap-1.5">
                        <span class="text-[9px] text-slate-400 font-bold tracking-wider uppercase">${p.answered ? 'Respondida' : 'Pendente'}</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input ${p.answered ? 'checked' : ''} class="sr-only peer" type="checkbox" onchange="markAsAnswered(${p.id})">
                            <div class="ios-toggle"></div>
                        </label>
                    </div>
                </div>
                <p class="text-slate-600 text-sm leading-relaxed">${p.text}</p>
                <div class="flex items-center justify-between pt-1">
                    <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        <span class="material-symbols-outlined text-base text-premium-gold">calendar_month</span>
                        ${p.date}
                    </div>
                </div>
            `;
            prayerContainer.appendChild(card);
        });
    };


    window.markAsAnswered = (id) => {
        const prayer = prayers.find(p => p.id === id);
        if (prayer) {
            prayer.answered = !prayer.answered;
            localStorage.setItem('amem_ia_prayers', JSON.stringify(prayers));
            // Slight delay to see the toggle animation before re-rendering
            setTimeout(renderPrayers, 300);
        }
    };


    fabAdd.onclick = () => {
        const title = prompt('Qual o motivo da sua oração?');
        if (title) {
            const text = prompt('Descreva seu pedido com mais detalhes:');
            const newPrayer = {
                id: Date.now(),
                title: title,
                text: text || '',
                date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
                urgent: confirm('Este pedido é urgente?'),
                answered: false
            };
            prayers.unshift(newPrayer);
            localStorage.setItem('amem_ia_prayers', JSON.stringify(prayers));
            renderPrayers();
        }
    };

    // Tab switching
    const tabPendentes = document.getElementById('tab-pendentes');
    const tabRespondidas = document.getElementById('tab-respondidas');

    if (tabPendentes && tabRespondidas) {
        const switchTab = (active, inactive) => {
            active.classList.remove('border-transparent', 'text-slate-400');
            active.classList.add('border-premium-gold', 'text-premium-gold');
            inactive.classList.remove('border-premium-gold', 'text-premium-gold');
            inactive.classList.add('border-transparent', 'text-slate-400');
            renderPrayers();
        };

        tabPendentes.onclick = (e) => {
            e.preventDefault();
            switchTab(tabPendentes, tabRespondidas);
        };

        tabRespondidas.onclick = (e) => {
            e.preventDefault();
            switchTab(tabRespondidas, tabPendentes);
        };
    }


    renderPrayers();
}

document.addEventListener('DOMContentLoaded', initDiary);
