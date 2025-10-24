// ===== CARD GAME BALANCE SIMULATOR =====
// Complete simulation for auto-battler card game with:
// - 5-card field limit per player
// - 100 player HP (direct damage when no blockers)
// - 20-card decks with mixed compositions
// - 3 deck flavors (hardy/angry/speedy)
// - 3 attack strategies (target-mana/kill-shot/optimize-damage)

// ===== CARD DEFINITIONS =====
const BASE_CARDS = {
    Goblin: { hp: 30, attack: 15, speed: 35, cost: 1 },
    Skeleton: { hp: 75, attack: 30, speed: 15, cost: 2 },
    Archer: { hp: 90, attack: 55, speed: 30, cost: 4 },
    Wizard: { hp: 120, attack: 75, speed: 25, cost: 6 },
    Knight: { hp: 240, attack: 120, speed: 20, cost: 8 }
};

// ===== DECK FLAVOR MODIFIERS =====
function applyFlavor(card, flavor) {
    const modified = { ...card };
    if (flavor === 'speedy') {
        modified.speed += 15;
    } else if (flavor === 'hardy') {
        modified.hp = Math.round(modified.hp * 1.25);
    } else if (flavor === 'angry') {
        modified.attack = Math.round(modified.attack * 1.25);
    }
    // 'base' flavor applies no changes
    return modified;
}

// ===== TARGETING STRATEGIES =====
function findTarget(attacker, targets, strategy) {
    if (targets.length === 0) return null;
    
    if (strategy === 'target-mana') {
        // Target highest cost enemy
        let best = targets[0];
        for (let t of targets) {
            if (t.cost > best.cost) best = t;
        }
        return best;
        
    } else if (strategy === 'kill-shot') {
        // Prefer killable targets, then highest HP
        const killable = targets.filter(t => attacker.attack >= t.hp);
        if (killable.length > 0) {
            let best = killable[0];
            for (let t of killable) {
                if (t.hp > best.hp) best = t;
            }
            return best;
        }
        // Can't kill anything, target highest HP
        let best = targets[0];
        for (let t of targets) {
            if (t.hp > best.hp) best = t;
        }
        return best;
        
    } else { // 'optimize-damage'
        // Minimize wasted damage
        const noWaste = targets.filter(t => t.hp >= attacker.attack);
        if (noWaste.length > 0) {
            let best = noWaste[0];
            let minRemaining = noWaste[0].hp - attacker.attack;
            for (let t of noWaste) {
                const remaining = t.hp - attacker.attack;
                if (remaining < minRemaining) {
                    minRemaining = remaining;
                    best = t;
                }
            }
            return best;
        }
        // All targets will die, pick closest to attack value
        let best = targets[0];
        let minWaste = Math.abs(targets[0].hp - attacker.attack);
        for (let t of targets) {
            const waste = Math.abs(t.hp - attacker.attack);
            if (waste < minWaste) {
                minWaste = waste;
                best = t;
            }
        }
        return best;
    }
}

// ===== MAIN GAME SIMULATION =====
function simulateGame(deck1Config, deck2Config, verbose = false) {
    const { cards: deck1Cards, flavor: flavor1, strategy: strategy1, name: name1 } = deck1Config;
    const { cards: deck2Cards, flavor: flavor2, strategy: strategy2, name: name2 } = deck2Config;
    
    // Apply flavor modifiers to decks
    const deck1 = deck1Cards.map(cardName => ({
        ...applyFlavor(BASE_CARDS[cardName], flavor1),
        name: cardName,
        cost: BASE_CARDS[cardName].cost
    }));
    const deck2 = deck2Cards.map(cardName => ({
        ...applyFlavor(BASE_CARDS[cardName], flavor2),
        name: cardName,
        cost: BASE_CARDS[cardName].cost
    }));
    
    // Game state
    let field1 = [];
    let field2 = [];
    let player1HP = 100;
    let player2HP = 100;
    let deckIndex1 = 0;
    let deckIndex2 = 0;
    let mana = 4;
    const MAX_FIELD_SIZE = 5;
    const MAX_TURNS = 20;
    
    // Game loop
    for (let turn = 1; turn <= MAX_TURNS; turn++) {
        if (verbose) {
            console.log(`\n--- Turn ${turn} (${mana} mana) ---`);
        }
        
        // ===== DEPLOY PHASE =====
        // Player 1 deploys
        const slotsAvailable1 = MAX_FIELD_SIZE - field1.length;
        let deployed1 = 0;
        let manaUsed1 = 0;
        
        while (deployed1 < slotsAvailable1 && 
               deckIndex1 < deck1.length && 
               manaUsed1 + deck1[deckIndex1].cost <= mana) {
            const card = deck1[deckIndex1];
            field1.push({ ...card, maxHp: card.hp, currentHp: card.hp });
            manaUsed1 += card.cost;
            deployed1++;
            deckIndex1++;
        }
        
        // Player 2 deploys
        const slotsAvailable2 = MAX_FIELD_SIZE - field2.length;
        let deployed2 = 0;
        let manaUsed2 = 0;
        
        while (deployed2 < slotsAvailable2 && 
               deckIndex2 < deck2.length && 
               manaUsed2 + deck2[deckIndex2].cost <= mana) {
            const card = deck2[deckIndex2];
            field2.push({ ...card, maxHp: card.hp, currentHp: card.hp });
            manaUsed2 += card.cost;
            deployed2++;
            deckIndex2++;
        }
        
        if (verbose) {
            console.log(`${name1 || 'Player 1'}: ${field1.length}/5 field, ${player1HP} HP, ${deck1.length - deckIndex1} in deck`);
            console.log(`${name2 || 'Player 2'}: ${field2.length}/5 field, ${player2HP} HP, ${deck2.length - deckIndex2} in deck`);
        }
        
        // ===== COMBAT PHASE =====
        // Create combined queue sorted by speed (descending)
        const allUnits = [
            ...field1.map(u => ({ ...u, team: 1 })),
            ...field2.map(u => ({ ...u, team: 2 }))
        ].sort((a, b) => {
            if (b.speed !== a.speed) return b.speed - a.speed;
            return Math.random() - 0.5; // Random tiebreaker
        });
        
        // Each unit attacks in speed order
        for (let unit of allUnits) {
            if (unit.hp <= 0) continue; // Skip dead units
            
            const enemies = unit.team === 1 ? field2 : field1;
            const aliveEnemies = enemies.filter(e => e.hp > 0);
            
            if (aliveEnemies.length > 0) {
                // Attack enemy units
                const unitStrategy = unit.team === 1 ? strategy1 : strategy2;
                const target = findTarget(unit, aliveEnemies, unitStrategy);
                
                if (target) {
                    target.hp -= unit.attack;
                }
            } else {
                // No enemy units - attack player directly
                if (unit.team === 1) {
                    player2HP -= unit.attack;
                } else {
                    player1HP -= unit.attack;
                }
            }
        }
        
        // Remove dead units
        field1 = field1.filter(u => u.hp > 0);
        field2 = field2.filter(u => u.hp > 0);
        
        // ===== WIN CONDITIONS =====
        if (player2HP <= 0) {
            if (verbose) console.log(`\n🏆 ${name1 || 'Player 1'} WINS! (Lethal damage)`);
            return { winner: 1, turn: turn, reason: 'player-hp' };
        }
        if (player1HP <= 0) {
            if (verbose) console.log(`\n🏆 ${name2 || 'Player 2'} WINS! (Lethal damage)`);
            return { winner: 2, turn: turn, reason: 'player-hp' };
        }
        if (field2.length === 0 && deckIndex2 >= deck2.length) {
            if (verbose) console.log(`\n🏆 ${name1 || 'Player 1'} WINS! (Deck out)`);
            return { winner: 1, turn: turn, reason: 'deck-out' };
        }
        if (field1.length === 0 && deckIndex1 >= deck1.length) {
            if (verbose) console.log(`\n🏆 ${name2 || 'Player 2'} WINS! (Deck out)`);
            return { winner: 2, turn: turn, reason: 'deck-out' };
        }
        
        mana++; // Increase mana for next turn
    }
    
    // Game went to max turns - highest HP wins
    if (verbose) console.log(`\nGame timeout at turn ${MAX_TURNS}`);
    return { 
        winner: player1HP > player2HP ? 1 : 2, 
        turn: MAX_TURNS, 
        reason: 'timeout' 
    };
}

// ===== TESTING UTILITIES =====

// Run multiple games and get win rate
function testMatchup(deck1Config, deck2Config, games = 10) {
    let wins1 = 0;
    let totalTurns = 0;
    
    for (let i = 0; i < games; i++) {
        const result = simulateGame(deck1Config, deck2Config);
        if (result.winner === 1) wins1++;
        totalTurns += result.turn;
    }
    
    return {
        wins1: wins1,
        wins2: games - wins1,
        winRate1: (wins1 / games * 100).toFixed(1),
        avgTurns: (totalTurns / games).toFixed(1)
    };
}

// Test deck against multiple opponents
function testDeckVsField(testDeck, opponentDecks, gamesPerMatchup = 5) {
    let totalWins = 0;
    let totalGames = 0;
    
    opponentDecks.forEach(opponent => {
        for (let i = 0; i < gamesPerMatchup; i++) {
            const result = simulateGame(testDeck, opponent);
            if (result.winner === 1) totalWins++;
            totalGames++;
        }
    });
    
    return {
        wins: totalWins,
        games: totalGames,
        winRate: (totalWins / totalGames * 100).toFixed(1)
    };
}

// ===== EXAMPLE USAGE =====

// Example deck 1: Goblin Rush
const goblinRush = {
    name: "Goblin Rush",
    cards: Array(20).fill("Goblin"),
    flavor: "angry",
    strategy: "kill-shot"
};

// Example deck 2: Archer Control
const archerControl = {
    name: "Archer Control",
    cards: [...Array(12).fill("Archer"), ...Array(8).fill("Wizard")],
    flavor: "hardy",
    strategy: "optimize-damage"
};

// Run a single verbose game
console.log("=== EXAMPLE GAME ===");
simulateGame(goblinRush, archerControl, true);

// Run matchup testing
console.log("\n\n=== MATCHUP TEST (10 games) ===");
const matchupResult = testMatchup(goblinRush, archerControl, 10);
console.log(`${goblinRush.name} vs ${archerControl.name}`);
console.log(`Record: ${matchupResult.wins1}-${matchupResult.wins2}`);
console.log(`Win Rate: ${matchupResult.winRate1}%`);
console.log(`Avg Game Length: ${matchupResult.avgTurns} turns`);
