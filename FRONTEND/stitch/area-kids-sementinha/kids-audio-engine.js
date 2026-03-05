/**
 * AMÉM IA - KIDS AUDIO ENGINE (Protocolo Sumaúma)
 * Responsibility: Handle smooth audio playback for kids' prayers with premium transitions.
 */

const KidsAudioEngine = {
    currentAudio: null,
    isPlaying: false,

    /**
     * Play prayer audio by ID or URL
     * @param {string} audioUrl 
     * @param {function} onEnd - Callback when audio finishes
     */
    play(audioUrl, onEnd) {
        if (this.currentAudio) {
            this.stop();
        }

        console.log(`[🔊] Nova: Iniciando oração para os pequenos...`);
        
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.volume = 0; // Start at 0 for fade-in
        
        this.currentAudio.play().then(() => {
            this.isPlaying = true;
            this.fadeIn(this.currentAudio);
        }).catch(err => {
            console.error("[⚠️] Falha ao reproduzir áudio:", err);
        });

        this.currentAudio.onended = () => {
            this.isPlaying = false;
            if (onEnd) onEnd();
        };
    },

    /**
     * Stop current playback with fade-out
     */
    stop() {
        if (!this.currentAudio) return;

        this.fadeOut(this.currentAudio, () => {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.isPlaying = false;
            console.log("[🔇] Áudio interrompido.");
        });
    },

    /**
     * Smooth volume increase
     */
    fadeIn(audio, duration = 1000) {
        let vol = 0;
        const interval = 50;
        const step = interval / duration;
        
        const fade = setInterval(() => {
            if (vol < 1) {
                vol += step;
                audio.volume = Math.min(vol, 1);
            } else {
                clearInterval(fade);
            }
        }, interval);
    },

    /**
     * Smooth volume decrease
     */
    fadeOut(audio, callback, duration = 800) {
        let vol = audio.volume;
        const interval = 50;
        const step = (vol * interval) / duration;

        const fade = setInterval(() => {
            if (vol > 0.05) {
                vol -= step;
                audio.volume = Math.max(vol, 0);
            } else {
                clearInterval(fade);
                if (callback) callback();
            }
        }, interval);
    }
};

window.KidsAudioEngine = KidsAudioEngine;
