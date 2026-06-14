# 03 章「视频矩阵」交付说明(窗口 E · 修订单-02 重构版)

两组放映,布局刻意不同(修订单五:禁止两组长得一样):
- **G1「AI 生视频」**:pin 舞台(行程 `+=75%`,铁律四在修订单01基础上再砍半),
  主打大窗(「从小姜到老姜」金字段)+ 右列三联;巨字开拍 → 主打先落 → 三联梯次升起。
- **G2「AI 代码视频」**:横向错落带,不 pin;条目左右交替入场 + 轻视差。
  2 个 **live 单文件**(代码即影片,挡板 +「进入互动」,片内自带播放键/配音)
  + 2 个**录屏循环**。满足总规划结论:同屏 live ≤2。

八位全实,无占位卡。彩色直出(铁律一,无灰度无 hover 变彩);
每个 mp4 **自绘进度条**(2px 白条 + 时码);无任何数量统计(铁律二);
每位**两行中文**(一句话定位 + 一句说明,铁律三)。

## 文件

| 文件 | 说明 |
|---|---|
| `m-video.html` / `m-video.css` / `m-video.js` | 三件套;内容由 js 顶部 `GEN` / `CODE` 配置驱动 |
| `assets/code-a.mp4` (2.6MB) | 代码视频录屏 A 循环版,静音 ≤3MB(源 `video-matrix/code-vid-1.mp4`,全屏带声用源文件) |
| `assets/kb-01.mp4` (2.45MB) / `kb-01-full.mp4` (5.3MB) | 代码视频成片 2:59 循环版(静音)/ 全屏带声版(点击才加载) |
| `assets/gen-0*-poster.jpg` `code-a-poster.jpg` `kb-01-poster.jpg` | 海报帧(`preload="none"` 占位) |
| `assets/code-live-*.jpg` | 两个 live 片的首屏海报(未挂载底图 / reduced 退化用) |
| `demo.html` | 独立预览页(前后白底占位验证 02→03 黑幕)。**勿合入**;`?jump=N` 仅 demo 用 |
| `qa/*.png` | 自测截图 |

AI 生视频 ×4 直接引用 `showcase-assets/video-matrix/ai-vid-*.mp4`(均 ≤2.5MB,已剪好静音,不复制副本);
live 两支引用 `video-matrix/code-video-愤怒时间.html` 与 `code-video-AI宣言.html`。
**注意**:原定的「最后两天」缺件——其 html 只是播放器壳,引用的 `电影感.mp4` 全盘不存在,
已用自包含的「AI 宣言 · 粗野主义」(拷自 社群资料库/代码视频2.html)顶上 CODE-03;
素材到位后改 m-video.js 的 CODE 配置一条即可换回(海报留在 `assets/code-live-zuihou-poster.jpg`)。
路径用 `document.currentScript` 锚定,index.html 与 demo.html 都能直跑。

## live 窗行为(修订单-01 性能规则 + 本次实测)

两支代码片**都有点击播放门**(自带配音,作者设了手动开演,浏览器也不允许带声自动播)。
处理方式 = v2Wall 同款已验收模式:
- 进视口前 300px 挂载 iframe(显示真实首屏,非截图);离开视口即卸载(配音随之停止),挡板复位;
- 透明挡板防滚动劫持,角标「进入互动 ▶」;点击挡板撤除 → 用户点片内播放键,带声开演;「退出互动 ✕」恢复;
- `sandbox="allow-scripts allow-same-origin"`(禁 top-navigation);同屏挂载 ≤2(本组本来只有 2 支,管控兜底);
- reduced-motion:不挂 iframe,海报 +「打开原片 ↗」新窗。

## 接入(总装)

1. 用 `m-video.html` 的 `<section>` 整段替换 02/03 之间的占位;`<head>` 加 css,fx.js 之后加 js;
2. 入口幕由 section 的 `data-curtain="hard"` 控制,总装边界另挂幕则删该属性;
3. 重编号改三处:section `id`/`data-chapter`、章头 kicker 编号、js 里 curtain 的 `num:'03'`;
4. js 注入后自带 `ScrollTrigger.refresh()`。

## 自测(qa/,puppeteer 实测)

懒加载(±300px)/ 视口外暂停 / live 挂载卸载与挡板复位 / 进度条走动 /
全屏带声(muted:false)+ 小窗全停 / ESC·✕·背板关闭 / `?qa=1` 直达 /
reduced-motion 静态海报无自动播 / 红色仅 `.fx-chapnum` / 无裸标签选择器。

注:原三组版的「树宁智能剪辑」竖屏实录转码(zhuning-a/b 及 full、poster)已挪到
`showcase-assets/video-matrix/`,供窗口 C(技能章对比案例)与窗口 B(大位)即取即用。
