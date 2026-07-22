# KARDS Product Direction Research Context

## Current truth

- 2026-07-22 本地仅有一个 worktree，`main` 与本地记录的 `origin/main` 同为 `3c83d77`，工作树在研究开始前干净。
- GitHub API 确认远端 `main` 也是 `3c83d77`，提交时间为 2026-07-22；公开仓库为 1 star、0 issue、未启用 Discussions，不能据此判断需求频率。
- 当前版本为 `1.3.0`；现有路线图把产品定义为本地、静态、单卡制作工具，而非 gameplay、账号、牌组或网络内容平台。
- Product Design preflight 未发现已保存的 `user-context.md`；本轮以当前仓库和用户请求为上下文。
- 当前最强的本地问题证据是：模板载入、重置、项目导入和卡库载入会替换当前编辑状态；正文和标题可能静默截断；自动草稿与卡库按设计移除嵌入卡图。

## Decisions and deviations

| Time | Evidence or decision | Impact |
| --- | --- | --- |
| 2026-07-22 | 用户要求研究继续发展方向和可借鉴模块/项目 | 本轮只读审计生产代码，输出证据化产品路线，不直接实现 |
| 2026-07-22 | 任务涉及本地产品、公共 UX 研究、外部项目和架构复核 | 按 complex 任务执行并维护三份留档 |
| 2026-07-22 | 公共用户反馈若不足 | 明确降低频率置信度，用现有产品摩擦和成熟模式补充，不伪造用户需求 |
| 2026-07-22 | 独立产品批判认为同类功能不能直接等同用户需求 | 打印、便携卡库和通用预设保持条件式路线，先收集真实任务证据 |
| 2026-07-22 | 架构复核确认破坏性替换和文本诊断有最窄现有 seam | 下一版本优先单次恢复与文本健康度，不先引入状态框架、Canvas 引擎或通用 Blueprint 系统 |
| 2026-07-22 | 模块研究完成 | `axe-core` 可作为 dev-only 候选；history 借鉴 transaction/mark 语义并在本地实现；`pixelmatch`、OPFS、裁图库和 PDF 库均不默认引入 |

## Live process ownership

| Process | Owner | Log path | State |
| --- | --- | --- | --- |
| none | primary agent | n/a | 未启动 dev server、浏览器或长测试 |

## Handoff

研究已完成。后续若进入实现，应先读取归档后的本目录、`docs/active/roadmap.md`、`lessons learned.md` 和当前源码，以 v1.4 的“编辑安全与输出可信度”为最小范围。

## Next step

先定义覆盖前单次恢复、文本截断诊断和手工可访问性审计的验收标准；打印与便携库在真实任务测试后再排期。
