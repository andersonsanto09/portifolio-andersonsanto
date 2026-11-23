// ---------- Animação ao rolar ----------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ---------- Galeria: abre a imagem ampliada ----------
const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector("img");

document.querySelectorAll(".gallery button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const thumb = btn.querySelector("img");
    lightboxImg.src = btn.dataset.full;
    lightboxImg.alt = thumb.alt;
    lightbox.showModal();
  });
});
lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
// Clicar fora da imagem fecha
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.close();
});
