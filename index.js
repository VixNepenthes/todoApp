const $ = document.querySelector.bind(document ) ;
const $$ = document.querySelectorAll.bind(document ) ;
const loginBtn = $('#btn-login' ) ;
const registerBtn = $('#btn-register' ) ;
const registerForm = $('#form-register' ) ;
const loginForm = $('#form-login' ) ;
const mainForm = $('.main-form' ) ;
const mainContent = $('.main-content' ) ;
const linkChangeFormRegister = $('#link-change-form-register' ) ;
const linkChangeFormLogin = $('#link-change-form-login' ) ;
const askUserRegister = $('#ask-user-register' ) ;
const askUserLogin = $('#ask-user-login' ) ;
const rememberCheck = $('#rememberMe' ) ;
const emailInputLogin = $('#email-login' ) ;
const passwordLoginField = $('#pwd-login' ) ;
const emailInputRegister = $('#email-register' ) ;
const pwdRegisterField = $('#pwd-register' ) ;
const rePasswordField = $('#rePwd' ) ;
const imageChibi = $('.img-form' ) ;
const notifUser = $('.notif-user' ) ;
const userActive = $('#user-active' ) ;
const logoutBtn = $('#logout-btn' ) ;
const inputTodo = $('.input-todo input' ) ;
const addTodoBtn = $('.input-todo button' ) ;
const deleteAllBtn = $('#delete-alltask-btn' ) ;
const pendingTasksCount = $( '.pending-task' ) ;
const todoList = $('.todo-list' ) ;
const filterStatus = $('#filter' );
const filterState = {
  DONE: 'done',
  UNDONE: 'undone',
  ALL: 'all'
}

/**
 * 
 * function create unique id. for the time after, we can use
 * id generated auto by mongoDB (ObjectId) when we catching in BE
 */
const generateUID = () => {
  return Date.now() .toString( 36 )  + Math.random() .toString( 36 ) .substring( 2, 11 ) ;
};

/**
 * Some regrex check email properly!
 */
const validateEmail = (email ) => {
  return email.match (
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
/**
 * Event DOMContentLoaded trigger when the browser finish load
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
var users, user, listTask
window.addEventListener('load', ()  => {
  const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));
  const currentSessionUser = JSON.parse(sessionStorage.getItem("currentSessionUser"));
  if ( rememberedUser || currentSessionUser ) {
    // display page Login / Signup to none
    mainForm.style.display = 'none';
    // display toDoApp
    mainContent.style.display = 'block';
    // loading current user & toDoTask ( when using react => useEffect())
    user = rememberedUser || currentSessionUser;
    users = loadUsers() ;
    helloUser(user )
    listTask= loadTask(user ) ;
    renderTask( listTask );
  } else {
    users = loadUsers() ;
    helloUser( user );
    console.log(user);

  }
}) ;

const loadUsers = () => {
  var users = JSON.parse( localStorage.getItem( 'users' )  || '[  ]' ) ;
  return users;
};

const helloUser = (user = '' ) => {
  if (user )  {
    notifUser.style.display = 'flex';
    logoutBtn.classList.add( 'active' ) ;
    userActive.innerHTML = user?.email;
  } else {
    notifUser.style.display = 'none';
    logoutBtn.classList.remove( 'active' ) ;
    userActive.innerHTML = '';
  }
}

const loadTask = ()  => {
  var listTask = JSON.parse(localStorage.getItem('listTask' )  || '[]' ) ;
  return listTask;
};

/**
 * Depend on filterStatus value, we choose task to render!
 */
filterStatus.addEventListener('change', ()=> {
  const filterStatusValue = filterStatus.value
  console.log(filterStatusValue)
  if (filterStatusValue === filterState.DONE ) {
    renderTask(listTask.filter((task )=>
      task.completed == filterState.DONE ))
  } else if (filterStatusValue == filterState.UNDONE) {
    renderTask(listTask.filter((task )=> 
      task.completed == filterState.UNDONE ))
  } else {
    renderTask(listTask )
  }
})

const renderTask = (listTask ) => {
  if(listTask ) {
    var tasks = listTask.filter( 
      (task ) => task.user_id == user.id
    ) ;
  }
  pendingTasksCount.textContent = tasks?.length || 0;
  if (tasks?.length > 0 ) {
    todoList.innerHTML = tasks.map((item ) => {
      return `<li>
          <div class="id-${item.id }">
            <input onchange="toggleCompleted('${item.id }')" 
            type="checkbox" ${item.completed == filterState.DONE ? 'checked' : '' }>
            <p>${item.name }</p>
            <span class ="icon icon-edit" onclick="editTask('${item.id }') ">
              <i class="fa-solid fa-pen-to-square"></i>
            </span>
            <span class="icon" onclick="deleteTask('${item.id }') ">
              <i class="fas fa-trash"></i>
            </span>
          </div>
        </li>`
    })
    .join('' );
    deleteAllBtn.classList.add('active' )
  } else {
    todoList.innerHTML = `Nothing to show here. Please add task`
    deleteAllBtn.classList.remove('active' )

  }
}

const toggleCompleted = (id ) => {
  const task = listTask.find((task ) => task.id == id)
  if( task ) {
    if(task.completed == filterState.UNDONE ){
      task.completed = filterState.DONE
    } else if(task.completed == filterState.DONE) {
      task.completed = filterState.UNDONE
    }
    localStorage.setItem('listTask', JSON.stringify(listTask ))
    listTask = loadTask(user )
    
  }
}

const deleteTask = (id )  => {
  const updatedListTask = listTask.filter((task ) => task.id !== id)
  if (updatedListTask )  {
    localStorage.setItem('listTask', JSON.stringify(updatedListTask ));
    listTask = loadTask(user );
    renderTask(listTask )
  }
};

const editTask = (id )  => {
  const todoItem = $(`.id-${id}` ) ;
  const task = listTask.find((task ) => task.id == id ) ;
  if (task )  {
    const existingValue = task.name;
    //create input field by using document.createElement( 'input' )
    const inputElement = document.createElement('input' ) ; 
    // Assign value of the input field exactly the name task
    inputElement.value = existingValue;
    // replace input field in place name for user change
    todoItem.replaceWith(inputElement ) ;
    inputElement.focus() ;
    /**
     *  blur trigger when mouse point out of element 
     *  take the value in inputField and update
     */
    inputElement.addEventListener('blur', ()  => {
      const updatedValue = inputElement.value.trim() ;
      if (updatedValue )  {
        task.name = updatedValue;
        localStorage.setItem(  'listTask', JSON.stringify( listTask )  ) ;
        listTask = loadTask(user ) ;
        renderTask(listTask )
      }
    }) ;
  }
};

deleteAllBtn.addEventListener('click', ()  => {
  if (confirm('Delete All?' ))  {
    var updatedListTask = listTask.filter( 
      (task )  => task.user_id !== user.id
     ) ;
    if (updatedListTask )  {
      imageChibi.style.animation = 'chibi-angrying 1s linear 0s 1 normal none';
      setTimeout( ()  => {
        imageChibi.style.animation = '';
      }, 3100 ) ;
      localStorage.setItem( 'listTask', JSON.stringify(updatedListTask ))
      listTask = loadTask(user )
      renderTask(listTask )
    }
  }
}) ;

registerForm.addEventListener('submit', (e )  => {
  e.preventDefault() ;

  if (pwdRegisterField.value != rePasswordField.value )  {
    alert('Please re-enter the password!' ) ;
    pwdRegisterField.value = '';
    rePasswordField.value = '';
    return;
  }
  console.log(emailInputRegister.value )
  if (!validateEmail( emailInputRegister.value ))  {
    alert('Please enter correctly email!' ) ;
    emailInputRegister.value = '';
    pwdRegisterField.value = '';
    rePasswordField.value = '';
    return;
  }
  const userCheck = users.find( 
    (user )  => user.email == emailInputRegister.value
   ) ;
  if (userCheck )  {
    alert('Already have this email registered!' ) ;
    emailInputRegister.value = '';
    pwdRegisterField.value = '';
    rePasswordField.value = '';
    return;
  }

  const newUser = {
    id: generateUID() ,
    email: emailInputRegister.value,
    password: pwdRegisterField.value,
  };
  users.push(newUser ) ;
  localStorage.setItem('users', JSON.stringify( users )  ) ;
  alert('Register success!' ) ;
  emailInputRegister.value = '';
  pwdRegisterField.value = '';
  rePasswordField.value = '';
  linkChangeFormRegister.click() ;
} ) ;

loginForm.addEventListener('submit', (e  )  => {
  e.preventDefault() ;
  if (!validateEmail( emailInputLogin.value ))  {
    alert( 'Please enter correctly email!' ) ;
    return;
  }
  // check if the user found in database => fetch api in here
  var userCheck = users.find ( 
    (user )  =>
      user.email == emailInputLogin.value &&
      user.password == passwordLoginField.value
   ) ;
  if (userCheck )  {
    user = userCheck
    if (rememberCheck.checked )  {
      localStorage.setItem('rememberedUser', JSON.stringify(user )) ;
      sessionStorage.removeItem('currentSessionUser' );
    } else {
      sessionStorage.setItem('currentSessionUser', JSON.stringify(user ))
      localStorage.removeItem('rememberedUser' );
    }
    imageChibi.style.animation = 'chibi-jumping 3s linear 0s 1 normal none';
    setTimeout( ()  => {
      imageChibi.style.animation = '';
    } , 3100 ) ;
    mainForm.style.display = 'none';
    mainContent.style.display = 'block';
    passwordLoginField.value = '';
    helloUser(user );
    listTask = loadTask(user ) ;
    renderTask(listTask )
  } else {
    alert('User not found or Email/Password incorrect!'  ) ;
    emailInputLogin.value = '';
    passwordLoginField.value = '';
    return;
  }
} ) ;

const checkAvailableFormAndDisplay = () => {
  if (registerForm.style.display != 'none' )  {
    registerForm.style.display = 'none';
    askUserRegister.style.display = 'none';
    loginForm.style.display = 'flex';
    askUserLogin.style.display = 'flex';
  } else {
    loginForm.style.display = 'none';
    askUserLogin.style.display = 'none';
    registerForm.style.display = 'flex';
    askUserRegister.style.display = 'flex';
  }
}

linkChangeFormRegister.addEventListener('click', ()  => {
  checkAvailableFormAndDisplay()
} ) ;

linkChangeFormLogin.addEventListener('click', ()  => {
  checkAvailableFormAndDisplay()
} ) ;

/**
 * CSS class active make field input beautiful
 */
inputTodo.addEventListener('keyup', ()  => {
  var enteredValues = inputTodo.value.trim() ;
  if (enteredValues )  {
    addTodoBtn.classList.add( 'active' ) ;
  } else {
    addTodoBtn.classList.remove( 'active' ) ;
  }
} ) ;

/**
 * Handle event click on button addTask
 */
addTodoBtn.addEventListener( 'click', ()  => {
  var todoValue = inputTodo.value.trim() ;
    var newTask = {
      id: generateUID(),
      name: todoValue,
      user_id: user.id,
      completed: filterState.UNDONE
    };
    listTask.push(newTask ) ;
    localStorage.setItem('listTask', JSON.stringify( listTask )  ) ;
    addTodoBtn.classList.remove('active' ) ;
    imageChibi.style.animation = 'chibi-swinging 3s linear 0s 1 normal none';
    setTimeout(()  => {
      imageChibi.style.animation = '';
    }, 3100 ) ;
    inputTodo.value = '';
    listTask = loadTask(user ) ;
    renderTask(listTask )
}) ;

logoutBtn.addEventListener('click', ()  => {
  localStorage.removeItem('rememberedUser' );
  sessionStorage.removeItem('currentSessionUser' );
  console.log(user )
  user = ''
  helloUser();
  mainForm.style.display = 'flex';
  mainContent.style.display = 'none';
  console.log(user )
}) ;
