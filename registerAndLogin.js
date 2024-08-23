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
		.then(async (data) => {
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
				await loadTaskList();
				renderListTasks(listTasks);
			} else {
				alert('User not found or Email/Password incorrect!');
				emailInputLogin.value = valueConstant.null;
				passwordLoginField.value = valueConstant.null;
				return;
			}
		});
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
