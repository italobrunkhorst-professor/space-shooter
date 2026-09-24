/* BOSS 2 — NÚCLEO GALÁCTICO — 6 MINI TANK + BOSS 500 HP */

const configuracaoFase6 = {
  numero: 6,
  planeta: "NÚCLEO GALÁCTICO",
  criarInimigos(lista) {
    // Formação original do segundo Boss:
    // MINI TANK | MINI TANK | MINI TANK
    // MINI TANK | MINI TANK | MINI TANK
    createEnemyFormation(lista, "MINI_TANK", 6, {
      cols: 3,
      startY: 82,
      gapX: 86,
      gapY: 62,
      horizontalOnly: true
    });
  },
  boss: {
    tipo: "BOSS",
    maxHp: 500
  }
};

function iniciarFase6() { SpaceShooter.startPhase(configuracaoFase6); }
