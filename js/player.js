const playerSprite = new Image();
playerSprite.src = "assets/sprites/player.png";

/* player.js
   Controla exclusivamente a nave, seus movimentos e seus disparos. */

class Player {
  static sprite = playerSprite;
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 40;
    this.height = 48;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - 62;
    this.speed = 6;
    this.cooldown = 0;
    this.shotCooldown = 12;
    this.invulnerable = 0;
    this.immobilizedUntil = 0;
  }

  reset() {
    this.x = this.canvas.width / 2 - this.width / 2;
    this.y = this.canvas.height - 62;
    this.cooldown = 0;
    this.invulnerable = 90;
    this.immobilizedUntil = 0;
  }

  update(keys, bullets, gameState) {
    // O poder Turbo pode alterar a velocidade; calcule antes de usar no teclado ou touch.
    const powers = gameState?.powers || {};
    const bossPowers = gameState?.bossPowers || {};
    const rapid = (powers.rapidFireUntil || 0) > (gameState?.frame || 0);
    const triple = (powers.tripleShotUntil || 0) > (gameState?.frame || 0) || Boolean(bossPowers.fixed === "fixedTriple");
    const bossDamageBoost = bossPowers.fixed === "cannon";
    const moveSpeed = bossPowers.fixed === "turbo" ? 8.5 : this.speed;
    const touch = gameState?.touch || { active: false, x: 0, y: 0, offsetX: 0, offsetY: 0 };
    const immobilized = (this.immobilizedUntil || 0) > (gameState?.frame || 0);

    if (!immobilized && (keys.ArrowLeft || keys.KeyA)) this.x -= moveSpeed;
    if (!immobilized && (keys.ArrowRight || keys.KeyD)) this.x += moveSpeed;
    if (!immobilized && (keys.ArrowUp || keys.KeyW)) this.y -= moveSpeed;
    if (!immobilized && (keys.ArrowDown || keys.KeyS)) this.y += moveSpeed;

    // No celular, o dedo controla diretamente o centro da nave.
    if (touch.active && !immobilized) {
      const targetX = touch.x - touch.offsetX - this.width / 2;
      const targetY = touch.y - touch.offsetY - this.height / 2;
      this.x += (targetX - this.x) * 0.35;
      this.y += (targetY - this.y) * 0.35;
    }

    this.x = Math.max(8, Math.min(this.canvas.width - this.width - 8, this.x));
    this.y = Math.max(8, Math.min(this.canvas.height - this.height - 8, this.y));

    if (this.cooldown > 0) this.cooldown--;
    if (this.invulnerable > 0) this.invulnerable--;

    // A gosma impede o movimento por 2 segundos, mas não causa dano.
    if (immobilized) {
      // Mantém a nave visível e permite disparar normalmente.
    }

    // No celular, segurar o dedo significa atirar automaticamente.
    const shooting = keys.Space || touch.active;
    if (shooting && this.cooldown <= 0) {
      if (triple) {
        [-1, 0, 1].forEach(offset => bullets.push({
          x: this.x + this.width / 2 - 3,
          y: this.y - 12,
          width: 6,
          height: 18,
          speed: 10,
          damage: bossDamageBoost ? 2 : 1,
          vx: offset * 1.8
        }));
      } else {
        bullets.push({
          x: this.x + this.width / 2 - 3,
          y: this.y - 12,
          width: 6,
          height: 18,
          speed: 10,
          damage: bossDamageBoost ? 2 : 1,
          vx: 0
        });
      }
      this.cooldown = rapid ? 6 : this.shotCooldown;
    }
  }

  draw(ctx) {
    if (this.invulnerable > 0 && Math.floor(this.invulnerable / 5) % 2 === 0) return;
    if (!Player.sprite.complete) return;
    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#52d9ff";
    ctx.drawImage(Player.sprite, this.x - 8, this.y - 9, this.width + 16, this.height + 18);
    ctx.restore();
  }

  getBounds() {
    return { x: this.x + 7, y: this.y + 4, width: this.width - 14, height: this.height - 5 };
  }
}
