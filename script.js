function allowDrop(event) { event.preventDefault(); }

function drag(event) {
    event.dataTransfer.setData("text", event.target.id || event.target.outerHTML);
    if (!event.target.id) { event.target.id = 'task-' + new Date().getTime(); }
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const task = document.getElementById(data) || new DOMParser().parseFromString(data, "text/html").body.firstChild;
    event.target.closest('.task-list').appendChild(task);
    saveBoard();
}

function openModal() {
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

function saveTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const priority = document.getElementById('task-priority').value;
    const columnId = document.getElementById('task-column').value;

    if (title) {
        const task = document.createElement("div");
        task.className = `task ${priority}`;
        task.draggable = true;
        const taskId = 'task-' + new Date().getTime();
        task.id = taskId;
        task.innerHTML = `
            <div class="task-title">${title}</div>
            <div class="task-description">${description}</div>
            <div class="task-buttons">
                <button class="edit-btn" onclick="editTask(this)">✏️</button>
                <button class="delete-btn" onclick="deleteTask(this)">🗑️</button>
            </div>`;
        task.ondragstart = drag;
        document.getElementById(columnId).querySelector(".task-list").appendChild(task);
        saveBoard();

        bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
        clearModalFields();
    } else {
        alert("Título da tarefa é obrigatório!");
    }
}

function clearModalFields() {
    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    document.getElementById('task-priority').value = 'prioridade-baixa';
    document.getElementById('task-column').value = 'todo';
}

function deleteTask(button) {
    button.closest('.task').remove();
    saveBoard();
}

function editTask(button) {
    const taskDiv = button.closest('.task');
    const currentTitle = taskDiv.querySelector('.task-title').innerText;
    const currentDescription = taskDiv.querySelector('.task-description').innerText;
    const newTitle = prompt("Editar título da tarefa:", currentTitle);
    const newDescription = prompt("Editar descrição da tarefa:", currentDescription);
    if (newTitle !== null && newTitle.trim() !== "") {
        taskDiv.querySelector('.task-title').innerText = newTitle.trim();
        taskDiv.querySelector('.task-description').innerText = newDescription.trim();
        saveBoard();
    }
}

function saveBoard() {
    const board = {};
    document.querySelectorAll('.column').forEach(column => {
        const columnId = column.id;
        const tasks = Array.from(column.querySelectorAll('.task')).map(task => {
            return {
                id: task.id,
                title: task.querySelector('.task-title').innerText.trim(),
                description: task.querySelector('.task-description').innerText.trim(),
                priority: task.classList.contains('prioridade-alta') ? 'prioridade-alta' :
                          task.classList.contains('prioridade-media') ? 'prioridade-media' : 'prioridade-baixa'
            };
        });
        board[columnId] = tasks;
    });
    localStorage.setItem('kanbanBoard', JSON.stringify(board));
}

function loadBoard() {
    const board = JSON.parse(localStorage.getItem('kanbanBoard'));
    if (board) {
        for (const columnId in board) {
            const taskList = document.getElementById(columnId).querySelector('.task-list');
            taskList.innerHTML = '';
            board[columnId].forEach(taskData => {
                const task = document.createElement('div');
                task.className = `task ${taskData.priority}`;
                task.draggable = true;
                task.id = taskData.id;
                task.innerHTML = `
                    <div class="task-title">${taskData.title}</div>
                    <div class="task-description">${taskData.description}</div>
                    <div class="task-buttons">
                        <button class="edit-btn" onclick="editTask(this)">✏️</button>
                        <button class="delete-btn" onclick="deleteTask(this)">🗑️</button>
                    </div>`;
                task.ondragstart = drag;
                taskList.appendChild(task);
            });
        }
    }
}

window.onload = loadBoard;