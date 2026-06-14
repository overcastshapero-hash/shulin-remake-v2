/* v2-nav:扫描 main section[data-title] 建右侧目录;点击经 FX.lenis 平滑跳转 */
(function () {
  'use strict';
  function build() {
    if (document.querySelector('.v2-nav')) return;
    var secs = Array.prototype.slice.call(document.querySelectorAll('main section[data-title]'));
    if (secs.length < 2) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nav = document.createElement('nav');
    nav.className = 'v2-nav';
    nav.setAttribute('aria-label', '章节目录');
    secs.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'v2-nav__item';
      var lab = document.createElement('span'); lab.className = 'v2-nav__label';
      lab.textContent = s.getAttribute('data-title');
      var dot = document.createElement('i'); dot.className = 'v2-nav__dot';
      b.appendChild(lab); b.appendChild(dot);
      b.addEventListener('click', function () {
        // 章节高度动态变化:点击时现量 offsetTop,不缓存
        var y = s.getBoundingClientRect().top + window.scrollY + 2;
        if (window.FX && window.FX.lenis) {
          window.FX.lenis.scrollTo(y, { duration: reduced ? 0 : 1.2 });
        } else {
          window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
        }
      });
      nav.appendChild(b);
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            var act = nav.querySelector('.v2-nav__item.is-active');
            if (act) act.classList.remove('is-active');
            b.classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      io.observe(s);
    });
    document.body.appendChild(nav);
    requestAnimationFrame(function () { nav.classList.add('is-on'); });
  }
  // 各章 DOM 由 JS 异步生成,延迟扫描
  if (document.readyState === 'complete') setTimeout(build, 1500);
  else window.addEventListener('load', function () { setTimeout(build, 1500); });
})();
