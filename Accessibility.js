export class Accessibility {
    constructor(game) {
        this.game = game;
        this.buttonId = 'micButton';
        this.textDisplayId = 'textDisplay';
        this.speechRate = 0.9;
        this.voices = []; // New property for loaded voices

        this.browserSupport = {
            speechSynthesis: false,
            speechRecognition: false,
            https: false
        };

        this.recognition = null;
        this.checkBrowserSupport();
        this.loadVoices(); // New function to load voices on startup
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

    // --- NEW: Load voices once on startup ---
    loadVoices() {
        if (this.browserSupport.speechSynthesis) {
            if (speechSynthesis.getVoices().length === 0) {
                speechSynthesis.onvoiceschanged = () => {
                    this.voices = speechSynthesis.getVoices();
                    console.log(`Voices loaded: ${this.voices.length}`);
                };
            } else {
                this.voices = speechSynthesis.getVoices();
            }
        }
    }

    // --- Text output for visual debugging (optional) ---
    displayText(text) {
        const display = document.getElementById(this.textDisplayId);
        if (display) display.innerHTML = text;
    }

    // --- Reliable speech function (FIXED) ---
    speak(text, callback) {
        this.displayText(text);
        if (!this.browserSupport.speechSynthesis) {
            console.warn('Speech synthesis not supported.');
            if (callback) setTimeout(callback, 2000);
            return;
        }

        try {
            speechSynthesis.cancel();
            
            // Check if voices are loaded before executing
            if (this.voices.length === 0) {
                // If voices aren't ready yet, log an error and skip the greeting 
                // but let the rest of the code run.
                console.warn('Speech voices not yet available. Skipping speak.');
                if (callback) setTimeout(callback, 2000);
                return; 
            }
            
            this.executeSpeech(text, callback);

        } catch (e) {
            console.error('Speech synthesis error:', e);
            if (callback) setTimeout(callback, 2000);
        }
    }

    // --- Execute actual speech logic ---
    executeSpeech(text, callback) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.speechRate;
        
        // Use a loaded voice if available
        if (this.voices.length > 0) {
            utterance.voice = this.voices.find(voice => voice.lang === 'en-US') || this.voices[0];
        }

        if (callback) {
            utterance.onend = callback;
        }
        speechSynthesis.speak(utterance);
    }

    // --- Start recognition (FIXED) ---
    startListening() {
        if (!this.browserSupport.speechRecognition || !this.browserSupport.https) {
            // Note: This check already passes on GitHub pages.
            if (!this.browserSupport.https) {
                 this.game.a11y.speak('Voice recognition requires a secure connection (HTTPS) or localhost. Please load the game on a proper server.');
                 console.error('HTTPS required for voice recognition.');
            }
            return false;
        }

        if (this.recognition) return true; // Already listening

        const Recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        this.recognition = new Recognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase().trim();
            this.game.a11y.speak(`You said: ${command}`);
            this.game.commandProcessor.processCommand(command);
        };
        
        // CRITICAL: New error handler for better debugging
        this.recognition.onerror = (event) => {
            console.error('Recognition Error:', event.error);
            // Specifically log mic permission issues
            if (event.error === 'not-allowed') {
                this.game.a11y.speak('Please enable microphone permission in your browser settings to continue playing.');
            } else {
                 this.game.a11y.speak('Voice recognition encountered an error. Please try tapping to speak again.');
            }
            this.stopListening();
        };

        this.recognition.onend = () => {
            console.log('Recognition ENDED');
            this.stopListening();
            // Optional: Restart listening if needed (e.g., this.startListening();)
        };

        const button = document.getElementById(this.buttonId);
        if (button) button.classList.add('listening');

        try {
            this.recognition.start();
            this.game.listening = true;
            this.recognition.onstart = () => {
                console.log('Recognition STARTED');
            };
        } catch (e) {
            console.error('Recognition Start Error:', e);
            this.stopListening();
            return false;
        }
        return true;
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
}

