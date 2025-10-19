export class Accessibility {
    constructor(game) {
        this.game = game;
        this.buttonId = 'micButton';
        this.textDisplayId = 'textDisplay';
        this.speechRate = 0.9;

        this.browserSupport = {
            speechSynthesis: false,
            speechRecognition: false,
            https: false
        };

        this.recognition = null;
        this.checkBrowserSupport();
    }

    // --- Browser capability check ---
    checkBrowserSupport() {
        this.browserSupport.https =
            window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        this.browserSupport.speechSynthesis =
            !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
        this.browserSupport.speechRecognition =
            !!(window.webkitSpeechRecognition || window.SpeechRecognition);
        return this.browserSupport;
    }

    // --- Text output for visual debugging (optional) ---
    displayText(text) {
        const display = document.getElementById(this.textDisplayId);
        if (display) display.innerHTML = text;
    }

    // --- Reliable speech function ---
    speak(text, callback) {
        this.displayText(text);
        if (!this.browserSupport.speechSynthesis) {
            console.warn('Speech synthesis not supported.');
            if (callback) setTimeout(callback, 2000);
            return;
        }

        try {
            speechSynthesis.cancel();

            // Wait for voices to be available before speaking
            const speakNow = () => {
                const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
                utterance.rate = this.speechRate;

                if (callback) {
                    utterance.onend = callback;
                    utterance.onerror = callback;
                }

                speechSynthesis.speak(utterance);
            };

            if (speechSynthesis.getVoices().length === 0) {
                // Some browsers (Android) delay voice loading
                speechSynthesis.addEventListener('voiceschanged', speakNow, { once: true });
            } else {
                speakNow();
            }
        } catch (error) {
            console.error('Speech synthesis error:', error);
            if (callback) setTimeout(callback, 2000);
        }
    }

    // --- Sequential speech helper ---
    speakSequence(messages, callback) {
        if (!Array.isArray(messages) || messages.length === 0) {
            if (callback) callback();
            return;
        }

        const [first, ...rest] = messages;
        this.speak(first, () => {
            if (rest.length > 0) {
                setTimeout(() => this.speakSequence(rest, callback), 500);
            } else if (callback) {
                callback();
            }
        });
    }

    // --- Start voice recognition ---
    startListening(onResult, onError) {
        if (!this.browserSupport.speechRecognition || !this.browserSupport.https) {
            this.speak('Voice recognition requires HTTPS and a compatible browser like Chrome or Edge.');
            return false;
        }

        if (this.game.listening) {
            this.stopListening();
            return false;
        }

        try {
            const Recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            this.recognition = new Recognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.game.listening = true;
                const button = document.getElementById(this.buttonId);
                if (button) button.classList.add('listening');
            };

            this.recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase().trim();
                this.displayText(`You said: "${command}"`);
                this.stopListening();
                setTimeout(() => {
                    if (onResult) onResult(command);
                }, 500);
            };

            this.recognition.onerror = (event) => {
                this.stopListening();
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    this.speak('Voice error. Try again.');
                    if (onError) onError(event);
                }
            };

            this.recognition.onend = () => this.stopListening();

            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Recognition start error:', error);
            this.speak('Failed to start voice recognition.');
            this.stopListening();
            return false;
        }
    }

    // --- Stop recognition and restore button state ---
    stopListening() {
        this.game.listening = false;
        const button = document.getElementById(this.buttonId);
        if (button) button.classList.remove('listening');

        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
            this.recognition = null;
        }
    }

    // --- Change button appearance (by class) ---
    setButtonState(state) {
        const button = document.getElementById(this.buttonId);
        if (!button) return;
        button.classList.remove('start-button', 'listening', 'combat', 'exploration');
        if (state) button.classList.add(state);
    }

    // --- Support info for debugging ---
    getSupportInfo() {
        return {
            ...this.browserSupport,
            recommendations: this.getRecommendations()
        };
    }

    getRecommendations() {
        const issues = [];
        if (!this.browserSupport.https)
            issues.push('Use HTTPS for voice recognition');
        if (!this.browserSupport.speechRecognition)
            issues.push('Use Chrome, Edge, or Safari for voice recognition');
        if (!this.browserSupport.speechSynthesis)
            issues.push('Speech synthesis not supported in this browser');
        return issues;
    }
}
