/* v2-prefetch:开场加载完成后,空闲期按文档顺序把全站媒体悄悄拉进浏览器缓存。
   解决「滑到哪儿等到哪儿」:等用户滚到时,资源大概率已在本地。
   策略:窗口 load + 2.5s 启动第一轮(此时各章 JS 已建段),+9s второй轮补漏;
   并发 3,省流模式(saveData)不跑;同一 URL 只取一次。 */
(function () {
  'use strict';
  if (navigator.connection && navigator.connection.saveData) return;
  var seen = {};
  var ACTIVE = 0, MAX = 3, queue = [];

  function collect() {
    var sel = 'img[src],img[data-src],video[src],video[data-src],video[poster],iframe[data-src]';
    document.querySelectorAll(sel).forEach(function (el) {
      ['src', 'data-src', 'poster'].forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && !seen[v] && v.indexOf('data:') !== 0 && v.indexOf('about:') !== 0) {
          seen[v] = true;
          queue.push(v);
        }
      });
    });
    pump();
  }

  function pump() {
    while (ACTIVE < MAX && queue.length) {
      var u = queue.shift();
      ACTIVE++;
      fetch(u, { credentials: 'same-origin' })
        .then(function (r) { return r && r.blob ? r.blob() : null; })
        .catch(function () {})
        .then(function () { ACTIVE--; pump(); });
    }
  }

  // 高优先清单:开场 loader 期间立刻抢载(关键 live 页与品牌底片)
  var enc = encodeURIComponent;
  var PRIORITY = [
    '../../showcase-assets/sites/photo-orbit/index.html',
    '../../showcase-assets/live-works/' + enc('视觉效果比较好的') + '/' + enc('从0到1是最贵的（树林）.html'),
    '../../showcase-assets/live-works/' + enc('视觉效果比较好的') + '/' + enc('笔记封面.html'),
    '../../showcase-assets/live-works/' + enc('视觉效果比较好的') + '/' + enc('有一道看不见的墙.html'),
    'sections/m-river/assets/riv-vid-flow.mp4',
    'sections/m-web/assets/letters/l3.mp4',
    'sections/m-web/assets/letters/l5.mp4',
    'sections/m-web/assets/letters/l4.mp4'
  ];
  function prime() {
    PRIORITY.forEach(function (u) { if (!seen[u]) { seen[u] = true; queue.push(u); } });
    pump();
  }

  function start() {
    setTimeout(collect, 2500);  // 第一轮:各章建段完成后
    setTimeout(collect, 9000);  // 第二轮:补迟建的段
  }
  if (document.readyState !== 'loading') prime();
  else document.addEventListener('DOMContentLoaded', prime);
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
