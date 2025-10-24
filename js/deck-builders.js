function createSkeletonDeck() {
    return {
        type: 'hardy',
        targetStrategy: 'target-mana',
        cards: [
            "Skeleton", "Skeleton", "Skeleton", "Skeleton", "Skeleton",
            "Skeleton", "Skeleton", "Skeleton", "Skeleton", "Skeleton",
            "Skeleton", "Skeleton", "Skeleton", "Skeleton", "Skeleton",
            "Skeleton", "Skeleton", "Skeleton", "Skeleton", "Skeleton"
        ]
    };
}

function createTestDeck() {
    return createGoblinDeck();
    return {
        type: 'angry',
        targetStrategy: 'target-mana',
        cards: [
            "Archer", 
            "Archer", 
            "Goblin", 
            "Wizard",
            "Goblin",
            "Wizard",
            "Knight",
            "Knight", 
            "Goblin", 
            "Archer", 
            "Wizard", 
            "Knight",
            "Archer", 
            "Wizard", 
            "Archer", 
            "Wizard",
            "Archer", 
            "Wizard", 
            "Knight", 
            "Wizard",
        ]
    };
}


function createMasterDeck() {
    return createSkeletonDeck();
    return {
        type: 'angry',
        targetStrategy: 'target-mana',
        cards: [
            "Archer", 
            "Archer", 
            "Goblin", 
            "Wizard",
            "Goblin",
            "Wizard",
            "Knight",
            "Knight", 
            "Goblin", 
            "Archer", 
            "Wizard", 
            "Knight",
            "Archer", 
            "Wizard", 
            "Archer", 
            "Wizard",
            "Archer", 
            "Wizard", 
            "Knight", 
            "Wizard",
        ]
    };
}

function createGoblinDeck() {
    return {
        type: 'angry',
        targetStrategy: 'kill-shot',
        cards: [
            "Goblin", "Goblin", "Goblin", "Goblin", "Goblin",
            "Goblin", "Goblin", "Goblin", "Goblin", "Goblin",
            "Goblin", "Goblin", "Goblin", "Goblin", "Goblin",
            "Goblin", "Goblin", "Goblin", "Goblin", "Goblin",
        ]
    };
}