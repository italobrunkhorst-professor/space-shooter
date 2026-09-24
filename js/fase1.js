/* Fase 1 — SOL — 12 NORMAL */

const configuracaoFase1 = {
  numero: 1,
  planeta: "SOL",
  criarInimigos(lista) {
    createRandomDescendingEnemies(lista, Array(12).fill("NORMAL"), { canvasWidth: 500, intervalFrames: 60, speed: 1.25 });
  }
};

function iniciarFase1() { SpaceShooter.startPhase(configuracaoFase1); }
