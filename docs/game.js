// Stan gry
const state = {
    player: {
        x: 400,
        y: 300,
        angle: 0,
        velocity: { x: 0, y: 0 },
        acceleration: 0.5,
        friction: 0.85,
        maxSpeed: 8,
        sprintMultiplier: 1.6,
        turnSpeed: 0.08,
        sprite: new Image(),
        coins: 0
    },
    enemies: [],
    projectiles: [],
    coins: [],
    keys: {
        forward: false,
        backward: false,
        turnLeft: false,
        turnRight: false,
        strafeLeft: false,
        strafeRight: false,
        sprint: false
    }
};

// Inicjalizacja płótna
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ładowanie zasobów
const ANIME_GIRL_SPRITE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKUSURBVFiF7ZdNaBNBFMd/s9mkTWqSJk1JW7QqVkWkKB5E/LiIBz0IHhQP4smDFBE96NGDiCBeRPCgICIePCh4EDyJKCLiQaqCn1Vr1TaxX2natGmbNLvjYZNQapKNwYvgf9h9M/P+v5n3ZnYXYmJiYmJi/jFCVJGxgQutLqt1QEF0KKDVg9MBhgaGBgt+0F0Q8MHrg4U5WJiHOQ/4QqJnGXwB8C/7cblcRQKaptWsr6tpQwfg9kDfEehsg+5OaG8Fu6263vRnmPLAu0/w8j28eAsTn8DnD4VFUcxqmhbUdd0kSZJRIVAUBYfDEVHsdMDxI3DyGBzYA4oSWby1GY7sgxMDkJmHp6/h0XOYmQNVVc2qqpbVxWAwGNzc3KxrmsZGxe6dMD4Kj27A+cHw4rXY2QaXhmFqAq4OQ0dbKLZly5b1/0QgEMDpdEYU7+2Gx7fg7jXY01V//M52uH8dHt6E/T3rx202W1ldVVUxm81/JGDRYP8eePcE7l2HzraNz7OrA+5ehwf5cPZQyJvNZkRRLBNQFAWLxVJ3YLMZTh+HyXG4NQItTRvPvxaXE26PwtvHcG4QrFYriqKU1SVJQpblugI2K1wcgk9P4MoFaLJvbvHvabLDtQswPQ6XhsFmtSLLMoqilAkEg0Hs9sgXpd0Gly/A7DhcPgeODSxc9/PrAq4Mw+cJuDgEDrsNWZYJBoNldUmSEASh7gQAkoNw/Qh8fR7e5/U2YiP6jXDqIPyYhLPHQRAEJEkqq5tMJrxeL4ZhRJ6gqRFujMBMBvp6N79wbxdkH8KFDDA0UPf5EEURn8+HYRhlAoqiYLVasVgsUcVNDZAIL7jxb0IQBERRxOfzoes6APJvjT9e8/8RQRBQVZVAIABALBATExMT8z/zC1vqIVMI2EIJAAAAAElFTkSuQmCC';
const CHEESE_SPRITE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGUlEQVQYV2P8z8Dwn4EAYBxVQEgBNs0gDQBn4gQJE+ZTogAAAABJRU5ErkJggg==';

state.player.sprite.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGUlEQVQYV2NkYGD4z4AHMP7//x8/BYyjAQCmBQYNBzg8PQAAAABJRU5ErkJggg==';

function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    switch(edge) {
        case 0: x = Math.random() * canvas.width; y = -32; break;
        case 1: x = canvas.width + 32; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 32; break;
        case 3: x = -32; y = Math.random() * canvas.height; break;
    }
    const animeGirl = new Image();
    animeGirl.src = ANIME_GIRL_SPRITE;
    state.enemies.push({ 
        x, 
        y, 
        speed: 2,
        sprite: animeGirl,
        catchphrase: ["Baka!", "Nani?!", "Kawaii~", "Senpai!"][Math.floor(Math.random() * 4)]
    });
}

function spawnCoin() {
    state.coins.push({
        x: Math.random() * (canvas.width - 20),
        y: Math.random() * (canvas.height - 20)
    });
}

function updateGame() {
    // Aktualizacja obrotu gracza z płynnym skrętem
    if (state.keys.turnLeft) state.player.angle -= state.player.turnSpeed;
    if (state.keys.turnRight) state.player.angle += state.player.turnSpeed;

    // Obliczanie wektorów ruchu
    const dx = Math.cos(state.player.angle);
    const dy = Math.sin(state.player.angle);
    
    // Pobierz aktualny mnożnik prędkości
    const speedMultiplier = state.keys.sprint ? state.player.sprintMultiplier : 1;

    // Oblicz wektor przyspieszenia
    let accelX = 0;
    let accelY = 0;

    if (state.keys.forward) {
        accelX += dx * state.player.acceleration;
        accelY += dy * state.player.acceleration;
    }
    if (state.keys.backward) {
        accelX -= dx * state.player.acceleration * 0.7; // Wolniejszy ruch do tyłu
        accelY -= dy * state.player.acceleration * 0.7;
    }
    if (state.keys.strafeLeft) {
        accelX += dy * state.player.acceleration;
        accelY -= dx * state.player.acceleration;
    }
    if (state.keys.strafeRight) {
        accelX -= dy * state.player.acceleration;
        accelY += dx * state.player.acceleration;
    }

    // Apply acceleration
    state.player.velocity.x += accelX;
    state.player.velocity.y += accelY;

    // Apply friction
    state.player.velocity.x *= state.player.friction;
    state.player.velocity.y *= state.player.friction;

    // Limit speed
    const currentSpeed = Math.sqrt(
        state.player.velocity.x * state.player.velocity.x + 
        state.player.velocity.y * state.player.velocity.y
    );
    
    if (currentSpeed > state.player.maxSpeed * speedMultiplier) {
        const scale = (state.player.maxSpeed * speedMultiplier) / currentSpeed;
        state.player.velocity.x *= scale;
        state.player.velocity.y *= scale;
    }

    // Update position
    state.player.x += state.player.velocity.x;
    state.player.y += state.player.velocity.y;

    // Keep player in bounds with momentum preservation
    if (state.player.x < 0 || state.player.x > canvas.width) {
        state.player.velocity.x *= -0.5; // Bounce with reduced momentum
        state.player.x = Math.max(0, Math.min(canvas.width, state.player.x));
    }
    if (state.player.y < 0 || state.player.y > canvas.height) {
        state.player.velocity.y *= -0.5; // Bounce with reduced momentum
        state.player.y = Math.max(0, Math.min(canvas.height, state.player.y));
    }
}

function drawGame() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(state.player.sprite, state.player.x - 16, state.player.y - 16);

    // Draw enemies
    ctx.fillStyle = '#f00';
    state.enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 16, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw coins
    ctx.fillStyle = '#ff0';
    state.coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(`Coins: ${state.player.coins}`, 10, 30);
}

// Input handling
window.addEventListener('keydown', e => {
    switch(e.key) {
        case 'w': state.keys.forward = true; break;
        case 's': state.keys.backward = true; break;
        case 'a': state.keys.strafeLeft = true; break;
        case 'd': state.keys.strafeRight = true; break;
        case 'ArrowLeft': state.keys.turnLeft = true; break;
        case 'ArrowRight': state.keys.turnRight = true; break;
        case 'Shift': state.keys.sprint = true; break;
    }
    e.preventDefault(); // Prevent default browser scrolling
});

window.addEventListener('keyup', e => {
    switch(e.key) {
        case 'w': state.keys.forward = false; break;
        case 's': state.keys.backward = false; break;
        case 'a': state.keys.strafeLeft = false; break;
        case 'd': state.keys.strafeRight = false; break;
        case 'ArrowLeft': state.keys.turnLeft = false; break;
        case 'ArrowRight': state.keys.turnRight = false; break;
        case 'Shift': state.keys.sprint = false; break;
    }
});

// Shop functionality
function openShop() {
    // TODO: Implement shop UI
    console.log('Shop opened');
}

// Game loop
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Spawn enemies and coins periodically
setInterval(spawnEnemy, 3000);
setInterval(spawnCoin, 5000);

// Start game
gameLoop();
