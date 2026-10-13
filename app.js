// Todo 列表 V2.0 —— 数据驱动重构
// 单一数据源 todos；三个操作统一走「改数据 → 重渲染」

const list = document.querySelector('#todo-list');
const input = document.querySelector('#todo-input');
const addBtn = document.querySelector('#add-btn');
const emptyTip = document.querySelector('#empty-tip');

let todos = [];   // 单一数据源：DOM 只是它的投影

// 添加：展开生成新数组，不改原数组
function addTodo(text) {
  todos = [...todos, { id: Date.now(), text, completed: false }];
  render();
}

// 删除：filter 生成新数组
function removeTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  render();
}

// 切换：map + 展开，只替换匹配的那一条
function toggleTodo(id) {
  todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  render();
}

// 渲染：清空 → 根据 todos 重画整表
function render() {
  list.innerHTML = '';

  todos.forEach((t) => {
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

  emptyTip.style.display = todos.length ? 'none' : '';
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

render();
