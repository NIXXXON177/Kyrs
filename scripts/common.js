// Общие функции для всех страниц

/**
 * Санитизация пользовательского ввода для защиты от XSS
 */
function sanitizeInput(input) {
	if (typeof input !== 'string') return input
	return input
		.replace(/</g, '<')
		.replace(/>/g, '>')
		.replace(/'/g, "'")
		.replace(/"/g, '"')
		.replace(/&/g, '&')
}

/**
 * Инициализация навигации и общих элементов
 */
function initCommon() {
	// Обновляем имя пользователя в header
	if (typeof AuthManager !== 'undefined') {
		AuthManager.updateUserNameInHeader()
	}

	// Обработчик выхода
	const logoutBtn = document.getElementById('logoutBtn')
	if (logoutBtn) {
		logoutBtn.addEventListener('click', () => {
			localStorage.removeItem('authToken')
			localStorage.removeItem('userData')
			// Определяем правильный путь в зависимости от текущей страницы
			const isMainPage =
				window.location.pathname.endsWith('index.html') ||
				window.location.pathname.endsWith('/')
			window.location.href = isMainPage ? 'pages/login.html' : 'login.html'
		})
	}

	// Мобильное меню
	const navToggle = document.getElementById('navToggle')
	const navMenu = document.getElementById('navMenu')
	if (navToggle && navMenu) {
		navToggle.addEventListener('click', () => {
			navMenu.classList.toggle('active')
			navToggle.classList.toggle('active')
		})
	}
}

// Preloader
window.addEventListener('load', function () {
	const preloader = document.getElementById('preloader')
	if (preloader) {
		setTimeout(() => {
			preloader.classList.add('hidden')
			setTimeout(() => {
				preloader.style.display = 'none'
			}, 500) // Match transition duration
		}, 2000) // Minimum show time
	}
})

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initCommon)
