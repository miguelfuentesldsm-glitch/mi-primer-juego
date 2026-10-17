// 1. Configuración del Juego y Canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Reposicionar elementos si el juego ya inició (opcional)
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 2. Variables de Estado
let gameStarted = false;
let player, opponent, goalkeeper, ball, leftGoal, rightGoal;

// 3. Clases
class Player {
    constructor(x, y, isOpponent = false) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 100;
        this.speed = 10;
        this.image = new Image();
        this.image.src = 'Images/portero_sprite.png';
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    moveUp() { if (this.y > 0) this.y -= this.speed; }
    moveDown() { if (this.y < canvas.height - this.height) this.y += this.speed; }
}

class Goalkeeper {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 110;
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 10; // Velocidad de la animación
        this.spritesheet = new Image();
        this.spritesheet.src = 'Images/portero_sprite.png';
    }

    update() {
        this.tickCount++;
        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            this.frameIndex = (this.frameIndex + 1) % 3;
        }
    }

    draw() {
        // Asumiendo un spritesheet horizontal de 3 frames
        const sw = this.spritesheet.width / 3 || 50;
        const sh = this.spritesheet.height || 100;
        ctx.drawImage(
            this.spritesheet,
            this.frameIndex * sw, 0, sw, sh,
            this.x, this.y, this.width, this.height
        );
    }
}

class Ball {
    constructor() {
        this.size = 30;
        this.image = new Image();
        this.image.src = 'Images/ball.png';
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = (Math.random() > 0.5 ? 5 : -5);
        this.speedY = (Math.random() - 0.5) * 10;
    }

    draw() {
        ctx.drawImage(this.image, this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebote paredes superior/inferior
        if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;

        // Goles
        if (this.x < 0) {
            rightGoal.score++;
            this.reset();
        } else if (this.x > canvas.width) {
            leftGoal.score++;
            this.reset();
        }
        
        // Colisión básica con jugador (ejemplo simplificado)
        if (this.x < player.x + player.width && this.x > player.x && 
            this.y > player.y && this.y < player.y + player.height) {
            this.speedX = Math.abs(this.speedX);
        }
    }
}

class Goal {
    constructor(x, y, w, h) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.score = 0;
    }
    draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.font = "30px Arial";
        ctx.fillText(this.score, this.x === 10 ? 50 : canvas.width - 80, 50);
    }
}

// 4. Inicialización y Control
function init() {
    player = new Player(50, canvas.height / 2 - 50);
    opponent = new Player(canvas.width - 100, canvas.height / 2 - 50);
    goalkeeper = new Goalkeeper(canvas.width / 2 - 30, canvas.height / 2 - 55);
    ball = new Ball();
    leftGoal = new Goal(10, canvas.height / 2 - 75, 10, 150);
    rightGoal = new Goal(canvas.width - 20, canvas.height / 2 - 75, 10, 150);
}

const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function handleInput() {
    if (keys['ArrowUp']) player.moveUp();
    if (keys['ArrowDown']) player.moveDown();
}

function gameLoop() {
    if (gameStarted) {
        ctx.fillStyle = '#4CAF50'; // Césped
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        handleInput();
        
        leftGoal.draw();
        rightGoal.draw();
        goalkeeper.update();
        goalkeeper.draw();
        player.draw();
        opponent.draw();
        ball.move();
        ball.draw();
    }
    requestAnimationFrame(gameLoop);
}

// 5. Eventos de UI
document.getElementById('start-game').addEventListener('click', () => {
    document.getElementById('lobby').style.display = 'none';
    init();
    gameStarted = true;
});

const lobbyMusic = document.getElementById('lobby-music');
window.addEventListener('click', () => {
    if (lobbyMusic && lobbyMusic.paused) {
        lobbyMusic.play().catch(e => console.log("Audio block:", e));
    }
}, { once: true });

gameLoop();