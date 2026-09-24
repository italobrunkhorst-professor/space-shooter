/* FASE 12 — COLÔNIA ALIEN — fase final antes do Boss Final */
const configuracaoFase12 = {
  numero: 12, planeta: "COLÔNIA ALIEN",
  criarInimigos(lista) {
    createRandomDescendingEnemies(lista, [
      ...Array(8).fill("NORMAL"), ...Array(8).fill("MINI_TANK"),
      ...Array(8).fill("TANK"), ...Array(8).fill("RAPIDO"), ...Array(8).fill("ALIEN_GOSMA")
    ], { canvasWidth: 500, intervalFrames: 60, spawnPerInterval: 3 });
  }
};
function iniciarFase12() { SpaceShooter.startPhase(configuracaoFase12); }
