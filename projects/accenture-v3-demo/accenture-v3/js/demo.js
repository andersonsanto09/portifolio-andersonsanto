/* ══ demo.js — modo demonstração (sem backend) ══════════════════════
   Quando ativo (rf_demo = "1"), intercepta as chamadas fetch para a API
   (API_BASE_URL) e responde com dados simulados guardados no localStorage.
   Carregar DEPOIS de auth.js e ANTES dos demais scripts.
   ══════════════════════════════════════════════════════════════════ */

const DEMO_FLAG = "rf_demo";
const DEMO_DB_KEY = "rf_demo_db";

const DEMO_USERS = {
  ADMIN:      { name: "Anderson Ferreira", email: "anderson@accenture.com", role: "ADMIN" },
  TECHLEADER: { name: "Marina Duarte",     email: "marina@accenture.com",   role: "TECHLEADER" },
  USER:       { name: "Rafael Lima",       email: "rafael@accenture.com",   role: "USER" }
};

function isDemoMode() {
  try { return localStorage.getItem(DEMO_FLAG) === "1"; } catch { return false; }
}

/* ── Entrar / sair do modo demo ─────────────────────────────────── */
function startDemo(role = "ADMIN") {
  const user = DEMO_USERS[role] || DEMO_USERS.ADMIN;

  localStorage.setItem(DEMO_FLAG, "1");
  demoSeed(user);

  setTokens("demo.access.token", "demo.refresh.token");
  setSession({ ...user, provider: "demo" });
}

function stopDemo() {
  localStorage.removeItem(DEMO_FLAG);
  localStorage.removeItem(DEMO_DB_KEY);
}

/* ── Banco simulado ─────────────────────────────────────────────── */
function demoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10); // mesmo formato usado pelo dashboard/calendário
}

function demoLoad() {
  try { return JSON.parse(localStorage.getItem(DEMO_DB_KEY)); } catch { return null; }
}

function demoSave(db) {
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
}

function demoSeed(me) {
  const salasBase = [
    { id: 1, nome: "Sala Olimpo", local: "Torre Corporativa", bloco: "A", andar: 5,  cidade: "São Paulo", estado: "SP", capacidade: 12, imagem: "sala-olimpo.jpg", eq: ["MONITOR_4K", "WEBCAM"] },
    { id: 2, nome: "Sala Aurora", local: "Torre Corporativa", bloco: "B", andar: 3,  cidade: "São Paulo", estado: "SP", capacidade: 6,  imagem: "sala-aurora.jpg", eq: ["MONITOR", "HEADSET"] },
    { id: 3, nome: "Sala Pégaso", local: "Torre Corporativa", bloco: "C", andar: 7,  cidade: "São Paulo", estado: "SP", capacidade: 20, imagem: "sala-pegaso.jpg", eq: ["MONITOR", "TECLADO"] },
    { id: 4, nome: "Sala Hermes", local: "Campus Aracaju",    bloco: "D", andar: 2,  cidade: "Aracaju",   estado: "SE", capacidade: 4,  imagem: "sala-hermes.jpg", eq: ["NOTEBOOK"] },
    { id: 5, nome: "Sala Atlas",  local: "Campus Aracaju",    bloco: "A", andar: 10, cidade: "Aracaju",   estado: "SE", capacidade: 30, imagem: "sala-atlas.jpg",  eq: ["MONITOR_4K", "WEBCAM", "MICROFONE"] },
    { id: 6, nome: "Sala Zeus",   local: "Campus Aracaju",    bloco: "B", andar: 4,  cidade: "Aracaju",   estado: "SE", capacidade: 8,  imagem: "sala-zeus.jpg",   eq: ["MONITOR_4K", "MICROFONE"] }
  ];

  const assentos = {};
  salasBase.forEach(s => {
    const cols = Math.min(6, Math.ceil(Math.sqrt(s.capacidade)));
    assentos[s.id] = Array.from({ length: s.capacidade }, (_, i) => ({
      id: s.id * 1000 + i + 1,
      posicao: i + 1,
      ativo: true,
      tipoAssento: "ESTACAO_PADRAO",
      coordenadaX: i % cols,
      coordenadaY: Math.floor(i / cols),
      tipoCadeira: "ERGONOMICA",
      tipoMesa: "INDIVIDUAL",
      equipamentos: s.eq
    }));
  });

  const usuarios = [
    { id: 1, username: me.name,          nome: me.name,          email: me.email,                  role: me.role,      tipoFuncionario: "GESTOR" },
    { id: 2, username: "Ana Silva",      nome: "Ana Silva",      email: "ana@accenture.com",       role: "TECHLEADER", tipoFuncionario: "PROGRAMADOR" },
    { id: 3, username: "Carlos Mendes",  nome: "Carlos Mendes",  email: "carlos@accenture.com",    role: "USER",       tipoFuncionario: "PROGRAMADOR" },
    { id: 4, username: "Júlia Ramos",    nome: "Júlia Ramos",    email: "julia@accenture.com",     role: "USER",       tipoFuncionario: "DESIGNER" },
    { id: 5, username: "Pedro Souza",    nome: "Pedro Souza",    email: "pedro@accenture.com",     role: "USER",       tipoFuncionario: "QA" },
    { id: 6, username: "Beatriz Costa",  nome: "Beatriz Costa",  email: "beatriz@accenture.com",   role: "USER",       tipoFuncionario: "SUPORTE" }
  ];

  const sala = id => salasBase.find(s => s.id === id).nome;
  const mk = (id, salaId, dia, ini, fim, pos, u, extra = {}) => ({
    id,
    salaId,
    salaNome: sala(salaId),
    nomeSala: sala(salaId),
    dataReserva: demoDate(dia),
    horarioInicio: ini + ":00",
    horarioFim: fim + ":00",
    posicaoAssento: pos,
    posicao: pos,
    statusReserva: "CONFIRMADA",
    usuarioNome: u.nome,
    usuarioEmail: u.email,
    codigoGrupo: null,
    ...extra
  });

  const reservas = [
    mk(1,  1, 0,  "09:00", "10:30", 3,  usuarios[1]),
    mk(2,  2, 0,  "10:00", "11:00", 1,  usuarios[2]),
    mk(3,  3, 0,  "14:00", "16:00", 5,  usuarios[3]),
    mk(4,  4, 0,  "16:30", "17:30", 2,  usuarios[4]),
    mk(5,  5, 1,  "09:00", "11:00", 8,  usuarios[0]),
    mk(6,  6, 1,  "13:00", "15:00", 4,  usuarios[5]),
    mk(7,  1, 2,  "10:00", "12:00", 6,  usuarios[1]),
    mk(8,  3, 3,  "15:00", "17:00", 10, usuarios[2]),
    mk(9,  2, -1, "09:30", "11:00", 2,  usuarios[3]),
    mk(10, 5, -2, "14:00", "16:00", 12, usuarios[4], { statusReserva: "CANCELADA" }),
    mk(11, 6, -3, "10:00", "12:00", 3,  usuarios[5]),
    mk(12, 1, -4, "08:30", "10:00", 1,  usuarios[0])
  ];

  const grupos = [
    {
      id: 1,
      nome: "Squad Front-end",
      descricao: "Time de interfaces e design system",
      lider: { id: 2, nome: usuarios[1].nome, email: usuarios[1].email },
      usuarios: [usuarios[1], usuarios[2], usuarios[3]].map(u => ({ id: u.id, nome: u.nome, email: u.email })),
      convitesPendentes: []
    },
    {
      id: 2,
      nome: "Time de Qualidade",
      descricao: "QA e automação de testes",
      lider: { id: 5, nome: usuarios[4].nome, email: usuarios[4].email },
      usuarios: [usuarios[4], usuarios[5]].map(u => ({ id: u.id, nome: u.nome, email: u.email })),
      convitesPendentes: []
    }
  ];

  demoSave({ salas: salasBase, assentos, usuarios, reservas, grupos, seq: 1000 });
}

/* ── Helpers ────────────────────────────────────────────────────── */
function demoJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function demoText(text, status = 400) {
  return new Response(text, { status, headers: { "Content-Type": "text/plain" } });
}

function demoHora(h) {
  return String(h || "").slice(0, 5);
}

function demoOverlap(r, data, ini, fim) {
  return r.dataReserva === data
    && r.statusReserva !== "CANCELADA"
    && demoHora(r.horarioInicio) < demoHora(fim)
    && demoHora(ini) < demoHora(r.horarioFim);
}

function demoOcupados(db, salaId, data, ini, fim) {
  return db.reservas
    .filter(r => Number(r.salaId) === Number(salaId) && demoOverlap(r, data, ini, fim))
    .map(r => Number(r.posicaoAssento));
}

function demoCriarReserva(db, { salaId, posicao, data, ini, fim, usuario, codigoGrupo = null }) {
  const sala = db.salas.find(s => s.id === Number(salaId));
  const reserva = {
    id: ++db.seq,
    salaId: sala.id,
    salaNome: sala.nome,
    nomeSala: sala.nome,
    dataReserva: data,
    horarioInicio: demoHora(ini) + ":00",
    horarioFim: demoHora(fim) + ":00",
    posicaoAssento: Number(posicao),
    posicao: Number(posicao),
    statusReserva: "CONFIRMADA",
    usuarioNome: usuario.nome,
    usuarioEmail: usuario.email,
    codigoGrupo
  };
  db.reservas.push(reserva);
  return reserva;
}

function demoUsuarioAtual(db) {
  const s = getSession();
  return db.usuarios.find(u => u.email === s?.email)
    || { nome: s?.name || "Usuário", email: s?.email || "" };
}

/* ── Roteador da API simulada ───────────────────────────────────── */
async function demoHandle(rawPath, init = {}) {
  const method = (init.method || "GET").toUpperCase();
  const [path, query = ""] = rawPath.split("?");
  const params = new URLSearchParams(query);

  let body = {};
  try { body = init.body ? JSON.parse(init.body) : {}; } catch { body = {}; }

  let db = demoLoad();
  if (!db) {
    demoSeed(DEMO_USERS[getSession()?.role] || DEMO_USERS.ADMIN);
    db = demoLoad();
  }

  let m;

  // Auth
  if (path.startsWith("/auth/")) return demoJson({});

  // Salas
  if (method === "GET" && path === "/salas") return demoJson(db.salas);

  if (method === "GET" && path === "/salas/ocupados") {
    return demoJson(demoOcupados(
      db, params.get("salaId"), params.get("dataReserva"),
      params.get("horarioInicio"), params.get("horarioFim")
    ));
  }

  if (method === "GET" && (m = path.match(/^\/salas\/(\d+)\/assentos$/))) {
    return demoJson(db.assentos[m[1]] || []);
  }

  // Reservas
  if (method === "GET" && path === "/reservas/historico") return demoJson(db.reservas);

  if (method === "POST" && path === "/reservas") {
    const { salaId, posicaoAssento, dataReserva, horarioInicio, horarioFim } = body;

    if (demoHora(horarioFim) <= demoHora(horarioInicio)) {
      return demoText("O horário final deve ser maior que o inicial.");
    }

    if (demoOcupados(db, salaId, dataReserva, horarioInicio, horarioFim).includes(Number(posicaoAssento))) {
      return demoText("Esse assento já está reservado nesse horário.", 409);
    }

    const r = demoCriarReserva(db, {
      salaId, posicao: posicaoAssento, data: dataReserva,
      ini: horarioInicio, fim: horarioFim, usuario: demoUsuarioAtual(db)
    });
    demoSave(db);
    return demoJson(r, 201);
  }

  if (method === "PUT" && (m = path.match(/^\/reservas\/(\d+)\/cancelar$/))) {
    db.reservas.forEach(r => { if (r.id === Number(m[1])) r.statusReserva = "CANCELADA"; });
    demoSave(db);
    return demoJson({ ok: true });
  }

  if (method === "PUT" && (m = path.match(/^\/reservas\/grupo\/([^/]+)\/cancelar$/))) {
    const codigo = decodeURIComponent(m[1]);
    db.reservas.forEach(r => { if (r.codigoGrupo === codigo) r.statusReserva = "CANCELADA"; });
    demoSave(db);
    return demoJson({ ok: true });
  }

  // Usuários
  if (method === "GET" && (path === "/usuarios" || path === "/usuarios/listarUsuarios")) {
    return demoJson(db.usuarios);
  }

  if (method === "DELETE" && (m = path.match(/^\/usuarios\/(\d+)$/))) {
    db.usuarios = db.usuarios.filter(u => u.id !== Number(m[1]));
    demoSave(db);
    return demoJson({ ok: true });
  }

  // Grupos
  if (method === "GET" && path === "/grupos") return demoJson(db.grupos);
  if (method === "GET" && path === "/grupos/convites/me") return demoJson([]);

  if (method === "POST" && path === "/grupos") {
    const eu = demoUsuarioAtual(db);
    const membros = (body.usuarioIds || [])
      .map(id => db.usuarios.find(u => u.id === id))
      .filter(Boolean)
      .map(u => ({ id: u.id, nome: u.nome, email: u.email }));

    const grupo = {
      id: ++db.seq,
      nome: body.nome,
      descricao: body.descricao || "",
      lider: { id: eu.id || 1, nome: eu.nome, email: eu.email },
      usuarios: [{ id: eu.id || 1, nome: eu.nome, email: eu.email }, ...membros],
      convitesPendentes: []
    };
    db.grupos.push(grupo);
    demoSave(db);
    return demoJson(grupo, 201);
  }

  if (method === "PUT" && (m = path.match(/^\/grupos\/(\d+)$/))) {
    db.grupos.forEach(g => {
      if (g.id === Number(m[1])) {
        g.nome = body.nome ?? g.nome;
        g.descricao = body.descricao ?? g.descricao;
      }
    });
    demoSave(db);
    return demoJson({ ok: true });
  }

  if (method === "DELETE" && (m = path.match(/^\/grupos\/(\d+)$/))) {
    db.grupos = db.grupos.filter(g => g.id !== Number(m[1]));
    demoSave(db);
    return demoJson({ ok: true });
  }

  if (method === "POST" && /^\/grupos\/\d+\/convites$/.test(path)) return demoJson({ ok: true });
  if (path.startsWith("/grupos/convites/")) return demoJson({ ok: true });

  // IA — sugere salas com assentos livres lado a lado para o grupo
  if (method === "POST" && path === "/ia/opcoes") {
    const grupo = db.grupos.find(g => g.id === Number(body.grupoId));
    if (!grupo) return demoText("Grupo não encontrado.", 404);

    const qtd = grupo.usuarios.length;
    const opcoes = [];

    db.salas.forEach(sala => {
      const ocupados = demoOcupados(db, sala.id, body.dataReserva, body.horarioInicio, body.horarioFim);
      const livres = db.assentos[sala.id]
        .map(a => a.posicao)
        .filter(p => !ocupados.includes(p));

      if (livres.length < qtd) return;

      const escolhidos = livres.slice(0, qtd);
      const juntos = escolhidos.every((p, i) => i === 0 || p - escolhidos[i - 1] === 1);
      const folga = Math.min(1, (livres.length - qtd) / Math.max(1, sala.capacidade));
      const compat = Math.round(Math.min(98, 70 + (juntos ? 20 : 0) + folga * 8));

      opcoes.push({
        salaId: sala.id,
        salaNome: sala.nome,
        compatibilidade: compat,
        observacao: juntos
          ? `${qtd} assentos lado a lado, ${livres.length} livres no horário.`
          : `${qtd} assentos livres, porém não consecutivos.`,
        assentos: escolhidos.map(p => {
          const a = db.assentos[sala.id].find(x => x.posicao === p);
          return { id: a.id, posicao: p, tipoAssento: a.tipoAssento, equipamentos: a.equipamentos };
        })
      });
    });

    opcoes.sort((a, b) => b.compatibilidade - a.compatibilidade);

    return demoJson({
      mensagem: opcoes.length
        ? `Encontrei ${Math.min(3, opcoes.length)} opção(ões) para ${qtd} pessoa(s) (modo demonstração).`
        : "Nenhuma sala tem assentos suficientes nesse horário.",
      opcoes: opcoes.slice(0, 3)
    });
  }

  if (method === "POST" && path === "/reservas/confirmar-opcao") {
    const grupo = db.grupos.find(g => g.id === Number(body.grupoId));
    if (!grupo) return demoText("Grupo não encontrado.", 404);

    const ocupados = demoOcupados(db, body.salaId, body.dataReserva, body.horarioInicio, body.horarioFim);
    const posicoes = body.posicoesAssentos || [];

    if (posicoes.some(p => ocupados.includes(Number(p)))) {
      return demoText("Algum dos assentos escolhidos acabou de ser reservado.", 409);
    }

    const codigo = "GRP-" + String(++db.seq).padStart(4, "0");

    posicoes.forEach((p, i) => {
      const membro = grupo.usuarios[i] || grupo.usuarios[0];
      demoCriarReserva(db, {
        salaId: body.salaId, posicao: p, data: body.dataReserva,
        ini: body.horarioInicio, fim: body.horarioFim,
        usuario: { nome: membro.nome, email: membro.email }, codigoGrupo: codigo
      });
    });

    demoSave(db);
    return demoJson({ codigoGrupo: codigo }, 201);
  }

  return demoText(`Rota não simulada no modo demonstração: ${method} ${path}`, 404);
}

/* ── Interceptação do fetch ─────────────────────────────────────── */
(function () {
  const realFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input?.url || "";

    if (isDemoMode() && url.startsWith(API_BASE_URL)) {
      return demoHandle(url.slice(API_BASE_URL.length), init || {});
    }

    return realFetch(input, init);
  };
})();
