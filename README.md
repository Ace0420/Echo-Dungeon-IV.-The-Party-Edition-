# 🎮 Echo Dungeon V4: The Full Party Edition

A voice-controlled, accessibility-first dungeon crawler RPG designed for visually impaired players. Navigate dungeons, battle monsters, collect loot, and level up your character using only your voice!

![Game Status](https://img.shields.io/badge/status-playable-brightgreen)
![Version](https://img.shields.io/badge/version-4.0-blue)
![Accessibility](https://img.shields.io/badge/accessibility-screen%20reader%20friendly-orange)

## 🌟 Features

### 🎙️ Full Voice Control
- **Hands-free gameplay** - Control everything with voice commands
- **Text-to-speech feedback** - All game events spoken aloud
- **Screen reader compatible** - Hidden text display for assistive technologies

### ⚔️ Deep RPG Mechanics
- **3 Playable Classes**: Warrior, Mage, Rogue
- **Turn-based Combat** with special abilities and spells
- **Equipment System**: Weapons, armor, shields, rings, and amulets
- **Leveling System** with experience and stat progression
- **Ability Learning** from found spellbooks
- **Status Effects**: Poison, freeze, stun, and more

### 🗺️ Procedural Dungeons
- **Infinite replayability** - Each dungeon is randomly generated
- **Multiple room types**: Treasure rooms, merchants, fountains, traps, boss rooms
- **Progressive difficulty** - Enemies scale with dungeon level
- **Secret rooms** - Hidden treasures to discover

### 💰 Economy System
- **Merchant trading** - Buy potions, sell treasures
- **Loot system** - Gold, gems, equipment, and magical items
- **Inventory management** - Organize your gear and consumables

## 🎯 How to Play

### Starting the Game
1. Open `index.html` in a modern web browser (Chrome, Edge, or Safari recommended)
2. Click/tap anywhere on the screen to start
3. Choose your class: "warrior", "mage", or "rogue"

### Voice Commands

#### 🧭 Movement
- **"north"** / **"forward"** - Move north
- **"south"** / **"back"** - Move south  
- **"east"** / **"right"** - Move east
- **"west"** / **"left"** - Move west
- **"go down stairs"** - Descend to next level

#### ⚔️ Combat Commands
- **"attack"** - Attack the enemy
- **"defend"** / **"block"** - Raise your guard (reduces damage)
- **"special"** - Use your class special ability
- **"cast [spell name]"** - Cast a learned spell
- **"use potion"** / **"drink health potion"** - Use a potion
- **"flee"** - Attempt to escape combat

#### 🔍 Exploration
- **"look around"** - Describe current room
- **"search"** - Search the room for hidden items
- **"open chest"** - Open a treasure chest
- **"drink fountain"** - Use a healing fountain
- **"merchant"** - Talk to a merchant

#### 🎒 Inventory & Equipment
- **"inventory"** - List your items
- **"status"** - Check your character stats
- **"wear ring"** - Equip a ring (up to 10)
- **"equip amulet"** - Equip an amulet
- **"equip [item name]"** - Equip weapon or armor
- **"read book"** - Learn an ability from a spellbook
- **"meditate"** - Restore mana (outside combat)

#### 🛒 Merchant Commands
- **"what do you have"** - List merchant's wares
- **"buy health potion"** - Purchase items
- **"sell ruby gem"** - Sell treasures
- **"leave"** - Exit merchant

#### ℹ️ Help Commands
- **"help"** - Get contextual help
- **"commands"** - List available commands
- **"hint"** - Get a gameplay hint

## 👥 Character Classes

### ⚔️ Warrior
- **Health**: 120 | **Mana**: 30
- **Starting Gold**: 50
- **Equipment**: Steel Sword, Chainmail, Iron Shield
- **Special**: Power Strike (50 damage, 15 mana)
- **Playstyle**: High health tank, physical damage dealer

### 🔮 Mage  
- **Health**: 80 | **Mana**: 100
- **Starting Gold**: 75
- **Equipment**: Mystic Staff, Enchanted Robes
- **Special**: Fireball (100 damage, 20 mana)
- **Playstyle**: Powerful spells, mana management critical

### 🗡️ Rogue
- **Health**: 100 | **Mana**: 60
- **Starting Gold**: 100
- **Equipment**: Shadow Daggers, Shadow Leather
- **Special**: Backstab (35 damage, 15 mana)
- **Playstyle**: Balanced, high starting gold for shopping

## 📚 Learnable Abilities

### Mage Spells
- **Icy Blast** - 70 damage + freeze (20 mana)
- **Chain Lightning** - 75 damage (30 mana)
- **Arcane Missiles** - 65 damage to all enemies (15 mana)

### Warrior Abilities
- **Shield Bash** - 60 damage + stun (20 mana)
- **Whirlwind** - 50 damage to all enemies (25 mana)

### Rogue Abilities
- **Poison Blade** - 30 damage + poison DOT (20 mana)
- **Shadow Strike** - 40 damage, no retaliation (20 mana)

## 🎲 Game Mechanics

### Combat
- Turn-based system
- Defend to reduce incoming damage temporarily
- Status effects last multiple turns
- Some enemies regenerate health
- Multi-enemy encounters possible at higher levels

### Leveling
- Gain XP from defeating enemies
- Level up increases max health (+20) and mana (+10)
- Full heal on level up
- XP requirements increase per level

### Equipment
- **Rings**: Up to 10 equipped, max 2 of same type
- **Amulets**: 1 equipped at a time
- **Weapons/Armor**: Class-specific, improves stats
- **Shields**: Warrior-only, adds defense

### Loot Distribution
- 30% Gold
- 20% Potions (Health/Mana, Greater variants)
- 15% Rings (8 types)
- 10% Amulets (6 types)
- 10% Ability Books (7 types)
- 15% Treasures (8 types for selling)

## 🛠️ Technical Requirements

### Browser Support
- **Chrome** (recommended) - Full voice support
- **Edge** - Full voice support
- **Safari** - Full voice support
- **Firefox** - Limited voice recognition support

### Requirements
- **HTTPS or localhost** - Required for voice recognition API
- **Microphone access** - Must allow browser to use microphone
- **Modern JavaScript** - ES6+ module support

## 📁 Project Structure

```
echo-dungeon-v4/
├── index.html              # Main HTML file
├── game.js                 # Core game engine
├── combat.js               # Combat system
├── playerManager.js        # Character management
├── commandProcessor.js     # Voice command parsing
├── dungeonGenerator.js     # Procedural generation
├── accessibility.js        # Speech & recognition APIs
├── gameData.js            # Game data (classes, enemies, items)
└── README.md              # This file
```

## 🎮 Gameplay Tips

1. **Start Exploring**: Search every room for loot before moving on
2. **Use Fountains Wisely**: They fully heal but are one-time use per level
3. **Merchant Strategy**: Sell treasures to buy better potions
4. **Mana Management**: Meditate often to keep mana full for combat
5. **Boss Preparation**: Stock up on potions before reaching level corners
6. **Ring Stacking**: Equip multiple rings for cumulative bonuses
7. **Ability Books**: Read them immediately - they're valuable
8. **Defend When Low**: Better to survive than risk death
9. **Flee Smart**: Not all battles are worth fighting
10. **Listen Carefully**: Audio cues tell you everything you need

## 🐛 Known Issues

- Save/load system not yet implemented
- Lockpicks command exists but not functional
- True party system not implemented (single character only)
- Some mobile browsers have limited voice recognition

## 🔮 Planned Features

- [ ] Save/Load with PIN system
- [ ] True multi-character party management
- [ ] More enemy variety
- [ ] Boss-specific loot tables
- [ ] Equipment crafting/upgrading
- [ ] Achievement system
- [ ] Combat history log
- [ ] Difficulty settings

## 🤝 Contributing

This is an open-source accessibility project. Contributions welcome!

### Areas for Improvement
- Additional voice command variations
- More enemy types and abilities
- UI enhancements for sighted players
- Performance optimizations
- Additional accessibility features

## 📄 License

MIT License - Feel free to use, modify, and distribute!

## 👏 Credits

- **Original Concept**: Grok AI / Ace0420
- **Code Implementation & Fixes**: Claude AI (Anthropic)
- **Accessibility Design**: Designed for visually impaired gamers
- **Inspiration**: Classic text-based RPGs and audio games

## 📞 Support

Having issues? 

1. Ensure you're using HTTPS or localhost
2. Check browser console for errors
3. Verify microphone permissions
4. Try Chrome/Edge for best compatibility
5. Make sure speech volume is audible

## 🎯 Quick Start Commands

After choosing your class, try these:

```
"look around"
"search"
"north"
"open chest"
"inventory"
"status"
"merchant"
"drink fountain"
"go down stairs"
```

---

**Ready to dive into the dungeon? Click to start and speak your first command!** 🎤

*Echo Dungeon V4 - Where adventure speaks to you!*
