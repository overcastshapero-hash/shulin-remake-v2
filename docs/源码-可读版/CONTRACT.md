# v2 合并契约 · 窗口 A 产出(组件库 + 序章)
> 给窗口 B(m-web)/ C(m-skill)/ D(m-images、m-river、m-finale)和总装窗口。
> 本目录 `E:\Workspaces\showcase-site\v2\`,静态服务 `http://localhost:8460/showcase-site/v2/`(根=E:\Workspaces,见 E:\Workspaces\.claude\launch.json)。
> **`base/` 与 `sections/m-intro/` 由窗口 A 维护,其他窗口只引用、不修改。**

## 目录与装配方式
```
v2/
  index.html              装配壳(总装所有):含 m-intro + 6 个章节占位 .v2-slot
  CONTRACT.md             本文件
  base/
    base.css              设计 tokens + 字体 + fx- 组件样式
    fx.js                 window.FX 组件库(见 API)
    vendor/               gsap.min.js / ScrollTrigger.min.js / lenis.min.js(全本地)
    fonts/                Archivo 900 / Space Mono 400+700 / Noto Sans SC 400+900(woff2 本地)
  sections/
    m-intro/              00 序章(窗口 A;三轮整改后=纯覆盖仪式,height:0 不占行程)
    m-slogan/             巨字短幕(窗口 A;~80vh 黑底巨字+行情带,总装插到 01 写真章之后,
                          插桩三步见 m-slogan.html 头注;_test.html 为独立验收页不进总装)
    m-guide/              树成林·学生使用指南=全站总目录(窗口 A;黑底编号目录 9 行,pin 180vh,
                          行点击现量 offsetTop 经 FX.lenis 跳对应章/锚点,hover 反白+右侧固定预览;
                          不占章号,kicker=GUIDE。总装插到 #chap-brand 之后、#chap-01 之前,
                          插桩三步见 m-guide.html 头注;依赖锚点 msk-case1~6/msk-list 勿改名)
    m-xxx/                ← 各窗口新建自己的目录:m-xxx.html(markup 片段)+ m-xxx.css + m-xxx.js
```
**接入步骤(每个窗口相同)**:
1. 在 `sections/m-xxx/` 写三件套;markup 顶层是一个 `<section class="m-xxx" id="chap-0X" data-chapter="0X">`。
2. 用你的 `<section>` 整体替换 index.html 里对应的 `.v2-slot[data-slot="m-xxx"]`;在 `<head>` 加你的 css link;在底部 **fx.js 之后** 加你的 js。
3. 你的 js 第一行调 `FX.init()`(幂等,谁先谁初始化);需要图片预载进开场计数的,在 **m-intro.js 执行前**(即你的 js 若在其后,放到单独的更早 script,或直接在 index.html head 内联)`(window.FX_PRELOAD = window.FX_PRELOAD || []).push(url…)`。
4. 动态注入内容/图片后调 `ScrollTrigger.refresh()`。

## 设计契约(铁律,REF-BIBLE 拍板)
- 颜色只用 CSS 变量:`var(--fx-k)`黑 `var(--fx-w)`白 `var(--fx-g)`灰 `var(--fx-r)`红。
  **红白名单**:开场幕、章节编号「0X」(用 `.fx-chapnum`)、光标信息卡描边。永不做底色、永不进正文。
- 字体栈:`var(--fx-sans)`(Archivo+Noto SC)/ `var(--fx-mono)`(Space Mono+Noto SC)。巨字 900 字距 -.04em 用 `.fx-display`;标签用 `.fx-label`(11px .18em 大写)。中文字体是 GB2312 子集(6763 常用字,855KB/字重);文案别用生僻字(会回退雅黑),全量原文件在 base/fonts/ 备用。
- 缓动唯一:GSAP 用 `ease:'fxContract'`(fx.js 已注册);CSS 用 `var(--fx-ease)`。**只动 transform/opacity**。
- 类名一律前缀 `m-xxx`/`fx-`/`v2-`,无裸标签选择器。
- reduced-motion:`FX.reduced===true` 时去 pin、内容直接显示(组件库已自动处理自己的部分;你的 ScrollTrigger pin 要自己 guard)。
- 滚动 scrub 一律 `scrub:1`;多图区默认 `filter:grayscale(1)`,hover/聚焦恢复彩色;单焦点媒体原色。
- 深链:`?qa=1` = 跳开场仪式 + 关 Lenis 平滑(无头截图/低配用),你的 section 也要在该模式下可直达。

## FX API(`base/fx.js`,全局 `window.FX`)
| 成员 | 说明 |
|---|---|
| `FX.init(opts?)` | 幂等。建 Lenis(lerp .12,修订单-01 节奏令)+ ScrollTrigger 桥(ticker 驱动),注册 `fxContract`,设 `gsap.defaults`。`{noSmooth:true}` 关平滑。 |
| `FX.reduced` | prefers-reduced-motion 布尔。 |
| `FX.lenis` | Lenis 实例(reduced/noSmooth 为 null)。锚点滚动用 `FX.lenis.scrollTo(target)`。 |
| `FX.ready` | Promise:`document.fonts.ready` 后并已 `ScrollTrigger.refresh()`。**所有 revealText 调用包在 `FX.ready.then()` 里**(行分组依赖字体度量)。 |
| `FX.lock()` / `FX.unlock()` | 仪式期锁滚动(序章在用;你一般不用)。 |
| `FX.revealText(el, opts?)` | 全站唯一文字进场。`mode:'rise'`(行罩升起,标题)/`'drop'`(逐字掉落,Hero/章节卡)/`'roll'`(字符纵滚,清单行)。默认进入视口 88% 自动播一次;`{trigger:'manual'}` 返回 paused timeline 自己 `.play()`/嵌进时间线。完成后自动还原 DOM(`{keep:true}` 保留 span)。元素初始可挂 `.fx-hide` 防闪(revealText 会摘掉)。reduced 下为空时间线、内容直显。 |
| `FX.split(el, {lines,chars})` | 文字拆分(CJK 感知),返回 `{lines,chars,words,revert()}`。需要自定义动画时用。 |
| `FX.curtain.hard({num,title,theme:'dark'\|'light',hold,onCover})` | 黑白幕硬切:0ms 落下→章节卡(编号红)→150ms 上揭。`onCover` 在盖住瞬间回调(在此切换你的章节状态)。返回 timeline。 |
| `FX.curtain.eyelid({num,title,theme,onCover})` | 睁眼幕(大章用):盖住→2px 中缝悬念 0.3s→上下色板各自退场,共 1.4s。返回 timeline。 |
| `FX.marquee(el, {speed:70,velocity:true,gap})` | el 子内容变无限横滚带(0→-50% 循环),滚动加速/反向联动。返回 `{timeline,destroy}`。reduced 下静止。 |
| `FX.preload(items, onProgress)` | 真实预载:图片 URL(decode)或 `'font:900 1em "Noto Sans SC"'`。 |

## 已踩坑(照做,别复踩)
1. **初始位移别写在 CSS `transform` 里再用 GSAP 动 `yPercent`**:GSAP 把 CSS transform 解析成像素残留量,叠加在 yPercent 之上,动画永远到不了目标位。正确做法:CSS 只 `visibility:hidden` 防闪,初始位移用 `gsap.set(el,{yPercent:…,autoAlpha:1})`。
2. `.fx-line` 是 inline-block(整行自然占一行),勿当 block 用;含内联子元素(如 `.fx-chapnum`)的文本 revealText 不会断行。
3. `from()/fromTo()` 在时间线非 0 位置不会立即渲染初始值;进场前防闪用 `.fx-hide` 或显式 `gsap.set`。
4. **红幕上 difference 必泛青**:开场仪式期间序章给 `<html>` 挂 `m-intro-ritual` 类,统一隐藏 `[data-fx-chrome]` 与 `.v2-nav`,睁眼时摘除。新增固定 UI 请挂 `[data-fx-chrome]`(由序章点亮),不要自行 rAF 即显。

## 反色规范(difference)
固定导航 / 章节编号 / 滚动进度数字统一挂 `.fx-blend`(= `color:#FFF; mix-blend-mode:difference`),跨黑白幕自动反色。
**注意**:其祖先链上不得有 transform/filter/opacity<1/will-change 等建 stacking context 的属性,否则只跟祖先混合;容器必要时自身加 `isolation:isolate` 兜底。红幕上 difference 会出青色——序章已规避(红幕期间固定 UI 隐藏);你的 section 若有红色元素,别让 `.fx-blend` 元素压在上面。

## 章节交接状态(写死,别改)
| 边界 | 状态 |
|---|---|
| 00→品牌幕 | 序章(三轮整改后)= 纯覆盖仪式,height:0 不占行程:计数 → 红幕上切 → FIRST EDUCATION scramble(hold 一拍)→ 2px 中缝 → **红幕上下睁眼退场,直接露出其后第一屏(v2-brand 品牌幕,总装)**。scramble 仅开场 logo 专用,不进 revealText 三模式契约。 |
| m-slogan | 巨字短幕(原 hero 巨字+行情带):**总装插到 01 写真章 `</section>` 之后、02 作品章之前**;head 加 css link、底部 m-intro.js 后加 js(详见 m-slogan.html 头注)。 |
| 01→02 | 01 末尾 = 波浪软转场(全站唯一),交到 02 白底。 |
| 02→03 | 白→黑:`FX.curtain.hard({theme:'dark'})`。 |
| 03→04 | 黑→白:`FX.curtain.hard({theme:'light'})`。 |
| 04→05 | 白→黑:hard 或直接背景切换。 |
| 05→06 | 同为黑,直接续。 |

## 完成信号
- 序章仪式完成:`window.__BOOT_DONE === true` + 事件 `document` 上的 `'fx:intro:done'`(QA 脚本等这个)。
- 固定 UI 点亮:序章会给所有 `[data-fx-chrome]` 元素加 `.is-on`。

## 验收基线(每个窗口自测)
60fps 只动 transform/opacity;`?qa=1` 可直达你的章;reduced-motion 全部退化为静态;红色只在白名单;无裸标签选择器;注入内容后 `ScrollTrigger.refresh()`。
