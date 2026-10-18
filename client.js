// dsh-plugin-market 浏览器半片：侧边栏「插件市场」+ 设置 → 插件 → 「插件市场」页签
// AMD bundle（client-modules 提供 window.__ModuleLoader__），React UI。
// 数据走同源 REST：/api/plugin-market/*（host 半片提供）。
// 分类、计数、分页、搜索都在 host 侧完成；这里只负责展示与交互。

window.__ModuleLoader__.load({
  id: 'dsh-market-ui',
  factory: (require) => {
    const React = require('react')
    const { useCallback, useEffect, useMemo, useRef, useState } = React
    const h = React.createElement

    // 必须全局唯一：官方 Discover 插件也占用 "pluginMarket"，重名会让后者注册失败。
    const NS = 'dshMarketUi'

    const zh = {
      tab: '插件市场',
      intro: '浏览 npm 上标记 dsh-plugin 的社区插件，一键安装到当前 profile。',
      loading: '加载中…',
      error: '加载失败：{msg}',
      retry: '重试',
      refresh: '刷新目录',
      search: '搜索插件…',
      empty: '没有匹配的插件。',
      sortPopularity: '按下载量',
      sortPublish: '按发布时间',
      sortRecent: '按最近更新',
      sortAsc: '升序',
      sortDesc: '降序',
      sortName: '按名称',
      page: '第 {p} 页 / 共 {total} 页',
      prev: '上一页',
      next: '下一页',
      install: '安装',
      uninstall: '卸载',
      update: '更新',
      installing: '安装中…',
      uninstalling: '卸载中…',
      updating: '更新中…',
      installed: '已安装',
      installedVersion: '已装 v{n}',
      restart: '重启 DSH 后生效',
      version: 'v{n}',
      updated: '更新于 {d}',
      downloads: '{n}/月',
      license: '协议：{l}',
      openRepo: '打开仓库',
      detail: '详情',
      back: '返回',
      readme: 'README 简介',
      noReadme: '（无 README）',
      failed: '操作失败：{msg}',
      installHint: '将执行 installBundle({pkg})',
      fetchedAt: '目录更新于 {d}',
      staleCatalog: 'npm 暂时不可用，显示的是旧目录（{d}）。',
      confirmUninstall: '确定卸载 {pkg}？',
      confirmUpdate: '更新 {pkg} 需要先卸载旧版本再安装，期间该插件会短暂停用。继续？',
      close: '关闭',
      catAll: '全部',
      catMine: '我的插件',
      catUi: '界面与主题',
      catMemory: '记忆与知识',
      catAgent: 'Agent 与工作流',
      catTools: '工具与集成',
      catComm: '通信与机器人',
      catDev: '开发与编码',
      catSecurity: '安全与权限',
      catSession: '会话与持久化',
      catNotify: '通知与提醒',
      catOther: '其他',
      okInstall: '已安装 {pkg}',
      okUninstall: '已卸载 {pkg}',
      okUpdate: '已更新 {pkg}',
      'err_busy': '该插件已有操作在进行，请稍候。',
      'err_already-installed': '该版本已经安装。',
      'err_incompatible-version': '该插件与当前 DSH 版本不兼容。',
      'err_not-bundle': '该 npm 包不是 DSH 插件包（没有 dsh.bundle 声明）。',
      'err_not-removable': '该插件不可卸载（随 DSH 提供或被管理插件依赖）。',
      'err_stop-profile': '该插件正在运行，需重启 DSH 后再操作。',
      'err_bundle-in-use': '该插件仍被运行中的条目使用，需重启后重试。',
      'err_invalid-spec': '包名不合法。',
      'err_not-found': 'npm 上找不到该包。',
      'err_network': '网络不可用，请检查代理或 registry。',
      'err_unknown': '未知错误。',
      installJob: '正在安装 {pkg}…',
      updateJob: '正在更新 {pkg}…',
      uninstallJob: '正在卸载 {pkg}…',
      backgroundHint: '可以关闭面板，安装会在后台继续。',
      cancelJob: '取消',
      cancelRequested: '已请求取消，等当前步骤结束。',
      cancelledJob: '操作已取消。',
      jobLost: '任务状态已丢失（插件可能已重载），已刷新列表，请以列表里的安装状态为准。',
      searchAction: '搜索',
      emptyFor: '没有找到与「{q}」匹配的插件。',
      resultCount: '共 {n} 个结果',
      publisherLabel: '发布者',
      authorLabel: '作者',
      githubOwner: 'GitHub 仓库所有者',
      versionsTitle: '版本历史',
      versionCount: '共 {n} 个版本',
      deprecatedBadge: '已废弃',
      latestLabel: '最新 {v}',
      repoLink: '仓库',
      npmLink: 'npm 页面',
      readmeMore: '展开全部',
      readmeLess: '收起',
      readmeFull: '查看完整 README',
      translate: '翻译为中文',
      translateReadme: '翻译前 2000 字',
      translating: '翻译中…',
      translatedBy: '机器翻译',
      showOriginal: '查看原文',
      showTranslation: '查看译文',
      translateFailed: '翻译失败：{msg}',
      authorPlaceholder: '作者 / 发布者（npm 或 GitHub）',
      sinceLabel: '更新时间',
      sinceAll: '全部时间',
      since1: '昨天以来',
      since3: '近 3 天',
      since7: '近 7 天',
      since30: '近一个月',
      since180: '近半年',
      exactHint: 'npm 搜索索引暂未收录该包，已按包名精确匹配。',
      notBundle: '该包没有声明 dsh.bundle，可能不是 DSH 插件，安装会失败。',
      preflight: '安装前体检',
      packageSize: '包大小 {v}',
      installScriptsYes: '含安装脚本',
      installScriptsNo: '无安装脚本',
      compatCompatible: '兼容当前 DSH',
      compatIncompatible: '与当前 DSH 不兼容',
      scriptsWarn: '该包包含 install/postinstall 脚本，安装时会执行代码。',
      incompatibleWarn: '声明的 DSH 版本与当前运行版本不匹配，安装可能失败。',
      updateAll: '全部更新（{n}）',
      updateAllConfirm: '将依次更新 {n} 个插件，期间 DSH 可能短暂不可用。继续？',
      bulkUpdating: '正在更新 {i}/{n}：{pkg}',
      bulkDone: '更新完成：成功 {ok}，失败 {failed}',
      filterUpdates: '需要更新',
      emptyUpdates: '没有需要更新的插件，全部已是最新。',
      compareTitle: '同类对比',
      compareNote: '基于下载量、更新时间、体积、安装脚本等客观数据，仅供参考',
      compareCurrent: '当前',
      compareSwitch: '切换',
      colPlugin: '插件',
      colDownloads: '月下载',
      colUpdated: '更新时间',
      colVersion: '版本',
      colLicense: '协议',
      prosTitle: '相对优势',
      consTitle: '相对劣势',
      noPros: '暂无明显优势',
      noCons: '暂无明显劣势',
      proDownloadsMax: '同类中下载量最高（{n}/月）',
      conDownloadsLow: '下载量低于同类（{n}/月）',
      proNewest: '同类中最近更新（{d}）',
      conOldest: '同类中更新最旧（{d}）',
      proNoScripts: '安装时不执行脚本',
      conScripts: '安装时会执行脚本',
      proCompatible: '兼容当前 DSH',
      conIncompatible: '与当前 DSH 不兼容',
      colFeatures: '特色标签',
      colFeature: '功能',
      featureNote: '根据 README / 简介 / keywords 自动识别，仅供参考',
      uniqueFeature: '独有',
      proUniqueTags: '独有标签：{tags}',
      conMissingTags: '同类常见但你未声明：{tags}',
      tagsNote: '标签来自 npm keywords，不是人工评测',
      translateHint: '优先用浏览器本地翻译；本地不可用时调用 DSH 默认模型（会消耗 token）',
      renderFailed: '插件市场渲染失败',
      retry: '重试',
    }

    const en = {
      tab: 'Plugin Market',
      intro: 'Browse community plugins tagged dsh-plugin on npm and install them into the current profile.',
      loading: 'Loading…',
      error: 'Failed to load: {msg}',
      retry: 'Retry',
      refresh: 'Refresh catalog',
      search: 'Search plugins…',
      empty: 'No matching plugins.',
      sortPopularity: 'By downloads',
      sortPublish: 'By publish time',
      sortRecent: 'Recently updated',
      sortAsc: 'Ascending',
      sortDesc: 'Descending',
      sortName: 'By name',
      page: 'Page {p} / {total}',
      prev: 'Prev',
      next: 'Next',
      install: 'Install',
      uninstall: 'Uninstall',
      update: 'Update',
      installing: 'Installing…',
      uninstalling: 'Uninstalling…',
      updating: 'Updating…',
      installed: 'Installed',
      installedVersion: 'installed v{n}',
      restart: 'Restart DSH to activate',
      version: 'v{n}',
      updated: 'Updated {d}',
      downloads: '{n}/mo',
      license: 'License: {l}',
      openRepo: 'Open repo',
      detail: 'Detail',
      back: 'Back',
      readme: 'README',
      noReadme: '(no README)',
      failed: 'Failed: {msg}',
      installHint: 'Runs installBundle({pkg})',
      fetchedAt: 'Catalog updated {d}',
      staleCatalog: 'npm is unreachable; showing the cached catalog from {d}.',
      confirmUninstall: 'Uninstall {pkg}?',
      confirmUpdate: 'Updating {pkg} uninstalls the old version first, so the plugin stops briefly. Continue?',
      close: 'Close',
      catAll: 'All',
      catMine: 'My plugins',
      catUi: 'UI & Themes',
      catMemory: 'Memory & Knowledge',
      catAgent: 'Agents & Workflows',
      catTools: 'Tools & Integrations',
      catComm: 'Comm & Bots',
      catDev: 'Dev & Coding',
      catSecurity: 'Security & Permissions',
      catSession: 'Sessions & Persistence',
      catNotify: 'Notifications & Reminders',
      catOther: 'Other',
      okInstall: 'Installed {pkg}',
      okUninstall: 'Uninstalled {pkg}',
      okUpdate: 'Updated {pkg}',
      'err_busy': 'Another operation is already running for this plugin.',
      'err_already-installed': 'That version is already installed.',
      'err_incompatible-version': 'This plugin is incompatible with the current DSH version.',
      'err_not-bundle': 'This npm package is not a DSH plugin (no dsh.bundle declaration).',
      'err_not-removable': 'This plugin cannot be removed (shipped with DSH or required by the plugin manager).',
      'err_stop-profile': 'This plugin is running; restart DSH before removing it.',
      'err_bundle-in-use': 'This plugin is still used by a running entry; restart and retry.',
      'err_invalid-spec': 'Invalid package name.',
      'err_not-found': 'Package not found on npm.',
      'err_network': 'Network unavailable; check the proxy or registry.',
      'err_unknown': 'Unknown error.',
      installJob: 'Installing {pkg}…',
      updateJob: 'Updating {pkg}…',
      uninstallJob: 'Uninstalling {pkg}…',
      backgroundHint: 'You can close this panel; the installation continues in the background.',
      cancelJob: 'Cancel',
      cancelRequested: 'Cancellation requested; waiting for the current step to finish.',
      cancelledJob: 'Cancelled.',
      jobLost: 'Job state was lost (the plugin probably reloaded). The list was refreshed; check the installed state there.',
      searchAction: 'Search',
      emptyFor: 'No plugins matched "{q}".',
      resultCount: '{n} result(s)',
      publisherLabel: 'Publisher',
      authorLabel: 'Author',
      githubOwner: 'GitHub repository owner',
      versionsTitle: 'Version history',
      versionCount: '{n} version(s)',
      deprecatedBadge: 'Deprecated',
      latestLabel: 'Latest {v}',
      repoLink: 'Repo',
      npmLink: 'npm page',
      readmeMore: 'Show more',
      readmeLess: 'Show less',
      readmeFull: 'Full README',
      translate: 'Translate to Chinese',
      translateReadme: 'Translate first 2000 chars',
      translating: 'Translating…',
      translatedBy: 'Machine translation',
      showOriginal: 'Show original',
      showTranslation: 'Show translation',
      translateFailed: 'Translation failed: {msg}',
      authorPlaceholder: 'Author / publisher (npm or GitHub)',
      sinceLabel: 'Updated',
      sinceAll: 'Any time',
      since1: 'Since yesterday',
      since3: 'Last 3 days',
      since7: 'Last 7 days',
      since30: 'Last month',
      since180: 'Last 6 months',
      exactHint: 'Not in the npm search index yet; matched by exact package name.',
      notBundle: 'This package declares no dsh.bundle and may not be a DSH plugin; installation will fail.',
      preflight: 'Pre-install check',
      packageSize: 'Package size {v}',
      installScriptsYes: 'Install scripts',
      installScriptsNo: 'No install scripts',
      compatCompatible: 'Compatible with this DSH',
      compatIncompatible: 'Incompatible with this DSH',
      scriptsWarn: 'This package runs install/postinstall scripts during installation.',
      incompatibleWarn: 'Its declared DSH range does not match the running version; installation may fail.',
      updateAll: 'Update all ({n})',
      updateAllConfirm: 'This updates {n} plugins one by one; DSH may be briefly unavailable. Continue?',
      bulkUpdating: 'Updating {i}/{n}: {pkg}',
      bulkDone: 'Update finished: {ok} succeeded, {failed} failed',
      filterUpdates: 'Needs update',
      emptyUpdates: 'No updates available; everything is up to date.',
      compareTitle: 'Similar plugins',
      compareNote: 'Based on downloads, last update, size and install scripts; for reference only',
      compareCurrent: 'Current',
      compareSwitch: 'Switch',
      colPlugin: 'Plugin',
      colDownloads: 'Downloads/mo',
      colUpdated: 'Updated',
      colVersion: 'Version',
      colLicense: 'License',
      prosTitle: 'Relative strengths',
      consTitle: 'Relative weaknesses',
      noPros: 'No clear strength',
      noCons: 'No clear weakness',
      proDownloadsMax: 'Most downloaded among similar ({n}/mo)',
      conDownloadsLow: 'Fewer downloads than similar ({n}/mo)',
      proNewest: 'Most recently updated ({d})',
      conOldest: 'Oldest update among similar ({d})',
      proNoScripts: 'No install scripts',
      conScripts: 'Runs install scripts',
      proCompatible: 'Compatible with this DSH',
      conIncompatible: 'Incompatible with this DSH',
      colFeatures: 'Feature tags',
      colFeature: 'Feature',
      featureNote: 'Detected from README, description and keywords; for reference only',
      uniqueFeature: 'Only here',
      proUniqueTags: 'Unique tags: {tags}',
      conMissingTags: 'Common among similar but missing here: {tags}',
      tagsNote: 'Tags come from npm keywords, not a manual review',
      translateHint: 'Uses the browser translator first; falls back to the DSH default model (consumes tokens)',
      renderFailed: 'Plugin market failed to render',
      retry: 'Retry',
    }

    const DICT_KEYS = Object.keys(zh)

    const CSS = `
.dshpm-root { width:100%; min-width:0; max-width:860px; display:flex; flex-direction:column; gap:12px; color:var(--dsw-alias-label-primary); }
.dshpm-toolbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.dshpm-search { position:relative; flex:1 1 220px; min-width:0; }
.dshpm-search input { box-sizing:border-box; width:100%; height:34px; padding:0 10px 0 32px; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:13px; }
.dshpm-search svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--dsw-alias-label-tertiary); }
.dshpm-select { height:34px; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:12px; padding:0 8px; }
.dshpm-cats { display:flex; flex-wrap:wrap; gap:6px; }
.dshpm-cat { display:inline-flex; align-items:center; gap:5px; height:28px; padding:0 11px; border:1px solid var(--dsw-alias-border-l2); border-radius:999px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-secondary); font:inherit; font-size:12px; cursor:pointer; }
.dshpm-cat:hover:not([data-active]) { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); }
.dshpm-cat[data-active=true] { border-color:var(--dsw-alias-state-business-primary); background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent); color:var(--dsw-alias-state-business-primary); font-weight:600; }
.dshpm-catCount { font-variant-numeric:tabular-nums; font-size:11px; color:var(--dsw-alias-label-tertiary); }
.dshpm-cat[data-active=true] .dshpm-catCount { color:var(--dsw-alias-state-business-primary); }
.dshpm-button { height:34px; padding:0 12px; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:12px; cursor:pointer; }
.dshpm-button:hover:not(:disabled) { background:var(--dsw-alias-interactive-bg-hover); }
.dshpm-button:disabled { opacity:.55; cursor:default; }
.dshpm-primary { border-color:var(--dsw-alias-state-business-primary); background:var(--dsw-alias-state-business-primary); color:var(--dsw-alias-label-on-primary,#fff); }
.dshpm-danger { color:var(--dsw-alias-state-error-primary); }
.dshpm-status { font-size:12px; color:var(--dsw-alias-label-tertiary); }
.dshpm-warn { font-size:12px; color:var(--dsw-alias-state-warning-primary,var(--dsw-alias-label-secondary)); }
.dshpm-cards { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin:0; padding:0; list-style:none; }
.dshpm-card { border:1px solid var(--dsw-alias-border-l2); border-radius:10px; background:var(--dsw-alias-bg-layer-3); padding:12px 14px; min-width:0; display:flex; flex-direction:column; gap:6px; }
.dshpm-cardHead { display:flex; align-items:center; gap:8px; min-width:0; }
.dshpm-cardName { font-size:14px; font-weight:600; line-height:20px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
.dshpm-cardVer { flex:none; font-size:12px; color:var(--dsw-alias-label-tertiary); font-variant-numeric:tabular-nums; }
.dshpm-cardDesc { font-size:12px; line-height:18px; color:var(--dsw-alias-label-secondary); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:36px; }
.dshpm-cardMeta { display:flex; flex-wrap:wrap; gap:4px 10px; font-size:11px; color:var(--dsw-alias-label-tertiary); }
.dshpm-chip { border:1px solid var(--dsw-alias-border-l2); border-radius:999px; padding:1px 7px; font-size:11px; color:var(--dsw-alias-label-tertiary); }
.dshpm-chip[data-installed=true] { background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent); color:var(--dsw-alias-state-success-primary); }
.dshpm-chip[data-outdated=true] { background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent); color:var(--dsw-alias-state-business-primary); }
.dshpm-cardActions { display:flex; gap:6px; align-items:center; margin-top:auto; }
.dshpm-cardActions .dshpm-button { height:28px; padding:0 10px; font-size:12px; }
.dshpm-msg { font-size:12px; color:var(--dsw-alias-state-success-primary); white-space:pre-wrap; }
.dshpm-err { font-size:12px; color:var(--dsw-alias-state-error-primary); white-space:pre-wrap; }
.dshpm-page { box-sizing:border-box; width:100%; height:100%; min-height:0; padding:22px clamp(24px,4vw,48px) 36px; overflow-y:auto; overscroll-behavior:contain; }
.dshpm-pageTitle { max-width:1000px; margin:0 auto 10px; font-size:20px; font-weight:600; line-height:28px; color:var(--dsw-alias-label-primary); }
.dshpm-page > .dshpm-root { max-width:1000px; margin:0 auto; }
.dshpm-searchBtn { flex:none; }
.dshpm-author { box-sizing:border-box; width:150px; height:34px; padding:0 10px; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:12px; }
.dshpm-versions { border:1px solid var(--dsw-alias-border-l2); border-radius:8px; overflow:hidden; }
.dshpm-versionsHead { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px; background:var(--dsw-alias-bg-layer-3); font-size:12px; }
.dshpm-versionRow { display:grid; grid-template-columns:96px minmax(0,1fr) auto auto; align-items:center; gap:10px; padding:7px 12px; font-size:12px; color:var(--dsw-alias-label-secondary); border-top:1px solid var(--dsw-alias-border-l2); }
.dshpm-versionNum { font-variant-numeric:tabular-nums; color:var(--dsw-alias-label-primary); font-weight:600; }
.dshpm-chip[data-deprecated=true] { color:var(--dsw-alias-state-error-primary); }
.dshpm-chip[data-ok=true] { color:var(--dsw-alias-state-success-primary); }
.dshpm-chip[data-ok=false] { color:var(--dsw-alias-state-error-primary); }
.dshpm-compare { border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--dsw-alias-bg-layer-1); padding:12px; display:flex; flex-direction:column; gap:10px; }
.dshpm-compareHead { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.dshpm-compareTable { display:flex; flex-direction:column; gap:2px; overflow-x:auto; }
.dshpm-compareRow { display:grid; grid-template-columns:minmax(0,1.7fr) 88px 104px 82px 76px; gap:8px; align-items:center; min-width:620px; padding:6px 8px; border:0; border-radius:6px; background:transparent; color:var(--dsw-alias-label-secondary); font:inherit; font-size:12px; text-align:left; }
.dshpm-compareHeader { color:var(--dsw-alias-label-tertiary); font-size:11px; padding-bottom:2px; }
.dshpm-compareRow[data-current=true] { background:var(--dsw-alias-bg-layer-3); color:var(--dsw-alias-label-primary); font-weight:600; }
.dshpm-compareBtn { cursor:pointer; }
.dshpm-compareSwitch { color:var(--dsw-alias-label-tertiary); font-size:11px; }
.dshpm-matrix { display:flex; flex-direction:column; gap:2px; overflow-x:auto; }
.dshpm-matrixRow { display:grid; gap:6px; align-items:center; min-width:560px; padding:4px 6px; border-radius:4px; font-size:12px; }
.dshpm-matrixHead { color:var(--dsw-alias-label-tertiary); font-size:11px; }
.dshpm-matrixLabel { color:var(--dsw-alias-label-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dshpm-matrixCol { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center; }
.dshpm-matrixCell { text-align:center; color:var(--dsw-alias-label-tertiary); }
.dshpm-matrixCell[data-on=true] { color:var(--dsw-alias-state-success-primary); font-weight:600; }
.dshpm-matrixCell[data-current=true] { background:var(--dsw-alias-bg-layer-3); border-radius:4px; }
.dshpm-matrixBtn { border:0; background:transparent; color:inherit; font:inherit; cursor:pointer; }
.dshpm-matrixBtn:hover { color:var(--dsw-alias-label-primary); }
.dshpm-compareBtn:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); }
.dshpm-insights { display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:12px; color:var(--dsw-alias-label-secondary); }
.dshpm-insights ul { margin:4px 0 0; padding-left:18px; }
.dshpm-insights strong { color:var(--dsw-alias-label-primary); }
@media (max-width:680px){ .dshpm-insights { grid-template-columns:1fr; } }
.dshpm-preflight { border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--dsw-alias-bg-layer-1); padding:10px 12px; display:flex; flex-direction:column; gap:6px; }
.dshpm-job { display:flex; align-items:center; flex-wrap:wrap; gap:10px; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--dsw-alias-bg-layer-1); padding:8px 12px; font-size:12px; color:var(--dsw-alias-label-secondary); }
.dshpm-pager { display:flex; align-items:center; justify-content:center; gap:10px; font-size:12px; color:var(--dsw-alias-label-tertiary); }
.dshpm-detail { display:flex; flex-direction:column; gap:10px; }
.dshpm-detailHead { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.dshpm-detailName { font-size:18px; font-weight:600; line-height:26px; margin:0; }
.dshpm-detailDesc { font-size:13px; line-height:20px; color:var(--dsw-alias-label-secondary); }
.dshpm-detailFacts { display:flex; flex-wrap:wrap; gap:4px 10px; font-size:12px; color:var(--dsw-alias-label-tertiary); }
.dshpm-translateRow { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:6px; }
.dshpm-readmeHead { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px; }
.dshpm-readme { border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--dsw-alias-bg-layer-1); padding:10px 12px; font-size:12px; line-height:18px; color:var(--dsw-alias-label-secondary); white-space:pre-wrap; overflow-wrap:anywhere; }
@media (max-width:680px){ .dshpm-cards { grid-template-columns:minmax(0,1fr); } }
.dshpm-sideBtn { display:inline-flex; align-items:center; gap:8px; height:36px; max-width:100%; padding:0 10px; border:none; border-radius:10px; background:transparent; color:var(--dsw-alias-label-primary); font-family:inherit; font-size:14px; cursor:pointer; overflow:hidden; }
.dshpm-sideBtn:hover { background:var(--dsw-alias-interactive-bg-hover-solid); }
.dshpm-sideBtn[data-active=true] { background:var(--dsw-alias-interactive-bg-hover); }
.dshpm-sideBtnLabel { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dshpm-sideBtn[data-rail=true] { justify-content:center; width:36px; padding:0; border-radius:50%; }
.dshpm-sideBtn[data-rail=true] .dshpm-sideBtnLabel { display:none; }
.dshpm-overlay { position:fixed; inset:8px 8px 8px 72px; z-index:60; display:flex; flex-direction:column; overflow:hidden; border:1px solid var(--dsw-alias-border-l1); border-radius:12px; background:var(--dsw-alias-bg-base); box-shadow:var(--dsw-shadow-lv2); }
.dshpm-overlayHeader { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid var(--dsw-alias-border-l2); flex:none; }
.dshpm-overlayTitle { font-size:14px; font-weight:600; color:var(--dsw-alias-label-primary); margin:0; }
.dshpm-overlayBody { flex:1; min-height:0; overflow-y:auto; padding:14px; }
.dshpm-overlayBody .dshpm-root { max-width:1100px; }
@media (max-width:680px){ .dshpm-overlay { inset:0; border-radius:0; } }
`

    const tagId = 'dsh-market-ui/dshpm.css'
    if (typeof document !== 'undefined' && !document.querySelector(`style[data-plugin-css="${tagId}"]`)) {
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-market-ui'
      tag.dataset.pluginCss = tagId
      tag.textContent = CSS
      document.head.appendChild(tag)
    }

    const CATEGORY_IDS = ['all', 'mine', 'ui', 'memory', 'agent', 'tools', 'comm', 'dev', 'security', 'session', 'notify', 'other']

    function catLabel(dict, id) {
      return dict['cat' + id.charAt(0).toUpperCase() + id.slice(1)]
    }

    const README_PREVIEW = 1200

    // 功能矩阵标签（与 host 的 CAPABILITIES id 对应）
    const FEATURE_LABELS = {
      zh: {
        cost: '费用统计', balance: '余额/额度', context: '上下文管理', memory: '记忆/知识',
        search: '搜索', mcp: 'MCP', notify: '通知/提醒', theme: '界面/主题',
        agent: 'Agent/工作流', schedule: '定时任务', session: '会话/历史', translate: '翻译',
        voice: '语音', vision: '图像/视觉', model: '多模型/路由', market: '插件市场',
        security: '安全/权限', terminal: '终端', file: '文件/工作区', git: 'Git', skill: '技能',
      },
      en: {
        cost: 'Cost', balance: 'Balance', context: 'Context', memory: 'Memory',
        search: 'Search', mcp: 'MCP', notify: 'Notifications', theme: 'UI/themes',
        agent: 'Agents', schedule: 'Scheduling', session: 'Sessions', translate: 'Translation',
        voice: 'Voice', vision: 'Vision', model: 'Models', market: 'Marketplace',
        security: 'Security', terminal: 'Terminal', file: 'Files', git: 'Git', skill: 'Skills',
      },
    }
    const FEATURE_ORDER = Object.keys(FEATURE_LABELS.zh)

    /** 当前界面语言：DSH 会在 <html lang> 上同步，navigator.language 兜底。 */
    function uiLang() {
      const raw = (typeof document !== 'undefined' && document.documentElement.lang)
        || (typeof navigator !== 'undefined' ? navigator.language : '')
        || 'en'
      return String(raw).toLowerCase().startsWith('zh') ? 'zh' : 'en'
    }

    /** 浏览器本地翻译（Chromium Translator API）：可用就免 token，不可用返回 null。 */
    async function translateLocally(text, target) {
      try {
        const api = globalThis.Translator
        if (api === undefined || typeof api.availability !== 'function' || typeof api.create !== 'function') return null
        const sourceLanguage = target === 'zh' ? 'en' : 'zh'
        const availability = await api.availability({ sourceLanguage, targetLanguage: target })
        // 只在语言包已就绪时使用，避免静默下载大模型；downloadable 交给用户先在浏览器里启用。
        if (availability !== 'available') return null
        const translator = await api.create({ sourceLanguage, targetLanguage: target })
        try {
          const output = await translator.translate(text)
          return typeof output === 'string' && output !== '' ? output : null
        } finally {
          translator.destroy?.()
        }
      } catch {
        return null
      }
    }

    /** 机器翻译控制条：有译文时显示“机器翻译 / 查看原文”。 */
    function TranslateBar({ dict, kind, translation, translating, showOriginal, onTranslate, onToggle }) {
      const active = translation !== null && translation.kind === kind
      return h('div', { className: 'dshpm-translateRow' },
        active
          ? h(React.Fragment, null,
            h('span', { className: 'dshpm-chip' }, dict.translatedBy),
            h('button', { className: 'dshpm-button', onClick: onToggle }, showOriginal ? dict.showTranslation : dict.showOriginal),
          )
          : h('button', {
            className: 'dshpm-button',
            disabled: translating !== null,
            title: dict.translateHint,
            onClick: onTranslate,
          }, translating === kind ? dict.translating : (kind === 'readme' ? dict.translateReadme : dict.translate)),
      )
    }

    function fmtNumber(value) {
      if (!value) return '0'
      if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}m`
      if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
      return String(value)
    }

    function fmtBytes(bytes) {
      if (typeof bytes !== 'number' || bytes <= 0) return ''
      const units = ['B', 'KB', 'MB', 'GB']
      let value = bytes
      let index = 0
      while (value >= 1024 && index < units.length - 1) {
        value /= 1024
        index += 1
      }
      return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`
    }

    function fmtDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return ''
      try {
        return d.toLocaleDateString()
      } catch {
        return d.toISOString().slice(0, 10)
      }
    }

    /** 用 keywords 做“功能标签”对比：独有的标签、同类常见但当前缺失的标签。 */
    function keywordInsights(base, items) {
      const baseTags = new Set((base.keywords || []).map((tag) => String(tag).toLowerCase()))
      const counts = new Map()
      for (const item of items) {
        for (const tag of item.keywords || []) {
          const key = String(tag).toLowerCase()
          counts.set(key, (counts.get(key) || 0) + 1)
        }
      }
      const unique = (base.keywords || []).filter((tag) => !counts.has(String(tag).toLowerCase()))
      const missing = [...counts.entries()]
        .filter(([tag, count]) => count >= 2 && !baseTags.has(tag))
        .map(([tag]) => tag)
      return { unique, missing }
    }

    /** 基于客观数据算相对优势/劣势；没有数据就不下结论。 */
    function compareInsights(base, items, dict) {
      const pros = []
      const cons = []
      const baseDownloads = base.downloads || 0
      const otherDownloads = items.map((item) => item.downloads || 0)
      if (baseDownloads > 0 && otherDownloads.length > 0 && baseDownloads > Math.max(...otherDownloads)) {
        pros.push(dict.proDownloadsMax.replace('{n}', fmtNumber(baseDownloads)))
      } else if (otherDownloads.some((value) => value > baseDownloads)) {
        cons.push(dict.conDownloadsLow.replace('{n}', fmtNumber(baseDownloads)))
      }
      const baseTime = base.updatedAt ? Date.parse(base.updatedAt) : 0
      const otherTimes = items
        .map((item) => (item.updatedAt ? Date.parse(item.updatedAt) : 0))
        .filter((value) => value > 0)
      if (baseTime > 0 && otherTimes.length > 0) {
        if (baseTime > Math.max(...otherTimes)) pros.push(dict.proNewest.replace('{d}', fmtDate(base.updatedAt)))
        else if (baseTime < Math.min(...otherTimes)) cons.push(dict.conOldest.replace('{d}', fmtDate(base.updatedAt)))
      }
      if (base.hasInstallScript === true) cons.push(dict.conScripts)
      else if (items.some((item) => item.hasInstallScript === true)) pros.push(dict.proNoScripts)
      if (base.compatibility === 'compatible') pros.push(dict.proCompatible)
      if (base.compatibility === 'incompatible') cons.push(dict.conIncompatible)
      return { pros, cons }
    }

    async function request(method, params, options) {
      const qs = params ? `?${new URLSearchParams(params)}` : ''
      const body = options?.body
      const res = await fetch(`/api/plugin-market/${method}${qs}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          accept: 'application/json',
          'x-dsh-market': '1',
          ...(body ? { 'content-type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal ?? AbortSignal.timeout(20000),
      })
      let data = null
      try {
        data = await res.json()
      } catch {
        /* 非 JSON 响应按状态码报错 */
      }
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      return data
    }

    function errorText(dict, data) {
      const code = data?.error?.code
      if (typeof code === 'string' && dict[`err_${code}`]) return dict[`err_${code}`]
      const message = data?.error?.message || data?.error
      return typeof message === 'string' && message ? message : dict.err_unknown
    }

    function okText(dict, action, data) {
      const key = action === 'install' ? 'okInstall' : action === 'uninstall' ? 'okUninstall' : 'okUpdate'
      const base = dict[key].replace('{pkg}', data.pkg)
      return data.application === 'restart-required' ? `${base}（${dict.restart}）` : base
    }

    /** 把仓库字段（owner/name、git+https、URL）统一成可点击的 HTTPS 地址。 */
    function repoHref(item) {
      const raw = String(item.repository || item.repo || '').trim()
      if (raw === '') return null
      if (/^https?:\/\//i.test(raw)) return raw
      if (/^git\+https?:/i.test(raw)) return raw.slice(4)
      if (/^[\w.-]+\/[\w.-]+$/.test(raw)) return 'https://github.com/' + raw
      return null
    }

    /** 安装/卸载/更新动作按钮（返回按钮片段，由调用方决定布局）。 */
    function ActionButtons({ dict, item, installedInfo, busy, onAction }) {
      const installed = installedInfo != null
      const outdated = installed && item.version && installedInfo.version && item.version !== installedInfo.version
      const removable = installed && installedInfo.removable !== false
      return h(React.Fragment, null,
        !installed
          ? h('button', {
            className: 'dshpm-button dshpm-primary',
            disabled: busy != null,
            onClick: () => onAction('install', item.pkg),
          }, busy === item.pkg ? dict.installing : dict.install)
          : h('button', {
            className: 'dshpm-button dshpm-primary',
            disabled: busy != null || !outdated,
            title: outdated ? `${installedInfo.version} → ${item.version}` : dict.installed,
            onClick: () => onAction('update', item.pkg),
          }, busy === item.pkg ? dict.updating : outdated ? dict.update : dict.installed),
        installed && removable
          ? h('button', {
            className: 'dshpm-button dshpm-danger',
            disabled: busy != null,
            onClick: () => onAction('uninstall', item.pkg),
          }, busy === item.pkg ? dict.uninstalling : dict.uninstall)
          : null,
      )
    }

    function MarketPanel({ t }) {
      const dict = useMemo(() => {
        if (!(t && typeof t === 'function')) return zh
        const out = {}
        for (const key of DICT_KEYS) {
          const value = t(key)
          out[key] = typeof value === 'string' ? value : zh[key]
        }
        return out
      }, [t])

      const [q, setQ] = useState('')
      const [query, setQuery] = useState('')
      const [author, setAuthor] = useState('')
      const [queryAuthor, setQueryAuthor] = useState('')
      const [since, setSince] = useState(0)
      const [only, setOnly] = useState('all')
      const [sort, setSort] = useState('popularity')
      const [dir, setDir] = useState('desc')
      const [category, setCategory] = useState('all')
      const [page, setPage] = useState(1)
      const [data, setData] = useState({ items: [], total: 0, counts: {}, fetchedAt: null, stale: false, exact: false })
      const [installed, setInstalled] = useState({})
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [notice, setNotice] = useState(null)
      const [job, setJob] = useState(null)
      const [updates, setUpdates] = useState([])
      const [version, setVersion] = useState(null)
      const [similar, setSimilar] = useState(null)
      const [similarLoading, setSimilarLoading] = useState(false)
      const [bulk, setBulk] = useState(null)
      const [detail, setDetail] = useState(null)
      const [detailLoading, setDetailLoading] = useState(false)
      const [readmeExpanded, setReadmeExpanded] = useState(false)
      const [translation, setTranslation] = useState(null)
      const [translating, setTranslating] = useState(null)
      const [showOriginal, setShowOriginal] = useState(false)
      const abortRef = useRef(null)
      const rootRef = useRef(null)
      const listScrollTop = useRef(0)

      // 输入防抖：停止输入 350ms 后才真正查询
      useEffect(() => {
        const timer = setTimeout(() => {
          setQuery(q.trim())
          setQueryAuthor(author.trim())
          setPage(1)
        }, 350)
        return () => clearTimeout(timer)
      }, [q, author])

      const load = useCallback(async (refresh = false) => {
        setLoading(true)
        setError(null)
        abortRef.current?.abort()
        const ac = new AbortController()
        abortRef.current = ac
        try {
          const res = await request('list', {
            q: query,
            author: queryAuthor,
            since: String(since),
            only,
            sort,
            dir,
            category,
            page,
            perPage: 20,
            ...(refresh ? { refresh: '1' } : {}),
          }, { signal: ac.signal })
          if (ac.signal.aborted) return
          setData({
            items: res.items ?? [],
            total: res.total ?? 0,
            counts: res.counts ?? {},
            fetchedAt: res.fetchedAt ?? null,
            stale: res.stale === true,
            exact: res.exact === true,
          })
          setInstalled(res.packages ?? {})
        } catch (e) {
          if (!ac.signal.aborted) setError(e.message)
        } finally {
          if (!ac.signal.aborted) setLoading(false)
        }
      }, [query, queryAuthor, since, only, sort, dir, category, page])

      useEffect(() => { load() }, [load])

      const loadUpdates = useCallback(async () => {
        try {
          const res = await request('updates')
          if (res.ok) setUpdates(Array.isArray(res.updates) ? res.updates : [])
        } catch {
          /* 更新检查失败不打扰用户 */
        }
      }, [])

      useEffect(() => { loadUpdates() }, [loadUpdates])

      useEffect(() => {
        let alive = true
        request('health')
          .then((res) => { if (alive && typeof res.version === 'string') setVersion(res.version) })
          .catch(() => {})
        return () => { alive = false }
      }, [])

      /** 显式搜索：点按钮或按 Enter 立即执行；重复搜索会强制刷新。 */
      const applySearch = useCallback(() => {
        const nextQuery = q.trim()
        const nextAuthor = author.trim()
        if (nextQuery === query && nextAuthor === queryAuthor) {
          void load()
        } else {
          setQuery(nextQuery)
          setQueryAuthor(nextAuthor)
          setPage(1)
        }
      }, [q, author, query, queryAuthor, load])

      const pageScroller = () => rootRef.current?.closest('.dshpm-page') ?? null

      const openDetail = useCallback(async (pkg, seed = null) => {
        setDetailLoading(true)
        setError(null)
        // 先用列表里已有的数据渲染，详情接口（README/版本历史）在后台补齐。
        if (seed !== null) {
          const info = installed[pkg] ?? null
          setDetail({ ...seed, installed: info !== null, installedInfo: info })
        }
        try {
          const res = await request('detail', { pkg, lang: uiLang() })
          setDetail(res.item ?? null)
        } catch (e) {
          setNotice({ type: 'err', text: dict.error.replace('{msg}', e.message) })
        } finally {
          setDetailLoading(false)
        }
      }, [dict, installed])

      /** 完成通知：任务结束、刷新列表与详情。 */
      const finishJob = useCallback(async (finished) => {
        setJob(null)
        if (finished.application === 'applied' || finished.application === 'restart-required') {
          setNotice({ type: 'ok', text: okText(dict, finished.action, finished) })
        } else if (finished.application === 'cancelled') {
          setNotice({ type: 'err', text: dict.cancelledJob })
        } else {
          setNotice({ type: 'err', text: dict.failed.replace('{msg}', errorText(dict, { error: finished.error })) })
        }
        await load()
        void loadUpdates()
        if (detail) await openDetail(detail.pkg, detail)
      }, [dict, load, loadUpdates, detail, openDetail])

      /** 启动任务：请求立即返回 job，不等 pnpm 跑完。 */
      const act = useCallback(async (action, pkg) => {
        if (job != null || bulk !== null) return
        if (action === 'uninstall' && !window.confirm(dict.confirmUninstall.replace('{pkg}', pkg))) return
        if (action === 'update' && !window.confirm(dict.confirmUpdate.replace('{pkg}', pkg))) return
        setNotice(null)
        try {
          const res = await request(action, null, { body: { pkg } })
          if (res.ok && res.job) setJob(res.job)
          else if (res.ok) {
            // 兼容旧版 host（同步返回）：直接提示并刷新。
            setNotice({ type: 'ok', text: okText(dict, action, res) })
            await load()
          } else setNotice({ type: 'err', text: dict.failed.replace('{msg}', errorText(dict, res)) })
        } catch (e) {
          setNotice({ type: 'err', text: dict.failed.replace('{msg}', e.message) })
        }
      }, [job, bulk, dict, load])

      const cancelJob = useCallback(async () => {
        if (job == null) return
        try {
          await request('cancel', null, { body: { id: job.id } })
          setNotice({ type: 'ok', text: dict.cancelRequested })
        } catch (e) {
          setNotice({ type: 'err', text: e.message })
        }
      }, [job, dict])

      /** 按需翻译：先试浏览器本地 Translator，失败回退到 DSH 默认模型（服务端缓存）。 */
      const runTranslate = useCallback(async (kind) => {
        if (detail === null) return
        const raw = kind === 'description' ? (detail.description || '') : (detail.readme || '').slice(0, 2000)
        if (raw.trim() === '') return
        setTranslating(kind)
        setNotice(null)
        try {
          const local = await translateLocally(raw, 'zh')
          if (local !== null) {
            setTranslation({ kind, text: local, source: 'local' })
            setShowOriginal(false)
            return
          }
          const res = await request('translate', null, { body: { text: raw, target: 'zh' } })
          if (!res.ok) throw new Error(res.error || 'translation failed')
          setTranslation({ kind, text: res.text, source: res.cached ? 'cache' : 'model' })
          setShowOriginal(false)
        } catch (e) {
          setNotice({ type: 'err', text: dict.translateFailed.replace('{msg}', e.message) })
        } finally {
          setTranslating(null)
        }
      }, [detail, dict])

      /** 依次更新所有已装插件；每个都复用 /update 的后台任务与轮询。 */
      const updateAll = useCallback(async () => {
        const list = updates
        if (list.length === 0 || job !== null || bulk !== null) return
        if (!window.confirm(dict.updateAllConfirm.replace('{n}', list.length))) return
        const failed = []
        for (let index = 0; index < list.length; index += 1) {
          const entry = list[index]
          setBulk({ index: index + 1, total: list.length, pkg: entry.pkg })
          try {
            const started = await request('update', null, { body: { pkg: entry.pkg } })
            if (!started.ok || !started.job) {
              failed.push(entry.pkg)
              continue
            }
            let finished = started.job
            for (;;) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
              const res = await request('job', { id: finished.id })
              if (res.job && res.job.status !== 'running') {
                finished = res.job
                break
              }
            }
            if (finished.application !== 'applied' && finished.application !== 'restart-required') failed.push(entry.pkg)
          } catch {
            failed.push(entry.pkg)
          }
        }
        setBulk(null)
        setNotice({
          type: failed.length === 0 ? 'ok' : 'err',
          text: dict.bulkDone
            .replace('{ok}', String(list.length - failed.length))
            .replace('{failed}', String(failed.length)),
        })
        await load()
        await loadUpdates()
      }, [updates, job, bulk, dict, load, loadUpdates])

      // 轮询任务状态；profile 重组导致的短暂断连会自动重试。
      useEffect(() => {
        if (job == null || job.status !== 'running') return
        let stopped = false
        let timer = null
        const tick = async () => {
          try {
            const res = await request('job', { id: job.id })
            if (stopped) return
            if (res.job && res.job.status !== 'running') {
              await finishJob(res.job)
              return
            }
            timer = setTimeout(tick, 1000)
          } catch (e) {
            if (stopped) return
            // 宿主插件被 profile 重组重载后，旧 job 不再存在：不要无限重试。
            if (/\b404\b|job not found/.test(String(e?.message ?? ''))) {
              setJob(null)
              setNotice({ type: 'ok', text: dict.jobLost })
              void load()
              return
            }
            timer = setTimeout(tick, 1500)
          }
        }
        timer = setTimeout(tick, 800)
        return () => {
          stopped = true
          clearTimeout(timer)
        }
      }, [job?.id, finishJob])

      // 重新打开面板时接管仍在后台运行的任务。
      useEffect(() => {
        let alive = true
        request('jobs')
          .then((res) => {
            if (!alive) return
            const running = (res.jobs || []).find((item) => item.status === 'running')
            if (running) setJob(running)
          })
          .catch(() => {})
        return () => { alive = false }
      }, [])

      useEffect(() => {
        setReadmeExpanded(false)
        setTranslation(null)
        setTranslating(null)
        setShowOriginal(false)
      }, [detail?.pkg])

      // 详情加载后拉同类插件（对比区独立加载，不阻塞主详情）。
      useEffect(() => {
        const pkg = detail?.pkg
        if (pkg === undefined || pkg === null) {
          setSimilar(null)
          return undefined
        }
        let alive = true
        setSimilar(null)
        setSimilarLoading(true)
        request('similar', { pkg, lang: uiLang() })
          .then((res) => {
            if (!alive || !res.ok) return
            setSimilar({ base: res.base ?? null, items: Array.isArray(res.items) ? res.items : [] })
          })
          .catch(() => {})
          .finally(() => {
            if (alive) setSimilarLoading(false)
          })
        return () => { alive = false }
      }, [detail?.pkg])

      // 打开详情回到顶部；返回列表时恢复原来的滚动位置。
      useEffect(() => {
        const node = rootRef.current?.closest('.dshpm-page')
        if (!node) return
        if (detail !== null) {
          node.scrollTo({ top: 0 })
        } else {
          node.scrollTo({ top: listScrollTop.current })
        }
      }, [detail])

      const counts = data.counts || {}
      const totalPages = Math.max(1, Math.ceil((data.total || 0) / 20))

      // ── 详情视图 ──
      if (detail) {
        const info = detail.installedInfo
        const readmeText = detail.readme || ''
        const readmePreview = readmeText.length > README_PREVIEW
          ? readmeText.slice(0, README_PREVIEW) + '…'
          : readmeText
        const comparison = similar !== null && similar.base !== null && similar.items.length > 0
          ? { ...compareInsights(similar.base, similar.items, dict), ...keywordInsights(similar.base, similar.items) }
          : null
        const featureLabels = FEATURE_LABELS[uiLang() === 'zh' ? 'zh' : 'en']
        const matrix = (() => {
          if (similar === null || similar.base === null) return null
          const plugins = [similar.base, ...similar.items]
          if (Array.isArray(similar.domainTemplate) && similar.domainTemplate.length > 0) {
            const rows = similar.domainTemplate
              .filter((feature) => plugins.some((plugin) => (plugin.domainFeatures || []).includes(feature.id)))
              .slice(0, 14)
              .map((feature) => ({
                id: feature.id,
                label: typeof feature.label === 'string'
                  ? feature.label
                  : (feature.label?.[uiLang() === 'zh' ? 'zh' : 'en'] ?? feature.id),
                field: 'domainFeatures',
              }))
            if (rows.length > 0) return { plugins, rows, template: `minmax(120px,1.2fr) repeat(${plugins.length}, minmax(86px,1fr))` }
          }
          const rows = FEATURE_ORDER
            .filter((id) => plugins.some((plugin) => (plugin.features || []).includes(id)))
            .slice(0, 14)
            .map((id) => ({ id, label: featureLabels[id], field: 'features' }))
          return { plugins, rows, template: `minmax(120px,1.2fr) repeat(${plugins.length}, minmax(86px,1fr))` }
        })()
        const descriptionTranslated = translation !== null && translation.kind === 'description' && !showOriginal
        const readmeTranslated = translation !== null && translation.kind === 'readme' && !showOriginal
        const readmeBody = readmeTranslated ? translation.text : (readmeExpanded ? readmeText : readmePreview)
        return h('div', { className: 'dshpm-root', ref: rootRef },
          h('div', { className: 'dshpm-toolbar' },
            h('button', { className: 'dshpm-button', onClick: () => { setDetail(null); setNotice(null) } }, '← ' + dict.back),
            h('a', { className: 'dshpm-button', href: detail.url, target: '_blank', rel: 'noreferrer' }, dict.openRepo),
          ),
          notice ? h('p', { className: notice.type === 'err' ? 'dshpm-err' : 'dshpm-msg' }, notice.text) : null,
          job != null && job.status === 'running'
            ? h('div', { className: 'dshpm-job' },
              h('span', null, dict[job.action + 'Job'].replace('{pkg}', job.pkg) + ' ' + dict.backgroundHint),
              job.action === 'uninstall' ? null : h('button', { className: 'dshpm-button', onClick: cancelJob }, dict.cancelJob),
            )
            : null,
          h('div', { className: 'dshpm-detail' },
            h('div', { className: 'dshpm-detailHead' },
              h('h3', { className: 'dshpm-detailName' }, detail.pkg),
              detail.installed
                ? h('span', { className: 'dshpm-chip', 'data-installed': 'true' },
                  info?.version ? dict.installedVersion.replace('{n}', info.version) : dict.installed)
                : null,
              detail.installed && info?.version && detail.version && info.version !== detail.version
                ? h('span', { className: 'dshpm-chip', 'data-outdated': 'true' }, `${info.version} → ${detail.version}`)
                : null,
            ),
            detail.isBundle === false
              ? h('p', { className: 'dshpm-warn' }, dict.notBundle)
              : null,
            detail.description
              ? h('div', null,
                h('p', { className: 'dshpm-detailDesc' }, descriptionTranslated ? translation.text : detail.description),
                uiLang() === 'zh' && !/[\u4e00-\u9fff]/.test(detail.description || '')
                  ? h(TranslateBar, {
                    dict,
                    kind: 'description',
                    translation,
                    translating,
                    showOriginal,
                    onTranslate: () => runTranslate('description'),
                    onToggle: () => setShowOriginal((value) => !value),
                  })
                  : null,
              )
              : null,
            h('div', { className: 'dshpm-detailFacts' },
              detail.latest
                ? h('span', null, dict.latestLabel.replace('{v}', detail.latest))
                : detail.version ? h('span', null, dict.version.replace('{n}', detail.version)) : null,
              detail.publisher ? h('span', null, dict.publisherLabel + ': ' + detail.publisher) : null,
              detail.author ? h('span', null, dict.authorLabel + ': ' + detail.author) : null,
              detail.repoOwner && detail.repoOwner !== detail.publisher
                ? h('span', null, 'GitHub: ' + detail.repoOwner)
                : null,
              detail.downloads ? h('span', null, dict.downloads.replace('{n}', fmtNumber(detail.downloads))) : null,
              detail.updatedAt ? h('span', null, dict.updated.replace('{d}', fmtDate(detail.updatedAt))) : null,
              detail.license ? h('span', null, dict.license.replace('{l}', detail.license)) : null,
              detail.engines?.dsh ? h('span', null, 'DSH ' + detail.engines.dsh) : null,
            ),
            h('div', { className: 'dshpm-detailFacts' },
              repoHref(detail) ? h('a', { href: repoHref(detail), target: '_blank', rel: 'noreferrer' }, dict.repoLink) : null,
              h('a', {
                href: 'https://www.npmjs.com/package/' + encodeURIComponent(detail.pkg),
                target: '_blank',
                rel: 'noreferrer',
              }, dict.npmLink),
            ),
            detail.unpackedSize || detail.hasInstallScript !== undefined || detail.compatibility !== undefined
              ? h('div', { className: 'dshpm-preflight' },
                h('strong', null, dict.preflight),
                h('div', { className: 'dshpm-detailFacts' },
                  detail.unpackedSize ? h('span', null, dict.packageSize.replace('{v}', fmtBytes(detail.unpackedSize))) : null,
                  detail.hasInstallScript === undefined
                    ? null
                    : h('span', null, detail.hasInstallScript ? dict.installScriptsYes : dict.installScriptsNo),
                  detail.compatibility === 'compatible' ? h('span', { className: 'dshpm-chip', 'data-ok': 'true' }, dict.compatCompatible) : null,
                  detail.compatibility === 'incompatible' ? h('span', { className: 'dshpm-chip', 'data-ok': 'false' }, dict.compatIncompatible) : null,
                  detail.deprecated ? h('span', { className: 'dshpm-chip', 'data-deprecated': 'true' }, dict.deprecatedBadge) : null,
                ),
                detail.hasInstallScript ? h('p', { className: 'dshpm-warn' }, dict.scriptsWarn) : null,
                detail.compatibility === 'incompatible' ? h('p', { className: 'dshpm-warn' }, dict.incompatibleWarn) : null,
              )
              : null,
            detail.versions?.length
              ? h('div', { className: 'dshpm-versions' },
                h('div', { className: 'dshpm-versionsHead' },
                  h('strong', null, dict.versionsTitle),
                  h('span', { className: 'dshpm-status' }, dict.versionCount.replace('{n}', detail.versionCount ?? detail.versions.length)),
                ),
                detail.versions.map((version) => h('div', { className: 'dshpm-versionRow', key: version.version },
                  h('span', { className: 'dshpm-versionNum' }, 'v' + version.version),
                  h('span', null, version.publishedAt ? fmtDate(version.publishedAt) : '—'),
                  version.dsh ? h('span', { className: 'dshpm-chip' }, 'DSH ' + version.dsh) : h('span', null, ''),
                  version.deprecated
                    ? h('span', { className: 'dshpm-chip', 'data-deprecated': 'true' }, dict.deprecatedBadge)
                    : h('span', null, ''),
                )),
              )
              : null,
            comparison !== null
              ? h('div', { className: 'dshpm-compare' },
                h('div', { className: 'dshpm-compareHead' },
                  h('strong', null, dict.compareTitle),
                  h('span', { className: 'dshpm-status' }, dict.compareNote),
                ),
                h('div', { className: 'dshpm-compareTable' },
                  h('div', { className: 'dshpm-compareRow dshpm-compareHeader' },
                    h('span', null, dict.colPlugin),
                    h('span', null, dict.colDownloads),
                    h('span', null, dict.colUpdated),
                    h('span', null, dict.colVersion),
                    h('span', null, dict.colLicense),
                  ),
                  h('div', { className: 'dshpm-compareRow', 'data-current': 'true' },
                    h('span', null, `${similar.base.pkg} · ${dict.compareCurrent}`),
                    h('span', null, fmtNumber(similar.base.downloads || 0)),
                    h('span', null, fmtDate(similar.base.updatedAt) || '—'),
                    h('span', null, similar.base.version ?? '—'),
                    h('span', null, similar.base.license ?? '—'),
                  ),
                  similar.items.map((item) => h('button', {
                    type: 'button',
                    key: item.pkg,
                    className: 'dshpm-compareRow dshpm-compareBtn',
                    title: dict.compareSwitch,
                    onClick: () => {
                      listScrollTop.current = pageScroller()?.scrollTop ?? 0
                      openDetail(item.pkg, item)
                    },
                  },
                    h('span', null, item.pkg, ' ', h('span', { className: 'dshpm-compareSwitch' }, '↗')),
                    h('span', null, fmtNumber(item.downloads || 0)),
                    h('span', null, fmtDate(item.updatedAt) || '—'),
                    h('span', null, item.version ?? '—'),
                    h('span', null, item.license ?? '—'),
                  )),
                ),
                h('div', { className: 'dshpm-insights' },
                  h('div', null,
                    h('strong', null, dict.prosTitle),
                    comparison.pros.length > 0
                      ? h('ul', null, comparison.pros.map((text, index) => h('li', { key: `${index}-${text}` }, text)))
                      : h('p', { className: 'dshpm-status' }, dict.noPros),
                  ),
                  h('div', null,
                    h('strong', null, dict.consTitle),
                    comparison.cons.length > 0
                      ? h('ul', null, comparison.cons.map((text, index) => h('li', { key: `${index}-${text}` }, text)))
                      : h('p', { className: 'dshpm-status' }, dict.noCons),
                  ),
                ),
                matrix !== null && matrix.rows.length > 0
                  ? h('div', { className: 'dshpm-matrix' },
                    h('div', {
                      className: 'dshpm-matrixRow dshpm-matrixHead',
                      style: { gridTemplateColumns: matrix.template },
                    },
                      h('span', null, dict.colFeature),
                      matrix.plugins.map((plugin, index) => index === 0
                        ? h('span', { className: 'dshpm-matrixCol', key: plugin.pkg }, dict.compareCurrent)
                        : h('button', {
                          type: 'button',
                          key: plugin.pkg,
                          className: 'dshpm-matrixCol dshpm-matrixBtn',
                          title: plugin.pkg,
                          onClick: () => {
                            listScrollTop.current = pageScroller()?.scrollTop ?? 0
                            openDetail(plugin.pkg, plugin)
                          },
                        }, plugin.pkg.split('/').pop())),
                    ),
                    matrix.rows.map((row) => {
                      const has = (plugin) => (plugin[row.field] || []).includes(row.id)
                      const currentOnly = has(matrix.plugins[0]) && matrix.plugins.slice(1).every((plugin) => !has(plugin))
                      return h('div', {
                        className: 'dshpm-matrixRow',
                        key: row.id,
                        style: { gridTemplateColumns: matrix.template },
                      },
                        h('span', { className: 'dshpm-matrixLabel' },
                          row.label,
                          currentOnly ? h('span', { className: 'dshpm-chip', style: { marginLeft: '6px' } }, dict.uniqueFeature) : null),
                        matrix.plugins.map((plugin, index) => h('span', {
                          key: plugin.pkg,
                          className: 'dshpm-matrixCell',
                          'data-on': has(plugin) ? 'true' : undefined,
                          'data-current': index === 0 ? 'true' : undefined,
                        }, has(plugin) ? '✓' : '·')),
                      )
                    }),
                  )
                  : null,
                matrix !== null && matrix.rows.length > 0 ? h('p', { className: 'dshpm-status' }, dict.featureNote) : null,
              )
              : null,
            h('div', { className: 'dshpm-detailFacts' },
              (detail.keywords || []).slice(0, 8).map((kw) => h('span', { className: 'dshpm-chip', key: kw }, kw)),
            ),
            h('div', { className: 'dshpm-readme' },
              detailLoading
                ? dict.loading
                : readmeText === ''
                  ? dict.noReadme
                  : h('div', null,
                    h('div', { className: 'dshpm-readmeHead' },
                      h('strong', null, dict.readme),
                      detail.readmeLang === 'en' && uiLang() === 'zh'
                        ? h('span', { className: 'dshpm-chip' }, 'EN')
                        : null,
                      detail.readmeSource ? h('span', { className: 'dshpm-status' }, detail.readmeSource) : null,
                      repoHref(detail)
                        ? h('a', { href: repoHref(detail), target: '_blank', rel: 'noreferrer' }, dict.readmeFull)
                        : null,
                      uiLang() === 'zh' && detail.readmeLang !== 'zh'
                        ? h(TranslateBar, {
                          dict,
                          kind: 'readme',
                          translation,
                          translating,
                          showOriginal,
                          onTranslate: () => runTranslate('readme'),
                          onToggle: () => setShowOriginal((value) => !value),
                        })
                        : null,
                    ),
                    h('div', null, readmeBody),
                    !readmeTranslated && readmeText.length > README_PREVIEW
                      ? h('button', {
                        className: 'dshpm-button',
                        style: { marginTop: '8px' },
                        onClick: () => setReadmeExpanded((value) => !value),
                      }, readmeExpanded ? dict.readmeLess : dict.readmeMore)
                      : null,
                  ),
            ),
            h('div', { className: 'dshpm-cardActions' },
              h(ActionButtons, {
                dict,
                item: detail,
                installedInfo: info,
                busy: bulk !== null ? bulk.pkg : job != null ? job.pkg : null,
                onAction: act,
              }),
              h('span', { className: 'dshpm-status' }, dict.installHint.replace('{pkg}', detail.pkg)),
            ),
          ),
        )
      }

      // ── 列表视图 ──
      return h('div', { className: 'dshpm-root', ref: rootRef },
        h('p', { className: 'dshpm-status' }, dict.intro),
        h('div', { className: 'dshpm-toolbar' },
          h('label', { className: 'dshpm-search' },
            h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
              h('circle', { cx: 11, cy: 11, r: 7 }),
              h('line', { x1: 21, y1: 21, x2: 16.5, y2: 16.5 }),
            ),
            h('input', {
              type: 'search',
              placeholder: dict.search,
              value: q,
              onChange: (e) => setQ(e.target.value),
              onKeyDown: (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applySearch()
                }
              },
            }),
          ),
          h('button', { className: 'dshpm-button dshpm-searchBtn', onClick: applySearch, disabled: loading }, dict.searchAction),
          h('input', {
            className: 'dshpm-author',
            type: 'search',
            placeholder: dict.authorPlaceholder,
            value: author,
            onChange: (e) => setAuthor(e.target.value),
            onKeyDown: (e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applySearch()
              }
            },
          }),
          h('select', {
            className: 'dshpm-select',
            value: String(since),
            title: dict.sinceLabel,
            onChange: (e) => {
              setSince(Number(e.target.value))
              setPage(1)
            },
          },
            [[0, dict.sinceAll], [1, dict.since1], [3, dict.since3], [7, dict.since7], [30, dict.since30], [180, dict.since180]]
              .map(([value, label]) => h('option', { key: value, value: String(value) }, label)),
          ),
          h('select', {
            className: 'dshpm-select',
            value: sort,
            onChange: (e) => {
              const next = e.target.value
              setSort(next)
              setDir(next === 'name' ? 'asc' : 'desc')
              setPage(1)
            },
          },
            h('option', { value: 'popularity' }, dict.sortPopularity),
            h('option', { value: 'publish' }, dict.sortPublish),
            h('option', { value: 'name' }, dict.sortName),
          ),
          h('button', {
            className: 'dshpm-button dshpm-dir',
            title: dir === 'asc' ? dict.sortAsc : dict.sortDesc,
            'aria-label': dir === 'asc' ? dict.sortAsc : dict.sortDesc,
            onClick: () => setDir((value) => (value === 'asc' ? 'desc' : 'asc')),
          }, dir === 'asc' ? '↑' : '↓'),
          updates.length > 0
            ? h('button', {
              className: 'dshpm-button dshpm-primary',
              disabled: job !== null || bulk !== null,
              onClick: updateAll,
            }, dict.updateAll.replace('{n}', updates.length))
            : null,
          h('button', { className: 'dshpm-button', onClick: () => load(true), disabled: loading }, dict.refresh),
        ),
        h('div', { className: 'dshpm-cats' },
          h('button', {
            className: 'dshpm-cat',
            'data-active': only === 'updates' ? 'true' : undefined,
            onClick: () => {
              setOnly((value) => (value === 'updates' ? 'all' : 'updates'))
              setCategory('all')
              setPage(1)
            },
          },
            dict.filterUpdates,
            updates.length > 0 ? h('span', { className: 'dshpm-catCount' }, updates.length) : null,
          ),
          CATEGORY_IDS.map((id) => h('button', {
            key: id,
            className: 'dshpm-cat',
            'data-active': category === id ? 'true' : undefined,
            onClick: () => { setCategory(id); setPage(1) },
          },
            catLabel(dict, id),
            counts[id] !== undefined && id !== 'all'
              ? h('span', { className: 'dshpm-catCount' }, counts[id])
              : null,
          )),
        ),
        data.stale ? h('p', { className: 'dshpm-warn' }, dict.staleCatalog.replace('{d}', fmtDate(data.fetchedAt))) : null,
        data.exact ? h('p', { className: 'dshpm-status' }, dict.exactHint) : null,
        bulk !== null
          ? h('div', { className: 'dshpm-job' },
            h('span', null, dict.bulkUpdating.replace('{i}', String(bulk.index)).replace('{n}', String(bulk.total)).replace('{pkg}', bulk.pkg)),
          )
          : job != null && job.status === 'running'
            ? h('div', { className: 'dshpm-job' },
              h('span', null, dict[job.action + 'Job'].replace('{pkg}', job.pkg) + ' ' + dict.backgroundHint),
              job.action === 'uninstall' ? null : h('button', { className: 'dshpm-button', onClick: cancelJob }, dict.cancelJob),
            )
            : null,
        loading ? h('p', { className: 'dshpm-status' }, dict.loading) : null,
        error ? h('p', { className: 'dshpm-err' }, dict.error.replace('{msg}', error)) : null,
        notice ? h('p', { className: notice.type === 'err' ? 'dshpm-err' : 'dshpm-msg' }, notice.text) : null,
        !loading && !error && data.items.length > 0
          ? h('p', { className: 'dshpm-status' }, dict.resultCount.replace('{n}', data.total))
          : null,
        !loading && !error && data.items.length === 0
          ? h('p', { className: 'dshpm-status' },
            only === 'updates' && query === '' ? dict.emptyUpdates : (query ? dict.emptyFor.replace('{q}', query) : dict.empty))
          : null,
        data.items.length > 0 ? h('ul', { className: 'dshpm-cards' },
          data.items.map((it) => {
            const info = installed[it.pkg]
            const outdated = info && it.version && info.version && it.version !== info.version
            return h('li', { className: 'dshpm-card', key: it.pkg },
              h('div', { className: 'dshpm-cardHead' },
                h('span', { className: 'dshpm-cardName', title: it.pkg }, it.pkg),
                h('span', { className: 'dshpm-chip' }, catLabel(dict, it.category || 'other')),
                it.version ? h('span', { className: 'dshpm-cardVer' }, dict.version.replace('{n}', it.version)) : null,
              ),
              h('div', { className: 'dshpm-cardDesc' }, it.description || '—'),
              h('div', { className: 'dshpm-cardMeta' },
                (it.keywords || []).slice(0, 3).map((kw) => h('span', { className: 'dshpm-chip', key: kw }, kw)),
                it.repoOwner
                  ? h('span', { title: dict.githubOwner }, it.repoOwner)
                  : it.publisher ? h('span', { title: dict.publisherLabel }, '@' + it.publisher) : null,
                it.downloads ? h('span', null, dict.downloads.replace('{n}', fmtNumber(it.downloads))) : null,
                it.updatedAt ? h('span', null, dict.updated.replace('{d}', fmtDate(it.updatedAt))) : null,
                info
                  ? h('span', { className: 'dshpm-chip', 'data-installed': 'true', 'data-outdated': outdated ? 'true' : undefined },
                    info.version ? dict.installedVersion.replace('{n}', info.version) : dict.installed)
                  : null,
                it.installedVersion && it.latestVersion && it.installedVersion !== it.latestVersion
                  ? h('span', { className: 'dshpm-chip', 'data-outdated': 'true' }, `${it.installedVersion} → ${it.latestVersion}`)
                  : null,
              ),
              h('div', { className: 'dshpm-cardActions' },
                h(ActionButtons, { dict, item: it, installedInfo: info, busy: bulk !== null ? bulk.pkg : job != null ? job.pkg : null, onAction: act }),
                h('button', { className: 'dshpm-button', onClick: () => { listScrollTop.current = pageScroller()?.scrollTop ?? 0; openDetail(it.pkg, it) } }, dict.detail),
              ),
            )
          }),
        ) : null,
        totalPages > 1 ? h('div', { className: 'dshpm-pager' },
          h('button', { className: 'dshpm-button', disabled: page <= 1 || loading, onClick: () => setPage((p) => Math.max(1, p - 1)) }, dict.prev),
          h('span', null, dict.page.replace('{p}', page).replace('{total}', totalPages)),
          h('button', { className: 'dshpm-button', disabled: page >= totalPages || loading, onClick: () => setPage((p) => Math.min(totalPages, p + 1)) }, dict.next),
        ) : null,
        data.fetchedAt || version !== null
          ? h('p', { className: 'dshpm-status' },
            data.fetchedAt ? dict.fetchedAt.replace('{d}', fmtDate(data.fetchedAt)) : '',
            version === null ? null : ` · v${version}`)
          : null,
      )
    }

    /** 侧边栏面板图标（接收 size；active 由 shell 处理高亮）。 */
    function MarketIcon({ size }) {
      const edge = typeof size === 'number' ? size : 16
      return h('svg', {
        width: edge,
        height: edge,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('path', { d: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6' }),
        h('circle', { cx: 10, cy: 20, r: 1 }),
        h('circle', { cx: 18, cy: 20, r: 1 }),
      )
    }

    /** main 面板页：不覆盖窗口/标题栏，窗口拖动与缩放保持可用。 */
    function MarketPage({ t }) {
      const value = t && typeof t === 'function' ? t('tab') : zh.tab
      const title = typeof value === 'string' && value !== 'tab' ? value : zh.tab
      return h('div', { className: 'dshpm-page' },
        h('h2', { className: 'dshpm-pageTitle' }, title),
        h(MarketPanel, { t }),
      )
    }

    /**
     * 局部错误边界：插件市场渲染出错时只替换这一块，不让整个 slot 树 /
     * 页面跟着崩掉（安装后 profile 重组期间尤其重要）。
     */
    class MarketErrorBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }

      static getDerivedStateFromError(error) {
        return { error }
      }

      componentDidCatch(error, info) {
        console.error('[dsh-plugin-market] render failed', error, info)
      }

      render() {
        if (this.state.error !== null) {
          const message = this.state.error?.message ?? String(this.state.error)
          return h('div', { className: 'dshpm-root' },
            h('p', { className: 'dshpm-err' }, `${zh.renderFailed}：${message}`),
            h('button', { className: 'dshpm-button', onClick: () => this.setState({ error: null }) }, zh.retry),
          )
        }
        return this.props.children
      }
    }

    function apply(ctx) {
      const slots = ctx.get('slots')
      if (!slots) {
        console.warn('[dsh-plugin-market] slots service unavailable; market UI not registered')
        return
      }

      const locale = ctx.get('locale')
      let dictionariesReady = false
      if (locale && typeof locale.register === 'function') {
        try {
          ctx.effect(() => locale.register(NS, { zh, en }), 'dsh-plugin-market: dictionaries')
          dictionariesReady = true
        } catch (e) {
          // 命名空间被别的插件占用时不要让整个插件挂掉，退回内置中文。
          console.warn('[dsh-plugin-market] locale registration failed; falling back to built-in copy:', e)
        }
      }
      const bound = dictionariesReady && typeof locale?.bind === 'function' ? locale.bind(NS) : null
      const t = bound !== null && bound('tab') !== 'tab' ? bound : (key) => zh[key] ?? key
      const injected = () => ({})

      // 两个入口各自独立注册：某个 slot 在未来的 DSH 版本里改名/移除时，
      // 另一个入口仍然可用，并在控制台留下明确告警而不是静默消失。
      const register = (slotName, options, component) => {
        try {
          slots.inject(slotName, () => slots.register({ name: slotName, locale: NS, ...options }, component))
          return true
        } catch (e) {
          console.warn(`[dsh-plugin-market] slot "${slotName}" unavailable:`, e)
          return false
        }
      }

      // 侧边栏面板 + main 页面：与官方「插件」页同款范式。
      // 不用全屏 overlay，窗口拖动/缩放/标题栏都不会被挡住。
      const PANEL_ID = 'dsh-market'
      register('sidebar.panellist', {
        id: PANEL_ID,
        order: 20,
        label: () => t('tab'),
      }, (props) => h(MarketIcon, props))

      register('main', {
        key: PANEL_ID,
        inject: injected,
      }, (props) => h(MarketErrorBoundary, null, h(MarketPage, props)))

      register('settings.plugins.tab', {
        id: 'dsh-market-ui',
        order: 20,
        label: () => t('tab'),
        inject: injected,
      }, (props) => h(MarketErrorBoundary, null, h(MarketPanel, props)))
    }

    return { NS, apply, inject: ['slots', 'locale'] }
  },
})
