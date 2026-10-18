# dsh-market-ui — 统一命名规范（作者必读）

如果你要设计**多个** DeepSeek Harness 插件，请统一遵循本规范。遵循它能获得三个好处：

1. **社区可发现**：`dsh-` 前缀是 npm 上 DSH 插件的绝对主流（250 个里 176 个），符合约定更容易被搜索/收录
2. **市场可筛选**：按规范命名 + 打上自研标记，就能在插件市场的「我的插件」标签里一键筛出你的全部插件
3. **自解释**：看名字就知道"干什么 + 是什么类型"

---

## 一、包名格式

```
dsh-<功能>-<类型>
```

| 段 | 规则 | 示例 |
|---|---|---|
| `dsh-` | 固定前缀，宣告"这是 DSH 插件" | — |
| `<功能>` | 2-3 个英文小写单词，`-` 连接，描述插件核心功能 | `memory`、`sync`、`notify`、`web-search` |
| `<类型>` | 类型词表（见下），说明插件形态 | `tool`、`ui`、`session` |

**类型词表**（必选其一）：

| 类型 | 含义 | 适用场景 |
|---|---|---|
| `tool` | 工具 | 给 agent 提供新工具（bash、fs 之外的） |
| `ui` | 界面 | 给 Web GUI 增加页签/面板/组件 |
| `session` | 会话 | 会话持久化、历史、恢复、导出 |
| `shell` | 命令/终端 | 终端、子进程、脚本执行相关 |
| `agent` | Agent 行为 | 修改 agent 循环、记忆、规划、子代理 |
| `notify` | 通知 | 提醒、推送、声音、消息到达通知 |
| `sync` | 同步/桥接 | 与外部系统桥接（飞书、微信、GitHub 等） |
| `data` | 数据 | 存储、缓存、导入导出、格式转换 |

**示例**：

| 你想要的功能 | 包名 |
|---|---|
| 一个"记住会议纪要"的工具 | `dsh-meeting-memory-tool` |
| 侧边栏天气面板 | `dsh-weather-ui` |
| 会话导出为 HTML | `dsh-export-session-tool` |
| 飞书消息桥 | `dsh-feishu-sync` |
| 定时提醒 | `dsh-remind-notify` |

> 如果你的功能同时跨多类，选**最主要**的一类；一个插件只有一个类型。

---

## 二、自研标记（必须）

每个自研插件的 `package.json` 的 **`keywords` 里必须带 `dsh-mine`**：

```json
{
  "name": "dsh-meeting-memory-tool",
  "version": "0.1.0",
  "keywords": ["dsh", "dsh-plugin", "dsh-mine", "memory", "meeting"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" }
  }
}
```

- `dsh-mine` 是插件市场「我的插件」标签的**识别标记**（按关键词精确匹配）
- 不带它，你的插件会被当作普通社区插件，不会出现在「我的插件」里
- 顺手也带上 `dsh`、`dsh-plugin` 两个关键词，便于 npm 搜索收录

---

## 三、目录/仓库命名（与包名一致）

```text
dsh-meeting-memory-tool/
├── package.json        # name: dsh-meeting-memory-tool, keywords 含 dsh-mine
├── cordis.patch.yml
├── host.js             # Node 半片（如有）
├── client.js           # 浏览器半片（如有）
└── README.md
```

GitHub 仓库名建议与包名一致（`dsh-meeting-memory-tool`），并打上
`dsh-plugin` 话题便于社区发现。

---

## 四、版本与发布

- 版本用语义化版本（`0.1.0` → `0.2.0` → `1.0.0`）
- 发布到 npm：`npm publish`（或 `pnpm publish`），`dsh` 前缀包社区直接可搜
- 发布后无需任何登记——插件市场每日/定期抓取 npm，自动出现

---

## 五、快速自检清单

- [ ] 包名 = `dsh-<功能>-<类型>`，全小写，`-` 连接
- [ ] `keywords` 含 `dsh-mine` + `dsh` + `dsh-plugin`
- [ ] 声明了 `dsh.bundle.patch`（否则只是普通依赖，不会成为插件）
- [ ] 仓库名与包名一致，打了 `dsh-plugin` 话题
- [ ] 发布后能在插件市场搜到，且「我的插件」标签能看到
