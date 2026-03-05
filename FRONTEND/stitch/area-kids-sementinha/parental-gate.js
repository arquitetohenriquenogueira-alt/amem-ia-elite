/**
 * AMÉM - PARENTAL GATE (SEGURANÇA UNGIDA)
 * Objetivo: Bloquear acesso de crianças a áreas de pagamento ou configurações.
 * Refined for Ungidos standard: High contrast, Inter semi-bold, and clear hit targets.
 */

const ParentalGate = {
    _pin: "1234", // Default para teste, deve ser carregado do Supabase
    _callback: null,

    init() {
        console.log("🛡️ Parental Gate inicializado com padrão Ungido.");
        this.createOverlay();
    },

    createOverlay() {
        const html = `
        <div id="parental-gate-overlay" style="display:none; position:fixed; inset:0; background:rgba(5, 11, 24, 0.95); z-index:9999; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); color:white; font-family:'Inter', sans-serif; align-items:center; justify-content:center; flex-direction:column; text-align:center; padding:24px;">
            <style>
                @keyframes pg-shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            </style>
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(200, 169, 81, 0.3); padding:40px; border-radius:32px; max-width:340px; width:100%; box-shadow: 0 20px 50px rgba(0,0,0,0.3); transition: transform 0.3s;">
                <div style="width:64px; height:64px; background:rgba(200, 169, 81, 0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
                    <span class="material-symbols-outlined" style="font-size:32px; color:#C8A951;">lock</span>
                </div>
                <h2 style="margin:0 0 12px; font-weight:800; font-size:22px; color:white;">Acesso Restrito</h2>
                <p style="color:rgba(255,255,255,0.8); font-size:15px; line-height:1.5; margin-bottom:28px; font-weight:500;">Um adulto deve confirmar o PIN de segurança para continuar.</p>
                
                <div style="display:flex; gap:12px; justify-content:center; margin-bottom:28px;">
                    <input type="password" id="pg-pin" maxlength="4" placeholder="PIN" inputmode="numeric" 
                        style="width:120px; height:60px; background:rgba(255,255,255,0.05); border:2px solid rgba(200, 169, 81, 0.4); border-radius:16px; color:white; text-align:center; font-size:28px; font-weight:800; outline:none; transition: border-color 0.3s;"
                        onfocus="this.style.borderColor='#C8A951'"
                        onblur="this.style.borderColor='rgba(200, 169, 81, 0.4)'">
                </div>

                <div style="display:flex; gap:16px;">
                    <button onclick="ParentalGate.close()" style="flex:1; height:48px; border-radius:14px; border:none; background:rgba(255,255,255,0.1); color:white; font-weight:600; font-size:14px; cursor:pointer; transition: background 0.2s;">Cancelar</button>
                    <button onclick="ParentalGate.verify()" style="flex:1; height:48px; border-radius:14px; border:none; background:#C8A951; color:#050B18; font-weight:800; font-size:14px; cursor:pointer; transition: transform 0.2s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">Confirmar</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    verify() {
        const input = document.getElementById('pg-pin');
        const overlay = document.querySelector('#parental-gate-overlay > div');
        
        if (input.value === this._pin) {
            this.success();
        } else {
            console.log("❌ PIN incorreto.");
            // Shake animation and red border
            input.style.borderColor = "#ff4444";
            overlay.style.animation = "pg-shake 0.5s cubic-bezier(.36,.07,.19,.97) both";
            
            setTimeout(() => {
                overlay.style.animation = "";
                input.style.borderColor = "rgba(200, 169, 81, 0.4)";
                input.value = "";
                input.focus();
            }, 600);
        }
    },

    ask(callback) {
        this._callback = callback;
        const overlay = document.getElementById('parental-gate-overlay');
        overlay.style.display = 'flex';
        document.getElementById('pg-pin').focus();
    },

    success() {
        this.close();
        if (this._callback) this._callback();
    },

    close() {
        document.getElementById('parental-gate-overlay').style.display = 'none';
        document.getElementById('pg-pin').value = "";
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.ParentalGate = ParentalGate;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ParentalGate.init());
    } else {
        ParentalGate.init();
    }
}
