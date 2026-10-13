# Todo 列表 V2.0（数据驱动 + 持久化）

Web 编程 第 7 周实验项目：把 V2.0 从「能跑的 Todo 列表」升级为「数据驱动、可持久化、可追溯」的工程产物。

## 运行方式

直接用浏览器打开 `index.html`（或用 `python -m http.server` 起本地服务）。

## 三个操作统一走「三步口诀」

```
改数据 → 保存 → 重渲染
```

- **改数据**：三个操作都不改原数组
  - 添加：`todos = [...todos, item]`
  - 删除：`todos = todos.filter(t => t.id !== id)`
  - 切换：`todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)`
- **保存**：`save()` 把新 todos 写入 `localStorage`
- **重渲染**：`render()` 根据新 todos 重画整个列表（DOM 是数据的投影）

## 状态划分

| 状态 | 变量 | 需要 save()？ | 刷新后 |
|---|---|---|---|
| 任务状态 | `todos` | 需要 | 从 localStorage 恢复 |
| 视图状态 | `filter` | 不需要 | 回到默认 `'all'` |

## 文件结构

```
index.html   页面结构 + 样式 + 筛选按钮
app.js       单一数据源、save/load、三个操作函数、render
todo.html    W6 基线（DOM 直改版，保留对照）
todo.js      W6 基线
```

## 分支与提交

- 功能分支：`feature/v2-data-driven`，完成后合并回 `main`
- 提交历史：基线 → 数据驱动重构 → 筛选 → 持久化 → 容错修复 → id 修复
