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
    li.textContent = t.text;   // 纯文本写入，杜绝 HTML 注入
    li.dataset.id = t.id;
    if (t.completed) li.classList.add('done');

    li.addEventListener('click', () => toggleTodo(t.id));

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'del-btn';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();     // 防止顺带触发 li 的切换
      removeTodo(t.id);
    });

    li.appendChild(delBtn);
    list.appendChild(li);
  });

  emptyTip.style.display = shown.length ? 'none' : '';
  if (!shown.length) {
    emptyTip.textContent = todos.length ? '当前筛选下没有任务' : '暂无待办事项';
  }
}

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
