const STORAGE_KEY = 'dmd1-todos';

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let nextId = todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1;
let filter = 'all'; // all | active | completed

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: nextId++, text, completed: false });
  input.value = '';
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.completed = !todo.completed; save(); render(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function startEdit(id) {
  const li = document.querySelector(`li[data-id="${id}"]`);
  const span = li.querySelector('span');
  const todo = todos.find(t => t.id === id);
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = todo.text;
  span.replaceWith(input);
  input.focus();
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') commitEdit(id, input.value);
    if (e.key === 'Escape') render();
  });
  input.addEventListener('blur', () => commitEdit(id, input.value));
}

function commitEdit(id, value) {
  const text = value.trim();
  if (text) {
    const todo = todos.find(t => t.id === id);
    if (todo) { todo.text = text; save(); }
  }
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  render();
}

function setFilter(f) {
  filter = f;
  render();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function render() {
  const filtered = todos.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed
  );
  const active = todos.filter(t => !t.completed).length;
  const completed = todos.filter(t => t.completed).length;

  // Stats
  document.getElementById('stats').textContent =
    todos.length ? `${completed} of ${todos.length} completed` : '';

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  // Clear completed button
  const clearBtn = document.getElementById('clear-btn');
  clearBtn.style.display = completed > 0 ? 'inline-block' : 'none';

  // List
  const list = document.getElementById('todo-list');
  const empty = document.getElementById('empty-msg');
  empty.style.display = filtered.length === 0 ? 'block' : 'none';

  list.innerHTML = filtered.map(t => `
    <li data-id="${t.id}" class="${t.completed ? 'completed' : ''}">
      <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTodo(${t.id})" />
      <span ondblclick="startEdit(${t.id})" title="Double-click to edit">${escapeHtml(t.text)}</span>
      <button class="delete-btn" onclick="deleteTodo(${t.id})" title="Delete">&#x2715;</button>
    </li>
  `).join('');
}

document.getElementById('todo-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

render();
