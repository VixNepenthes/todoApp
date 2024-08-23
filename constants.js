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
const filterState = Object.freeze({
	DONE: 'done',
	UNDONE: 'undone',
	ALL: 'all',
});
const valueConstant = Object.freeze({
	none: 'none',
	null: '',
	block: 'block',
	flex: 'flex',
	active: 'active',
});
const urlAPI = 'http://localhost:3000';

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

let users, user;
let listTasks = [];
