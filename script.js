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

// ---------- Carrossel dos projetos (um card por projeto) ----------
(function setupMarquee() {
  const marquee = document.querySelector(".marquee");
  const track = marquee && marquee.querySelector(".cards");
  if (!track) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPEED = reduced ? 0 : 30; // px por segundo (quanto menor, mais lento)
  const FRICTION = 0.94;          // inércia ao soltar (mais perto de 1 = desliza mais)

  // Uma cópia (só visual) da fila logo atrás dela, para o fim emendar no começo sem espaço vazio.
  // Como a fila é mais larga que a tela, o mesmo card nunca aparece duas vezes ao mesmo tempo.
  [...track.children].forEach((card) => {
    const c = card.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    c.querySelectorAll("a, button").forEach((el) => el.setAttribute("tabindex", "-1"));
    track.appendChild(c);
  });

  // Percurso de uma volta: de 0 até -(largura de uma fila)
  let start = 0, end = 0;
  const measure = () => {
    end = -track.offsetWidth / 2;
  };
  measure();
  window.addEventListener("resize", measure);

  let x = 0; // posição atual
  let velocity = 0;            // velocidade extra vinda do arraste (px/quadro)
  let hovering = false, dragging = false;

  // Ao sair de um lado, reaparece do outro
  const wrap = () => {
    if (x < end) x += start - end;
    else if (x > start) x -= start - end;
  };

  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!dragging) {
      if (Math.abs(velocity) > 0.1) {
        x += velocity;
        velocity *= FRICTION;
      } else {
        velocity = 0;
        if (!hovering) x -= SPEED * dt;
      }
      wrap();
    }
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Pausa quando o mouse está em cima (no toque não existe "hover")
  marquee.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovering = true; });
  marquee.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hovering = false; });
  marquee.addEventListener("focusin", () => (hovering = true));
  marquee.addEventListener("focusout", () => (hovering = false));

  // Arrastar com mouse ou dedo
  let pointerId = null, downX = 0, prevX = 0, moved = false;
  marquee.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    pointerId = e.pointerId;
    downX = prevX = e.clientX;
    moved = false;
    velocity = 0;
  });
  marquee.addEventListener("pointermove", (e) => {
    if (e.pointerId !== pointerId) return;
    if (!moved && Math.abs(e.clientX - downX) > 6) {
      moved = dragging = true; // só vira arraste depois de mexer um pouco (senão é clique)
      marquee.classList.add("is-dragging");
      marquee.setPointerCapture(pointerId);
    }
    if (!dragging) return;
    const dx = e.clientX - prevX;
    prevX = e.clientX;
    x += dx;
    velocity = dx;
    wrap();
  });
  const release = (e) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    dragging = false;
    marquee.classList.remove("is-dragging");
  };
  marquee.addEventListener("pointerup", release);
  marquee.addEventListener("pointercancel", release);

  // Impede o navegador de "arrastar o link" no lugar do carrossel
  marquee.addEventListener("dragstart", (e) => e.preventDefault());

  // Depois de arrastar, não abre o link do card por engano
  marquee.addEventListener("click", (e) => {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);
})();

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
