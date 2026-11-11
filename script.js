// ---------- Menu mobile ----------
const navToggle = document.getElementById("navToggle");
const navList = document.getElementById("navList");

navToggle.addEventListener("click", () => {
  const open = navList.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
navList.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navList.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

// ---------- Rolagem suave ao clicar nos links do menu ----------
const NAV_OFFSET = 90; // espaço para o menu fixo não cobrir o título

function smoothScrollTo(targetY, duration = 1100) {
  const html = document.documentElement;
  const startY = window.scrollY;
  const distance = targetY - startY;
  const start = performance.now();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // acelera e desacelera suave

  html.style.scrollBehavior = "auto"; // evita conflito com o smooth do CSS
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    window.scrollTo(0, startY + distance * ease(t));
    if (t < 1) requestAnimationFrame(step);
    else html.style.scrollBehavior = "";
  };
  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    const target = href.length > 1 && document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    smoothScrollTo(Math.max(0, y));
    history.pushState(null, "", href);
  });
});

// ---------- Esconde o nav ao descer, mostra ao subir ----------
const navWrap = document.querySelector(".nav-wrap");
let lastY = window.scrollY;
window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) < 8) return; // ignora movimentos mínimos
    const goingDown = y > lastY && y > 80;
    const menuOpen = navList.classList.contains("open");
    navWrap.classList.toggle("nav-hidden", goingDown && !menuOpen);
    lastY = y;
  },
  { passive: true }
);

// ---------- Fallback de imagens ----------
function setupFallback(imgId, fallbackId) {
  const img = document.getElementById(imgId);
  const fb = document.getElementById(fallbackId);
  const show = () => { img.hidden = true; fb.hidden = false; };
  img.addEventListener("error", show);
  if (img.complete && img.naturalWidth === 0) show();
}
setupFallback("avatarImg", "avatarFallback");
setupFallback("photoImg", "photoFallback");

// ---------- Animação ao rolar + barras de skills ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Cria o rótulo de % de cada skill a partir do data-level
document.querySelectorAll(".skill").forEach((skill) => {
  const name = skill.querySelector(".skill-name");
  const head = document.createElement("div");
  head.className = "skill-head";
  name.replaceWith(head);
  const pct = document.createElement("span");
  pct.className = "skill-pct";
  pct.textContent = "0%";
  head.append(name, pct);
});

function countUp(el, target, duration = 1200) {
  if (reduceMotion) { el.textContent = target + "%"; return; }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + "%";
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("visible");
      if (el.classList.contains("skill")) {
        const level = Number(el.dataset.level);
        el.querySelector(".bar i").style.width = level + "%";
        countUp(el.querySelector(".skill-pct"), level);
      }
      observer.unobserve(el);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ---------- Link ativo no menu ----------
const sections = ["sobre", "portfolio", "skills", "contato"];
const links = {};
sections.forEach((id) => {
  links[id] = navList.querySelector(`a[href="#${id}"]`);
});
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      Object.values(links).forEach((l) => l && l.classList.remove("active"));
      const link = links[entry.target.id];
      if (link) link.classList.add("active");
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((id) => {
  const el = document.getElementById(id);
  if (el) spy.observe(el);
});

// ---------- Formulário (abre o e-mail do usuário com a mensagem pronta) ----------
const EMAIL = "a.santo28092006@gmail.com";
const form = document.getElementById("contactForm");
const msg = document.getElementById("formMsg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const mensagem = form.mensagem.value.trim();

  msg.className = "form-msg";
  if (!nome || !email || !mensagem) {
    msg.textContent = "Preencha todos os campos.";
    msg.classList.add("error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.textContent = "Digite um e-mail válido.";
    msg.classList.add("error");
    return;
  }

  const assunto = encodeURIComponent(`Contato pelo portfólio – ${nome}`);
  const corpo = encodeURIComponent(`${mensagem}\n\nDe: ${nome} (${email})`);
  window.location.href = `mailto:${EMAIL}?subject=${assunto}&body=${corpo}`;

  msg.textContent = "Abrindo seu aplicativo de e-mail…";
  msg.classList.add("ok");
  form.reset();
});
