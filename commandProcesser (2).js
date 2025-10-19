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
        if (command.includes('attack') || command.includes('fight')) {
            this.game.combat.playerAttack();
        } else if (command.includes('defend') || command.includes('block') || command.includes('guard')) {
            this.game.combat.playerDefend();
        } else if (command.includes('special') || command.includes('ability')) {
            this.game.combat.playerSpecial();
        } else if (command.includes('cast') || command.includes('spell')) {
            this.processCastSpell(command);
        } else if (command.includes('potion') || command.includes('use') || command.includes('drink') || command.includes('heal')) {
            this.processPotionCommand(command);
        } else if (command.includes('flee') || command.includes('run') || command.includes('escape')) {
            this.game.combat.attemptFlee();
        } else {
            this.game.a11y.speak('Say attack, defend, special, cast spell, use potion, or flee.');
        }
    }

    processCastSpell(command) {
        let spellName = null;
        
        if (command.includes('icy') || command.includes('blast') || command.includes('freeze')) {
            spellName = 'Icy Blast';
        } else if (command.includes('shield') || command.includes('bash')) {
            spellName = 'Shield Bash';
        } else if (command.includes('poison') || command.includes('blade')) {
            spellName = 'Poison Blade';
        } else if (command.includes('chain') || command.includes('lightning')) {
            spellName = 'Chain Lightning';
        } else if (command.includes('arcane') || command.includes('missile')) {
            spellName = 'Arcane Missiles';
        } else if (command.includes('whirlwind')) {
            spellName = 'Whirlwind';
        } else if (command.includes('shadow') || command.includes('strike')) {
            spellName = 'Shadow Strike';
        }

        if (spellName) {
            this.game.combat.castSpell(spellName);
        } else {
            this.game.combat.castSpell('');
        }
    }

    processExplorationCommand(command) {
        if (command.includes('status') || command.includes('stats') || command.includes('check')) {
            this.game.playerManager.characterStatus();
        } else if (command.includes('inventory') || command.includes('items') || command.includes('bag')) {
            this.game.playerManager.listInventory();
        } else if (command.includes('commands') || command.includes('what can i')) {
            this.listCommands();
        } else if (command.includes('hint') || command.includes('help me')) {
            this.giveHint();
        } else if (command.includes('potion') || command.includes('use') || command.includes('drink') || command.includes('heal')) {
            this.processPotionCommand(command);
        } else if (command.includes('north') || command.includes('forward')) {
            this.game.move('north');
        } else if (command.includes('south') || command.includes('back')) {
            this.game.move('south');
        } else if (command.includes('east') || command.includes('right')) {
            this.game.move('east');
        } else if (command.includes('west') || command.includes('left')) {
            this.game.move('west');
        } else if (command.includes('meditate') || command.includes('rest')) {
            this.game.playerManager.meditate();
        } else if (command.includes('look') || command.includes('around') || command.includes('where')) {
            this.game.describeRoom();
        } else if (command.includes('search') || command.includes('examine')) {
            this.game.searchRoom();
        } else if (command.includes('open chest') || command.includes('chest') || command.includes('loot')) {
            this.game.openChest();
        } else if (command.includes('fountain') || command.includes('drink water')) {
            this.game.useFountain();
        } else if (command.includes('stairs') || command.includes('go down') || command.includes('descend')) {
            this.game.useStairs();
        } else if (command.includes('merchant') || command.includes('shop') || command.includes('trade')) {
            this.game.talkToMerchant();
        } else if (command.includes('wear ring') || command.includes('equip ring') || command.includes('put on ring')) {
            this.processEquipRing(command);
        } else if (command.includes('equip amulet') || command.includes('wear amulet')) {
            this.processEquipAmulet(command);
        } else if (command.includes('equip') || command.includes('wear')) {
            this.game.playerManager.equipWeaponOrArmor(command);
        } else if (command.includes('read book') || command.includes('read') || command.includes('learn')) {
            this.processReadBook(command);
        } else if (command.includes('use lockpicks') || command.includes('lockpick')) {
            this.game.useLockpicks();
        } else if (command.includes('help')) {
            this.showHelp();
        } else {
            this.game.a11y.speak('Unknown command. Say help for options.');
        }
    }

    processEquipRing(command) {
        const ringName = command.includes('vitality') || command.includes('health') ? 'Ring of Vitality' :
                         command.includes('minor mana') || command.includes('mana ring') ? 'Ring of Minor Mana' :
                         command.includes('protection') ? 'Ring of Protection' :
                         command.includes('strength') ? 'Ring of Strength' :
                         command.includes('wisdom') ? 'Ring of Wisdom' :
                         command.includes('titan') ? 'Ring of the Titan' :
                         command.includes('arcane power') ? 'Ring of Arcane Power' :
                         command.includes('berserker') ? 'Ring of the Berserker' : null;

        if (!ringName) {
            const availableRings = this.game.player.inventory.filter(item => 
                rings.some(r => r.name === item)
            );
            if (availableRings.length > 0) {
                this.game.a11y.speak(`You have: ${availableRings.join(', ')}. Say which one to equip.`);
            } else {
                this.game.a11y.speak('You have no rings. Find them in treasure chests or by searching rooms.');
            }
            return;
        }

        this.game.playerManager.equipRing(ringName);
    }

    processEquipAmulet(command) {
        const amuletName = command.includes('vitality') ? 'Amulet of Vitality' :
                           command.includes('amulet of mana') || (command.includes('mana') && !command.includes('archmage')) ? 'Amulet of Mana' :
                           command.includes('experience') ? 'Amulet of Experience' :
                           command.includes('archmage') ? 'Amulet of the Archmage' :
                           command.includes('titan') ? 'Amulet of the Titan' :
                           command.includes('power') ? 'Amulet of Power' : null;

        if (!amuletName) {
            const availableAmulets = this.game.player.inventory.filter(item => 
                amulets.some(a => a.name === item)
            );
            if (availableAmulets.length > 0) {
                this.game.a11y.speak(`You have: ${availableAmulets.join(', ')}. Say which one to equip.`);
            } else {
                this.game.a11y.speak('You have no amulets. Find them in treasure chests or by searching rooms.');
            }
            return;
        }

        this.game.playerManager.equipAmulet(amuletName);
    }

    processReadBook(command) {
        let abilityName = null;
        
        if (command.includes('icy') || command.includes('blast') || command.includes('freeze')) {
            abilityName = 'Icy Blast';
        } else if (command.includes('shield') || command.includes('bash')) {
            abilityName = 'Shield Bash';
        } else if (command.includes('poison') || command.includes('blade')) {
            abilityName = 'Poison Blade';
        } else if (command.includes('chain') || command.includes('lightning')) {
            abilityName = 'Chain Lightning';
        } else if (command.includes('arcane') || command.includes('missile')) {
            abilityName = 'Arcane Missiles';
        } else if (command.includes('whirlwind')) {
            abilityName = 'Whirlwind';
        } else if (command.includes('shadow') || command.includes('strike')) {
            abilityName = 'Shadow Strike';
        }

        this.game.playerManager.readBook(abilityName || '');
    }

    processPotionCommand(command) {
        let potionType = null;
        
        if (command.includes('greater health')) {
            potionType = 'Greater Health Potion';
        } else if (command.includes('greater mana')) {
            potionType = 'Greater Mana Potion';
        } else if (command.includes('health') || command.includes('heal')) {
            potionType = 'Health Potion';
        } else if (command.includes('mana')) {
            potionType = 'Mana Potion';
        }
        
        if (!potionType) {
            const healthIdx = this.game.player.inventory.indexOf('Health Potion');
            const manaIdx = this.game.player.inventory.indexOf('Mana Potion');
            
            if (healthIdx !== -1 && this.game.player.health < this.game.player.maxHealth) {
                potionType = 'Health Potion';
            } else if (manaIdx !== -1 && this.game.player.mana < this.game.player.maxMana) {
                potionType = 'Mana Potion';
            } else if (healthIdx !== -1) {
                potionType = 'Health Potion';
            } else if (manaIdx !== -1) {
                potionType = 'Mana Potion';
            }
        }
        
        if (potionType) {
            this.game.playerManager.usePotion(potionType);
        } else {
            this.game.a11y.speak('You have no potions.');
        }
    }

    processMerchantCommand(command) {
        if (command.includes('leave') || command.includes('exit') || command.includes('close')) {
            this.game.merchantOpen = false;
            this.game.a11y.speak('You leave the merchant.');
        } else if (command.includes('buy')) {
            this.game.buyFromMerchant(command);
        } else if (command.includes('sell')) {
            this.game.sellToMerchant(command);
        } else if (command.includes('what') || command.includes('wares') || command.includes('stock')) {
            this.game.listMerchantWares();
        } else {
            this.game.a11y.speak('Say buy, sell, what do you have, or leave.');
        }
    }

    showHelp() {
        if (this.game.phase === 'combat') {
            this.game.a11y.speak('Combat commands: attack, defend, special, cast spell, use potion, or flee.');
        } else {
            this.game.a11y.speak('Exploration commands: north, south, east, west, look around, search, open chest, drink fountain, merchant, meditate, wear ring, equip amulet, read book, use potion, status, inventory, save game, or load game.');
        }
    }

    listCommands() {
        if (this.game.phase === 'combat') {
            this.game.a11y.speakSequence([
                'Combat commands:',
                'Attack. Deal damage.',
                'Defend. Reduce incoming damage.',
                'Special. Use your class ability.',
                'Cast spell. Use a learned ability.',
                'Use potion. Heal or restore mana.',
                'Flee. Try to escape.'
            ]);
        } else {
            this.game.a11y.speakSequence([
                'Movement: north, south, east, west, go down stairs.',
                'Actions: look around, search, open chest, drink fountain, merchant, meditate, wear ring, equip amulet, read book, use potion.',
                'Info: status, inventory, hint.',
                'System: save game, load game, commands, help.'
            ]);
        }
    }

    giveHint() {
        if (this.game.phase === 'combat') {
            if (this.game.player.health < 30) {
                this.game.a11y.speak('Your health is low. Consider using a health potion or defending.');
            } else if (this.game.player.mana >= classes[this.game.player.class].special.cost) {
                this.game.a11y.speak(`You have enough mana for ${classes[this.game.player.class].special.name}.`);
            } else {
                this.game.a11y.speak('Try attacking or defending based on your health.');
            }
        } else {
            const room = this.game.currentRoom;
            if (room.type === 'stairs') {
                this.game.a11y.speak('A staircase is here. Say "go down stairs" to descend to the next level.');
            } else if (room.type === 'merchant') {
                this.game.a11y.speak('A merchant is here. Say "merchant" to trade goods.');
            } else if (room.type === 'fountain' && !room.fountainUsed) {
                this.game.a11y.speak('There is a magical fountain here. Say "drink fountain" for full healing.');
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
}

export default CommandProcessor;
