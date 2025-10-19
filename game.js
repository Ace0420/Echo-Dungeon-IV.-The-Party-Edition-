import { classes, rings, abilities, merchantItems, equipment, amulets } from './gameData.js';

class EchoDungeonGame {
    constructor() {
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

        // Store references for combat system
        this.rings = rings;
        this.amulets = amulets;

        // Initialize subsystems
        this.a11y = new Accessibility(this);
        this.dungeonGenerator = new DungeonGenerator(this);
        this.playerManager = new PlayerManager(this);
        this.combatSystem = new Combat(this);
        this.commandProcessor = new CommandProcessor(this);
    }

    initialize() {
        this.initialized = true;
        this.a11y.setButtonState('');
        this.a11y.speak("Welcome to Echo Dungeon V4: The Full Party Edition! Say 'load game' and provide your save PIN, or choose your class: warrior, mage, or rogue."); 
    }

    handleClick() {
        if (!this.initialized) {
            this.initialize();
        } else {
            this.a11y.startListening(
                (command) => this.commandProcessor.processCommand(command),
                (error) => console.error('Recognition error:', error)
            );
        }
    }

    // Room exploration methods
    move(direction) {
        const { x, y } = this.player.position;
        let newX = x, newY = y;
        
        if (direction === 'north') newY--;
        else if (direction === 'south') newY++;
        else if (direction === 'east') newX++;
        else if (direction === 'west') newX--;
        
        if (newX < 0 || newX >= this.dungeon.size || newY < 0 || newY >= this.dungeon.size) {
            this.a11y.speak('You cannot go that way. A solid wall blocks your path.');
            return;
        }
        
        this.player.position = { x: newX, y: newY };
        const key = `${newX},${newY}`;
        this.currentRoom = this.dungeon.grid[key];
        
        if (this.currentRoom.type === 'trap') {
            if (!this.currentRoom.visited) {
                const trapDamage = 15 + (this.dungeon.currentLevel * 5);
                this.player.health -= trapDamage;
                this.a11y.speak(`A trap springs! You take ${trapDamage} damage! Health: ${this.player.health}.`);
                if (this.player.health <= 0) {
                    setTimeout(() => this.combatSystem.gameOver(), 1000);
                    return;
                }
            }
        }

        this.currentRoom.visited = true;
        this.describeRoom();
    }

    describeRoom() {
        const room = this.currentRoom;
        const messages = [`You are on Level ${this.dungeon.currentLevel} in ${room.description}`];
        
        if (room.type === 'stairs') {
            messages.push('Dark stairs descend deeper. Say "go down stairs" to descend.');
        } else if (room.type === 'merchant') {
            messages.push('A traveling merchant is here. Say "merchant" to trade.');
        } else if (room.type === 'fountain' && !room.fountainUsed) {
            messages.push('A magical fountain bubbles here. Say "drink fountain" to be healed.');
        } else if (room.enemy && room.enemy.health > 0) {
            if (room.secondEnemy && room.secondEnemy.health > 0) {
                messages.push(`A ${room.enemy.name} and a ${room.secondEnemy.name} block your path!`);
            } else {
                messages.push(`A ${room.enemy.name} blocks your path!`);
            }
            this.a11y.speakSequence(messages, () => {
                setTimeout(() => this.combatSystem.startCombat(room.enemy, room.secondEnemy), 1000);
            });
            return;
        } else {
            if (room.hasChest && !room.searched) {
                messages.push('A treasure chest glimmers in the shadows. Say "open chest" to loot it.');
            }
            if (!room.searched && room.type !== 'stairs') {
                messages.push('You could search this room.');
            }
        }
        messages.push('Which direction will you go?');
        this.a11y.speakSequence(messages);
    }

    searchRoom() {
        const room = this.currentRoom;
        
        if (room.searched) {
            this.a11y.speak('You already searched this room thoroughly.');
            return;
        }
        
        room.searched = true;
        
        if (this.dungeon.hasSecretRoom && !this.dungeon.secretRoom && Math.random() < 0.15) {
            this.dungeon.secretRoom = true;
            const loot = this.dungeonGenerator.determineLoot();
            this.handleLoot(loot);
            this.a11y.speakSequence([
                'You found a hidden passage behind a loose stone!',
                'Inside, ancient treasures await!'
            ]);
        } else {
            const loot = this.dungeonGenerator.determineLoot();
            this.handleLoot(loot);
        }
    }

    openChest() {
        const room = this.currentRoom;
        
        if (!room.hasChest || room.searched) {
            this.a11y.speak('There is no chest here or it has already been opened.');
            return;
        }
        
        room.searched = true;
        const loot = this.dungeonGenerator.determineLoot();
        this.handleLoot(loot);
        this.a11y.speak('You open the chest and find...');
    }

    useFountain() {
        const room = this.currentRoom;
        
        if (room.type !== 'fountain' || room.fountainUsed) {
            this.a11y.speak('There is no usable fountain here.');
            return;
        }
        
        room.fountainUsed = true;
        this.player.health = this.player.maxHealth;
        this.player.mana = this.player.maxMana;
        this.a11y.speak('You drink from the fountain and are fully healed and restored!');
    }

    useStairs() {
        const room = this.currentRoom;
        
        if (room.type !== 'stairs') {
            this.a11y.speak('There are no stairs here to descend.');
            return;
        }
        
        this.dungeon.currentLevel++;
        this.dungeonGenerator.generateDungeon();
        this.a11y.speak(`You descend to level ${this.dungeon.currentLevel}.`);
        setTimeout(() => this.describeRoom(), 1000);
    }

    talkToMerchant() {
        const room = this.currentRoom;
        
        if (room.type !== 'merchant') {
            this.a11y.speak('There is no merchant here.');
            return;
        }
        
        this.merchantOpen = true;
        this.a11y.speak('A sassy merchant greets you: "Well, well, a customer! What do you want? Say what do you have, buy, sell, or leave."');
    }

    buyFromMerchant(command) {
        if (!this.merchantOpen) {
            this.a11y.speak('You are not at a merchant.');
            return;
        }
        
        let itemToBuy = null;
        let quantity = 1;
        
        if (command.includes('greater health')) {
            itemToBuy = 'Greater Health Potion';
        } else if (command.includes('greater mana')) {
            itemToBuy = 'Greater Mana Potion';
        } else if (command.includes('health')) {
            itemToBuy = 'Health Potion';
        } else if (command.includes('mana')) {
            itemToBuy = 'Mana Potion';
        }
        
        if (command.includes('two') || command.includes('2')) quantity = 2;
        else if (command.includes('three') || command.includes('3')) quantity = 3;
        
        if (!itemToBuy) {
            this.a11y.speak('Say buy greater health potion, greater mana potion, health potion, or mana potion, followed by a quantity like two or three if desired.');
            return;
        }
        
        const itemData = merchantItems.find(i => i.name === itemToBuy);
        const totalCost = itemData.price * quantity;
        
        if (this.player.gold < totalCost) {
            this.a11y.speak(`Ha! You only have ${this.player.gold} gold. That'll cost ${totalCost}! Scram!`);
            return;
        }
        
        this.player.gold -= totalCost;
        for (let i = 0; i < quantity; i++) {
            this.player.inventory.push(itemToBuy);
        }
        this.a11y.speak(`The merchant sneers, "Fine, ${quantity} ${itemToBuy}${quantity > 1 ? 's' : ''} for ${totalCost} gold." Gold remaining: ${this.player.gold}.`);
    }

    sellToMerchant(command) {
        if (!this.merchantOpen) {
            this.a11y.speak('You are not at a merchant.');
            return;
        }
        
        let itemToSell = null;
        let quantity = 1;
        
        if (command.includes('sapphire') || command.includes('gem')) itemToSell = 'Sapphire Gem';
        else if (command.includes('ruby')) itemToSell = 'Ruby Gem';
        else if (command.includes('diamond')) itemToSell = 'Diamond';
        else if (command.includes('emerald')) itemToSell = 'Emerald';
        else if (command.includes('coin') || command.includes('coins')) itemToSell = 'Ancient Coin Collection';
        else if (command.includes('chalice')) itemToSell = 'Golden Chalice';
        else if (command.includes('crown')) itemToSell = 'Silver Crown';
        else if (command.includes('amulet')) itemToSell = 'Enchanted Amulet';
        
        if (command.includes('two') || command.includes('2')) quantity = 2;
        else if (command.includes('three') || command.includes('3')) quantity = 3;
        
        if (!itemToSell) {
            this.a11y.speak('Say sell sapphire gem, ruby gem, diamond, emerald, ancient coin collection, golden chalice, silver crown, or enchanted amulet, followed by a quantity like two or three if desired.');
            return;
        }
        
        const itemData = treasures.find(t => t.name === itemToSell);
        if (!itemData) {
            this.a11y.speak('That item isn\'t worth my time!');
            return;
        }
        
        const count = this.player.inventory.filter(i => i === itemToSell).length;
        if (count < quantity) {
            this.a11y.speak(`You only have ${count} ${itemToSell}${count > 1 ? 's' : ''}!`);
            return;
        }
        
        const totalValue = Math.floor(itemData.value * quantity * 0.75);
        for (let i = 0; i < quantity; i++) {
            const idx = this.player.inventory.indexOf(itemToSell);
            this.player.inventory.splice(idx, 1);
        }
        this.player.gold += totalValue;
        this.a11y.speak(`The merchant chuckles, "I'll take ${quantity} ${itemToSell}${quantity > 1 ? 's' : ''} for ${totalValue} gold." Gold: ${this.player.gold}.`);
    }

    listMerchantWares() {
        if (!this.merchantOpen) {
            this.a11y.speak('You are not at a merchant.');
            return;
        }
        
        const messages = ['The merchant smirks: "Here\'s my stock:"'];
        merchantItems.forEach(item => {
            messages.push(`${item.name} for ${item.price} gold.`);
        });
        messages.push('Say buy followed by the item and quantity, sell an item, or leave.');
        this.a11y.speakSequence(messages);
    }

    // Loot and experience methods
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
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new EchoDungeonGame();
    document.getElementById('micButton').addEventListener('click', () => game.handleClick());
});

export default EchoDungeonGame;
