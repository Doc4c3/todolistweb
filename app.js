// Todo 列表 V2.0 —— 数据驱动重构
// 单一数据源 todos；三个操作统一走「改数据 → 重渲染」

const KEY = 'todos';   // localStorage 存储键名
const list = document.querySelector('#todo-list');
const input = document.querySelector('#todo-input');
const addBtn = document.querySelector('#add-btn');
const emptyTip = document.querySelector('#empty-tip');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = load();    // 启动时先恢复：单一数据源，DOM 只是它的投影
let filter = 'all';    // 视图状态：all / active / done
let lastId = 0;        // id 生成用：保证同一毫秒内也严格递增

// id：以时间戳为基准，同一毫秒内连续添加时递增避让（Date.now() 会撞号）
function nextId() {
  const now = Date.now();
  lastId = now > lastId ? now : lastId + 1;
  return lastId;
}

// 存：把新 todos 写进 localStorage
function save() {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

// 取：从 localStorage 恢复 todos（对损坏数据兜底）
function load() {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return [];       // 没存过 → 空数组
  try {
    const data = JSON.parse(raw);    // 存过 → 解析
    return Array.isArray(data) ? data : [];   // 只接受数组，其余按空数组处理
  } catch (e) {
    console.warn('load(): localStorage 中的数据不是合法 JSON，已按空列表处理', e);
    return [];
  }
}

// 添加：展开生成新数组，不改原数组
function addTodo(text) {
  todos = [...todos, { id: nextId(), text, completed: false }];
  save();
  render();
}

// 删除：filter 生成新数组
function removeTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}
function clearCompleted(id){
  todos = todos.filter((t) => !t.completed);
  save();
  render();
}
// 切换：map + 展开，只替换匹配的那一条
function toggleTodo(id) {
  todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  save();
  render();
}

// 编辑：map + 展开，只替换匹配那一条的文本
function editTodo(id, text) {
  todos = todos.map((t) => (t.id === id ? { ...t, text } : t));
  save();
  render();
}

// 进入编辑态：把 li 的内容临时换成输入框
// Enter 保存 / Esc 取消 / 失焦保存；空文本视为取消
function startEdit(item, id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.value = todo.text;
  editInput.className = 'edit-input';

  item.textContent = '';
  item.appendChild(editInput);
  editInput.focus();
  editInput.select();

  // 点击输入框不能冒泡到 ul，否则会触发委托里的切换分支
  editInput.addEventListener('click', (e) => e.stopPropagation());

  let settled = false;   // blur 与 Enter 都会触发收尾，防止执行两次
  const finish = (commit) => {
    if (settled) return;
    settled = true;
    const text = editInput.value.trim();
    if (commit && text && text !== todo.text) {
      editTodo(id, text);   // 改数据 → save → render
    } else {
      render();             // 取消或空文本：重渲染恢复原样
    }
  };

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    else if (e.key === 'Escape') finish(false);
  });
  editInput.addEventListener('blur', () => finish(true));
}

// 筛选：只改视图状态，不动任务数据，因此不需要 save()
function setFilter(f) {
  filter = f;
  filterBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === f));
  render();
}

// 渲染：先过滤（决定显示哪些）→ 清空 → 重画整表
function render() {
  const shown = todos.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.completed : !t.completed
  );

  list.innerHTML = '';

  shown.forEach((t) => {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    if (t.completed) li.classList.add('done');

    const span = document.createElement('span');
    span.className = 'text';
    span.textContent = t.text;   // 纯文本写入，杜绝 HTML 注入
    li.appendChild(span);

    // 按钮内再包一层 span：验证 e.target 落在按钮内部时 closest 仍能正确上溯
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.dataset.action = 'edit';
    const editIcon = document.createElement('span');
    editIcon.textContent = '✎';
    editBtn.appendChild(editIcon);
    li.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.dataset.action = 'delete';
    const delIcon = document.createElement('span');
    delIcon.textContent = '×';
    delBtn.appendChild(delIcon);
    li.appendChild(delBtn);

    list.appendChild(li);
  });

  emptyTip.style.display = shown.length ? 'none' : '';
  if (!shown.length) {
    emptyTip.textContent = todos.length ? '当前筛选下没有任务' : '暂无待办事项';
  }
}

// 事件委托：列表内所有点击统一交给父容器 ul 处理
// closest('li') 找任务，data-action 分派操作，逐级处理 null 边界
list.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return;   // 文字节点等非常规目标
  const item = e.target.closest('li');
  if (!item || !list.contains(item)) return;    // 点在列表空白处 / 不属于自己的 li
  const id = Number(item.dataset.id);           // dataset 读出来是字符串，转成数字再比较
  if (!id) return;

  const delBtn = e.target.closest('[data-action="delete"]');
  if (delBtn && item.contains(delBtn)) {
    removeTodo(id);
    return;   // 删除后必须结束，否则会连带触发下面的切换分支
  }

  const editBtn = e.target.closest('[data-action="edit"]');
  if (editBtn && item.contains(editBtn)) {
    startEdit(item, id);
    return;
  }

  toggleTodo(id);
});

function handleAdd() {
  const text = input.value.trim();
  if (!text) {
    input.value = '';
    input.placeholder = '内容不能为空，请输入待办事项';
    input.focus();
    return;
  }
  addTodo(text);
  input.value = '';
  input.focus();
}

addBtn.addEventListener('click', handleAdd);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAdd();
});

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

render();
