# dsh-market-ui

DeepSeek Harness 插件市场（社区开发）：在 Web GUI **侧边栏的「插件市场」面板**
（与「插件」页同级；或 设置 → 内置插件 → 插件市场）浏览 npm 社区插件，
看简介与版本历史，一键安装 / 卸载 / 更新到当前 profile。

GitHub：https://github.com/910092147/dsh-market-ui

## 工作方式（0.2.x）

- **安装/卸载/更新走官方 `pluginManager` 服务**，不再 spawn `dsh plugin` CLI：
  与 DSH 插件页共用同一套 pnpm 实现、profile 写锁、失败回滚、registry 回退、
  `engines.dsh` 兼容性检查与构建脚本审批；Web 与桌面端行为一致，装完能即时生效
  （HMR 开启时），否则提示重启。
- **操作是后台任务**：`POST /install|uninstall|update` 立即返回 `202 + job`，
  浏览器轮询 `GET /job?id=`；面板可以随时关闭，重开会通过 `GET /jobs` 接管仍在跑的
  任务，`POST /cancel` 调 `pluginManager.cancelInstall`。这样 pnpm 跑几十秒也不会
  把页面挂在一个请求上（profile 重组导致的短暂断连会自动重试）。
- **数据源**：npm registry search（`keywords:dsh-plugin`，浏览取 250 条相关度结果，
  缓存 6 小时到 `DSH_HOME/cache/plugin-market/catalog.json`，抓取失败回落旧缓存并标注）。
- **搜索**：npm `text=` 排名 + 严格 token 过滤（搜不到就是空）；支持按**作者/发布者**
  （npm 用户名或 GitHub owner）过滤、按**更新时间**筛选（昨天 / 3 天 / 7 天 / 30 天 / 半年）。
- **新包兜底**：npm 搜索索引对新发布的包有延迟；搜不到时按**精确包名**直接查
  registry（packument），所以刚发布的插件也能搜到。
- **详情页 README** 按界面语言优先中文（`README.zh-CN.md` 等），GitHub raw 失败时
  回退 npm registry 的 `readme` 字段。
- **分类/计数/分页在 host 侧完成**：分类标签的数字是全部结果的口径，不是当前页。
- **更新**：已装版本来自 `pluginManager.listBundles()`，与 npm 最新版不同时出现「更新」。
  HMR 下更新 = 先卸载再安装（插件会短暂停用）；无 HMR 时直接覆盖安装，提示重启。
  工具栏的「全部更新」会按顺序跑完所有可更新插件（`link:` / `file:` / `workspace:`
  本地安装会被跳过，避免用 npm 版覆盖开发中的源码）。
- **安装前体检**：详情页展示包大小、是否含 preinstall/install/postinstall 脚本、
  DSH 兼容判定（用运行时自带的 semver 对照 `engines.dsh`）、是否 deprecated；
  不兼容或含安装脚本会给出明确警告。
- **需要更新筛选**：分类栏的「需要更新（N）」只列已装且 npm 上有新版本的插件；
  `link:` / `file:` / `workspace:` 本地安装不计入。卡片显示 `当前版本 → 最新版本`，
  可配合「全部更新」一起用。
- **同类对比**：详情页按分类 / 关键词 / 包名 token 打分，列出最多 5 个同类插件，
  并排展示月下载、更新时间、版本、协议，给出基于客观数据的相对优势/劣势；
  另有一个**领域功能矩阵**：先识别插件领域（插件市场 / 费用 / …），再用该领域的功能模板
  对比——市场类是浏览/搜索/分类/安装/卸载/更新/批量更新/版本历史/兼容检查/回滚/评分/
  多语言/主题，费用类是本会话/日周月/价格表/官方同步/余额/额度/峰谷/预算/图表/多厂商/
  通知/导出；✓/· 对齐，并给只有当前插件具备的行标「独有」。能力由 README、简介和
  keywords 自动识别（仅供参考），
  点指标表任意一行或矩阵列头可直接切换到那个插件的详情（无需返回列表）。
- **按需机器翻译**：中文界面下，英文简介/README 可点「翻译为中文」。优先用浏览器
  `Translator` API（免费、本地）；不可用时回退 DSH 默认模型（`ctx.llm`），结果按内容
  hash 缓存到 `DSH_HOME/cache/plugin-market/translations.json`，并标注「机器翻译」。
  模型翻译会消耗 token，且不属于任何会话——**不会计入 dsh-cost-meter 的会话账**。
- **双面插件**：host 半片提供 `/api/plugin-market/*` REST；浏览器半片注册
  `sidebar.panellist` + `main`（侧边栏面板页，和官方「插件」页同款，不覆盖窗口标题栏）
  以及 `settings.plugins.tab`（设置页签）。
- **命名空间必须唯一**：本插件的 locale 命名空间是 `dshMarketUi`，bundle 行 id 是
  `dsh-market-ui`。官方的 Discover 插件占用 `pluginMarket` 和 `plugin-market`，重名会让
  后加载的那个注册失败（`locale namespace "pluginMarket" already has locale "zh"`），
  所以两个市场可以同时启用。

## 安全

写接口（install/uninstall/update/refresh）要求：

1. 自定义头 `x-dsh-market: 1`（跨站请求会触发预检，被挡在门外）
2. `Origin` 与 `Host` 同源（浏览器跨站请求带 Origin）
3. `POST` 且 `content-type: application/json`
4. 包名符合 npm 规则，且不能以 `-` 开头（防 CLI 参数注入）

GET 接口同样要求 `x-dsh-market` 头。

## 安装

前提：DSH 能正常运行（`dsh web` 或桌面端），pnpm 在 PATH 上。

```sh
dsh plugin --profile web add dsh-market-ui
# 或桌面端：
dsh plugin --profile desktop add dsh-market-ui
```

`dsh plugin` 会以 **link** 方式安装本地目录（不是复制），所以源码目录不要移动或删除；
修改 `host.js` / `client.js` 后重启 DSH 生效。

## 已知边界

- 浏览目录固定为 npm 单次搜索上限 250 条；更冷门的包用搜索框按名字找。
- 「我的插件」标签按 `keywords` 里的 `dsh-mine` 识别；未发布到 npm 的本地插件不会出现
  （包括本插件自己）。
- 需要构建脚本授权的包会被 `pluginManager` 拒绝，并在错误里返回 `pendingBuilds`；
  当前 UI 尚未提供「允许并重试」按钮，需到官方插件页处理或重新安装。
- 卸载随 DSH 提供的组合包、或正在运行的插件，会被 `pluginManager` 拒绝并给出原因。

## 结构

- `host.js` — Node 半片：npm 目录抓取/缓存、搜索、分类计数、REST API、调用 `pluginManager`
- `client.js` — 浏览器半片：React 面板（卡片列表、搜索、排序、分类、分页、详情、安装/卸载/更新）
- `cordis.patch.yml` — 插入插件行的 bundle patch
- `package.json` — `dsh.bundle` + `dsh.client` 双面声明
- `NAMING.md` — **统一命名规范**：要设计多个插件时必读（`dsh-功能-类型` + `dsh-mine` 标记）

## 发布到 npm

```sh
npm login
npm run check          # node --check 两个半片
npm publish            # prepublishOnly 会自动再跑一次 check
```

- 包名 `dsh-market-ui` 在 npm 上目前未被占用。
- `files` 白名单只打包运行所需的 7 个文件（含 LICENSE），测试和 `.github` 不会进包。
- 仓库里的 `.github/workflows/publish.yml` 支持打 `v*` tag 自动发布，需要 `NPM_TOKEN`；它用
  `npm publish --provenance`，因此需要公开仓库和 CI。手动 `npm publish` 不需要 provenance。
- 发布后 npm search 索引几分钟；本市场的目录缓存 6 小时，点「刷新目录」可立即看到。

## 安装与索引源

按包名安装（DSH 内置插件管理 / 命令行都支持）：

```sh
dsh plugin --profile desktop add dsh-market-ui
```

npm 页面：https://www.npmjs.com/package/dsh-market-ui

包内自带一份 DSH 插件市场索引（format 1）`index.json`，可以直接作为官方「发现」页的索引源：

```
https://cdn.jsdelivr.net/npm/dsh-market-ui@0.2.7/index.json
```

在 **插件 → 发现 → 添加索引源** 里粘贴上面的 URL，就能在官方发现页看到本插件。
每次发版后把 URL 里的版本号改成新版本即可（jsDelivr 按版本缓存，不会串包）。
