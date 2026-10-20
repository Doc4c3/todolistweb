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

## 事件委托（W8）

列表内不再给每个 li 单独绑事件，所有点击统一委托给父容器 `ul#todo-list`：

- `e.target.closest('li')` 找到任务项，`!item || !list.contains(item)` 兜底空白处点击
- `dataset.id` 读出的是字符串，用 `Number()` 转换后再与数据比较
- 按 `data-action` 分派：`delete` 删除、`edit` 进入编辑态，其余点击切换完成状态
- **删除分支执行后必须 `return`**，否则会连带触发切换（本周调试的缺陷点）
- 编辑态：`✎` 把 li 临时换成输入框，Enter/失焦保存、Esc 取消，空文本视为取消；输入框上的点击 `stopPropagation`，避免冒泡到 ul 触发切换

## 文件结构

```
index.html   页面结构 + 样式 + 筛选按钮
app.js       单一数据源、save/load、四个操作函数、render、ul 上的事件委托
todo.html    W6 基线（DOM 直改版，保留对照）
todo.js      W6 基线
```

## 分支与提交

- 功能分支：`feature/v2-data-driven`（W7）、`feature/v2-event-delegation`（W8），完成后合并回 `main`
- 提交历史：基线 → 数据驱动重构 → 筛选 → 持久化 → 容错修复 → id 修复 → 事件委托重构 + 编辑分支
