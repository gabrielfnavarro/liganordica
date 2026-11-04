/* ==========================================================
   MURAL — para adicionar fotos, copie a imagem para assets/mural/
   e acrescente uma linha na lista abaixo.

   src    caminho da foto
   title  legenda curta
   tag    categoria (ex: 'InterENG', 'TECO', 'JUCO', 'Esports', 'Bastidores').
          Os botões de filtro aparecem sozinhos quando houver 2+ categorias.
   year   ano
   size   'tall' (vertical alta) | 'half' (duas fotos empilhadas) | 'big' (larga)
          Use sempre 'half' em pares, um logo depois do outro.
   x, y, z (opcional) enquadramento: ponto de foco em % e zoom.

   As fotos abaixo são recortes provisórios de assets/team.jpg.
   Troque pelas fotos reais da Liga.
   ========================================================== */
const MURAL = [
  {src:'assets/mural/foto1.jpg', title:'Delegação JUCO',  tag:'JUCO', year:'2026', size:'tall'},
  {src:'assets/mural/foto2.jpeg', title:'JUCO',     tag:'JUCO',  year:'2026', size:'half', x:'49%', y:'52%', z:2.4},
  {src:'assets/mural/foto3.jpeg', title:'JUCO',         tag:'JUCO',  year:'2026', size:'half', x:'56%', y:'41%', z:3.6},
  {src:'assets/mural/foto4.jpeg', title:'JUCO',           tag:'JUCO',  year:'2026', size:'big',  x:'50%', y:'60%', z:1.15},
  {src:'assets/mural/foto5.jpeg', title:'JUCO',           tag:'JUCO',  year:'2026', size:'half', x:'16%', y:'46%', z:2.6},
  {src:'assets/mural/foto6.jpeg', title:'JUCO',          tag:'JUCO',  year:'2026', size:'half', x:'90%', y:'32%', z:2.6},
  {src:'assets/mural/foto7.jpeg', title:'JUCO',         tag:'JUCO',  year:'2026', size:'tall', x:'78%', y:'18%', z:1.7},
  {src:'assets/mural/foto8.jpeg', title:'JUCO', tag:'JUCO', year:'2026', size:'big',  x:'50%', y:'44%', z:1.5},
  {src:'assets/mural/foto9.jpeg', title:'JUCO', tag:'JUCO', year:'2026', size:'big',  x:'50%', y:'44%', z:1.5},
  {src:'assets/mural/foto10.jpeg', title:'JUCO', tag:'JUCO', year:'2026', size:'big',  x:'50%', y:'44%', z:1.5},
  {src:'assets/mural/foto11.jpeg', title:'JUCO', tag:'JUCO', year:'2026', size:'big',  x:'50%', y:'44%', z:1.5},
  {src:'assets/mural/foto12.jpeg', title:'JUCO', tag:'JUCO', year:'2026', size:'big',  x:'50%', y:'44%', z:1.5},
  {src:'assets/mural/foto13.jpeg', title:'JUCO', tag:'JUCO', year:'2026', size:'big',  x:'50%', y:'44%', z:1.5},
  {src:'assets/mural/foto14.jpeg', title:'JUCO', tag:'JUCO', year:'2026', size:'big',  x:'50%', y:'44%', z:1.5},

];

(() => {
  const wall = document.getElementById('wall'); if (!wall) return;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const filtersEl = document.getElementById('muralFilters');
  const countEl = document.getElementById('muralCount');
  const prog = document.querySelector('.mural-progress span');
  const prev = document.getElementById('muralPrev'), next = document.getElementById('muralNext');
  let visible = MURAL.map((_, i) => i);

  // ---------- montagem ----------
  wall.innerHTML = MURAL.map((m, i) =>
    `<button class="tile ${m.size || 'tall'}" data-i="${i}" style="--i:${i};--x:${m.x || '50%'};--y:${m.y || '50%'};--z:${m.z || 1}" aria-label="Ampliar foto: ${m.title}, ${m.year}">
      <span class="ph"><img src="${m.src}" alt="${m.title}" loading="lazy" draggable="false"></span>
      <span class="cap"><span>${m.title}</span><em>${m.year}</em></span></button>`).join('');
  const tiles = [...wall.querySelectorAll('.tile')];

  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { wall.classList.add('in'); o.disconnect(); } }), {threshold: .15}).observe(wall);

  // ---------- filtros ----------
  const tags = [...new Set(MURAL.map(m => m.tag))];
  if (tags.length > 1) {
    filtersEl.innerHTML = ['Todas', ...tags].map((t, i) => `<button aria-pressed="${i === 0}" data-t="${t}">${t}</button>`).join('');
    filtersEl.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      filtersEl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      tiles.forEach((t, i) => { t.hidden = b.dataset.t !== 'Todas' && MURAL[i].tag !== b.dataset.t; t.style.setProperty('--i', 0); });
      visible = MURAL.map((_, i) => i).filter(i => !tiles[i].hidden);
      wall.scrollTo({left: 0}); update();
    });
  }

  // ---------- rolagem: contador, barra e parallax ----------
  let raf;
  function update() {
    raf = 0;
    const max = wall.scrollWidth - wall.clientWidth, p = max > 0 ? wall.scrollLeft / max : 0;
    prog.style.width = (p * 100) + '%';
    prev.disabled = wall.scrollLeft < 4; next.disabled = wall.scrollLeft > max - 4;
    const mid = wall.getBoundingClientRect().left + wall.clientWidth / 2;
    const left = wall.getBoundingClientRect().left + 40; let cur = -1;
    visible.forEach((idx, n) => {
      const r = tiles[idx].getBoundingClientRect(), c = r.left + r.width / 2;
      if (cur < 0 && r.right > left) cur = n;
      if (!reduce && r.right > -100 && r.left < innerWidth + 100) tiles[idx].querySelector('img').style.setProperty('--tx', ((c - mid) / innerWidth * -34).toFixed(1) + 'px');
    });
    countEl.textContent = `${cur + 1} / ${visible.length}`;
  }
  const queue = () => raf || (raf = requestAnimationFrame(update));
  wall.addEventListener('scroll', queue, {passive: true}); addEventListener('resize', queue); update();

  const step = dir => wall.scrollBy({left: dir * wall.clientWidth * .6, behavior: reduce ? 'auto' : 'smooth'});
  prev.onclick = () => step(-1); next.onclick = () => step(1);

  // ---------- arrastar com o mouse (toque e trackpad já rolam nativamente) ----------
  let drag = null, moved = false;
  wall.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button) return; drag = {x: e.clientX, l: wall.scrollLeft}; moved = false; });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!moved && Math.abs(dx) > 5) { moved = true; wall.classList.add('dragging'); }
    if (moved) wall.scrollLeft = drag.l - dx;
  });
  addEventListener('pointerup', () => { drag = null; setTimeout(() => wall.classList.remove('dragging'), 0); });

  // ---------- cursor-guia ----------
  const cur = document.createElement('div'); cur.className = 'wall-cursor'; document.body.appendChild(cur);
  wall.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    cur.textContent = wall.classList.contains('dragging') ? 'Arrastando' : e.target.closest('.tile') ? 'Ampliar' : 'Arraste';
    cur.style.transform = `translate(${e.clientX + 18}px,${e.clientY + 18}px)`; cur.classList.add('on');
  });
  wall.addEventListener('pointerleave', () => cur.classList.remove('on'));

  // ---------- foto ampliada ----------
  const lb = document.getElementById('lb'), lbImg = lb.querySelector('img'), lbInfo = lb.querySelector('.lb-info');
  let pos = 0, opener = null;
  function show(n, from) {
    pos = (n + visible.length) % visible.length;
    const m = MURAL[visible[pos]];
    lbImg.src = m.src; lbImg.alt = m.title;
    lbInfo.innerHTML = `${m.title}<em>${m.year}</em>`;
    if (!reduce && lbImg.animate) lbImg.animate(from ? [{opacity: 0, scale: .94}, {opacity: 1, scale: 1}] : [{opacity: 0, translate: '24px 0'}, {opacity: 1, translate: '0 0'}], {duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)'});
  }
  function open(i) {
    opener = tiles[i]; show(visible.indexOf(i), true);
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    const t = tiles[visible[pos]]; t.scrollIntoView({inline: 'center', block: 'nearest', behavior: 'auto'}); (t || opener).focus({preventScroll: true});
  }
  wall.addEventListener('click', e => { const t = e.target.closest('.tile'); if (t && !moved) open(+t.dataset.i); });
  lb.querySelector('.lb-close').onclick = close;
  lb.querySelector('.lb-prev').onclick = () => show(pos - 1);
  lb.querySelector('.lb-next').onclick = () => show(pos + 1);
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(pos - 1); else if (e.key === 'ArrowRight') show(pos + 1);
  });
  let sx = null; const stage = lb.querySelector('.lb-stage');
  stage.addEventListener('touchstart', e => sx = e.touches[0].clientX, {passive: true});
  stage.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(pos + (dx < 0 ? 1 : -1)); sx = null; });
})();
