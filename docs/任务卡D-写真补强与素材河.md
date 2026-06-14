# 任务卡 D · 01 章写真补强 + 05 章素材河 + 06 终幕
> 你负责全站的"两头":照片球所在的写真章的升级与衔接,以及收尾的素材河与终幕。产出 `m-images`、`m-river`、`m-finale` 三个 section,引用窗口 A 组件库。

## 设计契约(不可改)
- 纯黑 #000 / 纯白 #FFF;唯一跳色正红 #E32B16 只给:章节编号、素材河 hover 标签`查看 ↗`、数字卡里的一个数字、波浪段(可选,二选一)。
- Archivo 900 / Space Mono / Noto Sans SC;缓动 `cubic-bezier(.16,1,.3,1)`;前缀如上;reduced-motion 支持。

## 一、m-images:01 章「写真」——已完成,不要动
照片球 v3(`showcase-assets\sites\photo-orbit\`)已由别的窗口完成并通过验收,**自带头尾衔接占位符与液态波浪页尾**。本窗口对它只做一件事:确认你产出的 m-river/m-finale 能接上它的尾部占位符(读它的占位符标记即可),不修改它的任何文件。原计划的"3D 照片墙+翻面卡补强"降为 P2,不做。
(波浪衔接已包含在照片球页尾,无需另做。)

## 二、m-river:05 章「档案」素材河(黑底,~600vh,参考 vid-11)
- **多速漂流拼贴**:总容器高=簇数×150~200vh,10–14 簇;每块绝对定位,data-speed 四档(0.75/1.0/1.25/1.5),rAF 里 translate3d 按 scroll×speed 漂移;z 序:远景图 < 中心字标 < 近景图 < 微标签。
- **中心常驻字标**:口号 `说一句话 / 拿到 / 成品` 三行 Archivo 900 错位咬合,fixed 居中(或 data-speed 0.05 极慢层),图块从它前后穿插——老板滚到哪,口号都在。
- **左下元数据联动**:fixed 左下,每簇 ScrollTrigger onEnter 交叉淡换:`07 — 网站 · 一句话,一个上线的网站`(从 works.json 读)。
- 内容入河:38 件作品截图 + 4 段演示视频切片 + 918 录屏切片 + 写真精选;默认灰度,hover 恢复彩色 + 红字 `查看 ↗` 跟随光标,13 个 live 可点直达。
- 河中段插一张**数字卡**(黑底白字巨字,入屏 count-up 一次):`38 件成品 / 13 个在线运行 / 16 项技能 / 331 张写真`,其中一个数字用红。

## 三、m-finale:06 终幕「未完待续」(黑底,~150vh)
> 注意:大字 footer 方案已被用户否决(照片墙页尾同款决策),终幕改为「未完待续」收官——传达"发展潜力无限,现在的只是现在的"。

1. **字母汇聚**:图块飞散退场,白色字符从随机散点(x±400,y±300,rotation±60)飞拢锁定成 `说一句话,拿到成品。`(gsap.from chars,stagger 0.05);
2. 下方一行 mono 落款:`截至 2026.06 · 38 件成品 · 还在涨`(与写真章的"还在涨"呼应);
3. **「未完待续」红球蹦跳(收官签名)**:口号定格后,四个大字 `未完待续`(Noto Sans SC 900)逐字 drop 落位;一颗**正红小球**(全站唯一跳色的收官亮相)从左侧入场,在四个字头顶依次弹跳(squash & stretch:落地压扁 scaleY .7、起跳拉长 scaleY 1.15,GSAP keyframes 或 MotionPath 抛物线),弹过「续」字后不出画——**落在右侧变成省略号的第一个点,后面两个点逐个亮起 `· · ·`**,永远停在"还没完"的状态(省略号缓慢呼吸 opacity 0.4↔1 循环)。字也可在球落地瞬间被"砸"得轻微下沉回弹(yPercent 0→6→0),让蹦跳有重量感。
4. 版权带:照片墙同款极简版权带(一行 Space Mono),不做巨字;角落 ♪ 小按钮点播 song.mp3(《Orbiting the Unknown》,AI 词曲)。
reduced-motion:球与呼吸停用,直接显示 `未完待续 · · ·`。

## 素材路径
写真=`E:\Workspaces\社群资料库\photos\`;照片球=`showcase-assets\sites\photo-orbit\`;截图=`showcase-assets\site-shots\`;数据=`showcase-assets\data\works.json`;演示视频=`showcase-assets\sites\operationbookbook\assets\videos\`;918 录屏=`社群资料库\网站重要素材.mp4`;song=`showcase-assets\a-手册源码包\大学生AI能力使用手册\assets\song.mp3`。

## 验收
素材河正常滚速通读 ≥20 秒;331 张纹理走图集不卡(参考照片球做法);视频切片预转码为 ≤3MB 静音 mp4;终幕字母汇聚 60fps;reduced-motion:河改为静态网格、汇聚改为直接显示。
