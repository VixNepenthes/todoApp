const $ = document.querySelector.bind(document);
const loginBtn = $('#btn-login');
const registerBtn = $('#btn-register');
const registerForm = $('#form-register');
const loginForm = $('#form-login');
const mainForm = $('.main-form');
const mainContent = $('.main-content');
const linkChangeFormRegister = $('#link-change-form-register');
const linkChangeFormLogin = $('#link-change-form-login');
const askUserRegister = $('#ask-user-register');
const askUserLogin = $('#ask-user-login');
const rmCheck = $('#rememberMe');
const emailInputLogin = $('#email-login');
const pwdLoginField = $('#pwd-login');
const emailInputRegister = $('#email-register');
const pwdRegisterField = $('#pwd-register');
const rePwd = $('#rePwd');
const imgChibi = $('.img-form');
const notifUser = $('.notif-user');
const userActive = $('#user-active');
const logoutBtn = $('#logout-btn');
const inputTodo = $('.input-todo input');
const addTodoBtn = $('.input-todo button');
const deleteAllBtn = $('#delete-alltask-btn');
const pendingTasksCount = $('.pending-task');
const todoList = $('.todo-list');
const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

const loadUsers = (email = '') => {
  var users = JSON.parse(localStorage.getItem('users') || '[]');
  var userActiveEmail = email;
  if (localStorage.checkbox && localStorage.checkbox !== '') {
    rmCheck.setAttribute('checked', 'checked');
    emailInputLogin.value = localStorage.emailRemembered;
  } else {
    rmCheck.removeAttribute('checked');
    emailInputLogin.value = '';
  }
  if (userActiveEmail != '') {
    notifUser.style.display = 'flex';
    logoutBtn.classList.add('active');
    userActive.innerHTML = userActiveEmail;
  } else {
    notifUser.style.display = 'none';

    logoutBtn.classList.remove('active');
    userActive.innerHTML = '';
  }
  return { users, userActiveEmail };
};

const loadListTodo = () => {
  var listTodos = JSON.parse(localStorage.getItem('newTodos') || '[]');
  var listTodo = listTodos.find(
    (listTodo) => listTodo.email == userActive.innerHTML
  );
  var newLiTag = '';
  pendingTasksCount.textContent = listTodo?.items.length || 0;
  if (listTodo?.items.length > 0) {
    //if array length is greater than 0
    listTodo.items.forEach((element, index) => {
      newLiTag += `<li>
      
        <p class="todo-name-${index}">${element}</p>
        <span class ="icon icon-edit" onclick="editTask(${index},'${listTodo.email}')">
        <i class="fa-solid fa-pen-to-square"></i>
        </span>
        <span class="icon" onclick="deleteTask(${index},'${listTodo.email}')">
            <i class="fas fa-trash"></i>
        </span>
        </li>`;
    });
    deleteAllBtn.classList.add('active'); //active the delete button
  } else {
    deleteAllBtn.classList.remove('active'); //unactive the delete button
  }

  todoList.innerHTML = newLiTag; //adding new li tag inside ul tag
  inputTodo.value = ''; //once task added leave the input field blank
  return listTodos;
};
var { users, userActiveEmail } = loadUsers();
var listTodos = loadListTodo();

const deleteTask = (index, email = userActive.innerHTML) => {
  const listTodo = listTodos.find((listTodo) => listTodo.email == email);
  if (listTodo) {
    listTodo.items.splice(index, 1);
    localStorage.setItem('newTodos', JSON.stringify(listTodos));
    loadListTodo();
  }

  // listTodos.forEach((listTodo) => {
  //   if (listTodo.email == email) {
  //     listTodo.items.splice(index, 1);
  //     localStorage.setItem('newTodos', JSON.stringify(listTodos));

  //     loadListTodo(); //call the showTasks function
  //   }
  // });
};

const editTask = (index, email = userActive.innerHTML) => {
  const todoItem = $(`.todo-name-${index}`);
  const listTodo = listTodos.find((listTodo) => listTodo.email == email);
  if (listTodo) {
    const existingValue = listTodo.items[index];
    const inputElement = document.createElement('input');
    inputElement.value = existingValue;
    todoItem.replaceWith(inputElement);
    inputElement.focus();
    inputElement.addEventListener('blur', () => {
      const updatedValue = inputElement.value.trim();
      if (updatedValue) {
        listTodo.items[index] = updatedValue;
        localStorage.setItem('newTodos', JSON.stringify(listTodos));
        loadListTodo();
      }
    });
  }
};

deleteAllBtn.addEventListener('click', () => {
  if (confirm('Delete All?')) {
    var listTodo = listTodos.find(
      (listTodo) => listTodo.email == userActive.innerHTML
    );
    if (listTodo) {
      listTodo.items = [];
    }
    localStorage.setItem('newTodos', JSON.stringify(listTodos));
    loadListTodo();
    imgChibi.style.animation = 'chibi-angrying 1s linear 0s 1 normal none';
    setTimeout(() => {
      imgChibi.style.animation = '';
    }, 3100);
  }
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (pwdRegisterField.value != rePwd.value) {
    alert('Please re-enter the password!');
    pwdRegisterField.value = '';
    rePwd.value = '';
    return;
  }
  if (!validateEmail(emailInputRegister.value)) {
    alert('Please enter correctly email!');
    emailInputRegister.value = '';
    pwdRegisterField.value = '';
    rePwd.value = '';
    return;
  }
  const userCheck = users.find(
    (user) => user.email == emailInputRegister.value
  );
  if (userCheck) {
    alert('Already have this email registered!');
    emailInputRegister.value = '';
    pwdRegisterField.value = '';
    rePwd.value = '';
    return;
  }

  const newUser = {
    email: emailInputRegister.value,
    password: pwdRegisterField.value,
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  alert('Register success!');
  emailInputRegister.value = '';
  pwdRegisterField.value = '';
  rePwd.value = '';
  linkChangeFormRegister.click();
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateEmail(emailInputLogin.value)) {
    alert('Please enter correctly email!');
    return;
  }

  var user = users.find(
    (user) =>
      user.email == emailInputLogin.value &&
      user.password == pwdLoginField.value
  );
  if (user) {
    if (rmCheck.checked && emailInputLogin.value !== '') {
      localStorage.emailRemembered = emailInputLogin.value;
      localStorage.checkbox = rmCheck.value;
    } else {
      localStorage.emailRemembered = '';
      localStorage.checkbox = '';
    }
    imgChibi.style.animation = 'chibi-jumping 3s linear 0s 1 normal none';
    setTimeout(() => {
      imgChibi.style.animation = '';
    }, 3100);
    mainForm.style.display = 'none';
    mainContent.style.display = 'block';
    var email = user.email;
    pwdLoginField.value = '';
    loadUsers(email);
    loadListTodo();
  } else {
    alert('User not found or Email/Password incorrect!');
    emailInputLogin.value = '';
    pwdLoginField.value = '';
    return;
  }
});

linkChangeFormRegister.addEventListener('click', () => {
  if (registerForm.style.display != 'none') {
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
});

linkChangeFormLogin.addEventListener('click', () => {
  if (registerForm.style.display != 'none') {
    registerForm.style.display = 'none';
    askUserRegister.style.display = 'none';
    askUserLogin.style.display = 'flex';
    loginForm.style.display = 'flex';

    loginForm.style.display = 'flex';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    askUserLogin.style.display = 'none';
    askUserRegister.style.display = 'flex';
  }
});

inputTodo.addEventListener('keyup', () => {
  var enteredValues = inputTodo.value.trim();
  if (enteredValues) {
    addTodoBtn.classList.add('active');
  } else {
    addTodoBtn.classList.remove('active');
  }
});

addTodoBtn.addEventListener('click', () => {
  var todoValue = inputTodo.value.trim();

  /**
   * Ở đây có 3 trường hợp xảy ra:
   * 1. mảng listTodos rỗng ( không có email, không có items)
   * => tạo mới 1 object listTodo con gồm email và mảng items chứa phần tử đầu tiên là todoValue
   * 2. mảng listTodos có phần tử
   * => kiểm tra email user đang login với email trong từng phần tử listTodos
   * 2.1 Nếu tồn tại đã có email => thêm todoValue vào mảng items và cập nhật localStorage
   * 2.2 Nếu không tồn tại email (email vừa đăng ký, chưa từng sử dụng)
   * => tạo mới 1 object listTodo con gồm email và mảng items chứa phần tử đầu tiên là todoValue
   */
  if (listTodos.length == 0) {
    // Trường hợp 1
    var newItem = {
      email: userActive.innerHTML,
      items: [todoValue],
    };
    listTodos.push(newItem);
    localStorage.setItem('newTodos', JSON.stringify(listTodos));
    loadListTodo();
    addTodoBtn.classList.remove('active');
    imgChibi.style.animation = 'chibi-swinging 3s linear 0s 1 normal none';
    setTimeout(() => {
      imgChibi.style.animation = '';
    }, 3100);
  } else {
    // Trường hợp 2
    const listTodo = listTodos.find(
      (listTodo) => listTodo.email == userActive.innerHTML
    );
    // 2.1
    if (listTodo) {
      listTodo.items.push(todoValue);
      localStorage.setItem('newTodos', JSON.stringify(listTodos));
      loadListTodo();
      addTodoBtn.classList.remove('active');
      imgChibi.style.animation = 'chibi-swinging 3s linear 0s 1 normal none';
      setTimeout(() => {
        imgChibi.style.animation = '';
      }, 3100);
    }
    // 2.2
    else {
      var newItem = {
        email: userActive.innerHTML,
        items: [todoValue],
      };
      listTodos.push(newItem);
      localStorage.setItem('newTodos', JSON.stringify(listTodos));
      loadListTodo();
      addTodoBtn.classList.remove('active');
      imgChibi.style.animation = 'chibi-swinging 3s linear 0s 1 normal none';
      setTimeout(() => {
        imgChibi.style.animation = '';
      }, 3100);
    }
  }
});

logoutBtn.addEventListener('click', () => {
  mainForm.style.display = 'flex';
  mainContent.style.display = 'none';
  loadUsers();
});
