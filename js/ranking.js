/* ranking.js
   Ranking online usando Firebase Firestore.
   Fallback localStorage é mantido para funcionar mesmo sem internet/Firebase.
*/
const Ranking = (() => {
  const STORAGE_KEY = "spaceShooterRanking";
  let unsubscribe = null;
  let online = false;
  let cached = [];

  function getLocalScores() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveLocal(nome, pontos) {
    const ranking = getLocalScores();
    ranking.push({ nome: nome || "JOGADOR", pontos: Number(pontos) || 0, data: new Date().toISOString() });
    ranking.sort((a, b) => b.pontos - a.pontos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranking.slice(0, 10)));
    cached = ranking.slice(0, 10);
  }

  function getDb() {
    if (!window.firebase || !window.firebase.firestore) return null;
    try {
      if (!window.__spaceDb) window.__spaceDb = window.firebase.firestore();
      return window.__spaceDb;
    } catch (error) {
      console.warn("Firebase indisponível:", error);
      return null;
    }
  }

  function playerId(nome) {
    return encodeURIComponent((nome || "JOGADOR").trim().toLowerCase()).slice(0, 150);
  }

  async function saveScore(nome, pontos, meta = {}) {
    const score = Number(pontos) || 0;
    saveLocal(nome, score);
    const db = getDb();
    if (!db) return getRank(nome, score);

    try {
      const ref = db.collection("ranking").doc(playerId(nome));
      const snap = await ref.get();
      const oldScore = snap.exists ? Number(snap.data().pontos || 0) : 0;
      if (score >= oldScore) {
        await ref.set({
          nome: nome || "JOGADOR",
          pontos: score,
          tempoSegundos: Number(meta.tempoSegundos) || 0,
          bonusTempo: Number(meta.bonusTempo) || 0,
          atualizadoEm: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
      online = true;
      return await getRank(nome, score);
    } catch (error) {
      console.warn("Não foi possível salvar no Firebase:", error);
      return getRank(nome, score);
    }
  }

  async function getOnlineScores() {
    const db = getDb();
    if (!db) return null;
    try {
      const snap = await db.collection("ranking").orderBy("pontos", "desc").limit(100).get();
      online = true;
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn("Não foi possível ler o ranking online:", error);
      return null;
    }
  }

  async function getRank(nome, score) {
    const onlineScores = await getOnlineScores();
    const list = onlineScores || getLocalScores();
    const index = list.findIndex(item => item.nome === nome && Number(item.pontos) === Number(score));
    return index >= 0 ? index + 1 : list.filter(item => Number(item.pontos) > Number(score)).length + 1;
  }

  function render(element, list = cached.length ? cached : getLocalScores()) {
    if (!element) return;
    element.innerHTML = "";
    if (!list.length) {
      element.innerHTML = "<li>Nenhuma pontuação registrada.</li>";
      return;
    }
    list.slice(0, 20).forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${index + 1}. ${escapeHtml(item.nome || "JOGADOR")}</span><strong>${String(Number(item.pontos) || 0).padStart(4, "0")}</strong>`;
      element.appendChild(li);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));
  }

  function listen(element) {
    if (unsubscribe) unsubscribe();
    const db = getDb();
    if (!db) {
      render(element);
      return;
    }
    unsubscribe = db.collection("ranking").orderBy("pontos", "desc").limit(20).onSnapshot(snap => {
      cached = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      online = true;
      render(element, cached);
      if (typeof window.onSpaceRankingUpdated === "function") window.onSpaceRankingUpdated(cached);
    }, error => {
      console.warn("Ranking em tempo real indisponível:", error);
      render(element);
    });
  }

  return { getScores: getLocalScores, saveScore, getRank, getOnlineScores, render, listen, isOnline: () => online };
})();
