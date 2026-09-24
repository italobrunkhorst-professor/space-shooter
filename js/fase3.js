/* BOSS 1 — JÚPITER — 6 RÁPIDOS + MINI BOSS 250 HP */

const configuracaoFase3 = {
  numero: 3,
  planeta: "JÚPITER",
  criarInimigos(lista) {
    // Formação original do primeiro Boss:
    // RÁPIDO | RÁPIDO | RÁPIDO
    // RÁPIDO | RÁPIDO | RÁPIDO
    createEnemyFormation(lista, "RAPIDO", 6, {
      cols: 3,
      startY: 68,
      gapX: 60,
      gapY: 52,
      horizontalOnly: true
    });
  },
  boss: {
    tipo: "MINI_BOSS"
  }
};

function iniciarFase3() { SpaceShooter.startPhase(configuracaoFase3); }
