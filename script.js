document.addEventListener('DOMContentLoaded', () => {
    const todos = [];
    let filter = 'active';

    const todoListElement = document.getElementById('todo-list');
    const newTodoInput = document.getElementById('new-todo');
    const currentDateElement = document.getElementById('current-date');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    // Set current date
    currentDateElement.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Add new todo
    document.getElementById('add-todo').addEventListener('click', () => {
        const text = newTodoInput.value.trim();
        if (text) {
            todos.push({ id: Date.now(), text, completed: false });
            newTodoInput.value = '';
            renderTodos();
        }
    });

    // Filter buttons
    document.getElementById('filter-active').addEventListener('click', () => {
        filter = 'active';
        renderTodos();
    });

    document.getElementById('filter-completed').addEventListener('click', () => {
        filter = 'completed';
        renderTodos();
    });

    document.getElementById('filter-all').addEventListener('click', () => {
        filter = 'all';
        renderTodos();
    });

    // Render todos
    function renderTodos() {
        todoListElement.innerHTML = '';
        const filteredTodos = todos.filter(todo => {
            if (filter === 'active') return !todo.completed;
            if (filter === 'completed') return todo.completed;
            return true;
        });

        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = 'flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded';
            todoItem.innerHTML = `
                <div class="flex items-center gap-3">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} class="w-5 h-5 border-2 border-gray-300 rounded">
                    <span class="${todo.completed ? 'line-through text-gray-500' : ''}">${todo.text}</span>
                </div>
                <button class="text-gray-500 hover:text-red-600">Delete</button>
            `;

            // Toggle completed
            todoItem.querySelector('input').addEventListener('change', () => {
                todo.completed = !todo.completed;
                renderTodos();
            });

            // Delete todo
            todoItem.querySelector('button').addEventListener('click', () => {
                const index = todos.indexOf(todo);
                todos.splice(index, 1);
                renderTodos();
            });

            todoListElement.appendChild(todoItem);
        });
    }

    // Open menu
    document.getElementById('open-menu').addEventListener('click', () => {
        sideMenu.classList.remove('-translate-x-full');
        menuOverlay.classList.remove('hidden');
    });

    // Close menu
    document.getElementById('close-menu').addEventListener('click', () => {
        sideMenu.classList.add('-translate-x-full');
        menuOverlay.classList.add('hidden');
    });

    menuOverlay.addEventListener('click', () => {
        sideMenu.classList.add('-translate-x-full');
        menuOverlay.classList.add('hidden');
    });
});