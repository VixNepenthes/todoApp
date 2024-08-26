window.addEventListener('DOMContentLoaded', async function () {
	const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser'));
	const currentSessionUser = JSON.parse(
		sessionStorage.getItem('currentSessionUser')
	);
	if (rememberedUser || currentSessionUser) {
		mainForm.style.display = valueConstant.none;
		mainContent.style.display = valueConstant.block;
		user = rememberedUser || currentSessionUser || '';
		checkUserIsOnline(user);
		await loadTaskList();
		renderListTasks(listTasks);
	} else {
		checkUserIsOnline(user);
	}
});

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
	const xhr = new XMLHttpRequest();
	xhr.open('GET', `${urlAPI}/tasks`, false);
	xhr.setRequestHeader(
		'Authorization',
		JSON.parse(localStorage.getItem('Authorization'))
	);

	xhr.onload = function () {
		if (xhr.status >= 200 && xhr.status < 300) {
			const data = JSON.parse(xhr.responseText);
			listTasks = data;
		} else {
			throw new Error('Network response was not ok');
		}
	};

	xhr.onerror = function () {
		throw new Error('Network request failed');
	};
	xhr.send();
}
/**
 * Depend on filterStatus value, we choose task to render!
 */
filterStatus.addEventListener('change', function () {
	let tasks;
	const filterStatusValue = filterStatus.value;
	if (filterStatusValue === filterState.DONE) {
		tasks = listTasks.filter((task) => task.completed === filterState.DONE);
	} else if (filterStatusValue === filterState.UNDONE) {
		tasks = listTasks.filter((task) => task.completed === filterState.UNDONE);
	} else {
		tasks = listTasks;
	}
	renderListTasks(tasks);
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
            type="checkbox" ${item.completed == filterState.DONE
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
	const xhr = new XMLHttpRequest();
	xhr.open('PUT', `${urlAPI}/tasks/toggle-task`, false);
	xhr.setRequestHeader('Authorization', JSON.parse(localStorage.getItem('Authorization')));
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.onload = function () {
		if (xhr.status >= 200 && xhr.status <= 299) {
			alert(JSON.parse(xhr.responseText));
		} else {
			throw new Error('Network response was not ok');
		}
	};
	xhr.onerror = function () {
		throw new Error('Network request failed');
	};
	xhr.send(JSON.stringify(id));
	await loadTaskList();
	filterStatus.value = filterState.ALL;
	filterStatus.dispatchEvent(new Event('change'));
}

async function deleteTask(id) {
	const xhr = new XMLHttpRequest();
	xhr.open('DELETE', `${urlAPI}/tasks`, false);
	xhr.setRequestHeader(
		'Authorization',
		JSON.parse(localStorage.getItem('Authorization'))
	);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.onload = function () {
		if (xhr.status >= 200 && xhr.status < 300) {
			alert(JSON.parse(xhr.responseText));
		}
	};
	xhr.onerror = function () {
		throw new Error('Network request failed');
	};
	xhr.send(JSON.stringify(id));
	await loadTaskList();
	renderListTasks(listTasks);
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
					await loadTaskList();
					renderListTasks(listTasks);
				}
			}
		});
	}
}

deleteAllTasksButton.addEventListener('click', async function () {
	if (confirm('Delete All?')) {
		const xhr = new XMLHttpRequest();
		xhr.open('DELETE', `${urlAPI}/tasks/delete-all-tasks`, false);
		xhr.setRequestHeader('Authorization', JSON.parse(localStorage.getItem('Authorization')));
		xhr.setRequestHeader('Content-type', 'application/json');
		xhr.onload = function () {
			if (xhr.status >= 200 && xhr.status < 300) {
				alert(JSON.parse(xhr.responseText));
			} else {
				throw new Error('Network response was not ok');
			}
		};
		xhr.onerror = function () {
			throw new Error('Network request failed');
		};
		xhr.send(JSON.stringify(user.id));
		imageChibi.style.animation = 'chibi-angrying 1s linear 0s 1 normal none';
		setTimeout(function () {
			imageChibi.style.animation = valueConstant.null;
		}, 3100);
		await loadTaskList();
		renderListTasks(listTasks);
	}
});


inputTodo.addEventListener('keyup', function () {
	let enteredValues = inputTodo.value.trim();
	if (enteredValues) {
		addTodoButton.classList.add(valueConstant.active);
	} else {
		addTodoButton.classList.remove(valueConstant.active);
	}
});

addTodoButton.addEventListener('click', async function () {
	let todoValue = inputTodo.value.trim();
	let newTask = {
		name: todoValue,
		user_id: user.id,
		completed: filterState.UNDONE,
	};
	const xhr = new XMLHttpRequest();
	xhr.open('POST', `${urlAPI}/tasks`, false);
	xhr.setRequestHeader(
		'Authorization',
		JSON.parse(localStorage.getItem('Authorization'))
	);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.onload = function () {
		if (xhr.status >= 200 && xhr.status < 300) {
			addTodoButton.classList.remove(valueConstant.active);
			imageChibi.style.animation = 'chibi-swinging 3s linear 0s 1 normal none';
			setTimeout(function () {
				imageChibi.style.animation = valueConstant.null;
			}, 3100);
		} else {
			throw new Error('Network response was not ok');
		}
	};

	xhr.onerror = function () {
		throw new Error('Network request failed');
	};
	xhr.send(JSON.stringify(newTask));
	inputTodo.value = valueConstant.null;
	await loadTaskList();
	renderListTasks(listTasks);
});
