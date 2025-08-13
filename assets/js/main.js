/* 1) Mobile Menu Toggle */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));
});

/* 2) Showcase Gallery (11 slides) */
(function () {
  const track = document.getElementById('gallery-track');
  const viewport = document.getElementById('gallery-viewport');
  const thumbs = Array.from(document.querySelectorAll('#gallery-thumbs .thumb'));
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  if (!track || !viewport || !prevBtn || !nextBtn) return;

  const slideCount = track.children.length;
  let index = 0;
  const intervalMs = 1500;
  let timer = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function go(i) {
    index = (i + slideCount) % slideCount;
    track.style.transform = `translateX(-${index * 100}%)`;
    thumbs.forEach((t, k) => {
      t.classList.toggle('active', k === index);
      t.classList.toggle('ring-emerald-400/60', k === index);
      t.classList.toggle('ring-white/10', k !== index);
    });
  }
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  function start() { if (!prefersReduced && !timer) timer = setInterval(next, intervalMs); }
  function stop()  { if (timer) { clearInterval(timer); timer = null; } }

  nextBtn.addEventListener('click', () => { stop(); next(); start(); });
  prevBtn.addEventListener('click', () => { stop(); prev(); start(); });
  thumbs.forEach((btn, i) => btn.addEventListener('click', () => { stop(); go(i); start(); }));
  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop : start)());

  go(0);
  start();
})();

/* 3) Mobile timeline reveal on scroll */
(function () {
  const items = document.querySelectorAll('#process .reveal');
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
})();

/** Attachments: custom picker + drag&drop + list preview **/
(function () {
  const input = document.getElementById('attachments');
  const pickBtn = document.getElementById('pickFiles');
  const dropZone = document.getElementById('dropZone');
  const list = document.getElementById('fileList');
  if (!input || !pickBtn || !dropZone || !list) return;

  const MAX_MB = 10;
  const ACCEPT = ['pdf','jpg','jpeg','png','webp'];

  // 触发选择
  function openPicker() { input.click(); }
  pickBtn.addEventListener('click', openPicker);
  dropZone.addEventListener('click', (e) => {
    // 避免点到按钮外区域不生效
    if (e.target === dropZone) openPicker();
  });

  // 拖拽态样式
  ['dragenter','dragover'].forEach(evt =>
    dropZone.addEventListener(evt, e => {
      e.preventDefault();
      dropZone.classList.add('ring-1','ring-emerald-400/50');
    })
  );
  ['dragleave','drop'].forEach(evt =>
    dropZone.addEventListener(evt, e => {
      e.preventDefault();
      dropZone.classList.remove('ring-1','ring-emerald-400/50');
    })
  );

  // 放置文件
  dropZone.addEventListener('drop', (e) => {
    if (!e.dataTransfer?.files?.length) return;
    input.files = e.dataTransfer.files;   // 同步到 input
    renderList();
  });

  // 选择变更
  input.addEventListener('change', renderList);

  function renderList() {
    const files = Array.from(input.files || []);
    if (!files.length) { list.innerHTML = ''; return; }

    // 校验 & 渲染
    const items = files.map(f => {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      const sizeMB = f.size / (1024 * 1024);
      let err = '';

      if (!ACCEPT.includes(ext)) {
        err = `Unsupported type: .${ext}`;
      } else if (sizeMB > MAX_MB) {
        err = `Too large: ${sizeMB.toFixed(1)} MB (max ${MAX_MB} MB)`;
      }

      // 列表项（错误项用红色）
      return `
        <li class="flex items-center gap-2 ${err ? 'text-rose-400' : 'text-zinc-300'}">
          <svg class="w-4 h-4 ${err ? 'text-rose-400' : 'text-brand'}"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14.5 2h-5L3 7.5V22h18V7.5L14.5 2z"/><path d="M14.5 2v5H9.5V2"/>
          </svg>
          <span class="truncate max-w-[70%]">${escapeHtml(f.name)}</span>
          <span class="ml-auto text-xs text-zinc-400">${sizeMB.toFixed(1)} MB</span>
          ${err ? `<span class="ml-2 text-xs">${err}</span>` : ''}
        </li>`;
    });

    list.innerHTML = items.join('');
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[c]));
  }
})();