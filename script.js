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
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("visible");
      if (el.classList.contains("skill")) {
        el.querySelector(".bar i").style.width = el.dataset.level + "%";
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
