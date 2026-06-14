# 任务卡 C · 02 章「技能」(16 个 Skill 的三幕长卷)
> 你负责把 16 个 skill 包讲成全站信息密度最高、又不视觉疲劳的一章(用户:"画面要好看、有趣,同时让用户看懂 Skill 到底有什么功能")。产出 `m-skill` section,引用窗口 A 组件库。

## 设计契约(不可改)
- 纯黑 #000 / 纯白 #FFF;唯一跳色正红 #E32B16 只给章节编号与格阵巨字(对位参考视频里的红字 LUNETTES 构图,全章仅此一处红字)。
- Archivo 900 / Space Mono / Noto Sans SC;缓动 `cubic-bezier(.16,1,.3,1)`;前缀 `m-skill`;reduced-motion 支持。
- 多图区默认灰度待点亮;演示视频原色。

## 章节开幕:16 张卡物理掉落(参考 vid-4 UNLOCK 段,用户:"这个功能一定可以做到")
- 16 个 skill 各一张黑白小卡(卡面:skill 名 Archivo + 一句话功能 Space Mono,白卡描黑边/黑卡描白边交替)。
- 进入本章触发 **Matter.js 真物理掉落**:每卡 Bodies.rectangle(restitution 0.3, friction 0.4,随机初始 x/角速度),地面+左右墙 static;渲染=每帧把 body 位置同步到真实 DOM 卡片 transform(卡片可 hover 翻看)。堆叠完成后静置,滚动继续进入幕一。

## 三幕结构(参考 vid-10,总行程 ≥1000vh,16 个 skill 按 6+5+5 分配防疲劳)
### 幕一 · 巨字格阵总览(快节奏,300vh)
- 红色巨字(`技能` 或 `SKILLS`)压在 16 格 skill 截图/图标阵上(对位 NOS LUNETTES 构图);巨字 revealText drop 进场,格阵灰度、滚动经过逐格点亮。
- 每格只给:skill 名 + 4 字功能词。16 个全亮相但不展开。
- 格阵标题行用 roll 模式(slot-machine 字符纵滚,对位用户点名的 MULTI MEDIA 翻滚效果)。

### 幕二 · 宣言四屏(慢节奏,400vh,王牌 skill 一屏一句)
每屏 100vh:一句转化句式(revealText rise)压在该 skill 成品画面上:
1. `一句话,一个上线的网站。` — make-website + cf-pages-deploy,压网站截图;
2. `一段口播,一条成片。` — audio-driven-video,压 2:59 成片帧(`a-手册源码包…assets\demo-clip.mp4`);
3. `一句话,一整本写真。` — ai-portrait-imagegen,压 collage 合辑图;
4. `一个主题,一首能听的歌。` — suno-song-creator,压歌词卡(可挂 song.mp3 点播)。
- 双图拼贴位做 ±15% 视差速度差;幕间用居中媒体 zoom-through 转场(中央截图 scrub 放大穿越,两侧露巨字「A」「I」)。

### 幕三 · 分屏 sticky 案例(中节奏,400vh,数据三件套+学生素材)
- 左侧 sticky(100vh)放演示画面,右侧自然滚动 ≥150vh 中文介绍(行级 rise 进场)。三组:
  1. 小红书爬取:左=xhs-crawler 演示视频,右标题 `关键词进去,选题库出来。`+ 输入→输出数字行(`婚恋法律 → 爆款笔记 ×N → 选题库一套`);
  2. 微信需求分析:左=wechat 演示,右 `零散的聊天,变成需求单。`;
  3. 飞书知识库:左=kb 演示+截图,右 `一堆资料,长成分类好的案例库。`(`108 篇 → 5 类`)。
- 介绍文案直接从三个学生站的原文案改写(转化句式),禁自创口号。
- 收尾一行(单独一屏,rise):`第十六个包,是用来造新包的。`(skill-creator)

## 素材路径
16 skill=`E:\Workspaces\showcase-assets\a-手册源码包\大学生AI能力使用手册\Skill安装包\skills\`(每个 SKILL.md 的 description 可提炼);演示视频=`E:\Workspaces\showcase-assets\sites\operationbookbook\assets\videos\`(xhs-crawler.mp4 完整版 8MB / wechat-kb.mp4 / bot-install.mp4 / ai-webpage.mp4);kb 截图=`shuchenglin-v6` 包内 assets\images;A 学生 demo=`a-手册源码包…assets\`。

## 16 卡片文案(卡面一行,照抄)
make-website·一句话→上线链接 / frontend-design·一句话→有设计感的页面 / cf-pages-deploy·一句话→部署上线 / audio-driven-video·一段口播→带字幕成片 / ffmpeg-video-editor·人话→剪辑指令 / ai-portrait-imagegen·一句话→杂志级写真 / suno-song-creator·一个主题→整首歌 / copywriting·一个产品→落地页文案 / blog-writer·一个观点→长文 / seo-content-writer·一个关键词→搜索流量文章 / social-content-generator·一条内容→全平台帖子 / research-paper-writer·一个题目→规范论文 / brainstorming·一个模糊想法→明确方案 / market-research·一个市场→规模与机会 / interview-designer·一份简历→结构化面试 / skill-creator·第十六个包,用来造新的包

## 验收
本章通读 ≥30 秒;物理掉落 60fps(卡片 DOM≤16,无 canvas 渲染需求);三幕节奏 快→慢→中 成立;reduced-motion:掉落改为静态堆叠、zoom-through 改硬切。
