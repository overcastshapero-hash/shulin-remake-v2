# 窗口 D 产出 · m-river(素材河)+ m-finale(终幕)
> 修订单-02 已执行(2026-06-10 晚):全彩直出 / 删数字卡 / 删尾簇与丑图 / 落款去数字 / 元数据加中文说明行。章号以总装 index.html 为准(当前:素材河=04,终幕=06)。

## 已接入
两章的 `<section>` 已替换进 `v2/index.html`(CSS 在 head、JS 在 fx.js 之后),`?qa=1` 可直达。
QA 脚本:`showcase-site/qa-tools/shots-d.js`(类选择器定位,不依赖章号;截图入 `v2/qa/d-*.png`);
live 站补截图生成器:`qa-tools/shots-river.js`(产物入 `showcase-assets/site-shots/riv-*.jpg`)。

## m-river 结构速查
- 河道 = 8 簇 × 120vh ≈ 1000vh 总行程(修订单02从 11 簇砍至 8 簇,删去仪式/合集尾簇与
  旭风、江哥嫂子、母亲节信、饮品页等丑图;素材文件保留在库,未删)。
- **肖像限量**:全河肖像只留 3 张(写真簇 f-024/f-047 + 展览簇男刊 m-012,防同人重复),
  其余位置用网站截图(引用窗口 B 的 `sections/m-web/assets/shots/`,只读不改)。
  **瘦身刀:删 `m-river.js` 顶部 `CLUSTERS` 条目即可,其余全自适应。**
- **彩色铁律**:作品素材彩色直出,无 grayscale、无 hover 变彩;远景层仅 opacity .7 减淡。
- 多速漂流:rAF 里 `translate3d`,漂移量 = (scroll − 块锚点) × (1 − speed),四档 0.75/1.0/1.25/1.5;
  漂移量钳制 ±1.6 视口高 + 段上 `overflow:clip`,出章不外溢。
- 中心字标 sticky 常驻(z=2),远景 z=1 / 近景 z=3 / 微标签 z=4,图块从字标前后穿插。
- 左下元数据两行讲解按簇交叉淡换:mono 定位行 + 中文说明行(CLUSTERS 的 meta/note 字段;
  内容整理自 `showcase-assets/data/works.json`;bodyfirst 已下线,live 补位 portrait-archive,现 8 个可点直达)。
- **精选铁律**:全部文案不出现数量统计(数字卡已整卡删除)。
- 视频 8 段已预转码 ≤0.31MB 静音 mp4(`assets/riv-vid-*.mp4`),入视口才播放。
- reduced-motion:静态彩色网格(不收视频块)。

## m-finale 时序
图块飞散(彩色,opacity 减淡)→ 字符散点飞拢锁定口号 → mono 落款「精选 · 还在涨」(不出现数字)
→「未完待续」逐字 drop → 红球(全站唯一跳色收官)四字头顶 squash&stretch 蹦跳、字被砸下沉回弹 →
落成省略号第一点,后两点亮起(白),整组 0.4↔1 呼吸不灭。
版权带 = 照片球页尾同款一行 Space Mono(文案随总装:树成林 · FIRST EDUCATION)+ ♪ 点播 song.mp3 + BACK TO TOP。
QA 钩子:`window.__finaleSettle()` 跳终态。reduced-motion 直显「未完待续 · · ·」。

## 与照片球(01 章)的衔接确认
照片球 `showcase-assets/sites/photo-orbit/` 头部占位 = `#intro-section`(黑底模拟上一章),
尾部占位 = `#footer`(液态波浪 → 黑色极简版权带)。
- 05/06 两章均为纯黑开场/收尾,与照片球黑色波浪尾自然同色续接(05→06 同黑直续,契约表一致);
- m-finale 版权带复用照片球 strip 的版式语言(一行 mono + 描边按钮),全站首尾呼应;
- 照片球文件未做任何修改。总装替换 01 槽位时,只需丢弃照片球自带的 `#intro-section`
  门面与 `#footer` 版权带文案(保留波浪),首尾由 v2 总装壳接管。
