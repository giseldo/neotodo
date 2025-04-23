let currentEditTaskId = null; // Armazena o ID da tarefa sendo editada

function allowDrop(event) { event.preventDefault(); }

function drag(event) {
    event.dataTransfer.setData("text", event.target.id || event.target.outerHTML);
    if (!event.target.id) { event.target.id = 'task-' + new Date().getTime(); }
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const task = document.getElementById(data) || new DOMParser().parseFromString(data, "text/html").body.firstChild;
    const taskList = event.target.closest('.task-list');
    taskList.appendChild(task);
    sortTasksByPriority(taskList);
    saveBoard();
}

function openModal(mode, taskId = null) {
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    const modalTitle = document.getElementById('taskModalLabel');
    const saveButton = document.getElementById('save-task-btn');

    if (mode === 'edit' && taskId) {
        // Modo de edição
        modalTitle.innerText = 'Editar Tarefa';
        saveButton.innerText = 'Salvar Alterações';
        currentEditTaskId = taskId;

        const task = document.getElementById(taskId);
        const title = task.querySelector('.task-title').innerText;
        const description = task.querySelector('.task-description').innerText;
        const priority = Array.from(task.classList).find(cls => cls.startsWith('prioridade-')) || 'prioridade-baixa';
        const dueDate = task.querySelector('.task-due-date')?.innerText.replace('Vencimento: ', '').trim() || '';
        const columnId = task.closest('.column').id;

        document.getElementById('task-title').value = title;
        document.getElementById('task-description').value = description;
        document.getElementById('task-priority').value = priority;
        document.getElementById('task-due-date').value = dueDate;
        document.getElementById('task-column').value = columnId;
    } else {
        // Modo de criação
        modalTitle.innerText = 'Adicionar Nova Tarefa';
        saveButton.innerText = 'Salvar';
        currentEditTaskId = null;
        clearModalFields();
    }

    modal.show();
}

function saveTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due-date').value;
    const columnId = document.getElementById('task-column').value;

    if (title) {
        if (currentEditTaskId) {
            // Editar tarefa existente
            const task = document.getElementById(currentEditTaskId);
            task.className = `task ${priority}`;
            task.querySelector('.task-title').innerText = title;
            task.querySelector('.task-description').innerText = description;
            task.querySelector('.task-priority-badge').innerText = priority.replace('prioridade-', '');
            task.querySelector('.task-due-date').innerText = dueDate ? 'Vencimento: ' + dueDate : '';
            const taskList = document.getElementById(columnId).querySelector('.task-list');
            if (task.closest('.column').id !== columnId) {
                taskList.appendChild(task);
            }
            sortTasksByPriority(taskList);
        } else {
            // Criar nova tarefa
            const task = document.createElement("div");
            task.className = `task ${priority}`;
            task.draggable = true;
            const taskId = 'task-' + new Date().getTime();
            task.id = taskId;
            task.innerHTML = `
                <div class="task-title">${title}</div>
                <div class="task-description">${description}</div>
                <div class="task-priority-badge">${priority.replace('prioridade-', '')}</div>
                <div class="task-due-date">${dueDate ? 'Vencimento: ' + dueDate : ''}</div>
                <div class="task-buttons">
                    <button class="edit-btn" onclick="openModal('edit', '${taskId}')">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                    </button>
                    <button class="delete-btn" onclick="deleteTask(this)">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </div>`;
            task.ondragstart = drag;
            const taskList = document.getElementById(columnId).querySelector(".task-list");
            taskList.appendChild(task);
            sortTasksByPriority(taskList);
        }

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
    document.getElementById('task-due-date').value = '';
    document.getElementById('task-column').value = 'todo';
}

function deleteTask(button) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        const task = button.closest('.task');
        const taskList = task.closest('.task-list');
        task.remove();
        sortTasksByPriority(taskList);
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
                          task.classList.contains('prioridade-media') ? 'prioridade-media' : 'prioridade-baixa',
                dueDate: task.querySelector('.task-due-date')?.innerText.replace('Vencimento: ', '').trim() || ''
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
                    <div class="task-priority-badge">${taskData.priority.replace('prioridade-', '')}</div>
                    <div class="task-due-date">${taskData.dueDate ? 'Vencimento: ' + taskData.dueDate : ''}</div>
                    <div class="task-buttons">
                        <button class="edit-btn" onclick="openModal('edit', '${taskData.id}')">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                            </svg>
                        </button>
                        <button class="delete-btn" onclick="deleteTask(this)">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>
                    </div>`;
                task.ondragstart = drag;
                taskList.appendChild(task);
            });
            sortTasksByPriority(taskList);
        }
    }
    highlightDueTasks();
}

function sortTasksByPriority(taskList) {
    const priorityOrder = {
        'prioridade-alta': 1,
        'prioridade-media': 2,
        'prioridade-baixa': 3
    };
    const tasks = Array.from(taskList.querySelectorAll('.task'));
    tasks.sort((a, b) => {
        const priorityA = Array.from(a.classList).find(cls => cls.startsWith('prioridade-')) || 'prioridade-baixa';
        const priorityB = Array.from(b.classList).find(cls => cls.startsWith('prioridade-')) || 'prioridade-baixa';
        return priorityOrder[priorityA] - priorityOrder[priorityB];
    });
    taskList.innerHTML = '';
    tasks.forEach(task => taskList.appendChild(task));
}

function highlightDueTasks() {
    const tasks = document.querySelectorAll('.task');
    const today = new Date();
    tasks.forEach(task => {
        const dueDateText = task.querySelector('.task-due-date')?.innerText.replace('Vencimento: ', '').trim();
        if (dueDateText) {
            const dueDate = new Date(dueDateText);
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays <= 2 && diffDays >= 0) {
                task.classList.add('due-soon');
            }
        }
    });
}

document.getElementById('search-tasks').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        const title = task.querySelector('.task-title').innerText.toLowerCase();
        const description = task.querySelector('.task-description').innerText.toLowerCase();
        const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
        task.classList.toggle('hidden', !isVisible);
    });
});

document.getElementById('save-task-btn').addEventListener('click', saveTask);

window.onload = loadBoard;