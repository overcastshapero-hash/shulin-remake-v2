# 任务卡 B · 03 章「作品」(网站展示主战场)
> 你负责全站最炫的一章:把 38 件网页作品展示到"怎么炫酷怎么来"(用户原话)。产出一个 `m-web` section,引用窗口 A 的组件库(Lenis/revealText/章节幕)。

## 设计契约(不可改)
- 纯黑 #000 / 纯白 #FFF;唯一跳色正红 #E32B16 只给:章节编号、光标信息卡描边。
- Archivo 900 / Space Mono / Noto Sans SC;缓动 `cubic-bezier(.16,1,.3,1)`;类名前缀 `m-web`;prefers-reduced-motion 必须支持。
- **灰度规则**:多图区(分栏网格)默认 `filter:grayscale(1)`,hover/滚动聚焦恢复彩色;单一焦点媒体(快闪秀框、通栏视频)保持原色。

## 本章结构(总行程 ≥1000vh,黑底起,内部黑白交替)
### B1 字母分隔幕(参考 vid-4 WARHOL,用户:"极度极度极度重要")
- 一屏巨字(SVG text,Archivo 900,4–6 字母,建议 `SHIPPED` 或站名),**每个字母是独立 clipPath,字形内播放我们最炫的网站录屏**(muted loop)。
- 交互:鼠标悬停某字母 → 该字母内视频点亮放大;键盘敲任意字母 → 对应字母闪现视频(keystroke-triggered)。
- 素材:918 录屏 `E:\Workspaces\社群资料库\网站重要素材.mp4` 切段 + site-shots 录屏/截图。

### B2 精华快闪秀框(参考 vid-8 开场,用户设想"精华框口大一点,全部截图快闪像视频")
- 居中大框(约 70vw),预加载 15–25 张精选截图(img.decode() 预解码),GSAP timeline 变速硬切(3 快 1 慢:120/120/120/600ms);pin 住 300vh,**前段自动快闪、滚动介入后转为 scrub 逐帧推进**。
- 框下 Space Mono 计数器 `01 / 24` 随切换跳动。

### B3 三列滚轮橱窗(参考 vid-9,用户:"三个滚轮,太帅了")
- 容器 rotate(-6°) scale(1.15) 防露边;三列截图各自无限纵滚(内容复制两份 yPercent -50 循环),奇偶列差速+反向;滚轮速度叠加滚动 velocity。pin 300vh。

### B4 编辑部混合分栏(参考 vid-8,用户:"横屏/三分/二分/不均等分栏,可流动,很好")
- CSS Grid 12 列底盘,行模板交替:满铺 12 / 6+6 / 4+4+4 / 8+4 / 3+3+3+3;代表作占满铺行,13 个 live 站做可点行(新开标签直达真站),次要作品进三分/不均等行。
- 每块 hover:**光标跟随信息卡**(fixed div + gsap.quickTo 拖尾,红描边,内容=作品名+一句话+`查看 ↗`),数据从 works.json 读。
- 行内插 1–2 个**通栏视频行**:4 段功能演示视频(`showcase-assets\sites\operationbookbook\assets\videos\`),自绘细线进度条,入屏 play 出屏 pause。(918 不走视频行——它升级为 B5+ 真代码旗舰位。)

### B5 斜置橱窗(参考 vid-9 鞋子段,用户:"一定要做")
- pin 段,内容容器横向 scroll-scrub;每件展品(918 跑车帧、手机 mockup 装演示视频、网页截图卡)单独 rotate(-8°~8°)+scale(0.9~1.2)+错落 z-index,黑底白影。

### B5+ 旗舰位「918 驶入」(压轴,嵌真代码不用录屏)
- 素材已解包:`E:\Workspaces\showcase-assets\918\`——`seq_coming\`(120 帧,驶入镜头)、`seq_rotate\`(192 帧,360°转台)、`seq_oneshot\`(360 帧,细节长镜),全部 webp,黑底摄影,放在我们黑幕上天然无缝。`index.html`(30KB)是原站实现,可参考其 canvas 绘制方式。
- 实现:**canvas 图序列 scroll-scrub**(苹果 AirPods 手法):预载当前段帧,ScrollTrigger scrub 把滚动进度映射到帧号,canvas drawImage 绘制。
- 编排(pin 住 ≥400vh,三相):
  1. **驶入**:进入本段,容器从 `translateX(60vw)` 右侧滑入 + 同步播放 seq_coming 帧——滚动越深、车开得越近(用户原话:"随着往下滑,汽车从右侧开始驶入");
  2. **驻车细节**:车定格居中,继续滚动 scrub seq_rotate(转台)或 seq_oneshot 细节段,配 Space Mono 浮注(`PCCB CERAMIC · FIVE DRIVE MODES` 式编号小卡);
  3. **离场**:黑白幕硬切进 B6。
- mono 注一行:`676 帧 · 单文件 · 滚轮往下,车会动`。性能:帧按需加载(当前±20 帧),createImageBitmap 解码,黑底 jpg/webp 无透明通道负担;reduced-motion 退化为 3 张静帧。

### B6 hover 索引(参考 vid-2 目录 + vid-6 联动预览,用户:"很好看的目录环节")
- 38 件作品全列出(works.json),行格式 `0X — 作品名`,行 hover 整行反白 + **浮窗预览图跟随光标**(预加载缩略图,clip-path 揭示切换);13 个 live 行尾 `↗` 跳真站;行的 pill 标签写该作品用到的 skill 名。
- 移动端降级:行内固定缩略图。

## 文案(照抄,不得自创)
章节卡:`03 — 作品`;标题:`一句话,一个上线的网站。`;副文:`每件都挂着当时那句指令,点开就是正在运行的页面。`;918 位 mono 注:`676 帧 · 单文件 · 滚轮往下,车会动`。

## 素材路径
截图=`E:\Workspaces\showcase-assets\site-shots\`;数据=`E:\Workspaces\showcase-assets\data\works.json`;演示视频与 918 见上文;A 学生 5 件网页作品=`E:\Workspaces\showcase-assets\a-手册源码包\大学生AI能力使用手册\assets\work-*.html + shot-*.jpg`。

## 验收
本章通读 ≥25 秒;视频并发≤2(IntersectionObserver 管理);60fps;灰度→彩色点亮生效;所有 live 链接可点;reduced-motion 全部退化为静态网格。
