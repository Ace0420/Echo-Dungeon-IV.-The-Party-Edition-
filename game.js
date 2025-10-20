import { roomTypes, enemies, treasures, merchantItems, rings, amulets } from './gameData.js';
import { Accessibility } from './accessibility.js';
import { DungeonGenerator } from './dungeonGenerator.js';
import { PlayerManager } from './playerManager.js';
import { Combat } from './combat.js';
import CommandProcessor from './commandProcessor.js';

class EchoDungeonGame {
    constructor() {
        console.log('Game constructor called');
        
        this.player = {
            class: '',
            level: 1,
            experience: 0,
            experienceToNext: 100,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            gold: 25,
            inventory: [],
            equippedRings: [],
            learnedAbilities: [],
            equippedAmulet: '',
            position: { x: 5, y: 5 },
            baseAttack: 15,
            defense: 0,
            weapon: '',
            armor: '',
            shield: ''
        };

        this.dungeon = {
            grid: {},
            size: 10,
            secretRoom: null,
            hasSecretRoom: false,
            currentLevel: 1 
        };

        this.currentRoom = null;
        this.combat = null;
        this.started = false;
        this.needsClass = true;
        this.initialized = false;
        this.phase = 'init';
        this.merchantOpen = false;
        this.listening = false;

    }

    // REWRITTEN: Initialize the game and its dependencies.
    initializeGame() {
        // Construct dependencies (already confirmed to be working)
        this.a11y = new Accessibility(this);
        this.dungeonGenerator = new DungeonGenerator(this);
        this.playerManager = new PlayerManager(this);
        this.commandProcessor = new CommandProcessor(this);
        
        // Final setup
        this.dungeonGenerator.generateDungeon();
        this.currentRoom = this.dungeon.grid['5,5'];
        
        // Set state to BLUE (start-button) - This confirms initialization is complete
        this.a11y.setButtonState('start-button');
        this.initialized = true;
        this.phase = 'class-select';

        // CRITICAL FIX 1: Add a brief pause before speaking 
        // to let the browser stabilize the speech synthesis engine.
        setTimeout(() => {
            this.a11y.speak('Welcome to Echo Dungeon! Choose your class: warrior, mage, or rogue.');
        }, 500); // 500ms delay
    }

    // REWRITTEN: Handles all button clicks.
    handleClick() {
        // 1. If we are currently listening, a click stops it.
        if (this.listening) {
            this.a11y.stopListening();
            return;
        }

        // 2. If the game is not initialized, run initialization.
        if (!this.initialized) {
            this.initializeGame();
            // CRITICAL FIX 2: Delay the startListening call 
            // to allow the greeting to start and the mic prompt to stabilize.
            setTimeout(() => this.a11y.startListening(), 1500); 
            return;
        }
        
        // 3. If initialized but not listening (normal game state), start listening immediately.
        this.a11y.startListening(); 
    }

    // --- (Keep the rest of your EchoDungeonGame class methods below this point) ---

    // ... your existing methods like handleLoot, describeRoom, etc. should follow here ...
    handleLoot(loot) {
        if (loot.type === 'item') {
            this.player.inventory.push(loot.item);
            this.a11y.speak(`You found a ${loot.item}!`);
        } else if (loot.type === 'ring') {
            this.player.inventory.push(loot.item);
            this.a11y.speak(`You found a ${loot.item}! Say wear ring to equip it.`);
        } else if (loot.type === 'amulet') {
            this.player.inventory.push(loot.item);
            this.a11y.speak(`You found an ${loot.item}! Say equip amulet to wear it.`);
        } else if (loot.type === 'gold') {
            this.player.gold += loot.amount;
            this.a11y.speak(`You found ${loot.amount} gold! Total gold: ${this.player.gold}.`);
        }
    }
} // End of EchoDungeonGame class

// --- Replace the DOMContentLoaded listener block at the end of game.js ---

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM LOADED ===');
    const game = new EchoDungeonGame();
    const button = document.getElementById('micButton');
    
    if (button) {
        console.log('Button found, adding click listener');
        button.addEventListener('click', () => game.handleClick());
        console.log('Click listener added successfully');
    } else {
        console.error('ERROR: micButton not found!');
    }
    
    // Check browser support
    console.log('Browser support check:');
    console.log('- HTTPS:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');
    console.log('- Speech Synthesis:', !!(window.speechSynthesis && window.SpeechSynthesisUtterance));
    console.log('- Speech Recognition:', !!(window.webkitSpeechRecognition || window.SpeechRecognition));
});

