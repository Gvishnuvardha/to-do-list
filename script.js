// State & DOM Elements
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

// Startup
document.addEventListener('DOMContentLoaded', renderTasks);

// LocalStorage Utilities
function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasksToStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render Tasks
function renderTasks() {
    const tasks = getTasksFromStorage();
    const filter = filterSelect.value;

    activeTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    let activeCount = 0;
    let completedCount = 0;

    tasks.forEach((task, index) => {
        if (task.completed) {
            completedCount++;
        } else {
            activeCount++;
        }

        // Apply view filter
        if (filter === 'active' && task.completed) return;
        if (filter === 'completed' && !task.completed) return;

        const li = document.createElement('li');
        li.className = 'task-card';

        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="circle-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</span>
            </div>
            <div class="card-actions">
                <button class="icon-btn" onclick="openEditModal(${index})">&#9998;</button>
                <button class="icon-btn" onclick="deleteTask(${index})">&#128465;</button>
            </div>
        `;

        if (task.completed) {
            completedTaskList.appendChild(li);
        } else {
            activeTaskList.appendChild(li);
        }
    });

    // Update Header Counts
    taskCount.textContent = `${tasks.length} to-dos`;

    // Handle "Done" Section visibility
    if (completedCount > 0 && filter !== 'active') {
        doneSection.classList.remove('hidden');
        doneHeader.textContent = `Done (${completedCount})`;
    } else {
        doneSection.classList.add('hidden');
    }
}

// Add or Edit Task Logic (with Duplicate Warning)
function saveTask() {
    const text = taskInput.value.trim();
    if (text === '') {
        alert('Please enter a task name.');
        return;
    }

    let tasks = getTasksFromStorage();

    // Duplicate Check
    const isDuplicate = tasks.some((t, i) => t.text.toLowerCase() === text.toLowerCase() && i !== editingIndex);
    if (isDuplicate) {
        const confirmAdd = confirm(`You already have a task named "${text}". Do you want to add it again?`);
        if (!confirmAdd) return;
    }

    if (editingIndex !== null) {
        tasks[editingIndex].text = text;
    } else {
        tasks.push({ text: text, completed: false });
    }

    saveTasksToStorage(tasks);
    closeModal();
    renderTasks();
}

// Toggle Task Complete / Active Status
function toggleTask(index) {
    let tasks = getTasksFromStorage();
    tasks[index].completed = !tasks[index].completed;
    saveTasksToStorage(tasks);
    renderTasks();
}

// Delete Task (Removes only the selected item)
function deleteTask(index) {
    let tasks = getTasksFromStorage();
    tasks.splice(index, 1);
    saveTasksToStorage(tasks);
    renderTasks();
}

// Modal Helpers
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

// Helper to prevent HTML injection
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

// Event Listeners
fabBtn.addEventListener('click', openAddModal);
cancelModalBtn.addEventListener('click', closeModal);
saveTaskBtn.addEventListener('click', saveTask);
filterSelect.addEventListener('change', renderTasks);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveTask();
});