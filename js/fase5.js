/* Fase 5 — URANO — 34 inimigos */

const configuracaoFase5 = {
  numero: 5,
  planeta: "URANO",
  criarInimigos(lista) {
    createRandomDescendingEnemies(lista, [
      ...Array(12).fill("NORMAL"),
      ...Array(8).fill("MINI_TANK"),
      ...Array(4).fill("TANK"),
      ...Array(10).fill("RAPIDO")
    ], { canvasWidth: 500, intervalFrames: 60 });
  }
};

function iniciarFase5() { SpaceShooter.startPhase(configuracaoFase5); }
