const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const loginBtn = $('#btn-login');
const registerBtn = $('#btn-register');
const registerForm = $('#form-register');
const loginForm = $('#form-login') ;
const mainForm = $('.main-form') ;
const mainContent = $('.main-content') ;
const linkChangeFormRegister = $('#link-change-form-register') ;
const linkChangeFormLogin = $('#link-change-form-login') ;
const askUserRegister = $('#ask-user-register') ;
const askUserLogin = $('#ask-user-login') ;
const rememberCheck = $('#rememberme') ;
const emailInputLogin = $('#email-login') ;
const passwordLoginField = $('#password-login') ;
const emailInputRegister = $('#email-register') ;
const passwordRegisterField = $('#password-register') ;
const rePasswordRegisterField = $('#re-password-register') ;
const imageChibi = $('.img-form') ;
const notifUser = $('.notif-user') ;
const userActive = $('#user-active') ;
const logoutBtn = $('#logout-btn') ;
const inputTodo = $('.input-todo input') ;
const addTodoBtn = $('.input-todo button') ;
const deleteAllBtn = $('#delete-alltask-btn') ;
const pendingTasksCount = $( '.pending-task') ;
const todoList = $('.todo-list') ;
const filterStatus = $('#filter');
const filterState = {
  DONE: 'done',
  UNDONE: 'undone',
  ALL: 'all'
}
const valueConstant = {
  none : 'none',
  null : '',
  block: 'block',
  flex: 'flex',
  active: 'active'
}

/**
 * 
 * function create unique id. for the time after, we can use
 * id generated auto by mongoDB (ObjectId) when we catching in BE
 */
function generateUID() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11) ;
};

/**
 * Some regrex check email properly!
 */
function validateEmail(email) {
  return email.match (
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
/**
 * Event DOMContentLoaded/load trigger when the browser finish load
 * without waiting for stylesheets, images, and subframes
 * => using to detech whether a user logged or user using rememberMe
 * localStorage to save the user permanently
 * sessionStorage to save the user for only one session & one tab browser 
 */

/**
 * Improve than ver 1, instead using email like primary key of listTodo
 * in ver 2, task can store independently directly in localStorage
 * When we use query, simply using user_id (id of user) like the
 * foreign key to filter tasks to take array task
 * And easily add new task more than ver 1
 * we don't need to check if user exist / user created task yet
 * just add new task, who add task then give lil task a credential
 * property is user_id with value is user.id
 */
let users, user, listTasks;
window.addEventListener('DOMContentLoaded', function() {
  const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));
  const currentSessionUser = JSON.parse(sessionStorage.getItem("currentSessionUser"));
  if (rememberedUser || currentSessionUser) {
    // display page Login / Signup to none
    mainForm.style.display = valueConstant.none;
    // display toDoApp
    mainContent.style.display = valueConstant.block;
    // loading current user & toDoTask ( when using react => useEffect())
    user = rememberedUser || currentSessionUser;
    users = loadUsers() ;
    checkUserIsOnline(user);
    listTasks = loadTaskList(user) ;
    renderListTasks(listTasks);
  } else {
    users = loadUsers() ;
    checkUserIsOnline(user);
  }
}) ;

function loadUsers() {
  var users = JSON.parse(localStorage.getItem('users') ||'[]') ;
  return users;
};

function checkUserIsOnline(user = valueConstant.null) {
  if (user) {
    notifUser.style.display = valueConstant.flex;
    logoutBtn.classList.add(valueConstant.active);
    userActive.innerHTML = user?.email;
  } else {
    notifUser.style.display = valueConstant.none;
    logoutBtn.classList.remove(valueConstant.active);
    userActive.innerHTML = valueConstant.null;
  }
}

function loadTaskList() {
  var listTasks = JSON.parse(localStorage.getItem('listTasks')  || '[]') ;
  return listTasks;
};

/**
 * Depend on filterStatus value, we choose task to render!
 */
filterStatus.addEventListener('change',function() {
  const filterStatusValue = filterStatus.value;
  if (filterStatusValue === filterState.DONE) {
    renderListTasks(listTasks.filter((task) =>
      task.completed === filterState.DONE));
  } else if (filterStatusValue === filterState.UNDONE) {
    renderListTasks(listTasks.filter((task) => 
      task.completed === filterState.UNDONE));
  } else {
    renderListTasks(listTasks);
  }
})

function renderListTasks(listTasks) {
  if (listTasks) {
    var tasks = listTasks.filter( 
      (task) => task.user_id === user.id
   );
  }
  pendingTasksCount.textContent = tasks?.length || 0;
  if (tasks?.length > 0) {
    todoList.innerHTML = tasks.map((item) => {
      return `<li>
          <div class="id-${item.id}">
            <input onchange="toggleCompleted('${item.id}')" 
            type="checkbox" ${item.completed == filterState.DONE ? 'checked' : valueConstant.null }>
            <p>${item.name}</p>
            <span class ="icon icon-edit" onclick="editTask('${item.id}') ">
              <i class="fa-solid fa-pen-to-square"></i>
            </span>
            <span class="icon" onclick="deleteTask('${item.id}') ">
              <i class="fas fa-trash"></i>
            </span>
          </div>
        </li>`
    })
    .join(valueConstant.null);
    deleteAllBtn.classList.add(valueConstant.active);
  } else {
    todoList.innerHTML = `Nothing to show here. Please add task`;
    deleteAllBtn.classList.remove(valueConstant.active);

  }
}

function toggleCompleted(id) {
  const task = listTasks.find((task) => task.id === id);
  if (task) {
    if(task.completed === filterState.UNDONE){
      task.completed = filterState.DONE;
    } else if(task.completed === filterState.DONE) {
      task.completed = filterState.UNDONE;
    }
    localStorage.setItem('listTasks', JSON.stringify(listTasks));
    listTasks = loadTaskList(user);
    filterStatus.value = filterState.ALL;
    filterStatus.dispatchEvent(new Event('change'));
    
  }
}

function deleteTask(id) {
  const updatedlistTasks = listTasks.filter((task) => task.id !== id);
  if (updatedlistTasks)  {
    localStorage.setItem('listTasks', JSON.stringify(updatedlistTasks));
    listTasks = loadTaskList(user);
    renderListTasks(listTasks);
  }
};

function editTask(id) {
  const todoItem = $(`.id-${id}`) ;
  const task = listTasks.find((task) => task.id === id) ;
  if (task) {
    const existingValue = task.name;
    //create input field by using document.createElement( 'input')
    const inputElement = document.createElement('input'); 
    // Assign value of the input field exactly the name task
    inputElement.value = existingValue;
    // replace input field in place name for user change
    todoItem.replaceWith(inputElement) ;
    inputElement.focus();
    /**
     *  blur trigger when mouse point out of element 
     *  take the value in inputField and update
     */
    inputElement.addEventListener('blur', function() {
      const updatedValue = inputElement.value.trim();
      if (updatedValue)  {
        task.name = updatedValue;
        localStorage.setItem('listTasks', JSON.stringify(listTasks)) ;
        listTasks = loadTaskList(user) ;
        renderListTasks(listTasks);
      }
    });
  }
};

deleteAllBtn.addEventListener('click', function() {
  if (confirm('Delete All?')) {
    var updatedlistTasks = listTasks.filter( 
      (task) => task.user_id !== user.id
    ) ;
    if (updatedlistTasks) {
      imageChibi.style.animation = 'chibi-angrying 1s linear 0s 1 normal none';
      setTimeout(function() {
        imageChibi.style.animation = valueConstant.null;
      }, 3100) ;
      localStorage.setItem('listTasks', JSON.stringify(updatedlistTasks));
      listTasks = loadTaskList(user);
      renderListTasks(listTasks);
    }
  }
});

registerForm.addEventListener('submit', function(event) {
  event.preventDefault();

  if (passwordRegisterField.value !== rePasswordRegisterField.value)  {
    alert('Please re-enter the password!') ;
    passwordRegisterField.value = valueConstant.null;
    rePasswordRegisterField.value = valueConstant.null;
    return;
  }
  if (!validateEmail(emailInputRegister.value))  {
    alert('Please enter correctly email!') ;
    emailInputRegister.value = valueConstant.null;
    passwordRegisterField.value = valueConstant.null;
    rePasswordRegisterField.value = valueConstant.null;
    return;
  }
  const userCheck = users.find( 
    (user)  => user.email === emailInputRegister.value
  );
  if (userCheck)  {
    alert('Already have this email registered!') ;
    emailInputRegister.value = valueConstant.null;
    passwordRegisterField.value = valueConstant.null;
    rePasswordRegisterField.value = valueConstant.null;
    return;
  }

  const newUser = {
    id: generateUID(),
    email: emailInputRegister.value,
    password: passwordRegisterField.value,
  };
  users.push(newUser) ;
  localStorage.setItem('users', JSON.stringify( users)) ;
  alert('Register success!') ;
  emailInputRegister.value = valueConstant.null;
  passwordRegisterField.value = valueConstant.null;
  rePasswordRegisterField.value = valueConstant.null;
  linkChangeFormRegister.click();
});

loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  if (!validateEmail(emailInputLogin.value)) {
    alert('Please enter correctly email!');
    return;
  }
  // check if the user found in database => fetch api in here
  var userCheck = users.find( 
    (user) =>
      user.email === emailInputLogin.value &&
      user.password === passwordLoginField.value
  );
  if (userCheck)  {
    user = userCheck
    if (rememberCheck.checked) {
      localStorage.setItem('rememberedUser', JSON.stringify(user)) ;
      sessionStorage.removeItem('currentSessionUser');
    } else {
      sessionStorage.setItem('currentSessionUser', JSON.stringify(user));
      localStorage.removeItem('rememberedUser');
    }
    imageChibi.style.animation = 'chibi-jumping 3s linear 0s 1 normal none';
    setTimeout(function() {
      imageChibi.style.animation = valueConstant.null;
    }, 3100) ;
    mainForm.style.display = valueConstant.none;
    mainContent.style.display = valueConstant.block;
    passwordLoginField.value = valueConstant.null;
    checkUserIsOnline(user);
    listTasks = loadTaskList(user) ;
    renderListTasks(listTasks)
  } else {
    alert('User not found or Email/Password incorrect!');
    emailInputLogin.value = valueConstant.null;
    passwordLoginField.value = valueConstant.null;
    return;
  }
}) ;

function checkAvailableFormAndDisplay() {
  if (registerForm.style.display !== valueConstant.none) {
    registerForm.style.display = valueConstant.none;
    askUserRegister.style.display = valueConstant.none;
    loginForm.style.display = valueConstant.flex;
    askUserLogin.style.display = valueConstant.flex;
  } else {
    loginForm.style.display = valueConstant.none;
    askUserLogin.style.display = valueConstant.none;
    registerForm.style.display = valueConstant.flex;
    askUserRegister.style.display = valueConstant.flex;
  }
}

linkChangeFormRegister.addEventListener('click', function() {
  checkAvailableFormAndDisplay();
});

linkChangeFormLogin.addEventListener('click', function() {
  checkAvailableFormAndDisplay();
});

/**
 * CSS class active make field input beautiful
 */
inputTodo.addEventListener('keyup', function() {
  var enteredValues = inputTodo.value.trim() ;
  if (enteredValues) {
    addTodoBtn.classList.add(valueConstant.active);
  } else {
    addTodoBtn.classList.remove(valueConstant.active);
  }
});

/**
 * Handle event click on button addTask
 */
addTodoBtn.addEventListener('click', function() {
  var todoValue = inputTodo.value.trim() ;
    var newTask = {
      id: generateUID(),
      name: todoValue,
      user_id: user.id,
      completed: filterState.UNDONE
    };
    listTasks.push(newTask);
    localStorage.setItem('listTasks', JSON.stringify(listTasks)) ;
    addTodoBtn.classList.remove(valueConstant.active);
    imageChibi.style.animation = 'chibi-swinging 3s linear 0s 1 normal none';
    setTimeout(function() {
      imageChibi.style.animation = valueConstant.null;
    }, 3100) ;
    inputTodo.value = valueConstant.null;
    listTasks = loadTaskList(user) ;
    renderListTasks(listTasks)
});

logoutBtn.addEventListener('click', function() {
  localStorage.removeItem('rememberedUser');
  sessionStorage.removeItem('currentSessionUser');
  user = valueConstant.null
  checkUserIsOnline();
  mainForm.style.display = valueConstant.flex;
  mainContent.style.display = valueConstant.none;
}) ;
