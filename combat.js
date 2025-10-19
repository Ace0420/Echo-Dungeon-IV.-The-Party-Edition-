import { abilities, classes, enemies } from './gameData.js';

export class Combat {
    constructor(game) {
        this.game = game;
        this.turnIndex = 0;
        this.targetIndex = 0;
        this.effects = [];
    }

    startCombat(enemy, secondEnemy = null) {
        this.game.phase = 'combat';
        this.game.a11y.setButtonState('combat');
        this.enemies = [enemy];
        if (secondEnemy && secondEnemy.health > 0) this.enemies.push(secondEnemy);
        this.game.combat = this;
        this.turnIndex = 0;
        this.targetIndex = 0;
        this.effects = [];

        const enemyNames = this.enemies.map(e => e.name).join(' and ');
        this.game.a11y.speak(`Combat begins! You face a ${enemyNames}! Say attack, defend, special, cast spell, use potion, or flee.`);
    }

    playerAttack() {
        const player = this.game.player;
        const target = this.enemies[this.targetIndex];
        
        let totalAttack = player.baseAttack;
        player.equippedRings.forEach(ringName => {
            const ringData = this.game.rings.find(r => r.name === ringName);
            if (ringData && ringData.stat === 'attack') {
                totalAttack += ringData.value;
            }
        });
        
        if (player.equippedAmulet) {
            const amuletData = this.game.amulets.find(a => a.name === player.equippedAmulet);
            if (amuletData && amuletData.stat === 'attack') {
                totalAttack += amuletData.value;
            }
        }
        
        const damage = Math.max(0, totalAttack - (target.defense || 0));
        target.health -= damage;
        this.game.a11y.speak(`You hit the ${target.name} for ${damage} damage! ${target.name} health: ${target.health}.`);

        if (target.health <= 0) {
            this.removeDefeatedEnemy();
            if (this.enemies.length === 0) {
                this.combatVictory();
                return;
            }
            this.targetIndex = 0;
        }

        setTimeout(() => this.enemyTurn(), 1000);
    }

    playerDefend() {
        const player = this.game.player;
        player.defense += 5;
        this.game.a11y.speak('You raise your guard, increasing your defense!');

        setTimeout(() => {
            player.defense -= 5;
            this.enemyTurn();
        }, 1000);
    }

    playerSpecial() {
        const player = this.game.player;
        const special = classes[player.class].special;

        if (player.mana < special.cost) {
            this.game.a11y.speak(`Not enough mana! ${special.name} requires ${special.cost} mana.`);
            return;
        }

        player.mana -= special.cost;
        const target = this.enemies[this.targetIndex];
        const damage = special.damage;

        target.health -= damage;
        this.game.a11y.speak(`You use ${special.name} on the ${target.name} for ${damage} damage! ${target.name} health: ${target.health}. Mana: ${player.mana}.`);

        if (target.health <= 0) {
            this.removeDefeatedEnemy();
            if (this.enemies.length === 0) {
                this.combatVictory();
                return;
            }
            this.targetIndex = 0;
        }

        setTimeout(() => this.enemyTurn(), 1000);
    }

    castSpell(spellName) {
        const player = this.game.player;
        const ability = abilities.find(a => a.name === spellName && player.learnedAbilities.includes(a.name));

        if (!ability) {
            this.game.a11y.speak('You don\'t know that spell or it\'s not available. Say cast followed by a learned spell.');
            return;
        }

        if (player.mana < ability.cost) {
            this.game.a11y.speak(`Not enough mana! ${ability.name} requires ${ability.cost} mana.`);
            return;
        }

        player.mana -= ability.cost;
        const target = this.enemies[this.targetIndex];

        if (ability.type === 'damage') {
            const damage = ability.damage;
            target.health -= damage;
            this.game.a11y.speak(`You cast ${ability.name} for ${damage} damage! ${target.name} health: ${target.health}. Mana: ${player.mana}.`);
        } else if (ability.type === 'freeze') {
            const damage = ability.damage;
            target.health -= damage;
            this.effects.push({ target: target.name, type: 'freeze', turns: 1 });
            this.game.a11y.speak(`You cast ${ability.name} for ${damage} damage! The ${target.name} is frozen for 1 turn. Mana: ${player.mana}.`);
        } else if (ability.type === 'stun') {
            const damage = ability.damage;
            target.health -= damage;
            this.effects.push({ target: target.name, type: 'stun', turns: 1 });
            this.game.a11y.speak(`You cast ${ability.name} for ${damage} damage! The ${target.name} is stunned for 1 turn. Mana: ${player.mana}.`);
        } else if (ability.type === 'poison') {
            const damage = ability.damage;
            target.health -= damage;
            this.effects.push({ target: target.name, type: 'poison', turns: ability.duration, damage: 5 });
            this.game.a11y.speak(`You cast ${ability.name} for ${damage} damage! The ${target.name} is poisoned for ${ability.duration} turns. Mana: ${player.mana}.`);
        } else if (ability.type === 'aoe') {
            let messages = [`You cast ${ability.name}!`];
            this.enemies.forEach(enemy => {
                const damage = ability.damage;
                enemy.health -= damage;
                messages.push(`${ability.name} hits ${enemy.name} for ${damage} damage! ${enemy.name} health: ${enemy.health}.`);
            });
            this.game.a11y.speakSequence(messages);
            this.removeDefeatedEnemies();
            if (this.enemies.length === 0) {
                setTimeout(() => this.combatVictory(), 2000);
                return;
            }
        } else if (ability.type === 'sneak') {
            const damage = ability.damage;
            target.health -= damage;
            this.game.a11y.speak(`You use ${ability.name} for ${damage} damage! ${target.name} health: ${target.health}. The enemy cannot retaliate this turn. Mana: ${player.mana}.`);
            
            if (target.health <= 0) {
                this.removeDefeatedEnemy();
                if (this.enemies.length === 0) {
                    this.combatVictory();
                    return;
                }
                this.targetIndex = 0;
            }
            
            setTimeout(() => {
                this.applyEffects();
                this.game.a11y.speak('Your turn! Say attack, defend, special, cast spell, use potion, or flee.');
            }, 1000);
            return;
        }

        if (target.health <= 0) {
            this.removeDefeatedEnemy();
            if (this.enemies.length === 0) {
                this.combatVictory();
                return;
            }
            this.targetIndex = 0;
        }

        setTimeout(() => this.enemyTurn(), 1000);
    }

    enemyTurn() {
        this.applyEffects();

        const player = this.game.player;
        let allFrozenOrStunned = true;

        this.enemies.forEach(enemy => {
            const effect = this.effects.find(e => e.target === enemy.name && (e.type === 'freeze' || e.type === 'stun') && e.turns > 0);
            if (!effect) allFrozenOrStunned = false;
        });

        if (allFrozenOrStunned && this.enemies.length > 0) {
            this.game.a11y.speak('All enemies are frozen or stunned! Your turn. Say attack, defend, special, cast spell, use potion, or flee.');
            return;
        }

        let messages = [];
        let defeatedEnemies = [];

        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            
            if (enemy.health <= 0) {
                defeatedEnemies.push(i);
                continue;
            }

            const effect = this.effects.find(e => e.target === enemy.name && (e.type === 'freeze' || e.type === 'stun') && e.turns > 0);
            if (effect) {
                messages.push(`The ${enemy.name} is ${effect.type === 'freeze' ? 'frozen' : 'stunned'} and cannot act!`);
                continue;
            }

            if (enemy.regenerate) {
                const maxHealth = enemies[Object.keys(enemies).find(k => enemies[k].name === enemy.name)]?.health || enemy.health;
                const oldHealth = enemy.health;
                enemy.health = Math.min(enemy.health + enemy.regenerate, maxHealth);
                if (enemy.health > oldHealth) {
                    messages.push(`The ${enemy.name} regenerates ${enemy.health - oldHealth} health!`);
                }
            }

            let damage = Math.max(0, enemy.damage - player.defense);
            player.health -= damage;
            messages.push(`The ${enemy.name} attacks for ${damage} damage! Your health: ${player.health}.`);

            if (player.health <= 0) {
                this.game.a11y.speakSequence(messages, () => {
                    setTimeout(() => this.gameOver(), 1000);
                });
                return;
            }
        }

        for (let i = defeatedEnemies.length - 1; i >= 0; i--) {
            this.enemies.splice(defeatedEnemies[i], 1);
        }

        if (this.enemies.length === 0) {
            this.game.a11y.speakSequence(messages, () => {
                setTimeout(() => this.combatVictory(), 1000);
            });
            return;
        }

        this.game.a11y.speakSequence(messages, () => {
            setTimeout(() => this.nextTurn(), 500);
        });
    }

    applyEffects() {
        let messages = [];
        
        this.effects = this.effects.filter(effect => {
            const enemy = this.enemies.find(e => e.name === effect.target);
            if (!enemy || effect.turns <= 0) return false;

            if (effect.type === 'poison') {
                enemy.health -= effect.damage;
                messages.push(`Poison deals ${effect.damage} damage to ${effect.target}! ${effect.target} health: ${enemy.health}.`);
                if (enemy.health <= 0) {
                    messages.push(`The ${effect.target} is defeated!`);
                }
            }
            effect.turns--;
            return true;
        });

        if (messages.length > 0) {
            this.game.a11y.speakSequence(messages);
        }
    }

    removeDefeatedEnemy(targetName = null) {
        const index = targetName ? this.enemies.findIndex(e => e.name === targetName) : this.targetIndex;
        if (index >= 0 && this.enemies[index] && this.enemies[index].health <= 0) {
            this.game.a11y.speak(`The ${this.enemies[index].name} is defeated!`);
            this.enemies.splice(index, 1);
            this.targetIndex = Math.min(this.targetIndex, Math.max(0, this.enemies.length - 1));
        }
    }

    removeDefeatedEnemies() {
        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
    }

    nextTurn() {
        this.turnIndex++;
        if (this.turnIndex >= 3) this.turnIndex = 0;
        this.game.a11y.speak('Your turn! Say attack, defend, special, cast spell, use potion, or flee.');
    }

    attemptFlee() {
        const enemy = this.enemies[0];
        const fleeRoll = Math.random();
        const fleeChance = enemy.fleeChance ? enemy.fleeChance * 0.5 : 0.3;

        if (fleeRoll < fleeChance) {
            this.game.a11y.speak(`You successfully flee from combat!`);
            this.endCombat();
            setTimeout(() => this.game.describeRoom(), 1000);
        } else {
            this.game.a11y.speak(`You fail to flee! The enemies block your escape.`);
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    combatVictory() {
        const room = this.game.currentRoom;
        
        let totalGold = 0;
        let totalExp = 0;
        
        if (room.enemy) {
            totalGold += room.enemy.gold;
            totalExp += room.enemy.exp;
        }
        if (room.secondEnemy) {
            totalGold += room.secondEnemy.gold;
            totalExp += room.secondEnemy.exp;
        }

        const enemyCount = (room.enemy ? 1 : 0) + (room.secondEnemy ? 1 : 0);
        const xpMultiplier = enemyCount > 1 ? 1.5 : 1;
        const finalExp = Math.floor(totalExp * xpMultiplier);

        this.game.player.gold += totalGold;
        this.game.playerManager.gainExperience(finalExp);

        room.enemy = null;
        room.secondEnemy = null;
        
        this.endCombat();
        
        this.game.a11y.speak(`Victory! You gained ${finalExp} experience and ${totalGold} gold. Total gold: ${this.game.player.gold}.`);
        setTimeout(() => this.game.describeRoom(), 2000);
    }

    gameOver() {
        this.game.a11y.speak('You have been defeated! Game Over. Restarting...');
        this.endCombat();
        setTimeout(() => {
            this.game.needsClass = true;
            this.game.started = false;
            this.game.phase = 'init';
            this.game.initialized = false;
            this.game.a11y.setButtonState('');
            this.game.player = {
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
            this.game.a11y.speak("Game over! Choose your class: warrior, mage, or rogue.");
        }, 2000);
    }

    endCombat() {
        this.game.combat = null;
        this.game.phase = 'exploration';
        this.game.a11y.setButtonState('exploration');
        this.effects = [];
    }
              }
