let editingIndex = null;

const activeTaskList = document.getElementById('activeTaskList');
const completedTaskList = document.getElementById('completedTaskList');
const doneSection = document.getElementById('doneSection');
const doneHeader = document.getElementById('doneHeader');
const taskCount = document.getElementById('taskCount');
const filterSelect = document.getElementById('filterSelect');

const fabBtn = document.getElementById('fabBtn');
const taskModal = document.getElementById('taskModal');
const taskInput = document.getElementById('taskInput');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const modalTitle = document.getElementById('modalTitle');

renderTasks();

function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasksToStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const tasks = getTasksFromStorage();
    const filter = filterSelect.value;

    activeTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    let completedCount = 0;

    tasks.forEach((task, index) => {

        if (task.completed) {
            completedCount++;
        }

        if (filter === 'active' && task.completed) {
            return;
        }

        if (filter === 'completed' && !task.completed) {
            return;
        }

        const li = document.createElement('li');
        li.className = 'task-card';

        const taskLeft = document.createElement('div');
        taskLeft.className = 'task-left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'circle-checkbox';
        checkbox.checked = task.completed;

        checkbox.addEventListener('change', function () {
            toggleTask(index);
        });

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;

        if (task.completed) {
            taskText.classList.add('completed');
        }

        taskLeft.appendChild(checkbox);
        taskLeft.appendChild(taskText);

        const cardActions = document.createElement('div');
        cardActions.className = 'card-actions';

        const editButton = document.createElement('button');
        editButton.className = 'icon-btn';
        editButton.innerHTML = '&#9998;';

        editButton.addEventListener('click', function () {
            openEditModal(index);
        });

        const deleteButton = document.createElement('button');
        deleteButton.className = 'icon-btn';
        deleteButton.innerHTML = '&#128465;';

        deleteButton.addEventListener('click', function () {
            deleteTask(index);
        });

        cardActions.appendChild(editButton);
        cardActions.appendChild(deleteButton);

        li.appendChild(taskLeft);
        li.appendChild(cardActions);

        if (task.completed) {
            completedTaskList.appendChild(li);
        } else {
            activeTaskList.appendChild(li);
        }
    });

    taskCount.textContent = `${ tasks.length } to - dos`;

    if (completedCount > 0 && filter !== 'active') {
        doneSection.classList.remove('hidden');
        doneHeader.textContent = `Done(${ completedCount })`;
    } else {
        doneSection.classList.add('hidden');
    }
}

function saveTask() {
    const text = taskInput.value.trim();

    if (text === '') {
        alert('Please enter a task name.');
        return;
    }

    let tasks = getTasksFromStorage();

    const isDuplicate = tasks.some(function (task, index) {
        return (
            task.text.toLowerCase() === text.toLowerCase() &&
            index !== editingIndex
        );
    });

    if (isDuplicate) {
        const confirmAdd = confirm(
            `You already have a task named "${text}".Do you want to add it again ?`
        );

        if (!confirmAdd) {
            return;
        }
    }

    if (editingIndex !== null) {
        tasks[editingIndex].text = text;
    } else {
        tasks.push({
            text: text,
            completed: false
        });
    }

    saveTasksToStorage(tasks);
    closeModal();
    renderTasks();
}

function toggleTask(index) {
    let tasks = getTasksFromStorage();

    tasks[index].completed = !tasks[index].completed;

    saveTasksToStorage(tasks);
    renderTasks();
}

function deleteTask(index) {
    let tasks = getTasksFromStorage();

    tasks.splice(index, 1);

    saveTasksToStorage(tasks);
    renderTasks();
}

function openAddModal() {
    editingIndex = null;
    modalTitle.textContent = 'New To-do';
    taskInput.value = '';
    taskModal.classList.remove('hidden');
    taskInput.focus();
}

function openEditModal(index) {
    const tasks = getTasksFromStorage();

    editingIndex = index;
    modalTitle.textContent = 'Edit To-do';
    taskInput.value = tasks[index].text;

    taskModal.classList.remove('hidden');
    taskInput.focus();
}

function closeModal() {
    taskModal.classList.add('hidden');
    taskInput.value = '';
    editingIndex = null;
}

fabBtn.addEventListener('click', openAddModal);
cancelModalBtn.addEventListener('click', closeModal);
saveTaskBtn.addEventListener('click', saveTask);

filterSelect.addEventListener('change', renderTasks);

taskInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        saveTask();
    }
});