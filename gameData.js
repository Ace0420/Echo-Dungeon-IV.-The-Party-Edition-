import { roomTypes, enemies, treasures, merchantItems, rings, amulets } from './gameData.js';
import { Accessibility } from './accessibility.js';
import { DungeonGenerator } from './dungeonGenerator.js';
import { PlayerManager } from './playerManager.js';
import { Combat } from './combat.js';
import CommandProcessor from './commandProcessor.js';
export const classes = {
    warrior: {
        name: 'Warrior',
        level: 1,
        experience: 0,
        experienceToNext: 100,
        health: 120,
        maxHealth: 120,
        mana: 30,
        maxMana: 30,
        gold: 50,
        items: ['Steel Sword', 'Health Potion', 'Health Potion', 'Chainmail', 'Iron Shield'],
        special: { name: 'Power Strike', damage: 50, cost: 15, type: 'damage' },
        equippedRings: []
    },
    mage: {
        name: 'Mage',
        level: 1,
        experience: 0,
        experienceToNext: 100,
        health: 80,
        maxHealth: 80,
        mana: 100,
        maxMana: 100,
        gold: 75,
        items: ['Mystic Staff', 'Mana Potion', 'Health Potion', 'Enchanted Robes'],
        special: { name: 'Fireball', damage: 100, cost: 20, type: 'damage' },
        equippedRings: []
    },
    rogue: {
        name: 'Rogue',
        level: 1,
        experience: 0,
        experienceToNext: 100,
        health: 100,
        maxHealth: 100,
        mana: 60,
        maxMana: 60,
        gold: 100,
        items: ['Shadow Daggers', 'Lockpicks', 'Health Potion', 'Shadow Leather'],
        special: { name: 'Backstab', damage: 35, cost: 15, type: 'damage' },
        equippedRings: []
    }
};

export const partyOrder = ['warrior', 'mage', 'rogue'];

export const equipment = {
    weapons: [
        { name: 'Steel Sword', attack: 8, class: 'warrior', value: 100 },
        { name: 'Mystic Staff', attack: 10, class: 'mage', value: 150 },
        { name: 'Shadow Daggers', attack: 10, class: 'rogue', value: 120 },
        { name: 'Legendary Greatsword', attack: 15, class: 'warrior', value: 300 },
        { name: 'Archmage Staff', attack: 18, class: 'mage', value: 350 },
        { name: 'Vorpal Daggers', attack: 16, class: 'rogue', value: 320 },
        { name: 'Demon Slayer Blade', attack: 20, class: 'warrior', value: 500 },
        { name: 'Staff of the Cosmos', attack: 25, class: 'mage', value: 600 },
        { name: 'Ethereal Blades', attack: 22, class: 'rogue', value: 550 }
    ],
    armor: [
        { name: 'Chainmail', defense: 8, class: 'warrior', value: 100 },
        { name: 'Enchanted Robes', defense: 5, class: 'mage', value: 120 },
        { name: 'Shadow Leather', defense: 6, class: 'rogue', value: 110 },
        { name: 'Dragonscale Plate', defense: 15, class: 'warrior', value: 350 },
        { name: 'Arcane Vestments', defense: 12, class: 'mage', value: 380 },
        { name: 'Phantom Suit', defense: 13, class: 'rogue', value: 360 },
        { name: 'Titanium Fortress', defense: 22, class: 'warrior', value: 550 },
        { name: 'Celestial Robes', defense: 18, class: 'mage', value: 600 },
        { name: 'Void Cloak', defense: 20, class: 'rogue', value: 580 }
    ],
    shields: [
        { name: 'Iron Shield', defense: 5, class: 'warrior', value: 80 },
        { name: 'Tower Shield', defense: 10, class: 'warrior', value: 250 },
        { name: 'Aegis Shield', defense: 15, class: 'warrior', value: 450 }
    ]
};

export const abilities = [
    { name: 'Icy Blast', damage: 70, cost: 20, type: 'freeze', description: 'Deals damage and freezes enemy for 1 turn', class: 'mage' },
    { name: 'Shield Bash', damage: 60, cost: 20, type: 'stun', description: 'Stun enemy for one turn', class: 'warrior' },
    { name: 'Poison Blade', damage: 30, cost: 20, type: 'poison', duration: 3, description: 'Poison damages 5 per turn for 3 turns', class: 'rogue' },
    { name: 'Chain Lightning', damage: 75, cost: 30, type: 'damage', description: 'Devastating lightning attack', class: 'mage' },
    { name: 'Arcane Missiles', damage: 65, cost: 15, type: 'aoe', description: 'Magic missiles hit all enemies', class: 'mage' },
    { name: 'Whirlwind', damage: 50, cost: 25, type: 'aoe', description: 'Spin attack hitting all enemies', class: 'warrior' },
    { name: 'Shadow Strike', damage: 40, cost: 20, type: 'sneak', description: 'Strike from shadows without enemy retaliation', class: 'rogue' }
];

export const rings = [
    { name: 'Ring of Vitality', effect: '+10 Max Health', stat: 'maxHealth', value: 10 },
    { name: 'Ring of Minor Mana', effect: '+10 Max Mana', stat: 'maxMana', value: 10 },
    { name: 'Ring of Protection', effect: '+5 Max Health', stat: 'maxHealth', value: 5 },
    { name: 'Ring of Strength', effect: '+2 Attack Damage', stat: 'attack', value: 2 },
    { name: 'Ring of Wisdom', effect: '+5 Max Mana', stat: 'maxMana', value: 5 },
    { name: 'Ring of the Titan', effect: '+20 Max Health', stat: 'maxHealth', value: 20 },
    { name: 'Ring of Arcane Power', effect: '+15 Max Mana', stat: 'maxMana', value: 15 },
    { name: 'Ring of the Berserker', effect: '+4 Attack Damage', stat: 'attack', value: 4 }
];

export const amulets = [
    { name: 'Amulet of Vitality', effect: '+15 Max Health', stat: 'maxHealth', value: 15 },
    { name: 'Amulet of Mana', effect: '+15 Max Mana', stat: 'maxMana', value: 15 },
    { name: 'Amulet of Experience', effect: '+20% Experience Gain', stat: 'expGain', value: 1.2 },
    { name: 'Amulet of the Archmage', effect: '+30 Max Mana', stat: 'maxMana', value: 30 },
    { name: 'Amulet of the Titan', effect: '+30 Max Health', stat: 'maxHealth', value: 30 },
    { name: 'Amulet of Power', effect: '+5 Attack', stat: 'attack', value: 5 }
];

export const enemies = {
    goblin: { name: 'Goblin', health: 30, damage: 8, gold: 5, exp: 15, fleeChance: 0.8 },
    skeleton: { name: 'Skeleton', health: 40, damage: 10, gold: 8, exp: 20, fleeChance: 0.7 },
    orc: { name: 'Orc', health: 60, damage: 15, gold: 12, exp: 30, fleeChance: 0.5 },
    wraith: { name: 'Wraith', health: 50, damage: 18, gold: 15, exp: 35, fleeChance: 0.6 },
    troll: { name: 'Troll', health: 80, damage: 20, gold: 20, exp: 45, fleeChance: 0.4, regenerate: 5 },
    dragon: { name: 'Dragon', health: 150, damage: 30, gold: 50, exp: 100, fleeChance: 0.1 },
    demon: { name: 'Demon', health: 120, damage: 28, gold: 45, exp: 80, fleeChance: 0.3 },
    vampire: { name: 'Vampire', health: 100, damage: 25, gold: 40, exp: 70, fleeChance: 0.4, regenerate: 8 },
    orcChieftain: { name: 'Orc Chieftain', health: 100, damage: 22, gold: 25, exp: 50, fleeChance: 0.3 },
    ancientWraith: { name: 'Ancient Wraith', health: 90, damage: 26, gold: 30, exp: 60, fleeChance: 0.4 },
    elderTroll: { name: 'Elder Troll', health: 150, damage: 28, gold: 40, exp: 75, fleeChance: 0.2, regenerate: 10 },
    archDemon: { name: 'Arch Demon', health: 180, damage: 35, gold: 70, exp: 120, fleeChance: 0.2 },
    hydra: { name: 'Hydra', health: 140, damage: 30, gold: 55, exp: 90, fleeChance: 0.3, regenerate: 12 },
    phoenixGuardian: { name: 'Phoenix Guardian', health: 130, damage: 32, gold: 60, exp: 95, fleeChance: 0.3, regenerate: 15 },
    lichKing: { name: 'Lich King', health: 160, damage: 38, gold: 80, exp: 130, fleeChance: 0.1, regenerate: 10 }
};

export const treasures = [
    { name: 'Sapphire Gem', value: 50 },
    { name: 'Ruby Gem', value: 75 },
    { name: 'Diamond', value: 100 },
    { name: 'Emerald', value: 60 },
    { name: 'Ancient Coin Collection', value: 40 },
    { name: 'Golden Chalice', value: 80 },
    { name: 'Silver Crown', value: 90 },
    { name: 'Enchanted Amulet', value: 120 }
];

export const merchantItems = [
    { name: 'Health Potion', type: 'potion', price: 30 },
    { name: 'Mana Potion', type: 'potion', price: 25 },
    { name: 'Greater Health Potion', type: 'potion', price: 60, healing: 80 },
    { name: 'Greater Mana Potion', type: 'potion', price: 50, mana: 60 }
];

export const roomTypes = {
    entrance: { 
        descriptions: [
            'the grand entrance hall. Torches flicker on ancient stone walls.',
            'the entrance chamber. A faded tapestry hangs on the north wall.',
            'the starting hall. Cobwebs drape from vaulted ceilings above.'
        ], 
        hasEnemy: false 
    },
    empty: { 
        descriptions: [
            'an abandoned barracks. Rusty weapons litter the floor.',
            'a collapsed library. Torn pages scatter at your feet.',
            'a crumbling shrine. A broken altar stands in the center.',
            'a forgotten armory. Empty weapon racks line the walls.',
            'a dusty workshop. Ancient tools hang from hooks.',
            'a meditation chamber. Stone benches circle a dry fountain.',
            'an old prison cell. Iron bars have rusted through.',
            'a guard post. A skeleton sits slumped in a chair.'
        ], 
        hasEnemy: false 
    },
    treasure: { 
        descriptions: [
            'a glittering treasure vault. Gold coins reflect torchlight.',
            'a dragon\'s hoard chamber. Piles of jewels gleam in the darkness.',
            'a royal treasury. Ancient chests overflow with riches.',
            'a pirate\'s cache. Stolen goods fill every corner.',
            'a wizard\'s vault. Magical artifacts pulse with energy.'
        ], 
        hasEnemy: false 
    },
    enemy: { 
        descriptions: [
            'a dark chamber. You sense hostile eyes watching you.',
            'a blood-stained arena. Old battle scars mark the floor.',
            'a shadowy lair. Something growls in the darkness.',
            'a monster\'s den. Bones crunch beneath your feet.',
            'a cursed chamber. An evil presence fills the air.'
        ], 
        hasEnemy: true 
    },
    boss: { 
        descriptions: [
            'the throne room of darkness. A massive beast awaits on a stone throne.',
            'the dragon\'s lair. Heat radiates from the enormous creature before you.',
            'the demon king\'s chamber. Dark energy swirls around your foe.'
        ], 
        hasEnemy: true 
    },
    trap: { 
        descriptions: [
            'a trapped corridor. Pressure plates cover the floor.',
            'a spike-filled chamber. Deadly traps line the walls.',
            'a poison gas room. Strange vapors seep from cracks.'
        ], 
        hasEnemy: false 
    },
    stairs: { 
        descriptions: [
            'a spiral stairwell. Dark stone steps descend into deeper darkness.',
            'a grand staircase. Ancient carvings decorate the descent.',
            'a hidden passage. Secret stairs lead to the next level.'
        ], 
        hasEnemy: false 
    },
    fountain: {
        descriptions: [
            'a magical fountain room. Crystal clear water bubbles from an enchanted spring.',
            'an ancient healing shrine. A mystical fountain glows with restorative power.'
        ],
        hasEnemy: false
    },
    crypt: {
        descriptions: [
            'a dusty crypt. Stone sarcophagi line the walls.',
            'an ancient burial chamber. Skeletal remains rest in alcoves.',
            'a forgotten tomb. Hieroglyphs cover every surface.'
        ],
        hasEnemy: false
    },
    merchant: {
        descriptions: [
            'a merchant\'s tent. A hooded figure tends to various wares.',
            'a traveling shop. Mysterious goods line makeshift shelves.'
        ],
        hasEnemy: false
    }
};
