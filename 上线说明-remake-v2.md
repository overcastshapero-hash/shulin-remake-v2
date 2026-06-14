# remake-v2 上线说明

这个项目里有两套东西：

- `index.html`：原开源包主站壳，里面还保留了别人线上站的历史信息。
- `original-index.html`：原开源包主站壳备份。
- `index.html`：当前仓库/Pages 根入口，会自动跳到你自己的新版。
- `remake-v2/index.html`：你自己做的新版入口，部署时应该让别人先看到这一版。

## 本地预览

```bash
npm run start
```

打开：

```text
http://127.0.0.1:4173/remake-v2/index.html
```

## Cloudflare Pages

最省事的方式：

```bash
npm run deploy:cloudflare
```

如果第一次用，会要求登录 Cloudflare。项目名默认是：

```text
shulin-remake-v2
```

部署后根路径 `/` 会自动跳到 `/remake-v2/`，这是故意的。因为 v2 页面要在自己的目录上下文里加载素材，不能把它用 200 rewrite 硬塞到根路径。

## Netlify

预览部署：

```bash
npm run deploy:netlify
```

正式发布：

```bash
npm run deploy:netlify:prod
```

Netlify 会读取 `netlify.toml`，根路径同样会跳到 `/remake-v2/`。

## 已接入的继续完善点

- 视频工位：主视频“从小姜到老姜”和右侧视频卡片都可点击打开完整作品。
- 品牌章节：`#brand` 已进入桌面导航和移动导航。
- 游戏模块：`#game` 已嵌入 `game/index.html`，也保留独立新页打开入口。

## 下一个最小发布动作

先用 Cloudflare Pages 发一个独立预览链接，不要覆盖别人的 `shuchenglin-handbook.pages.dev`。链接出来后，只发这个新版链接给别人看。
