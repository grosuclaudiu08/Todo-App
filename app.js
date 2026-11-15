const todoInput = document.querySelector('.new_todo');
const todoList = document.querySelector('.todo_list');
const mainContent = document.querySelector('.main_content');
const footer = document.querySelector('.footer');
const todoCount = document.querySelector('.todo_count strong');
const toggleAll = document.querySelector('.toggle_all');
const toggleAllLabel = document.querySelector('.header label');
const clearBtn = document.querySelector('.clear_completed');
const filterLinks = document.querySelectorAll('.filters a');
 
let todos = []; // Lista de task-uri
let currentFilter = 'all'; // Filtrul activ (all, active, completed)
let selectedRowId = null;
let editingId = null;

// Adauga un task nou
function addTodo(text) {
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };
    todos.push(newTodo);
    render(); // Re-deseneaza interfata
}

// Sterge un task dupa ID
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    render();
}

// Bifeaza / debifeaza un task
function toggleTodo(id) {
    selectedRowId = id;
    todos = todos.map(todo => {
        if(todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    render();
}

// Bifeaza / debifeaza toate task-urile
function toggleAllTodos() {
    const isChecked = toggleAll.checked;
    todos = todos.map(todo => ({ ...todo, completed: isChecked }));
    render();
}

// Sterge toate task-urile completate
function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    render();
}

// Schimba filtrul curent (All / Active / Completed)
function filterTodos(filterType) {
    currentFilter = filterType;

    // Sterge clasa "selected" de pe butoane
    filterLinks.forEach(function(link) {
        link.classList.remove('selected');
    });

    let href = '';
    if(filterType === 'all')
        href = '#/'; // Daca e All, link-ul este doar "#/"
    else
        href = '#/' + filterType; // Altfel este "#/active" sau "#/completed"

    // Cauta butonul in HTML
    const activeLink = document.querySelector('a[href="' + href + '"]');

    // Daca l-a gasit il face activ(chenar rosu)
    if(activeLink) {
        activeLink.classList.add('selected');
    }

    render();
}

// Start edit 
function startEditing(id) {
    editingId = id;
    selectedRowId = id;
    render();

    const input = document.querySelector('.todo_list li.editing .edit');
    if(input) {
        input.focus();
        input.value = input.value;
    }
}

// Salveza input-ul
function saveEdit(id, event) {
    const newText = event.target.value.trim();

    if(newText.length > 0) {
        for(let i = 0; i < todos.length; i++) {
            if(todos[i].id === id) {
                todos[i].text = newText;
                break;
            }
        }
    }
    else{
        // Daca nu e text sterge task-ul
        deleteTodo(id);
    }
    
    editingId = null;
    render();
}

// Anulare edit cu "Escape"
function handleEditKeydown(event, id) {
    if(event.key === 'Enter') {
        saveEdit(id, event);
    }
    else if(event.key === 'Escape') {
        editingId = null;
        render();
    }
}

// Functie de randare
function render() {
    updateVisibility(); // Ascunde sau arata continutul, daca sunt task-uri sau nu
    renderList();       // Genereaza lista HTML
    updateFooterInfo(); // Actualizeaza contorul si butoanele
}

// Vizibilitatea liste TODO
function updateVisibility() {
    if(todos.length === 0) {
        mainContent.style.display = 'none';
        footer.style.display = 'none';
        toggleAllLabel.style.visibility = 'hidden'; 
    }
    else {
        mainContent.style.display = 'block';
        footer.style.display = 'flex';
        toggleAllLabel.style.visibility = 'visible';
    }
}

// Randeaza HTML in functie de lista si buton
function renderList() {
    let filteredTodos = todos;
    if(currentFilter === 'active')
        filteredTodos = todos.filter(t => !t.completed); 
    else if(currentFilter === 'completed')
        filteredTodos = todos.filter(t => t.completed);

    // Generare HTML
    todoList.innerHTML = '';
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        if(todo.completed)
            li.classList.add('completed');
        
        if(todo.id === selectedRowId)
            li.classList.add('selected');

        if(todo.id === editingId)
            li.classList.add('editing');

        li.innerHTML = `
            <div class="view">
                <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleTodo(${todo.id})">
                
                <label onclick="toggleTodo(${todo.id})" ondblclick="startEditing(${todo.id})">${todo.text}</label>
                
                <button class="destroy" onclick="deleteTodo(${todo.id})">×</button>
            </div>

            <input class="edit" value="${todo.text}" 
                onblur="saveEdit(${todo.id}, event)" 
                onkeydown="handleEditKeydown(event, ${todo.id})">
        `;
        todoList.appendChild(li);
    });
}

// Contor + butoane ( All Active Completed Clear Completed)
function updateFooterInfo() {
    const activeCount = todos.filter(t => !t.completed).length;
    todoCount.innerText = activeCount;
    
    // Butonul "Clear completed" 
    const hasCompleted = todos.some(t => t.completed);

    // Daca exista todo il afiseaza, daca nu, il ascunde
    clearBtn.style.display = hasCompleted ? 'block' : 'none';
    clearBtn.style.visibility = hasCompleted ? 'visible' : 'hidden';
    
    // Checkbox-ul "Select All" 
    const allCompleted = todos.length > 0 && todos.every(t => t.completed);
    toggleAll.checked = allCompleted;
}

// "Enter" input
todoInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter' && todoInput.value.trim() !== '') {
        addTodo(todoInput.value.trim()); // adauga todo in lista
        todoInput.value = '';
    }
});

// Click pe sageata ; le bifeaza pe toate
toggleAll.addEventListener('change', toggleAllTodos);

// Scoate chenarul portocaliu
document.addEventListener('click', function(event) {
    const isToggle = event.target.classList.contains('toggle');
    const isLabel = event.target.tagName === 'LABEL';
    const isEdit = event.target.classList.contains('edit');

    if(!isToggle && !isLabel && !isEdit) {
        if(selectedRowId !== null) {
            selectedRowId = null;
            render();
        }
    }
});