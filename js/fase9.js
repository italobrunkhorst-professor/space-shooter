/* BOSS FINAL — ESPAÇO CÓSMICO — 750 HP */

const configuracaoFase9 = {
  numero: 9,
  planeta: "BATALHA FINAL",
  criarInimigos(lista) {
    // Boss Final: sem inimigos de suporte.
  },
  boss: {
    tipo: "BOSS_FINAL",
    maxHp: 750
  }
};

function iniciarFase9() { SpaceShooter.startPhase(configuracaoFase9); }
