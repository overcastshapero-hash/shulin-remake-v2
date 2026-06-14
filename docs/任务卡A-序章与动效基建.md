# 任务卡 A · 序章 + 全站动效组件库
> 你负责整站的"第一口气"和所有窗口共用的动效地基。产出两样东西:① `base/`(组件库,纯 JS/CSS,无构建)② `m-intro` 序章 section。其他窗口会直接引用你的组件库,接口必须稳定。

## 设计契约(不可改)
- 颜色:纯黑 #000 / 纯白 #FFF / 灰 #8A8A8A;**唯一跳色 正红 #E32B16**,只准出现在:开场幕、章节编号「0X」、光标信息卡描边。红永不做大面积底色、永不进正文。
- 字体:Archivo 900(英文巨字,字距 -.04em)/ Space Mono(标签,大写 .18em)/ Noto Sans SC 900+400(中文)。
- 缓动全站唯一:`cubic-bezier(.16,1,.3,1)`。只动 transform/opacity。
- 类名前缀 `m-intro`、组件前缀 `fx-`;无裸标签选择器;支持 prefers-reduced-motion(直接显示、去 pin)。

## 一、组件库 base/(其他窗口要用,先做)
1. **Lenis 平滑滚动**:lerp 0.1,桥接 GSAP ScrollTrigger(`lenis.on('scroll', ScrollTrigger.update)`)。流畅度六件套照此实现:Lenis + clip-path mask reveal + scale settle + expo.out 长缓动 + transform/opacity-only + scrub:1。
2. **revealText(el, {mode})** 全站唯一文字进场函数,三模式:
   - `rise`:行级遮罩升起(SplitText lines,外层 overflow:hidden,yPercent 100→0,stagger 0.08)——所有标题;
   - `drop`:逐字掉落(chars yPercent -140→0,stagger 0.035,带 ±8° 随机微旋)——Hero 与章节卡;
   - `roll`:字符纵滚 slot-machine(chars 在行罩内 yPercent [220→110→0] 两连滚,stagger 0.02 from random)——清单行。
3. **章节幕 fx-curtain**:两种过场。a) 黑白幕硬切:纯色 fixed 遮罩 0ms 落下、150ms 揭开,幕中央 Space Mono 章节卡「0X — 名词」(编号红色);b) **睁眼幕**(大章用):上下两块半屏色板,先露 2px 中缝悬念 0.3s,再各自 yPercent 退场,总时长 1.4s。
4. **fx-marquee**:无限横向跑马灯(内容复制两份 translateX 0→-50%),支持滚速联动(ScrollTrigger getVelocity 改 timeScale)。
5. **mix-blend-mode:difference 反色规范**:固定导航、章节编号、滚动进度数字统一 `color:#FFF; mix-blend-mode:difference`,跨黑白幕自动反色;注意祖先元素勿建 stacking context(必要时 isolation:isolate)。

## 二、m-intro 序章(行程 ~150vh + 4 秒仪式)
按帧拆解还原,顺序:
1. **加载计数**(参考 vid-7):黑幕,Space Mono 白色大数字 0→100,**真实预载**(照片球首屏缩略+字体+首屏图,decode() 完成才放行),tabular-nums 防抖;旁边轮换两三条 Space Mono 小字(用数字事实句:`38 件成品 · 13 个在线`)。
2. **红幕上切**(参考 vid-9):计数满 → 正红幕自底而上盖屏一闪 → 整幕 yPercent -100 上切(1s,契约缓动)。这是全站跳色的第一次亮相。
3. **Hero 巨字**(参考 vid-9/10):`说一句话。` / `拿到成品。` 两行,revealText drop 模式逐字落位;副文一行 rise:`网站、视频、写真、歌。每一件,都是用 AI 当场做出来的。`
4. **指令行情带**:底部 fx-marquee,Space Mono,内容(真实指令原句,逐条用 ✦ 分隔):`"把这份母亲节祝福做成一个会动、配轻音乐的网页" ✦ "把我这段口播音频做成能录屏发抖音的视频" ✦ "把我的写真做成一整本不同风格的合辑海报" ✦ "用婚恋法律去小红书把爆款笔记扒出来整理成选题库" ✦ "把这段微信聊天整理成需求单和下一步行动"`
5. Hero 离场→交接:照片墙(`showcase-assets\sites\photo-orbit\`,已完成勿改)自带**头部衔接占位符**,序章结尾直接对接它的占位符,不要自己再做一层吞幕;睁眼幕保留为 02 章之后各大章的过场。loader 的真实预载清单需包含照片墙首批纹理(向 photo-orbit 的资源清单看齐),保证幕一揭开球已就绪。

## 沉浸式规格(铁律)
序章 pin 住,行程≥150vh;计数+上切+巨字总仪式约 4 秒;reduced-motion 时跳过计数直接显示 Hero。

## 验收
60fps 无布局抖动;Lighthouse ≥85;组件库三个函数被外部调用无副作用;红色只出现在约定位置;断网字体回退不跳版(font-display:swap + preload)。
