(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* scroll reveal */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal").forEach((el) => io ? io.observe(el) : el.classList.add("in"));

  /* 3D parallax on the hero scene */
  const stage = document.querySelector(".stage");
  const scene = document.querySelector(".scene");
  if (stage && scene && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (x, y) => {
      const r = stage.getBoundingClientRect();
      tx = ((x - (r.left + r.width / 2)) / r.width) * 16;
      ty = ((y - (r.top + r.height / 2)) / r.height) * -12;
    };
    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma == null) return;
      tx = Math.max(-14, Math.min(14, e.gamma / 2.5)); ty = Math.max(-10, Math.min(10, (e.beta - 45) / -4));
    }, { passive: true });
    const tick = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      const sy = Math.min(window.scrollY, 600) / 600;
      scene.style.transform = `rotateY(${cx}deg) rotateX(${cy + sy * 8}deg) translateY(${sy * -30}px)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* pricing tilt */
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    if (reduce) return;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateZ(0)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  /* before/after loops: load and play only while on screen */
  const loops = document.querySelectorAll("video.loop");
  if (loops.length) {
    const vio = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { if (!v.getAttribute("src")) v.src = v.dataset.src; if (!reduce) v.play().catch(() => {}); }
      else v.pause();
    }), { threshold: 0.35 }) : null;
    loops.forEach((v) => { if (vio) vio.observe(v); else v.src = v.dataset.src; });
  }

  /* the finished reel, with sound */
  const player = document.getElementById("player");
  if (player) {
    const pv = player.querySelector("video");
    const close = () => { pv.pause(); pv.removeAttribute("src"); pv.load(); player.hidden = true; document.body.style.overflow = ""; };
    document.querySelectorAll("button.play").forEach((b) => b.addEventListener("click", () => {
      pv.poster = b.dataset.poster; pv.src = b.dataset.reel; player.hidden = false; document.body.style.overflow = "hidden";
      pv.play().catch(() => {});
    }));
    player.addEventListener("click", (e) => { if (e.target === player || e.target.closest(".x")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !player.hidden) close(); });
  }

  /* the live flow inside the hero */
  const $ = (s) => document.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const cards = ["#f-wa", "#f-edit", "#f-cap", "#f-ok", "#f-post"].map($);
  if (!cards[0]) return;

  const SETS = [
    { words: ["Monday", "ki", "shuruaat", "garam", "chai", "se", "☕"], hl: 4,
      caption: "Monday ki shuruaat garam chai se ☕ Aaj shaam aao, adda humara hai.", tags: "#chailovers #cafevibes #noida",
      handle: "@your.cafe", edit: "Cutting the best 12 seconds" },
    { words: ["Naye", "colours", "aa", "gaye", "👟"], hl: 1,
      caption: "Naye colours aa gaye 👟 Weekend ke liye ready ho jao.", tags: "#sneakers #newdrop #streetstyle",
      handle: "@your.brand", edit: "Picking the 3 best angles" },
    { words: ["Transformation", "Tuesday", "💪"], hl: 0,
      caption: "Transformation Tuesday 💪 8 weeks, zero shortcuts. Next batch starts soon.", tags: "#fitness #gymlife #transformation",
      handle: "@your.gym", edit: "Syncing cuts to the beat" },
  ];

  const capEl = $("#reelcap"), handleEl = $("#reelhandle"), typed = $("#typed"), tags = $("#tags");
  const editTxt = $("#edittxt"), prog = $("#prog"), okBtn = $("#okbtn"), okTxt = $("#oktxt"), postTxt = $("#posttxt");

  const activate = (i) => cards.forEach((c, k) => c.classList.toggle("active", k === i));

  async function showWords(set) {
    capEl.innerHTML = set.words.map((w, i) => `<span class="w${i === set.hl ? " hl" : ""}">${w}</span>`).join(" ");
    const ws = capEl.querySelectorAll(".w");
    for (const w of ws) { w.classList.add("on"); await wait(reduce ? 0 : 260); }
  }
  async function typeCaption(text) {
    typed.textContent = "";
    if (reduce) { typed.textContent = text; return; }
    for (const ch of text) { typed.textContent += ch; await wait(28); }
  }

  async function loop() {
    let n = 0;
    while (true) {
      const set = SETS[n % SETS.length]; n++;
      handleEl.textContent = set.handle;
      capEl.innerHTML = ""; typed.textContent = ""; tags.textContent = "";
      prog.style.width = "0"; editTxt.textContent = set.edit + "…";
      okTxt.textContent = "Approve this reel?"; okBtn.classList.remove("tap");
      postTxt.innerHTML = "Scheduled for 7:30 PM";

      activate(0); await wait(1800);
      activate(1); await wait(80); prog.style.width = "100%"; await wait(1700);
      editTxt.textContent = "Reel ready ✓";
      await showWords(set); await wait(300);
      activate(2); await typeCaption(set.caption); tags.textContent = set.tags; await wait(900);
      activate(3); await wait(700); okBtn.classList.add("tap"); okTxt.textContent = "Approved ✓"; await wait(1100);
      activate(4); await wait(500); postTxt.innerHTML = '<span class="tick">Posted ✓</span> Instagram · YouTube Shorts'; await wait(2600);
    }
  }
  loop();
})();
