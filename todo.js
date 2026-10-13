// Todo 列表 V2.0 基础版（修改后最终版）
(function () {
  'use strict';

  // 修复③：IIFE 包裹，变量与函数不再污染全局作用域；var -> const/let
  const input = document.getElementById('todo-input');
  const btn = document.getElementById('add-btn');
  const list = document.getElementById('todo-list');
  const emptyTip = document.getElementById('empty-tip');
  const todos = [];

  function renderItem(text) {
    // 修复①：createElement + textContent，用户输入一律按纯文本处理，杜绝 HTML 注入
    const li = document.createElement('li');
    li.textContent = text;
    // 修复③：appendChild 增量添加，不重建已有节点
    list.appendChild(li);
  }

  function syncEmptyTip() {
    emptyTip.style.display = todos.length ? 'none' : '';
  }

  function addTodo() {
    // 修复②：trim 后判空，空值/纯空格直接拦截并提示
    const text = input.value.trim();
    if (!text) {
      input.value = '';
      input.placeholder = '内容不能为空，请输入待办事项';
      input.focus();
      return;
    }
    todos.push(text);
    renderItem(text);
    syncEmptyTip();
    input.value = '';
    input.focus();
  }

  btn.addEventListener('click', addTodo);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTodo();
  });
})();
