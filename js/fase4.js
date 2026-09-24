/* Fase 4 — TERRA — 12 NORMAL + 6 MINI TANK + 4 TANK */

const configuracaoFase4 = {
  numero: 4,
  planeta: "TERRA",
  criarInimigos(lista) {
    createRandomDescendingEnemies(lista, [
      ...Array(12).fill("NORMAL"),
      ...Array(6).fill("MINI_TANK"),
      ...Array(4).fill("TANK")
    ], { canvasWidth: 500, intervalFrames: 60 });
  }
};

function iniciarFase4() { SpaceShooter.startPhase(configuracaoFase4); }
