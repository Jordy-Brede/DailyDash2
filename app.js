//  - DailyDash prototype script

document.addEventListener('DOMContentLoaded', function() {

  var elemsSidenav = document.querySelectorAll('.sidenav');
  M.Sidenav.init(elemsSidenav);

  var elemsModal = document.querySelectorAll('.modal');
  M.Modal.init(elemsModal);

  const tasksList = document.getElementById('tasksList');
  const habitList = document.getElementById('habitList');
  const statsText = document.getElementById('statsText');
  const offlineBanner = document.getElementById('offlineBanner');
  const installBtn = document.getElementById('installBtn');
  const clearBtn = document.getElementById('clearBtn');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const noteText = document.getElementById('noteText');

  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('disabled');
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
    });
  });

  function updateOnlineStatus() {
    if (!navigator.onLine) {
      offlineBanner.classList.remove('hide');
    } else {
      offlineBanner.classList.add('hide');
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  const TASKS_KEY = 'dailyDash.tasks.v1';
  const HABITS_KEY = 'dailyDash.habits.v1';
  const NOTE_KEY = 'dailyDash.note.v1';

  function seedData() {
    if (!localStorage.getItem(HABITS_KEY)) {
      const sampleHabits = [
        {id: 'h1', text: 'Drink water', done: false},
        {id: 'h2', text: 'Stretch (5 min)', done: false},
        {id: 'h3', text: 'Read 10 pages', done: false},
      ];
      localStorage.setItem(HABITS_KEY, JSON.stringify(sampleHabits));
    }
    if (!localStorage.getItem(TASKS_KEY)) {
      localStorage.setItem(TASKS_KEY, JSON.stringify([]));
    }
  }
  seedData();

  function renderHabits() {
    const habits = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
    habitList.innerHTML = '';
    habits.forEach(h => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.innerHTML = `
        <div>
          <label>
            <input type="checkbox" ${h.done ? 'checked' : ''} data-id="${h.id}" />
            <span>${h.text}</span>
          </label>
          <a class="secondary-content red-text remove-habit" data-id="${h.id}"><i class="material-icons">close</i></a>
        </div>`;
      habitList.appendChild(li);
    });

    habitList.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        toggleHabit(id, e.target.checked);
      });
    });
    habitList.querySelectorAll('.remove-habit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        removeHabit(id);
      });
    });
  }

  function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    tasksList.innerHTML = '';
    tasks.forEach(t => {
      const col = document.createElement('div');
      col.className = 'col s12';
      col.innerHTML = `
        <div class="card">
          <div class="card-content">
            <span class="card-title">${escapeHtml(t.title)}</span>
            <p>${escapeHtml(t.notes || '')}</p>
            <p class="grey-text">${t.due ? 'Due: ' + escapeHtml(t.due) : ''}</p>
          </div>
          <div class="card-action">
            <a class="complete-task" data-id="${t.id}">Complete</a>
            <a class="delete-task red-text" data-id="${t.id}">Delete</a>
          </div>
        </div>`;
      tasksList.appendChild(col);
    });

    tasksList.querySelectorAll('.complete-task').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        completeTask(id);
      });
    });
    tasksList.querySelectorAll('.delete-task').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        deleteTask(id);
      });
    });

    const completedCount = tasks.filter(t => t.completed).length;
    statsText.textContent = `You completed ${completedCount} tasks today.`;
  }

  function renderNote() {
    const note = localStorage.getItem(NOTE_KEY) || '';
    noteText.value = note;
    M.updateTextFields();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  }

  function addTask(task) {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    tasks.unshift(task);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    renderTasks();
  }
  function completeTask(id) {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx].completed = true;
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      renderTasks();
    }
  }
  function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    renderTasks();
  }

  function toggleHabit(id, done) {
    const habits = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
    const h = habits.find(x => x.id === id);
    if (h) {
      h.done = done;
      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
      renderHabits();
    }
  }
  function removeHabit(id) {
    let habits = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
    habits = habits.filter(h => h.id !== id);
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    renderHabits();
  }

  document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const notes = document.getElementById('taskNotes').value.trim();
    const due = document.getElementById('taskDue').value || '';
    if (!title) return M.toast({html: 'Please add a title.'});
    addTask({
      id: 't' + Date.now(),
      title, notes, due, createdAt: new Date().toISOString(), completed: false
    });
    const modal = M.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.close();
    e.target.reset();
  });

  saveNoteBtn.addEventListener('click', () => {
    localStorage.setItem(NOTE_KEY, noteText.value || '');
    M.toast({html: 'Note saved locally.'});
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Clear local data (tasks, habits, notes)?')) {
      localStorage.removeItem(TASKS_KEY);
      localStorage.removeItem(HABITS_KEY);
      localStorage.removeItem(NOTE_KEY);
      seedData();
      renderHabits();
      renderTasks();
      renderNote();
      M.toast({html: 'Local data cleared.'});
    }
  });

  renderHabits();
  renderTasks();
  renderNote();
});
