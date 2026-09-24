/* Fase 7 — ESPAÇO PROFUNDO — 24 inimigos, 2 a cada 1 segundo */

const configuracaoFase7 = {
  numero: 7,
  planeta: "ESPAÇO PROFUNDO",
  criarInimigos(lista) {
    createRandomDescendingEnemies(lista, [
      ...Array(8).fill("NORMAL"),
      ...Array(6).fill("MINI_TANK"),
      ...Array(4).fill("RAPIDO"),
      ...Array(6).fill("ELITE")
    ], { canvasWidth: 500, intervalFrames: 60, spawnPerInterval: 2 });
  }
};

function iniciarFase7() { SpaceShooter.startPhase(configuracaoFase7); }
