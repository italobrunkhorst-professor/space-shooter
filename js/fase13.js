/* BOSS FINAL — ALIEN SUPREMO — 1000 HP */
const configuracaoFase13 = {
  numero: 13, planeta: "NÚCLEO DA COLÔNIA",
  criarInimigos(lista) {},
  boss: { tipo: "ALIEN_SUPREMO", maxHp: 1000 }
};
function iniciarFase13() { SpaceShooter.startPhase(configuracaoFase13); }
