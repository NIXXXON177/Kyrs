// Инициализация страницы плана обучения

document.addEventListener('DOMContentLoaded', function () {
	// Проверка авторизации
	if (!AuthManager.checkAuth()) {
		window.location.href = buildPathFromRoot('pages/auth/login.html')
		return
	}

	// Инициализация плана обучения
	if (typeof PlanManager !== 'undefined') {
		new PlanManager()
	}
})

