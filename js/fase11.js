/* FASE 11 — ZONA CONTAMINADA — mistura de todos os inimigos */
const configuracaoFase11 = {
  numero: 11, planeta: "ZONA CONTAMINADA",
  criarInimigos(lista) {
    createRandomDescendingEnemies(lista, [
      ...Array(6).fill("NORMAL"), ...Array(8).fill("MINI_TANK"),
      ...Array(6).fill("ELITE"), ...Array(6).fill("RAPIDO"), ...Array(6).fill("ALIEN_GOSMA")
    ], { canvasWidth: 500, intervalFrames: 60, spawnPerInterval: 2 });
  }
};
function iniciarFase11() { SpaceShooter.startPhase(configuracaoFase11); }
