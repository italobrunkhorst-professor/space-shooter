/* Fase 2 — MERCÚRIO — 12 NORMAL + 8 MINI TANK */

const configuracaoFase2 = {
  numero: 2,
  planeta: "MERCÚRIO",
  criarInimigos(lista) {
    createRandomDescendingEnemies(lista, [
      ...Array(12).fill("NORMAL"),
      ...Array(8).fill("MINI_TANK")
    ], { canvasWidth: 500, intervalFrames: 60 });
  }
};

function iniciarFase2() { SpaceShooter.startPhase(configuracaoFase2); }
