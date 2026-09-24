/* Fase 8 — ZONA CÓSMICA — 32 inimigos, 2 a cada 1 segundo */

const configuracaoFase8 = {
  numero: 8,
  planeta: "ZONA CÓSMICA",
  criarInimigos(lista) {
    createRandomDescendingEnemies(lista, [
      ...Array(6).fill("NORMAL"),
      ...Array(8).fill("MINI_TANK"),
      ...Array(6).fill("TANK"),
      ...Array(6).fill("RAPIDO"),
      ...Array(6).fill("ELITE")
    ], { canvasWidth: 500, intervalFrames: 60, spawnPerInterval: 2 });
  }
};

function iniciarFase8() { SpaceShooter.startPhase(configuracaoFase8); }
