import { roomTypes, enemies, rings, amulets, abilities, treasures } from './gameData.js';

export class DungeonGenerator {
    constructor(game) {
        this.game = game;
    }

    generateDungeon() {
        const size = this.game.dungeon.size;
        const currentLevel = this.game.dungeon.currentLevel;
        this.game.dungeon.grid = {};
        
        const centerX = 5; 
        const centerY = 5;
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const key = `${x},${y}`;
                const distanceX = Math.abs(x - centerX);
                const distanceY = Math.abs(y - centerY);
                const distanceFromCenter = distanceX + distanceY;
                
                let roomData = { visited: false, searched: false, hasChest: false, fountainUsed: false };

                if (x === centerX && y === centerY) {
                    this.game.dungeon.grid[key] = { 
                        type: 'entrance', 
                        description: this.getRandomDescription('entrance'),
                        ...roomData
                    };
                } else if (x === size - 1 && y === size - 1) { 
                    let bossEnemy = this.scaleEnemyForLevel(enemies.dragon, currentLevel);
                    
                    this.game.dungeon.grid[key] = {
                        type: 'boss',
                        description: this.getRandomDescription('boss'),
                        ...roomData,
                        hasChest: true,
                        enemy: bossEnemy
                    };
                } else if (x === size - 1 && y === size - 2) { 
                    this.game.dungeon.grid[key] = { 
                        type: 'stairs', 
                        description: this.getRandomDescription('stairs'),
                        ...roomData 
                    };
                } else {
                    this.generateRegularRoom(key, distanceFromCenter, currentLevel, roomData);
                }
            }
        }
        
        if (Math.random() < 0.3) {
            this.game.dungeon.hasSecretRoom = true;
        }
        
        this.game.player.position = { x: 5, y: 5 };
        const key = `${this.game.player.position.x},${this.game.player.position.y}`;
        this.game.currentRoom = this.game.dungeon.grid[key];
    }

    generateRegularRoom(key, distanceFromCenter, currentLevel, roomData) {
        let roomType = null;
        let enemyType = null;
        
        const roll = Math.random();
        const isElite = currentLevel >= 2 && Math.random() < 0.15;
        
        if (Math.random() < 0.1) {
            this.game.dungeon.grid[key] = {
                type: 'merchant',
                description: this.getRandomDescription('merchant'),
                ...roomData
            };
            return;
        }
        
        if (distanceFromCenter >= 7) {
            this.generateFarRoom(key, roll, currentLevel, isElite, roomData);
        } else if (distanceFromCenter >= 4) {
            this.generateMidRoom(key, roll, currentLevel, isElite, roomData);
        } else {
            this.generateNearRoom(key, roll, currentLevel, isElite, roomData);
        }
    }

    generateFarRoom(key, roll, currentLevel, isElite, roomData) {
        if (roll < 0.5) {
            let enemyType;
            if (currentLevel >= 5) {
                if (Math.random() < 0.4) {
                    enemyType = Math.random() < 0.5 ? 'hydra' : 'phoenixGuardian';
                } else if (isElite) {
                    enemyType = 'archDemon';
                } else {
                    enemyType = Math.random() < 0.5 ? 'demon' : 'vampire';
                }
            } else if (isElite) {
                enemyType = currentLevel >= 3 ? 'archDemon' : 'elderTroll';
            } else if (currentLevel >= 3) {
                enemyType = Math.random() < 0.5 ? 'demon' : 'vampire';
            } else {
                enemyType = Math.random() < 0.5 ? 'troll' : 'wraith';
            }
            this.createEnemyRoom(key, enemyType, currentLevel, roomData);
        } else if (roll < 0.7) {
            roomData.hasChest = true;
            this.game.dungeon.grid[key] = {
                type: 'treasure',
                description: this.getRandomDescription('treasure'),
                ...roomData
            };
        } else if (roll < 0.8) {
            this.game.dungeon.grid[key] = {
                type: 'fountain',
                description: this.getRandomDescription('fountain'),
                ...roomData
            };
        } else {
            roomData.hasChest = Math.random() < 0.3;
            this.game.dungeon.grid[key] = {
                type: 'crypt',
                description: this.getRandomDescription('crypt'),
                ...roomData
            };
        }
    }

    generateMidRoom(key, roll, currentLevel, isElite, roomData) {
        if (roll < 0.45) {
            let enemyType;
            if (currentLevel >= 5) {
                if (Math.random() < 0.3) {
                    enemyType = 'lichKing';
                } else if (isElite) {
                    enemyType = 'elderTroll';
                } else {
                    enemyType = Math.random() < 0.5 ? 'wraith' : 'troll';
                }
            } else if (isElite) {
                enemyType = currentLevel >= 2 ? 'ancientWraith' : 'orcChieftain';
            } else if (currentLevel >= 2) {
                enemyType = Math.random() < 0.5 ? 'wraith' : 'troll';
            } else {
                enemyType = Math.random() < 0.6 ? 'orc' : 'skeleton';
            }
            this.createEnemyRoom(key, enemyType, currentLevel, roomData);
        } else if (roll < 0.65) {
            roomData.hasChest = true;
            this.game.dungeon.grid[key] = {
                type: 'treasure',
                description: this.getRandomDescription('treasure'),
                ...roomData
            };
        } else if (roll < 0.75) {
            this.game.dungeon.grid[key] = {
                type: 'trap',
                description: this.getRandomDescription('trap'),
                ...roomData
            };
        } else if (roll < 0.8) {
            this.game.dungeon.grid[key] = {
                type: 'fountain',
                description: this.getRandomDescription('fountain'),
                ...roomData
            };
        } else {
            roomData.hasChest = Math.random() < 0.2;
            this.game.dungeon.grid[key] = {
                type: 'empty',
                description: this.getRandomDescription('empty'),
                ...roomData
            };
        }
    }

    generateNearRoom(key, roll, currentLevel, isElite, roomData) {
        if (roll < 0.35) {
            let enemyType;
            if (isElite) {
                enemyType = 'orcChieftain';
            } else if (currentLevel >= 2) {
                enemyType = Math.random() < 0.5 ? 'orc' : 'skeleton';
            } else {
                enemyType = 'goblin';
            }
            this.createEnemyRoom(key, enemyType, currentLevel, roomData);
        } else if (roll < 0.55) {
            roomData.hasChest = true;
            this.game.dungeon.grid[key] = {
                type: 'treasure',
                description: this.getRandomDescription('treasure'),
                ...roomData
            };
        } else if (roll < 0.6) {
            this.game.dungeon.grid[key] = {
                type: 'fountain',
                description: this.getRandomDescription('fountain'),
                ...roomData
            };
        } else {
            roomData.hasChest = Math.random() < 0.15;
            this.game.dungeon.grid[key] = {
                type: 'empty',
                description: this.getRandomDescription('empty'),
                ...roomData
            };
        }
    }

    createEnemyRoom(key, enemyType, currentLevel, roomData) {
        let scaledEnemy = this.scaleEnemyForLevel(enemies[enemyType], currentLevel);
        
        if (currentLevel >= 3 && Math.random() < 0.2) {
            this.game.dungeon.grid[key] = {
                type: 'enemy',
                description: this.getRandomDescription('enemy') + ' Two creatures lurk here!',
                ...roomData,
                enemy: scaledEnemy,
                secondEnemy: this.scaleEnemyForLevel(enemies[enemyType], currentLevel)
            };
        } else {
            this.game.dungeon.grid[key] = {
                type: 'enemy',
                description: this.getRandomDescription('enemy'),
                ...roomData,
                enemy: scaledEnemy
            };
        }
    }

    scaleEnemyForLevel(enemy, level) {
        const scaleFactor = 1 + ((level - 1) * 0.3);
        return {
            ...enemy,
            health: Math.floor(enemy.health * scaleFactor),
            damage: Math.floor(enemy.damage * scaleFactor),
            gold: Math.floor(enemy.gold * scaleFactor),
            exp: Math.floor(enemy.exp * scaleFactor),
            regenerate: enemy.regenerate
        };
    }

    getRandomDescription(roomType) {
        const descriptions = roomTypes[roomType].descriptions;
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    determineLoot() {
        const roll = Math.random();
        const level = this.game.dungeon.currentLevel;
        
        if (roll < 0.30) {
            // Gold (30% chance)
            const baseGold = 10 + (level * 5);
            const goldAmount = Math.floor(baseGold + Math.random() * baseGold);
            return { type: 'gold', amount: goldAmount };
        } else if (roll < 0.50) {
            // Health or Mana Potion (20% chance)
            const potions = level >= 3 
                ? ['Health Potion', 'Mana Potion', 'Greater Health Potion', 'Greater Mana Potion']
                : ['Health Potion', 'Mana Potion'];
            const potion = potions[Math.floor(Math.random() * potions.length)];
            return { type: 'item', item: potion };
        } else if (roll < 0.65) {
            // Ring (15% chance)
            const ring = rings[Math.floor(Math.random() * rings.length)];
            return { type: 'ring', item: ring.name };
        } else if (roll < 0.75) {
            // Amulet (10% chance)
            const amulet = amulets[Math.floor(Math.random() * amulets.length)];
            return { type: 'amulet', item: amulet.name };
        } else if (roll < 0.85) {
            // Ability book (10% chance)
            const ability = abilities[Math.floor(Math.random() * abilities.length)];
            return { type: 'item', item: ability.name };
        } else {
            // Treasure (15% chance)
            const treasure = treasures[Math.floor(Math.random() * treasures.length)];
            return { type: 'item', item: treasure.name };
        }
    }
}
