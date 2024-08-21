const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const loginButton = $('#button-login');
const registerButton = $('#button-register');
const registerForm = $('#form-register');
const loginForm = $('#form-login');
const mainForm = $('.main-form');
const mainContent = $('.main-content');
const linkChangeFormRegister = $('#link-change-form-register');
const linkChangeFormLogin = $('#link-change-form-login');
const askUserRegister = $('#ask-user-register');
const askUserLogin = $('#ask-user-login');
const rememberCheck = $('#remember-me');
const emailInputLogin = $('#email-login');
const passwordLoginField = $('#password-login');
const emailInputRegister = $('#email-register');
const passwordRegisterField = $('#password-register');
const rePasswordRegisterField = $('#re-password-register');
const imageChibi = $('.img-form');
const notificationUser = $('.notification-user');
const userActive = $('#user-active');
const logoutButton = $('#logout-button');
const inputTodo = $('.input-todo input');
const addTodoButton = $('.input-todo button');
const deleteAllTasksButton = $('#delete-all-tasks-button');
const pendingTasksCount = $('.pending-task');
const todoList = $('.todo-list');
const filterStatus = $('#filter');
const filterState = {
	DONE: 'done',
	UNDONE: 'undone',
	ALL: 'all',
};
const valueConstant = {
	none: 'none',
	null: '',
	block: 'block',
	flex: 'flex',
	active: 'active',
};
const urlAPI = 'http://localhost:3000';

/**
 *
 * function create unique id. for the time after, we can use
 * id generated auto by mongoDB (ObjectId) when we catching in BE
 */
function generateUID() {
	return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

/**
 * Some regrex check email properly!
 */
function validateEmail(email) {
	return email.match(
		/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	);
}
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

// fetch('http://localhost:3000/task', {
//   headers: {
//     authorization : 23523523,
//   },
// })
// .then(response => response.json())
// .then(data => {
//   console.log(data) // Prints result from `response.json()` in getRequest
// })
// .catch(error => console.error(error))

let users, user;
let listTasks = [];
window.addEventListener('DOMContentLoaded', async function () {
	const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser'));
	const currentSessionUser = JSON.parse(
		sessionStorage.getItem('currentSessionUser')
	);
	if (rememberedUser || currentSessionUser) {
		// display page Login / Signup to none
		mainForm.style.display = valueConstant.none;
		// display toDoApp
		mainContent.style.display = valueConstant.block;
		// loading current user & toDoTask ( when using react => useEffect())
		user = rememberedUser || currentSessionUser || '';
		checkUserIsOnline(user);
		listTasks = await loadTaskList();
		renderListTasks(listTasks);
	} else {
		checkUserIsOnline(user);
	}
});

function loadUsers() {}

function checkUserIsOnline(user = valueConstant.null) {
	if (user == valueConstant.null) {
		notificationUser.style.display = valueConstant.none;
		logoutButton.classList.remove(valueConstant.active);
		userActive.innerHTML = valueConstant.null;
	} else {
		notificationUser.style.display = valueConstant.flex;
		logoutButton.classList.add(valueConstant.active);
		userActive.innerHTML = user?.email;
	}
}

async function loadTaskList() {
	try {
		const response = await fetch(`${urlAPI}/tasks`, {
			method: 'GET',
			headers: {
				authorization: JSON.parse(localStorage.getItem('Authorization')),
			},
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		let listTasks = await response.json();
		return listTasks;
	} catch (error) {
		console.error(error);
	}
}

/**
 * Depend on filterStatus value, we choose task to render!
 */
filterStatus.addEventListener('change', function () {
	const filterStatusValue = filterStatus.value;
	if (filterStatusValue === filterState.DONE) {
		renderListTasks(
			listTasks.filter((task) => task.completed === filterState.DONE)
		);
	} else if (filterStatusValue === filterState.UNDONE) {
		renderListTasks(
			listTasks.filter((task) => task.completed === filterState.UNDONE)
		);
	} else {
		renderListTasks(listTasks);
	}
});

function renderListTasks(listTasks) {
	let tasks;
	if (listTasks) {
		tasks = listTasks.filter((task) => task.user_id === user.id);
	}
	pendingTasksCount.textContent = tasks?.length || 0;
	if (tasks?.length > 0) {
		todoList.innerHTML = tasks
			.map((item) => {
				return `<li>
          <div class="id-${item.id}">
            <input onchange="toggleCompleted('${item.id}')" 
            type="checkbox" ${
							item.completed == filterState.DONE
								? 'checked'
								: valueConstant.null
						}>
            <p>${item.name}</p>
            <span class ="icon icon-edit" onclick="editTask('${item.id}') ">
              <i class="fa-solid fa-pen-to-square"></i>
            </span>
            <span class="icon" onclick="deleteTask('${item.id}') ">
              <i class="fas fa-trash"></i>
            </span>
          </div>
        </li>`;
			})
			.join(valueConstant.null);
		deleteAllTasksButton.classList.add(valueConstant.active);
	} else {
		todoList.innerHTML = `Nothing to show here. Please add task`;
		deleteAllTasksButton.classList.remove(valueConstant.active);
	}
}

async function toggleCompleted(id) {
	const response = await fetch(`${urlAPI}/tasks/toggle-task`, {
		method: 'PUT',
		headers: {
			authorization: JSON.parse(localStorage.getItem('Authorization')),
		},
		body: JSON.stringify(id),
	});
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	alert(await response.json());
	listTasks = await loadTaskList();
	renderListTasks(listTasks);
	filterStatus.value = filterState.ALL;
	filterStatus.dispatchEvent(new Event('change'));
}

async function deleteTask(id) {
	const response = await fetch(`${urlAPI}/tasks`, {
		method: 'DELETE',
		headers: {
			authorization: JSON.parse(localStorage.getItem('Authorization')),
		},
		body: JSON.stringify(id),
	});
	if (!response.ok) {
		throw new Error('Network response was not ok');
	} else {
		alert(await response.json());
		listTasks = await loadTaskList();
		renderListTasks(listTasks);
	}
}

function editTask(id) {
	const todoItem = $(`.id-${id}`);
	const task = listTasks.find((task) => task.id === id);
	if (task) {
		const existingValue = task.name;
		//create input field by using document.createElement( 'input')
		const inputElement = document.createElement('input');
		// Assign value of the input field exactly the name task
		inputElement.value = existingValue;
		// replace input field in place name for user change
		todoItem.replaceWith(inputElement);
		inputElement.focus();
		/**
		 *  blur trigger when mouse point out of element
		 *  take the value in inputField and update
		 */
		inputElement.addEventListener('blur', async function () {
			const updatedValue = inputElement.value.trim();
			if (updatedValue) {
				task.name = updatedValue;
				const response = await fetch(`${urlAPI}/tasks`, {
					method: 'PUT',
					headers: {
						authorization: JSON.parse(localStorage.getItem('Authorization')),
					},
					body: JSON.stringify(task),
				});
				if (!response.ok) {
					throw new Error('Network response was not ok');
				} else {
					alert(await response.json());
					listTasks = await loadTaskList();
					renderListTasks(listTasks);
				}
			}
		});
	}
}

deleteAllTasksButton.addEventListener('click', async function () {
	if (confirm('Delete All?')) {
		const response = await fetch(`${urlAPI}/tasks/delete-all-tasks`, {
			method: 'DELETE',
			headers: {
				authorization: JSON.parse(localStorage.getItem('Authorization')),
			},
			body: JSON.stringify(user.id),
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		imageChibi.style.animation = 'chibi-angrying 1s linear 0s 1 normal none';
		setTimeout(function () {
			imageChibi.style.animation = valueConstant.null;
		}, 3100);
		alert(await response.json());
		listTasks = await loadTaskList();
		renderListTasks(listTasks);
	}
});

registerForm.addEventListener('submit', function (event) {
	event.preventDefault();

	if (!validateEmail(emailInputRegister.value)) {
		alert('Please enter correctly email!');
		emailInputRegister.value = valueConstant.null;
		passwordRegisterField.value = valueConstant.null;
		rePasswordRegisterField.value = valueConstant.null;
		return;
	}

	if (passwordRegisterField.value.length < 8) {
		alert('Please enter password with the minimum length is 8 character');
		passwordRegisterField.value = valueConstant.null;
		rePasswordRegisterField.value = valueConstant.null;
	}

	if (passwordRegisterField.value !== rePasswordRegisterField.value) {
		alert('Please re-enter the password!');
		passwordRegisterField.value = valueConstant.null;
		rePasswordRegisterField.value = valueConstant.null;
		return;
	}

	let newUser = {
		email: emailInputRegister.value,
		password: passwordRegisterField.value,
	};

	fetch(`${urlAPI}/users`, {
		method: 'POST',
		body: JSON.stringify(newUser),
	})
		.then((response) => response.json())
		.then((message) => {
			if (message === 'Already have this email registered!') {
				alert('Already have this email registered!');
				emailInputRegister.value = valueConstant.null;
				passwordRegisterField.value = valueConstant.null;
				rePasswordRegisterField.value = valueConstant.null;
				return;
			} else {
				alert('Register success!');
				emailInputRegister.value = valueConstant.null;
				passwordRegisterField.value = valueConstant.null;
				rePasswordRegisterField.value = valueConstant.null;
				linkChangeFormRegister.click();
			}
		});
});

loginForm.addEventListener('submit', function (event) {
	event.preventDefault();
	if (!validateEmail(emailInputLogin.value)) {
		alert('Please enter correctly email!');
		return;
	}
	// check if the user found in database => fetch api in here
	const userLoginData = {
		email: emailInputLogin.value,
		password: passwordLoginField.value,
	};
	fetch(`${urlAPI}/users/login`, {
		method: 'POST',
		body: JSON.stringify(userLoginData),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data !== 'Wrong user or password') {
				user = data;
				if (rememberCheck.checked) {
					localStorage.setItem('rememberedUser', JSON.stringify(user));
					sessionStorage.removeItem('currentSessionUser');
				} else {
					sessionStorage.setItem('currentSessionUser', JSON.stringify(user));
					localStorage.removeItem('rememberedUser');
				}
				localStorage.setItem('Authorization', JSON.stringify(user.token));
				imageChibi.style.animation = 'chibi-jumping 3s linear 0s 1 normal none';
				setTimeout(function () {
					imageChibi.style.animation = valueConstant.null;
				}, 3100);
				mainForm.style.display = valueConstant.none;
				mainContent.style.display = valueConstant.block;
				passwordLoginField.value = valueConstant.null;
				checkUserIsOnline(user);
				listTasks = loadTaskList();
				renderListTasks(listTasks);
			} else {
				alert('User not found or Email/Password incorrect!');
				emailInputLogin.value = valueConstant.null;
				passwordLoginField.value = valueConstant.null;
				return;
			}
		});
});

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

linkChangeFormRegister.addEventListener('click', function () {
	checkAvailableFormAndDisplay();
});

linkChangeFormLogin.addEventListener('click', function () {
	checkAvailableFormAndDisplay();
});

/**
 * CSS class active make field input beautiful
 */
inputTodo.addEventListener('keyup', function () {
	let enteredValues = inputTodo.value.trim();
	if (enteredValues) {
		addTodoButton.classList.add(valueConstant.active);
	} else {
		addTodoButton.classList.remove(valueConstant.active);
	}
});

/**
 * Handle event click on button addTask
 */
addTodoButton.addEventListener('click', async function () {
	let todoValue = inputTodo.value.trim();
	let newTask = {
		name: todoValue,
		user_id: user.id,
		completed: filterState.UNDONE,
	};
	const response = await fetch(`${urlAPI}/tasks`, {
		method: 'POST',
		headers: {
			authorization: JSON.parse(localStorage.getItem('Authorization')),
		},
		body: JSON.stringify(newTask),
	});
	if (!response.ok) {
		throw new Error('Network response was not ok');
	} else {
		addTodoButton.classList.remove(valueConstant.active);
		imageChibi.style.animation = 'chibi-swinging 3s linear 0s 1 normal none';
		setTimeout(function () {
			imageChibi.style.animation = valueConstant.null;
		}, 3100);
		inputTodo.value = valueConstant.null;
		listTasks = await loadTaskList();
		renderListTasks(listTasks);
	}
});

logoutButton.addEventListener('click', async function () {
	localStorage.removeItem('rememberedUser');
	sessionStorage.removeItem('currentSessionUser');
	const response = await fetch(`${urlAPI}/users/logout`, {
		method: 'POST',
		headers: {
			authorization: JSON.parse(localStorage.getItem('Authorization')),
		},
		body: JSON.stringify(user),
	});
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	localStorage.removeItem('Authorization');
	user = valueConstant.null;
	checkUserIsOnline(user);
	mainForm.style.display = valueConstant.flex;
	mainContent.style.display = valueConstant.none;
});
