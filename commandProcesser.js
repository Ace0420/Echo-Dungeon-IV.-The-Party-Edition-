import { partyOrder, classes, rings, amulets } from './gameData.js';

class CommandProcessor {
    constructor(game) {
        this.game = game;
    }

    processCommand(command) {
        if (this.game.needsClass) {
            if (command.includes('warrior') || command.includes('fighter')) this.game.playerManager.selectClass('warrior');
            else if (command.includes('mage') || command.includes('wizard')) this.game.playerManager.selectClass('mage');
            else if (command.includes('rogue') || command.includes('thief')) this.game.playerManager.selectClass('rogue');
            else this.game.a11y.speak('Please say warrior, mage, or rogue.');
            return;
        }

        if (this.game.merchantOpen) {
            this.processMerchantCommand(command);
            return;
        }

        if (this.game.combat) {
            this.processCombatCommand(command);
            return;
        }

        this.processExplorationCommand(command);
    }

    processClassSelection(command) {
        if (command.includes('warrior') || command.includes('fighter')) {
            this.game.playerManager.selectClass('warrior');
        } else if (command.includes('mage') || command.includes('wizard')) {
            this.game.playerManager.selectClass('mage');
        } else if (command.includes('rogue') || command.includes('thief')) {
            this.game.playerManager.selectClass('rogue');
        } else {
            this.game.a11y.speak('Please say warrior, mage, or rogue.');
        }
    }

    processCombatCommand(command) {
        if (command.includes('attack')) {
            this.game.combat.playerAttack();
        } else if (command.includes('defend')) {
            this.game.combat.playerDefend();
        } else if (command.includes('special')) {
            this.game.combat.playerSpecial();
        } else if (command.includes('cast spell') && this.game.player.class === 'mage') {
            this.game.combat.playerSpecial();
        } else if (command.includes('use potion') || command.includes('drink potion')) {
            this.game.playerManager.usePotion();
        } else if (command.includes('flee') || command.includes('run away')) {
            this.game.combat.flee();
        } else {
            this.game.a11y.speak('Try attacking or defending based on your health.');
        }
    }

    processExplorationCommand(command) {
        if (command.includes('go north') || command.includes('move north')) this.game.playerManager.move('north');
        else if (command.includes('go south') || command.includes('move south')) this.game.playerManager.move('south');
        else if (command.includes('go east') || command.includes('move east')) this.game.playerManager.move('east');
        else if (command.includes('go west') || command.includes('move west')) this.game.playerManager.move('west');
        else if (command.includes('search') || command.includes('look around')) this.game.playerManager.searchRoom();
        else if (command.includes('open chest') || command.includes('claim treasure')) this.game.playerManager.openChest();
        else if (command.includes('drink fountain') || command.includes('use fountain')) this.game.playerManager.drinkFountain();
        else if (command.includes('merchant') || command.includes('trade')) this.game.playerManager.openMerchant();
        else if (command.includes('go down stairs') || command.includes('descend')) this.game.playerManager.goDownStairs();
        else if (command.includes('status') || command.includes('stats')) this.game.playerManager.describeStatus();
        else if (command.includes('inventory') || command.includes('items')) this.game.playerManager.describeInventory();
        else if (command.includes('equip')) this.processEquipCommand(command);
        else if (command.includes('use')) this.processUseCommand(command);
        else if (command.includes('save game') || command.includes('save my game')) this.game.playerManager.saveGame();
        else if (command.includes('load game') || command.includes('load my game')) this.game.playerManager.loadGame(command);
        else if (command.includes('meditate') || command.includes('rest')) this.game.playerManager.meditate();
        else if (command.includes('party')) this.game.playerManager.describeParty();
        else if (command.includes('ability')) this.game.playerManager.describeAbilities();
        else if (command.includes('help')) this.game.a11y.speak('Say go north, south, east, or west to move. Say search, status, inventory, equip, or help.');
        else {
            const room = this.game.currentRoom;
            if (room.type === 'stairs') {
                this.game.a11y.speak('A staircase is here. Say \"go down stairs\" to descend to the next level.');
            } else if (room.type === 'merchant') {
                this.game.a11y.speak('A merchant is here. Say \"merchant\" to trade goods.');
            } else if (room.type === 'fountain' && !room.fountainUsed) {
                this.game.a11y.speak('There is a magical fountain here. Say \"drink fountain\" for full healing.');
            } else if (room.hasChest && !room.searched) {
                this.game.a11y.speak('There is a chest here. Say open chest.');
            } else if (!room.searched) {
                this.game.a11y.speak('You have not searched this room yet. Try searching.');
            } else if (this.game.player.mana < this.game.player.maxMana * 0.5) {
                this.game.a11y.speak('Your mana is low. Consider saying meditate to recover.');
            } else if (room.type === 'boss') {
                this.game.a11y.speak('This is a boss room. Be prepared for a tough fight.');
            } else {
                this.game.a11y.speak('Explore in different directions. The boss is at the far south east corner. Look for merchants to buy potions and sell loot.');
            }
        }
    }

    processMerchantCommand(command) {
        if (command.includes('buy')) this.game.playerManager.buyItem(command);
        else if (command.includes('sell')) this.game.playerManager.sellItem(command);
        else if (command.includes('list items') || command.includes('what is for sale')) this.game.playerManager.listMerchantItems();
        else if (command.includes('leave') || command.includes('exit')) this.game.playerManager.closeMerchant();
        else this.game.a11y.speak('Say buy, sell, list items, or leave.');
    }

    processEquipCommand(command) {
        if (command.includes('ring')) this.game.playerManager.equipRing(command);
        else if (command.includes('amulet')) this.game.playerManager.equipAmulet(command);
        else if (command.includes('weapon')) this.game.playerManager.equipWeapon(command);
        else if (command.includes('armor')) this.game.playerManager.equipArmor(command);
        else this.game.a11y.speak('Say equip ring, equip amulet, equip weapon, or equip armor.');
    }
    
    processUseCommand(command) {
        if (command.includes('potion')) this.game.playerManager.usePotion(command);
        else if (command.includes('ability book')) this.game.playerManager.learnAbility(command);
        else this.game.a11y.speak('Say use potion or use ability book.');
    }
}

// CRITICAL FIX: Add this line to allow game.js to import the class correctly
export default CommandProcessor;

