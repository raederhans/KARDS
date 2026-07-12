# KARDS Card Forge v1.1.0 — Visual Fidelity Update

## 简体中文

`v1.1.0` 是首个稳定版之后的向后兼容更新，集中改进卡面还原度、参考卡工作流和空白卡体验。

### 主要改进

- 重新校准标准、限定、特殊和精英稀有度标记。
- 清理阵营图标和卡包徽标的背景污染、裁切杂边与拉伸问题。
- 修复正文局部加粗，使编辑器中的星标格式能在卡面正确显示。
- 修复“载入整张参考卡”后的语言、词条和卡图一致性。
- 为没有用户卡图的卡牌加入默认水豚占位图；它不会写入卡牌数据，也不会覆盖用户卡图。
- 让战斗机、轰炸机和炮兵共享与原版一致的 94×94 攻击瞄准镜、颜色、缺口和数值位置。
- 仅在 Vercel 环境启用 Speed Insights，并补齐对应的隐私说明和 Apache-2.0 第三方许可。

### 关于自动草稿

编辑器会在当前浏览器、当前站点的 `localStorage` 中自动保存轻量卡牌字段和外观设置。因此，关闭页面、重新打开，或 Vercel 更新后，已经填写的内容仍会恢复。这是防止误丢工作的设计特性，不是 Vercel 缓存故障。

自动草稿不会保存上传图片本体，也不会跨浏览器、设备或域名同步。要恢复默认卡，请点击工作台底部的“重置当前卡牌”。

### 许可与 Release 资产

本 Release 继续只附带纯代码压缩包和 SHA-256 校验文件。压缩包排除 `public/reference-pack/v1/**`、`public/brand/**`、`public/artwork/**`、`public/favicon.svg` 和维护者 Sites 配置，不提供完整 `dist` 或独立参考素材包。

默认占位图及其他被排除资源不属于软件许可证范围。GitHub 自动生成的源码归档仍会反映标签中已跟踪的文件；文件存在于仓库或自动归档中不代表获得资源使用权。

## English

`v1.1.0` is a backward-compatible update focused on card-face fidelity, reference-card workflows, and a more useful empty-card experience.

### Highlights

- Recalibrated Standard, Limited, Special, and Elite rarity marks.
- Cleaned background contamination, crop artifacts, and stretching from nation icons and set marks.
- Fixed explicit body emphasis so editor marker syntax renders as visible bold text on the card.
- Fixed language, keyword, and artwork fidelity when loading a complete reference card.
- Added a default capybara placeholder for cards without user artwork; it is not written into card data and never replaces user artwork.
- Matched fighter, bomber, and artillery attack values to one original-style 94×94 reticle with measured colors, notches, and value placement.
- Enabled Speed Insights only on Vercel and completed the related privacy disclosure and Apache-2.0 third-party notice.

### Automatic drafts

The editor automatically stores lightweight card fields and appearance settings in `localStorage` for the current browser and site. Closing and reopening the page, or deploying a new Vercel build, therefore restores authored content. This is an intentional work-loss prevention feature, not stale Vercel server state.

Automatic drafts do not store uploaded image bytes and do not sync across browsers, devices, or domains. Use “Reset current card” at the bottom of the workbench to restore the default card.

### License and Release assets

This Release attaches only a code-only archive and its SHA-256 checksum. The archive excludes `public/reference-pack/v1/**`, `public/brand/**`, `public/artwork/**`, `public/favicon.svg`, and maintainer-specific Sites metadata; it does not include a complete `dist` or standalone reference pack.

The default placeholder and other excluded resources are outside the software-license scope. GitHub-generated source archives still reflect tracked files at the tag; presence in the repository or automatic archive is not a grant of resource rights.
