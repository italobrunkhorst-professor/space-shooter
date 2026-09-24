/* FASE 10 — NEBULOSA TÓXICA — introdução do Alien Gosma */
const configuracaoFase10 = {
  numero: 10, planeta: "NEBULOSA TÓXICA",
  criarInimigos(lista) {
    createRandomDescendingEnemies(lista, [
      ...Array(6).fill("NORMAL"), ...Array(6).fill("MINI_TANK"),
      ...Array(4).fill("RAPIDO"), ...Array(6).fill("ALIEN_GOSMA")
    ], { canvasWidth: 500, intervalFrames: 60, spawnPerInterval: 2 });
  }
};
function iniciarFase10() { SpaceShooter.startPhase(configuracaoFase10); }
