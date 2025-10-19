import { classes, rings, amulets, abilities, equipment } from './gameData.js';

export class PlayerManager {
    constructor(game) {
        this.game = game;
    }

    selectClass(className) {
        const classData = classes[className];
        const player = this.game.player;
        
        player.class = className;
        player.health = classData.health;
        player.maxHealth = classData.maxHealth;
        player.mana = classData.mana;
        player.maxMana = classData.maxMana;
        player.gold = classData.gold;
        player.inventory = [...classData.items];
        player.equippedRings = [];
        player.learnedAbilities = [];
        player.equippedAmulet = '';
        
        player.weapon = classData.items.find(item => equipment.weapons.some(w => w.name === item)) || '';
        player.armor = classData.items.find(item => equipment.armor.some(a => a.name === item)) || '';
        player.shield = '';
        
        if (equipment.shields) {
            const foundShield = classData.items.find(item => equipment.shields.some(s => s.name === item));
            if (foundShield) {
                player.shield = foundShield;
            }
        }
        
        const weaponData = equipment.weapons.find(w => w.name === player.weapon);
        player.baseAttack = weaponData ? weaponData.attack : 15;
        
        const armorData = equipment.armor.find(a => a.name === player.armor);
        player.defense = armorData ? armorData.defense : 0;
        
        if (player.shield && equipment.shields) {
            const shieldData = equipment.shields.find(s => s.name === player.shield);
            if (shieldData) {
                player.defense += shieldData.defense;
            }
        }
        
        this.game.needsClass = false;
        this.game.started = true;
        this.game.phase = 'exploration';
        
        this.game.dungeonGenerator.generateDungeon();
        
        let messages = [
            `You are now a ${classData.name}.`,
            `Health: ${classData.health}.`,
            `Mana: ${classData.mana}.`,
            `Starting gold: ${classData.gold}.`
        ];

        if (player.weapon && player.armor) {
            messages.push(`Equipped: ${player.weapon} and ${player.armor}.`);
        }

        if (player.shield) {
            messages.push(`Shield: ${player.shield}.`);
        }

        messages.push(`Your adventure begins!`);
        
        this.game.a11y.speakSequence(messages, () => {
            setTimeout(() => this.game.describeRoom(), 1000);
        });
    }

    gainExperience(exp) {
        const player = this.game.player;
        let actualExp = exp;
        
        if (player.equippedAmulet && amulets.find(a => a.name === player.equippedAmulet)?.stat === 'expGain') {
            actualExp = Math.floor(exp * amulets.find(a => a.name === player.equippedAmulet).value);
        }
        
        player.experience += actualExp;
        
        if (player.experience >= player.experienceToNext) {
            this.levelUp();
        }
    }

    levelUp() {
        const player = this.game.player;
        player.level++;
        player.experience -= player.experienceToNext;
        player.experienceToNext = Math.floor(player.experienceToNext * 1.5);
        
        const healthGain = 20;
        const manaGain = 10;
        
        player.maxHealth += healthGain;
        player.health = player.maxHealth;
        player.maxMana += manaGain;
        player.mana = player.maxMana;
        
        this.game.a11y.speakSequence([
            `Level up! You are now level ${player.level}!`,
            `Max health increased by ${healthGain}!`,
            `Max mana increased by ${manaGain}!`,
            `Fully healed and restored!`
        ]);
    }

    equipRing(ringName) {
        const player = this.game.player;
        const ringIndex = player.inventory.findIndex(item => item === ringName);
        
        if (ringIndex === -1) {
            this.game.a11y.speak(`You do not have a ${ringName}.`);
            return;
        }

        if (player.equippedRings.length >= 10) {
            this.game.a11y.speak(`You already have 10 rings equipped. You must remove one first.`);
            return;
        }

        const ringData = rings.find(r => r.name === ringName);
        if (!ringData) {
            this.game.a11y.speak(`Error: Ring data not found.`);
            return;
        }

        const sameRingCount = player.equippedRings.filter(r => r === ringName).length;
        if (sameRingCount >= 2) {
            this.game.a11y.speak(`You can only equip up to 2 of the same ring.`);
            return;
        }

        player.inventory.splice(ringIndex, 1);
        player.equippedRings.push(ringName);

        if (ringData.stat === 'maxHealth') {
            player.maxHealth += ringData.value;
            player.health += ringData.value;
            this.game.a11y.speak(`You equip the ${ringName}. Your max health increased by ${ringData.value}!`);
        } else if (ringData.stat === 'maxMana') {
            player.maxMana += ringData.value;
            player.mana += ringData.value;
            this.game.a11y.speak(`You equip the ${ringName}. Your max mana increased by ${ringData.value}!`);
        } else if (ringData.stat === 'attack') {
            this.game.a11y.speak(`You equip the ${ringName}. Your attacks are now stronger!`);
        }
    }

    removeRing(ringName) {
        const player = this.game.player;
        const ringIndex = player.equippedRings.indexOf(ringName);
        
        if (ringIndex === -1) {
            this.game.a11y.speak(`You are not wearing a ${ringName}.`);
            return;
        }

        const ringData = rings.find(r => r.name === ringName);
        player.equippedRings.splice(ringIndex, 1);
        player.inventory.push(ringName);

        if (ringData.stat === 'maxHealth') {
            player.maxHealth -= ringData.value;
            player.health = Math.min(player.health, player.maxHealth);
            this.game.a11y.speak(`You remove the ${ringName}. Your max health decreased by ${ringData.value}!`);
        } else if (ringData.stat === 'maxMana') {
            player.maxMana -= ringData.value;
            player.mana = Math.min(player.mana, player.maxMana);
            this.game.a11y.speak(`You remove the ${ringName}. Your max mana decreased by ${ringData.value}!`);
        } else if (ringData.stat === 'attack') {
            this.game.a11y.speak(`You remove the ${ringName}. Your attacks are weaker!`);
        }
    }

    equipAmulet(amuletName) {
        const player = this.game.player;
        const amuletIndex = player.inventory.findIndex(item => item === amuletName);
        
        if (amuletIndex === -1) {
            this.game.a11y.speak(`You do not have the ${amuletName}.`);
            return;
        }

        if (player.equippedAmulet === amuletName) {
            this.game.a11y.speak(`You are already wearing the ${amuletName}.`);
            return;
        }

        const amuletData = amulets.find(a => a.name === amuletName);
        if (!amuletData) {
            this.game.a11y.speak(`Error: Amulet data not found.`);
            return;
        }

        if (player.equippedAmulet) {
            const oldAmulet = player.equippedAmulet;
            const oldAmuletData = amulets.find(a => a.name === oldAmulet);
            
            if (oldAmuletData.stat === 'maxHealth') {
                player.maxHealth -= oldAmuletData.value;
                player.health = Math.min(player.health, player.maxHealth);
            } else if (oldAmuletData.stat === 'maxMana') {
                player.maxMana -= oldAmuletData.value;
                player.mana = Math.min(player.mana, player.maxMana);
            }
            
            player.inventory.push(oldAmulet);
        }

        player.inventory.splice(amuletIndex, 1);
        player.equippedAmulet = amuletName;

        if (amuletData.stat === 'maxHealth') {
            player.maxHealth += amuletData.value;
            player.health += amuletData.value;
            this.game.a11y.speak(`You equip the ${amuletName}. Your max health increased by ${amuletData.value}!`);
        } else if (amuletData.stat === 'maxMana') {
            player.maxMana += amuletData.value;
            player.mana += amuletData.value;
            this.game.a11y.speak(`You equip the ${amuletName}. Your max mana increased by ${amuletData.value}!`);
        } else if (amuletData.stat === 'expGain') {
            this.game.a11y.speak(`You equip the ${amuletName}. You now gain 20% more experience!`);
        } else if (amuletData.stat === 'attack') {
            this.game.a11y.speak(`You equip the ${amuletName}. Your attack power increases by ${amuletData.value}!`);
        }
    }

    equipWeaponOrArmor(itemName) {
        const player = this.game.player;
        const weaponNames = equipment.weapons.map(w => w.name.toLowerCase());
        const armorNames = equipment.armor.map(a => a.name.toLowerCase());
        const shieldNames = equipment.shields ? equipment.shields.map(s => s.name.toLowerCase()) : [];
        
        let itemToEquip = null;
        let itemType = null;
        
        for (let item of player.inventory) {
            if (itemName.includes(item.toLowerCase())) {
                if (weaponNames.includes(item.toLowerCase())) {
                    itemToEquip = item;
                    itemType = 'weapon';
                    break;
                } else if (armorNames.includes(item.toLowerCase())) {
                    itemToEquip = item;
                    itemType = 'armor';
                    break;
                } else if (shieldNames.includes(item.toLowerCase())) {
                    itemToEquip = item;
                    itemType = 'shield';
                    break;
                }
            }
        }
        
        if (!itemToEquip) {
            this.game.a11y.speak('You do not have that equipment. Check your inventory.');
            return;
        }
        
        const itemIndex = player.inventory.indexOf(itemToEquip);
        playerusePotion(potionType) {
        const player = this.game.player;
        const idx = player.inventory.indexOf(potionType);
        
        if (idx === -1) {
            this.game.a11y.speak(`You do not have a ${potionType}.`);
            return;
        }
        
        player.inventory.splice(idx, 1);
        
        if (potionType === 'Health Potion') {
            const heal = 40;
            const oldHealth = player.health;
            player.health = Math.min(player.maxHealth, player.health + heal);
            const actualHeal = player.health - oldHealth;
            this.game.a11y.speak(`You drink a health potion and restore ${actualHeal} health. Health: ${player.health}.`, () => {
                if (this.game.combat) {
                    setTimeout(() => this.game.combat.enemyTurn(), 1000);
                }
            });
        } else if (potionType === 'Greater Health Potion') {
            const heal = 80;
            const oldHealth = player.health;
            player.health = Math.min(player.maxHealth, player.health + heal);
            const actualHeal = player.health - oldHealth;
            this.game.a11y.speak(`You drink a greater health potion and restore ${actualHeal} health. Health: ${player.health}.`, () => {
                if (this.game.combat) {
                    setTimeout(() => this.game.combat.enemyTurn(), 1000);
                }
            });
        } else if (potionType === 'Mana Potion') {
            const restore = 30;
            const oldMana = player.mana;
            player.mana = Math.min(player.maxMana, player.mana + restore);
            const actualRestore = player.mana - oldMana;
            this.game.a11y.speak(`You drink a mana potion and restore ${actualRestore} mana. Mana: ${player.mana}.`, () => {
                if (this.game.combat) {
                    setTimeout(() => this.game.combat.enemyTurn(), 1000);
                }
            });
        } else if (potionType === 'Greater Mana Potion') {
            const restore = 60;
            const oldMana = player.mana;
            player.mana = Math.min(player.maxMana, player.mana + restore);
            const actualRestore = player.mana - oldMana;
            this.game.a11y.speak(`You drink a greater mana potion and restore ${actualRestore} mana. Mana: ${player.mana}.`, () => {
                if (this.game.combat) {
                    setTimeout(() => this.game.combat.enemyTurn(), 1000);
                }
            });
        }
    }

    readBook(abilityName) {
        const player = this.game.player;
        const ability = abilities.find(ab => 
            ab.name === abilityName && 
            player.inventory.includes(ab.name) &&
            (ab.class === player.class || !ab.class)
        );

        if (!ability) {
            const abilityBooks = abilities.filter(ab => 
                player.inventory.includes(ab.name) && 
                (ab.class === player.class || !ab.class)
            );
            
            if (abilityBooks.length > 0) {
                this.game.a11y.speak(`You have: ${abilityBooks.map(ab => ab.name).join(', ')}. Say which one to read.`);
            } else {
                this.game.a11y.speak('You have no ability books to read. Find them in treasure chests.');
            }
            return;
        }

        if (player.learnedAbilities.includes(ability.name)) {
            this.game.a11y.speak(`You already know ${ability.name}.`);
            return;
        }

        const bookIndex = player.inventory.indexOf(ability.name);
        player.inventory.splice(bookIndex, 1);
        player.learnedAbilities.push(ability.name);

        this.game.a11y.speak(`You read the ancient tome and learn ${ability.name}! ${ability.description}. Say "cast ${ability.name}" in combat to use it.`);
    }

    meditate() {
        const player = this.game.player;
        
        if (this.game.combat) {
            this.game.a11y.speak('You cannot meditate during combat!');
            return;
        }
        
        const manaRestored = 25;
        const previousMana = player.mana;
        
        if (player.mana === player.maxMana) {
            this.game.a11y.speak('You are already at full mana.');
            return;
        }

        player.mana = Math.min(player.maxMana, player.mana + manaRestored);
        const actualRestored = player.mana - previousMana;

        this.game.a11y.speak(`You meditate and restore ${actualRestored} mana. Current mana: ${player.mana}.`);
    }

    characterStatus() {
        const player = this.game.player;
        const classData = classes[player.class];
        const special = classData.special;
        const specialInfo = special.type === 'damage' ? `Deals ${special.damage} damage.` : `Restores ${special.heal} health.`;
        const expNeeded = player.experienceToNext - player.experience;

        let messages = [
            `Level ${player.level} ${classData.name}.`,
            `Health: ${player.health} of ${player.maxHealth}.`,
            `Mana: ${player.mana} of ${player.maxMana}.`,
            `Attack: ${player.baseAttack}. Defense: ${player.defense}.`,
            `Experience: ${player.experience}. Need ${expNeeded} for next level.`,
            `Special ability: ${special.name}. Costs ${special.cost} mana. ${specialInfo}`,
            `Gold: ${player.gold}.`,
        ];

        if (player.learnedAbilities.length > 0) {
            messages.push(`Learned abilities: ${player.learnedAbilities.join(', ')}.`);
        }

        if (player.equippedRings.length > 0) {
            messages.push(`Equipped rings: ${player.equippedRings.join(', ')}.`);
        } else {
            messages.push(`No rings equipped.`);
        }

        if (player.equippedAmulet) {
            messages.push(`Equipped amulet: ${player.equippedAmulet}.`);
        } else {
            messages.push(`No amulet equipped.`);
        }

        this.game.a11y.speakSequence(messages);
    }

    listInventory() {
        const player = this.game.player;
        
        if (player.inventory.length === 0 && player.equippedRings.length === 0) {
            this.game.a11y.speak(`Empty inventory. Gold: ${player.gold}.`);
        } else {
            const healthPotions = player.inventory.filter(i => i === 'Health Potion').length;
            const greaterHealthPotions = player.inventory.filter(i => i === 'Greater Health Potion').length;
            const manaPotions = player.inventory.filter(i => i === 'Mana Potion').length;
            const greaterManaPotions = player.inventory.filter(i => i === 'Greater Mana Potion').length;
            
            const ringsList = player.inventory.filter(i => rings.some(r => r.name === i));
            const ringCounts = {};
            ringsList.forEach(ring => {
                ringCounts[ring] = (ringCounts[ring] || 0) + 1;
            });
            
            const amuletsList = player.inventory.filter(i => amulets.some(a => a.name === i));
            const amuletCounts = {};
            amuletsList.forEach(amulet => {
                amuletCounts[amulet] = (amuletCounts[amulet] || 0) + 1;
            });
            
            const abilityBooks = player.inventory.filter(i => abilities.some(a => a.name === i));
            const otherItems = player.inventory.filter(i => 
                i !== 'Health Potion' && 
                i !== 'Greater Health Potion' &&
                i !== 'Mana Potion' && 
                i !== 'Greater Mana Potion' &&
                !ringsList.includes(i) && 
                !amuletsList.includes(i) &&
                !abilityBooks.includes(i)
            );
            
            const messages = ['Inventory:'];
            if (healthPotions > 0) messages.push(`${healthPotions} health potion${healthPotions > 1 ? 's' : ''}.`);
            if (greaterHealthPotions > 0) messages.push(`${greaterHealthPotions} greater health potion${greaterHealthPotions > 1 ? 's' : ''}.`);
            if (manaPotions > 0) messages.push(`${manaPotions} mana potion${manaPotions > 1 ? 's' : ''}.`);
            if (greaterManaPotions > 0) messages.push(`${greaterManaPotions} greater mana potion${greaterManaPotions > 1 ? 's' : ''}.`);
            if (abilityBooks.length > 0) messages.push(`Unread books: ${abilityBooks.join(', ')}.`);
            
            const unequippedRingsList = Object.entries(ringCounts).map(([ring, count]) => 
                count > 1 ? `${ring} x${count}` : ring
            );
            if (unequippedRingsList.length > 0) messages.push(`Unequipped rings: ${unequippedRingsList.join(', ')}.`);
            
            if (player.equippedRings.length > 0) {
                messages.push(`Equipped rings: ${player.equippedRings.join(', ')}.`);
            }
            
            const unequippedAmuletsList = Object.entries(amuletCounts).map(([amulet, count]) => 
                count > 1 ? `${amulet} x${count}` : amulet
            );
            if (unequippedAmuletsList.length > 0) messages.push(`Unequipped amulets: ${unequippedAmuletsList.join(', ')}.`);
            
            if (player.equippedAmulet) messages.push(`Equipped amulet: ${player.equippedAmulet}.`);
            if (otherItems.length > 0) messages.push(`Equipment: ${otherItems.join(', ')}.`);
            messages.push(`Gold: ${player.gold}.`);
            
            this.game.a11y.speakSequence(messages);
        }
    }
}
