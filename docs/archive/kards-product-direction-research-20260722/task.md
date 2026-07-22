# KARDS Product Direction Research Task

## Current status

已完成：本地基线、外部研究、模块筛选、独立产品批判和架构复核均已收敛；未修改生产代码。

## Checklist

- [x] Task 1: 映射当前产品能力、主要用户旅程和现有摩擦。
- [x] Task 2: 核对近期提交、路线图、历史教训和真实交付边界。
- [x] Task 3: 研究公共用户问题、成熟同类产品与活跃开源候选。
- [x] Task 4: 按价值、成本、风险和契合度排序，并做独立复核。
- [x] Task 5: 交付带来源的中文研究简报并归档任务记录。

## Validation evidence

| Command or check | Result |
| --- | --- |
| `git status --short --branch` | 研究开始前工作树干净，`main...origin/main` |
| `git worktree list --porcelain` | 仅有当前主 worktree |
| Product Design user-context preflight | 成功；未发现已保存上下文 |
| GitHub API `commits/main` | 远端 `main` 为 `3c83d77`，与本地一致 |
| GitHub repo/issues metadata | 公开仓库 1 star、0 issue、无 Discussions；用户频率证据弱 |
| Targeted source/docs/history inspection | 已核对编辑替换、草稿/卡库、文本截断、视觉比较、导出与路线图边界 |
| Official-source research | 已覆盖 Tabletop Creator、Component.Studio、nanDECK、Dextrous、Strange Eons、MTG.Design 及候选模块官方资料 |
| Independent evidence critique | 完成；纠正了把同行功能直接当作 KARDS 需求的风险 |
| Architecture review | 完成；推荐安全恢复 → 文本健康度 → 可访问性 → 小型视觉基线的顺序 |
| `npm run validate` | 未运行；本轮未修改生产代码，运行完整产品门禁不能增加研究结论可信度 |

## Open risks and remaining work

- 公开用户反馈几乎为空，所有需求频率仍是未知；在季度承诺前需要真实任务测试。
- 未登录同类产品、未检查付费或私有能力；这些不影响本轮 local-first 单卡结论。
- 打印物理尺寸、bleed 和 cut-mark 契约尚未确定；便携卡库是否应带 sidecar artwork 也需用户证据。
