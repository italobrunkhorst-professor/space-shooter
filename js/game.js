/* game.js
   Núcleo do jogo: controles, loop, colisões, pontuação, vidas,
   troca de fases, quiz e poderes.
*/

const SpaceShooter = (() => {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const state = {
    running: false,
    playerName: "",
    phase: 1,
    score: 0,
    lives: 3,
    activeTimeMs: 0,
    lastTimeStamp: 0,
    timeBonus: 0,
    finalScore: 0,
    player: null,
    bullets: [],
    enemyBullets: [],
    enemies: [],
    boss: null,
    phaseData: null,
    keys: {},
    // Controle por toque: arrastar a nave e atirar enquanto o dedo estiver pressionado.
    touch: { active: false, pointerId: null, x: 0, y: 0, offsetX: 0, offsetY: 0 },
    stars: [],
    frame: 0,
    phaseFrame: 0,
    transitionLocked: false,
    gameOver: false,
    paused: false,
    powers: { shieldUntil: 0, tripleShotUntil: 0, rapidFireUntil: 0 },
    bossPowers: { temporary: null, fixed: null, selectionShown: false },
    testMode: false,
    testTargetPhase: null
  };

  for (let i = 0; i < 150; i++) {
    state.stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() < .85 ? 1 : 2, speed: .15 + Math.random() * .65, alpha: .35 + Math.random() * .65 });
  }

  const backgroundImages = {};
  const backgroundPaths = {
    1: "assets/backgrounds/fase1-sol.png", 2: "assets/backgrounds/fase2-mercurio.png",
    3: "assets/backgrounds/fase4-jupiter.png", 4: "assets/backgrounds/fase3-terra.png",
    5: "assets/backgrounds/fase5-urano.png", 6: "assets/backgrounds/fase6-final.png",
    7: "assets/backgrounds/fase6-final.png", 8: "assets/backgrounds/fase6-final.png", 9: "assets/backgrounds/fase6-final.png",
    10: "assets/backgrounds/f10-nebulosa-toxica.svg", 11: "assets/backgrounds/f11-zona-contaminada.svg", 12: "assets/backgrounds/f12-colonia-alien.svg", 13: "assets/backgrounds/f13-nucleo-alien.svg"
  };
  Object.entries(backgroundPaths).forEach(([phase, path]) => { const image = new Image(); image.src = path; backgroundImages[phase] = image; });

  const ui = {
    startScreen: document.getElementById("start-screen"), testScreen: document.getElementById("test-screen"), testPhasesButton: document.getElementById("test-phases-button"), testBackButton: document.getElementById("test-back-button"), testPhaseList: document.getElementById("test-phase-list"), gameScreen: document.getElementById("game-screen"), endScreen: document.getElementById("end-screen"), rankingScreen: document.getElementById("ranking-screen"),
    nameInput: document.getElementById("player-name"), startButton: document.getElementById("start-button"), rankingButton: document.getElementById("ranking-button"), rankingBackButton: document.getElementById("ranking-back-button"), endRankingButton: document.getElementById("end-ranking-button"), startMessage: document.getElementById("start-message"),
    continueButton: document.getElementById("continue-button"), phaseOverlay: document.getElementById("phase-overlay"), phaseTitle: document.getElementById("phase-title"), phaseSubtitle: document.getElementById("phase-subtitle"), restartButton: document.getElementById("restart-button"),
    hudPlayer: document.getElementById("hud-player"), hudPhase: document.getElementById("hud-phase"), hudScore: document.getElementById("hud-score"), hudLives: document.getElementById("hud-lives"), endTitle: document.getElementById("end-title"), endPlayer: document.getElementById("end-player"), endScore: document.getElementById("end-score"), endRank: document.getElementById("end-rank"),
    rankingList: document.getElementById("ranking-list"), rankingStatus: document.getElementById("ranking-status"), quizOverlay: document.getElementById("quiz-overlay"), quizQuestions: document.getElementById("quiz-questions"), quizResult: document.getElementById("quiz-result"), quizSubmitButton: document.getElementById("quiz-submit-button"), quizTitle: document.getElementById("quiz-title"), quizInstruction: document.getElementById("quiz-instruction"), powerOverlay: document.getElementById("power-overlay"), powerOptions: document.getElementById("power-options")
  };

  const quizBank = [
    { q: "Qual planeta é conhecido como Planeta Vermelho?", a: ["Vênus", "Marte", "Júpiter", "Mercúrio"], correct: 1 },
    { q: "Como se chama a galáxia onde está o Sistema Solar?", a: ["Andrômeda", "Via Láctea", "Triângulo", "Sombrero"], correct: 1 },
    { q: "Qual é o maior planeta do Sistema Solar?", a: ["Saturno", "Terra", "Júpiter", "Urano"], correct: 2 },
    { q: "Qual é a estrela no centro do nosso Sistema Solar?", a: ["Sirius", "Sol", "Polaris", "Betelgeuse"], correct: 1 },
    { q: "Qual planeta possui anéis mais famosos e visíveis?", a: ["Saturno", "Terra", "Marte", "Mercúrio"], correct: 0 },
    { q: "Qual agência espacial é dos Estados Unidos?", a: ["ESA", "NASA", "JAXA", "CNSA"], correct: 1 },
    { q: "Qual é o planeta mais próximo do Sol?", a: ["Mercúrio", "Vênus", "Terra", "Marte"], correct: 0 },
    { q: "A Lua é o quê da Terra?", a: ["Uma estrela", "Um planeta", "Um satélite natural", "Um cometa"], correct: 2 },
    { q: "Em que planeta vivemos?", a: ["Terra", "Urano", "Netuno", "Marte"], correct: 0 },
    { q: "Qual planeta é famoso pela Grande Mancha Vermelha?", a: ["Júpiter", "Saturno", "Netuno", "Vênus"], correct: 0 }
  ];

  const powerData = {
    shield: { icon: "🛡️", name: "ESCUDO", desc: "Fica invulnerável por 6 segundos." },
    triple: { icon: "🔱", name: "TIRO TRIPLO", desc: "Dispara 3 tiros de uma vez por 15 segundos." },
    rapid: { icon: "⚡", name: "RAJADA RÁPIDA", desc: "Dobra a velocidade dos disparos por 15 segundos." }
  };

  function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

  function startGame(name) {
    const cleanName = name.trim().slice(0, 18);
    if (!cleanName) { ui.startMessage.textContent = "Digite um nome para começar."; return; }
    state.testMode = false; state.testTargetPhase = null; state.playerName = cleanName; state.phase = 1; state.score = 0; state.lives = 3; state.activeTimeMs = 0; state.lastTimeStamp = performance.now(); state.timeBonus = 0; state.finalScore = 0; state.gameOver = false; state.running = true; state.paused = false; state.transitionLocked = false; state.frame = 0;
    state.powers = { shieldUntil: 0, tripleShotUntil: 0, rapidFireUntil: 0 };
    state.touch = { active: false, pointerId: null, x: 0, y: 0, offsetX: 0, offsetY: 0 };
    state.bossPowers = { temporary: null, fixed: null, selectionShown: false };
    state.player = new Player(canvas);
    ui.startScreen.classList.add("hidden"); ui.rankingScreen.classList.add("hidden"); ui.endScreen.classList.add("hidden"); ui.gameScreen.classList.remove("hidden");
    updateHud(); iniciarFase1(); requestAnimationFrame(loop);
  }

  function startPhase(config) {
    state.phaseData = config; state.phase = config.numero; state.phaseFrame = 0; state.bullets = []; state.enemyBullets = []; state.enemies = []; state.boss = null; state.transitionLocked = false; state.paused = false;
    if (config.boss) state.bossPowers = { temporary: null, fixed: null, selectionShown: false };
    if (!state.player) state.player = new Player(canvas); else state.player.reset();
    config.criarInimigos(state.enemies, canvas);
    if (config.boss) state.boss = new Boss(config.boss.tipo, canvas, { maxHp: config.boss.maxHp });
    updateHud();
  }

  function completePhase(message = `FASE ${state.phase} CONCLUÍDA!`, subtitle = "Prepare-se para a próxima fase.") {
    if (state.transitionLocked || state.gameOver) return;
    state.transitionLocked = true;
    state.paused = true;

    if (state.testMode) {
      state.running = false;
      state.paused = false;
      state.transitionLocked = false;
      state.testMode = false;
      state.testTargetPhase = null;
      ui.gameScreen.classList.add("hidden");
      ui.testScreen.classList.remove("hidden");
      return;
    }

    // A vitória só acontece depois do Boss Final da Fase 9.
    if (state.phase === 13) { finishVictory(); return; }

    const nextPhase = state.phase + 1;
    const nextIsBoss = [3, 6, 9, 13].includes(nextPhase);

    const continueToNextPhase = (quizWon) => {
      try {
        const startNext = window[`iniciarFase${nextPhase}`];
        if (typeof startNext !== "function") {
          throw new Error(`Função iniciarFase${nextPhase} não encontrada.`);
        }

        // Esconde qualquer overlay antigo antes de montar a próxima etapa.
        ui.quizOverlay.classList.add("hidden");
        ui.powerOverlay.classList.add("hidden");

        state.phase = nextPhase;
        state.transitionLocked = false;
        startNext();

        // Boss: se acertou o quiz, escolha 1 poder temporário + 1 fixo.
        if (nextIsBoss) {
          state.paused = true;
          if (quizWon) {
            setTimeout(() => showBossPowerSelection(), 60);
          } else {
            state.paused = false;
            if (state.boss) { state.boss.unlocked = true; state.boss.shotTimer = 45; }
          }
        } else if (quizWon) {
          state.paused = true;
          showPowerChoices(() => { state.paused = false; });
        } else {
          state.paused = false;
        }
      } catch (error) {
        console.error("Erro ao avançar de fase:", error);
        ui.quizResult.textContent = "Não foi possível avançar. Recarregue o jogo e tente novamente.";
        state.paused = true;
        state.transitionLocked = false;
      }
    };

    openQuiz(message, subtitle, continueToNextPhase);
  }

  function openQuiz(message, subtitle, callback) {
    ui.phaseOverlay.classList.add("hidden");
    ui.quizOverlay.classList.remove("hidden");
    ui.quizTitle.textContent = `FASE ${state.phase} CONCLUÍDA!`;
    ui.quizInstruction.textContent = "Responda corretamente as 3 questões para escolher um poder.";
    ui.quizResult.textContent = "";
    ui.quizSubmitButton.textContent = "RESPONDER QUIZ";
    const questions = shuffle([...quizBank]).slice(0, 3);
    ui.quizQuestions.innerHTML = questions.map((item, qi) => `
      <div class="quiz-question"><p>${qi + 1}. ${item.q}</p>${item.a.map((answer, ai) => `<label class="quiz-option"><input type="radio" name="quiz-${qi}" value="${ai}"> ${answer}</label>`).join("")}</div>`).join("");
    ui.quizSubmitButton.disabled = false;
    ui.quizSubmitButton.onclick = () => {
      let correct = 0;
      questions.forEach((item, qi) => {
        const selected = ui.quizQuestions.querySelector(`input[name="quiz-${qi}"]:checked`);
        if (selected && Number(selected.value) === item.correct) correct++;
      });

      // A resposta é processada uma única vez.
      ui.quizSubmitButton.disabled = true;

      if (correct === 3) {
        ui.quizResult.textContent = "🎉 Você acertou as 3! Preparando sua recompensa...";
        setTimeout(() => callback(true), 450);
      } else {
        ui.quizResult.textContent = `Você acertou ${correct}/3. Você seguirá sem poder nesta etapa.`;
        setTimeout(() => callback(false), 650);
      }
    };
  }

  function showPowerChoices(callback) {
    ui.powerOverlay.classList.remove("hidden");
    ui.powerOptions.innerHTML = Object.entries(powerData).map(([key, p]) => `<button class="power-choice" data-power="${key}"><strong>${p.icon} ${p.name}</strong><small>${p.desc}</small></button>`).join("");
    ui.powerOptions.querySelectorAll(".power-choice").forEach(button => {
      button.onclick = () => { applyPower(button.dataset.power); ui.powerOverlay.classList.add("hidden"); ui.quizSubmitButton.disabled = false; callback(); };
    });
  }

  function applyPower(power) {
    const duration = power === "shield" ? 480 : 900;
    if (power === "shield") state.powers.shieldUntil = Math.max(state.powers.shieldUntil, state.frame) + duration;
    if (power === "triple") state.powers.tripleShotUntil = Math.max(state.powers.tripleShotUntil, state.frame) + duration;
    if (power === "rapid") state.powers.rapidFireUntil = Math.max(state.powers.rapidFireUntil, state.frame) + duration;
  }

  const bossTemporaryPowers = {
    shield: { icon: "🛡️", name: "ESCUDO TEMPORÁRIO", desc: "Invulnerabilidade por 8 segundos contra o Boss." },
    triple: { icon: "🔱", name: "TIRO TRIPLO", desc: "Dispara 3 tiros por 15 segundos." },
    rapid: { icon: "⚡", name: "RAJADA RÁPIDA", desc: "Dispara muito mais rápido por 15 segundos." }
  };

  const bossFixedPowers = {
    cannon: { icon: "💥", name: "CANHÃO PESADO", desc: "Todos os tiros causam 2x de dano durante toda a luta contra o Boss." },
    turbo: { icon: "🚀", name: "MOTOR TURBO", desc: "A nave fica mais rápida durante toda a luta contra o Boss." },
    fixedTriple: { icon: "🔱", name: "CANHÃO TRIPLO FIXO", desc: "Dispara 3 tiros durante toda a luta contra o Boss." }
  };

  function showBossPowerSelection() {
    state.paused = true;
    ui.powerOverlay.classList.remove("hidden");
    ui.powerOptions.innerHTML = `
      <div class="boss-power-section">
        <h3>⚡ PODER TEMPORÁRIO</h3>
        <p>Escolha 1 poder para usar por tempo limitado.</p>
        <div class="power-options">${Object.entries(bossTemporaryPowers).map(([key,p]) => `<button class="power-choice" data-boss-temp="${key}"><strong>${p.icon} ${p.name}</strong><small>${p.desc}</small></button>`).join("")}</div>
      </div>
      <div class="boss-power-section fixed-section">
        <h3>🔒 PODER FIXO</h3>
        <p>Escolha 1 poder que ficará ativo durante toda a luta contra o Boss.</p>
        <div class="power-options">${Object.entries(bossFixedPowers).map(([key,p]) => `<button class="power-choice" data-boss-fixed="${key}"><strong>${p.icon} ${p.name}</strong><small>${p.desc}</small></button>`).join("")}</div>
      </div>`;

    let temporary = null;
    let fixed = null;
    ui.powerOptions.querySelectorAll("[data-boss-temp]").forEach(button => {
      button.onclick = () => {
        temporary = button.dataset.bossTemp;
        ui.powerOptions.querySelectorAll("[data-boss-temp]").forEach(b => b.classList.remove("selected"));
        button.classList.add("selected");
        if (temporary && fixed) confirmBossPowers(temporary, fixed);
      };
    });
    ui.powerOptions.querySelectorAll("[data-boss-fixed]").forEach(button => {
      button.onclick = () => {
        fixed = button.dataset.bossFixed;
        ui.powerOptions.querySelectorAll("[data-boss-fixed]").forEach(b => b.classList.remove("selected"));
        button.classList.add("selected");
        if (temporary && fixed) confirmBossPowers(temporary, fixed);
      };
    });
  }

  function confirmBossPowers(temporary, fixed) {
    state.bossPowers.temporary = temporary;
    state.bossPowers.fixed = fixed;
    state.bossPowers.selectionShown = true;
    applyPower(temporary);
    ui.powerOptions.innerHTML = `<div class="boss-confirmation"><h3>🚀 PODERES ESCOLHIDOS!</h3><p>${bossTemporaryPowers[temporary].icon} ${bossTemporaryPowers[temporary].name}<br>${bossFixedPowers[fixed].icon} ${bossFixedPowers[fixed].name}</p><button id="start-boss-button">⚔️ ENFRENTAR O BOSS</button></div>`;
    document.getElementById("start-boss-button").onclick = () => {
      ui.powerOverlay.classList.add("hidden");
      state.paused = false;
      if (state.boss && !state.boss.defeated) { state.boss.unlocked = true; state.boss.shotTimer = 45; }
    };
  }

  function calculateTimeBonus() {
    // Bônus de até 1.200 pontos. A cada segundo ativo, perde 1 ponto.
    // O tempo de quiz/seleção de poderes não entra na conta porque o relógio
    // só avança enquanto a partida está efetivamente em andamento.
    const seconds = Math.floor(state.activeTimeMs / 1000);
    return Math.max(0, 1200 - seconds);
  }

  async function finishVictory() {
    state.timeBonus = calculateTimeBonus();
    state.finalScore = state.score + state.timeBonus;
    state.running = false; state.gameOver = true; state.paused = false;
    if (state.testMode) {
      state.testMode = false;
      state.testTargetPhase = null;
      ui.gameScreen.classList.add("hidden");
      ui.testScreen.classList.remove("hidden");
      return;
    }
    const rank = await Ranking.saveScore(state.playerName, state.finalScore, {
      tempoSegundos: Math.floor(state.activeTimeMs / 1000),
      bonusTempo: state.timeBonus
    });
    showEndScreen("🏆 BOSS DERROTADO! 🏆", "VOCÊ VENCEU!", rank, true);
  }

  async function loseLife() {
    if (!state.running || state.gameOver || !state.player) return false;
    if (state.player.invulnerable > 0 || state.powers.shieldUntil > state.frame) return false;
    state.lives--; updateHud();
    if (state.lives <= 0) {
      state.running = false; state.gameOver = true; state.paused = false; state.enemyBullets = []; state.bullets = [];
      state.finalScore = state.score;
      if (state.testMode) {
        state.testMode = false;
        state.testTargetPhase = null;
        ui.gameScreen.classList.add("hidden");
        ui.testScreen.classList.remove("hidden");
        return true;
      }
      const rank = await Ranking.saveScore(state.playerName, state.finalScore, {
        tempoSegundos: Math.floor(state.activeTimeMs / 1000),
        bonusTempo: 0
      });
      showEndScreen("GAME OVER", "Todas as vidas foram perdidas.", rank, false); return true;
    }
    state.player.reset(); state.enemyBullets = []; return true;
  }

  async function showEndScreen(title, subtitle, rank, victory = false) {
    ui.gameScreen.classList.add("hidden"); ui.endScreen.classList.remove("hidden"); ui.rankingScreen.classList.add("hidden");
    ui.endTitle.textContent = title;
    ui.endPlayer.textContent = `JOGADOR: ${state.playerName}`;
    const final = state.finalScore || state.score;
    const timeText = `${Math.floor(state.activeTimeMs / 60000)}m ${Math.floor((state.activeTimeMs % 60000) / 1000)}s`;
    ui.endScore.innerHTML = `PONTUAÇÃO FINAL: <strong>${String(final).padStart(5, "0")}</strong><br><small>Eliminados: ${String(state.score).padStart(4, "0")} • Tempo: ${timeText}${victory ? ` • Bônus de tempo: +${state.timeBonus}` : ""}</small>`;
    ui.endRank.textContent = rank ? `#${rank}` : "#--";
  }

  function openRankingScreen() {
    ui.startScreen.classList.add("hidden"); ui.endScreen.classList.add("hidden"); ui.rankingScreen.classList.remove("hidden");
    ui.rankingStatus.textContent = "Atualizando ranking online...";
    Ranking.listen(ui.rankingList);
  }

  function updateHud() {
    const stageLabel = state.phase === 3 ? "BOSS 1" : state.phase === 6 ? "BOSS 2" : state.phase === 9 ? "BOSS 3" : state.phase === 13 ? "BOSS FINAL" : state.phase;
    ui.hudPlayer.textContent = state.playerName;
    ui.hudPhase.textContent = stageLabel;
    ui.hudScore.textContent = String(state.score).padStart(4, "0");
    ui.hudLives.textContent = "❤️ ".repeat(state.lives).trim() || "💔";
  }
  function addScore(points) { state.score += points; updateHud(); }
  function rectsCollide(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
  function circleRectCollide(c,r){const x=Math.max(r.x,Math.min(c.x,r.x+r.width)),y=Math.max(r.y,Math.min(c.y,r.y+r.height)),dx=c.x-x,dy=c.y-y;return dx*dx+dy*dy<=c.radius*c.radius;}

  function updateBullets() {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bullet = state.bullets[i]; bullet.y -= bullet.speed; bullet.x += bullet.vx || 0;
      if (bullet.y + bullet.height < 0 || bullet.x < -20 || bullet.x > canvas.width + 20) { state.bullets.splice(i,1); continue; }
      let consumed = false;
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const enemy = state.enemies[j];
        if (rectsCollide(bullet, enemy.getBounds())) { const dead=enemy.takeDamage(bullet.damage); state.bullets.splice(i,1); consumed=true; if(dead){addScore(enemy.points);state.enemies.splice(j,1);} break; }
      }
      if (consumed) continue;
      if (state.boss && state.boss.unlocked && !state.boss.defeated && rectsCollide(bullet,state.boss.getBounds())) {
        const dead=state.boss.takeDamage(bullet.damage); state.bullets.splice(i,1);
        if(dead){
          const bossPoints = state.phase === 13 ? 2000 : (state.phase === 9 ? 1500 : (state.boss.type === "MINI_BOSS" ? 500 : 1000));
          addScore(bossPoints);
          if(state.phase === 13) finishVictory();
          else completePhase(`👹 ${state.phase === 3 ? "BOSS 1" : state.phase === 6 ? "BOSS 2" : "BOSS 3"} DERROTADO!`, "Agora responda o quiz para avançar.");
        }
      }
    }
  }

  async function updateEnemyBullets() {
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const shot = state.enemyBullets[i];

      // Raio vertical do Boss Final: fica ativo por poucos frames e cria uma
      // zona de perigo clara para o jogador desviar.
      if (shot.kind === "beam" || shot.kind === "slimeBeam") {
        shot.ttl--;
        if (shot.ttl <= 0) { state.enemyBullets.splice(i,1); continue; }
        const beamRect = { x: shot.x - shot.width / 2, y: 0, width: shot.width, height: canvas.height };
        if (rectsCollide(beamRect, state.player.getBounds())) {
          state.enemyBullets.splice(i,1);
          if (shot.kind === "slimeBeam") {
            state.player.immobilizedUntil = Math.max(state.player.immobilizedUntil || 0, state.frame + 120);
          } else {
            await loseLife();
          }
          break;
        }
        continue;
      }

      shot.x += shot.vx || 0;
      shot.y += shot.vy || 0;
      if (shot.y-shot.radius>canvas.height||shot.x+shot.radius<0||shot.x-shot.radius>canvas.width){state.enemyBullets.splice(i,1);continue;}
      if (circleRectCollide(shot,state.player.getBounds())) {
        state.enemyBullets.splice(i,1);
        if (shot.kind === "slime") {
          state.player.immobilizedUntil = Math.max(state.player.immobilizedUntil || 0, state.frame + 120);
        } else {
          await loseLife();
        }
        break;
      }
    }
  }

  function resetEnemyToTop(enemy){enemy.x=Math.random()*Math.max(1,canvas.width-enemy.width);enemy.y=-enemy.height-30-Math.random()*90;enemy.escaped=false;}

  async function updateEnemies() {
    for (const enemy of state.enemies) {
      if (!enemy.active && state.phaseFrame >= enemy.spawnAt) enemy.active=true;
      enemy.update(state.frame,canvas);
      if (enemy.active && enemy.type === "ALIEN_GOSMA" && enemy.descend) {
        enemy.shotCooldown--;
        if (enemy.shotCooldown <= 0) {
          state.enemyBullets.push({x: enemy.x + enemy.width/2, y: enemy.y + enemy.height, vx: 0, vy: 3.2, radius: 7, damage: 0, kind: "slime"});
          enemy.shotCooldown = 110;
        }
      }
    }
    for (let i=state.enemies.length-1;i>=0;i--){const enemy=state.enemies[i];if(!enemy.active)continue;if(enemy.descend&&enemy.y>canvas.height){await loseLife();if(!state.gameOver)resetEnemyToTop(enemy);continue;}if(rectsCollide(enemy.getBounds(),state.player.getBounds())){await loseLife();if(!state.gameOver)resetEnemyToTop(enemy);}}
  }

  function updateBoss(){
    if(!state.boss) return;
    const supportCleared = state.enemies.length === 0;
    if(supportCleared && !state.boss.unlocked){
      if(!state.bossPowers.selectionShown && state.paused){
        return;
      }
      state.boss.unlocked = true;
      state.boss.shotTimer = 45;
    }
    state.boss.update(state.frame,state.enemyBullets,state.player);
  }
  function checkPhaseCompletion(){if(state.transitionLocked)return;if(!state.boss&&state.enemies.length===0){completePhase();return;}if(state.boss&&state.boss.hp<=0)return;}

  function drawBackground(){ctx.clearRect(0,0,canvas.width,canvas.height);const image=backgroundImages[state.phase];if(image&&image.complete&&image.naturalWidth>0){const scale=Math.max(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale,x=(canvas.width-w)/2,y=(canvas.height-h)/2;ctx.drawImage(image,x,y,w,h);}else{ctx.fillStyle="#01030a";ctx.fillRect(0,0,canvas.width,canvas.height);}const overlay=ctx.createLinearGradient(0,0,0,canvas.height);overlay.addColorStop(0,"rgba(0,3,12,.18)");overlay.addColorStop(.55,"rgba(0,2,10,.28)");overlay.addColorStop(1,"rgba(0,2,8,.46)");ctx.fillStyle=overlay;ctx.fillRect(0,0,canvas.width,canvas.height);for(const star of state.stars){star.y+=star.speed;if(star.y>canvas.height){star.y=0;star.x=Math.random()*canvas.width;}ctx.globalAlpha=star.alpha*.28;ctx.fillStyle="#fff";ctx.fillRect(star.x,star.y,star.size,star.size);}ctx.globalAlpha=1;}
  function drawBullets(){
    ctx.save();ctx.shadowBlur=12;ctx.shadowColor="#52d9ff";ctx.fillStyle="#e8fbff";state.bullets.forEach(b=>ctx.fillRect(b.x,b.y,b.width,b.height));ctx.restore();
    state.enemyBullets.forEach(b=>{
      if (b.kind === "beam" || b.kind === "slimeBeam") {
        ctx.save();
        const g=ctx.createLinearGradient(b.x-b.width/2,0,b.x+b.width/2,0);
        if (b.kind === "slimeBeam") {
          g.addColorStop(0,"rgba(80,255,110,0)");g.addColorStop(.5,"rgba(150,255,170,.95)");g.addColorStop(1,"rgba(80,255,110,0)");
        } else {
          g.addColorStop(0,"rgba(255,0,255,0)");g.addColorStop(.5,"rgba(255,215,255,.95)");g.addColorStop(1,"rgba(255,0,255,0)");
        }
        ctx.globalAlpha=.9;ctx.fillStyle=g;ctx.shadowBlur=24;ctx.shadowColor=b.kind==="slimeBeam"?"#4cff72":"#ff35ff";
        ctx.fillRect(b.x-b.width/2,0,b.width,b.height);
        ctx.restore();
        return;
      }
      ctx.save();
      if (b.kind === "slime" || b.kind === "slimeRain") {
        ctx.shadowBlur = 16; ctx.shadowColor = "#58ff70"; ctx.fillStyle = b.kind === "slimeRain" ? "#6dff78" : "#8cff98";
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.radius * 0.72, b.radius * 1.12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath(); ctx.arc(b.x, b.y - b.radius * 0.9, b.radius * 0.34, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = .5; ctx.fillStyle = "#d5ffd8"; ctx.beginPath(); ctx.arc(b.x - b.radius * .25, b.y - b.radius * .35, b.radius * .2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.shadowBlur=16;ctx.shadowColor=b.kind==="energy"?"#d26cff":"#ff5577";ctx.fillStyle=b.kind==="energy"?"#e1a7ff":"#ff8099";ctx.beginPath();ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    });
  }
  function draw(){
    drawBackground();
    state.enemies.forEach(e=>e.draw(ctx));
    if(state.boss)state.boss.draw(ctx);
    drawBullets();
    state.player.draw(ctx);
    if ((state.player.immobilizedUntil || 0) > state.frame) {
      const p=state.player, remain=Math.max(0,p.immobilizedUntil-state.frame);
      ctx.save();
      ctx.strokeStyle="#64ff78"; ctx.shadowBlur=14; ctx.shadowColor="#4cff72"; ctx.lineWidth=2;
      const pad=5; const x=p.x-pad,y=p.y-pad,w=p.width+pad*2,h=p.height+pad*2;
      ctx.strokeRect(x,y,w,h);
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+i*w/3,y);ctx.lineTo(x+w,y+(i+1)*h/4);ctx.stroke();ctx.beginPath();ctx.moveTo(x+w-i*w/3,y+h);ctx.lineTo(x,y+(i+1)*h/4);ctx.stroke();}
      ctx.fillStyle="#baffc2"; ctx.font="bold 11px Arial"; ctx.textAlign="center"; ctx.fillText(`IMOBILIZADO ${(remain/60).toFixed(1)}s`,p.x+p.width/2,p.y-12);
      ctx.restore();
    }
  }

  function loop(){
    if(!state.running)return;
    const now = performance.now();
    if(!state.paused){
      const delta = state.lastTimeStamp ? Math.min(100, Math.max(0, now - state.lastTimeStamp)) : 0;
      state.activeTimeMs += delta;
      state.frame++; state.phaseFrame++;
      state.player.update(state.keys,state.bullets,state);
      updateBullets(); updateEnemyBullets(); updateEnemies(); updateBoss(); checkPhaseCompletion(); draw();
    }
    state.lastTimeStamp = now;
    requestAnimationFrame(loop);
  }

  const testPhases = [
    [1, "FASE 1 — SOL", "12 NORMAL"], [2, "FASE 2 — MERCÚRIO", "NORMAL + MINI TANK"], [3, "BOSS 1 — 250 HP", "Teste direto do Boss 1"],
    [4, "FASE 4 — JÚPITER", "RÁPIDOS + suporte"], [5, "FASE 5 — URANO", "Mistura de inimigos"], [6, "BOSS 2 — 500 HP", "Teste direto do Boss 2"],
    [7, "FASE 7", "24 inimigos"], [8, "FASE 8", "32 inimigos"], [9, "BOSS 3 — 750 HP", "Ataque especial"],
    [10, "FASE 10 — NEBULOSA TÓXICA", "Novo Alien Gosma"], [11, "FASE 11 — ZONA CONTAMINADA", "Mistura + Gosma"], [12, "FASE 12 — COLÔNIA ALIEN", "3 inimigos/segundo"], [13, "BOSS FINAL — ALIEN SUPREMO", "1000 HP + Chuva de Gosma"]
  ];

  function openTestPhases() {
    ui.startScreen.classList.add("hidden");
    ui.rankingScreen.classList.add("hidden");
    ui.endScreen.classList.add("hidden");
    ui.testScreen.classList.remove("hidden");
    ui.testPhaseList.innerHTML = testPhases.map(([n,title,desc]) => `<button class="test-phase-button" data-test-phase="${n}"><strong>${title}</strong><small>${desc}</small></button>`).join("");
  }

  function startTestPhase(phaseNumber) {
    state.testMode = true;
    state.testTargetPhase = phaseNumber;
    state.playerName = "TESTE"; state.phase = phaseNumber; state.score = 0; state.lives = 3; state.activeTimeMs = 0; state.lastTimeStamp = performance.now(); state.timeBonus = 0; state.finalScore = 0; state.gameOver = false; state.running = true; state.paused = false; state.transitionLocked = false; state.frame = 0; state.phaseFrame = 0;
    state.powers = { shieldUntil: 0, tripleShotUntil: 0, rapidFireUntil: 0 };
    state.touch = { active: false, pointerId: null, x: 0, y: 0, offsetX: 0, offsetY: 0 };
    state.bossPowers = { temporary: null, fixed: null, selectionShown: false };
    state.player = new Player(canvas);
    ui.testScreen.classList.add("hidden"); ui.startScreen.classList.add("hidden"); ui.rankingScreen.classList.add("hidden"); ui.endScreen.classList.add("hidden"); ui.gameScreen.classList.remove("hidden");
    updateHud();
    const fn = window[`iniciarFase${phaseNumber}`];
    if (typeof fn !== "function") { state.running = false; ui.gameScreen.classList.add("hidden"); ui.testScreen.classList.remove("hidden"); return; }
    fn();
    // O modo de teste precisa iniciar o loop do jogo também.
    // Sem isso, o HUD aparece, mas inimigos, tiros, movimento e colisões ficam congelados.
    requestAnimationFrame(loop);
    // Para testar um Boss sem repetir as fases anteriores, entramos diretamente na luta.
    if ([3,6,9,13].includes(phaseNumber) && state.boss) {
      state.enemies = [];
      state.boss.unlocked = true;
      state.boss.shotTimer = 45;
    }
  }

  function startTestBossQuiz() {
    if (state.running || !ui.startScreen || ui.startScreen.classList.contains("hidden")) return;
    state.playerName = (ui.nameInput.value.trim() || "TESTE").slice(0, 18);
    state.phase = 12; state.score = 0; state.lives = 3; state.activeTimeMs = 0; state.lastTimeStamp = performance.now(); state.timeBonus = 0; state.finalScore = 0; state.gameOver = false; state.running = true;
    state.paused = true; state.transitionLocked = true; state.frame = 0; state.phaseFrame = 0;
    state.powers = { shieldUntil: 0, tripleShotUntil: 0, rapidFireUntil: 0 };
    state.touch = { active: false, pointerId: null, x: 0, y: 0, offsetX: 0, offsetY: 0 };
    state.bossPowers = { temporary: null, fixed: null, selectionShown: false };
    state.player = new Player(canvas);
    ui.startScreen.classList.add("hidden"); ui.rankingScreen.classList.add("hidden"); ui.endScreen.classList.add("hidden"); ui.gameScreen.classList.remove("hidden");
    updateHud();
    requestAnimationFrame(loop);
    openQuiz("PREPARAÇÃO PARA O BOSS!", "Modo de teste: responda as 3 questões para escolher um poder e enfrentar o Boss Final Alienígena.", () => {
      state.phase = 13;
      state.transitionLocked = false;
      state.paused = false;
      iniciarFase13();
    });
  }

  window.addEventListener("keydown",event=>{
    if (event.code === "KeyT" && document.activeElement !== ui.nameInput && !state.running) {
      event.preventDefault();
      openTestPhases();
      return;
    }
    if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space"].includes(event.code))event.preventDefault();
    state.keys[event.code]=true;
  });
  // CONTROLE MOBILE
  // Um toque/arraste move a nave; enquanto o dedo estiver pressionado, ela atira automaticamente.
  canvas.style.touchAction = "none";

  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    state.touch.active = true;
    state.touch.pointerId = event.pointerId;
    state.touch.x = x;
    state.touch.y = y;
    if (state.player) {
      state.touch.offsetX = x - (state.player.x + state.player.width / 2);
      state.touch.offsetY = y - (state.player.y + state.player.height / 2);
    }
    canvas.setPointerCapture?.(event.pointerId);
  }, { passive: false });

  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch" || event.pointerId !== state.touch.pointerId) return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    state.touch.x = (event.clientX - rect.left) * (canvas.width / rect.width);
    state.touch.y = (event.clientY - rect.top) * (canvas.height / rect.height);
  }, { passive: false });

  const stopTouch = (event) => {
    if (event.pointerType !== "touch" || event.pointerId !== state.touch.pointerId) return;
    event.preventDefault();
    state.touch.active = false;
    state.touch.pointerId = null;
    state.touch.offsetX = 0;
    state.touch.offsetY = 0;
  };

  canvas.addEventListener("pointerup", stopTouch, { passive: false });
  canvas.addEventListener("pointercancel", stopTouch, { passive: false });
  canvas.addEventListener("lostpointercapture", () => {
    state.touch.active = false;
    state.touch.pointerId = null;
  });

  window.addEventListener("keyup",event=>{state.keys[event.code]=false;});
  ui.testPhasesButton.addEventListener("click", openTestPhases);
  ui.testBackButton.addEventListener("click",()=>{ui.testScreen.classList.add("hidden");ui.startScreen.classList.remove("hidden");});
  ui.testPhaseList.addEventListener("click", (event)=>{
    const button = event.target.closest("[data-test-phase]");
    if (!button) return;
    startTestPhase(Number(button.dataset.testPhase));
  });

  ui.startButton.addEventListener("click",()=>startGame(ui.nameInput.value));
  ui.nameInput.addEventListener("keydown",e=>{if(e.key==="Enter")startGame(ui.nameInput.value);});
  ui.rankingButton.addEventListener("click",openRankingScreen);
  ui.rankingBackButton.addEventListener("click",()=>{ui.rankingScreen.classList.add("hidden");ui.startScreen.classList.remove("hidden");});
  ui.endRankingButton.addEventListener("click",openRankingScreen);
  ui.restartButton.addEventListener("click",()=>{ui.endScreen.classList.add("hidden");ui.startScreen.classList.remove("hidden");ui.nameInput.value="";ui.startMessage.textContent="";});
  window.onSpaceRankingUpdated=()=>{ui.rankingStatus.textContent="Ranking online • atualização automática";};

  return {canvas,state,startPhase,completePhase,addScore,updateHud,getState:()=>state};
})();
