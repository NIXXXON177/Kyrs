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
 * Получение роли пользователя
 */
function getUserRole() {
	const userData = AuthManager.getUserData()
	return userData?.employee?.position?.toLowerCase() || ''
}

/**
 * Проверка, является ли пользователь HR-менеджером
 */
function isHRManager() {
	return getUserRole().includes('hr')
}

/**
 * Проверка, является ли пользователь руководителем отдела
 */
function isDepartmentHead() {
	return getUserRole().includes('руководитель')
}

/**
 * Проверка доступа к страницам на стороне клиента
 */
function checkRolePageAccess() {
	const path = window.location.pathname.toLowerCase()
	const isHR = isHRManager()
	const isHead = isDepartmentHead()
	const isEmployee = !isHR && !isHead

	// Страницы для HR
	const hrPages = [
		'hr-dashboard.html',
		'course-management.html',
		'reports.html',
	]
	// Страницы для руководителя отдела
	const headPages = ['department-stats.html', 'team-management.html']
	// Страницы только для сотрудников (не для HR и руководителя)
	const employeeOnlyPages = ['courses.html', 'plan.html', 'course-details.html']

	// Проверка доступа
	if (hrPages.some(p => path.includes(p))) {
		if (!isHR) window.location.href = '../index.html'
	}
	if (headPages.some(p => path.includes(p))) {
		if (!isHead) window.location.href = '../index.html'
	}
	// HR и руководитель не могут заходить на страницы курсов
	if (employeeOnlyPages.some(p => path.includes(p))) {
		if (!isEmployee) window.location.href = '../index.html'
	}
}

/**
 * Инициализация навигации и общих элементов
 */
function initCommon() {
	checkRolePageAccess() // Новая проверка доступа
	// Обновляем имя пользователя в header
	if (typeof AuthManager !== 'undefined') {
		AuthManager.updateUserNameInHeader()
	}

	// Настройка меню в зависимости от роли
	setupRoleBasedMenu()

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

/**
 * Получение правильного пути к странице в зависимости от текущего местоположения
 */
function getPagePath(pageName) {
	const isInPagesFolder = window.location.pathname.includes('/pages/')
	return isInPagesFolder ? pageName : `pages/${pageName}`
}

/**
 * Настройка меню в зависимости от роли пользователя
 */
function setupRoleBasedMenu() {
	const navMenu = document.getElementById('navMenu')
	if (!navMenu) return

	// Удаляем существующие дополнительные ссылки (кроме основных)
	const existingExtraLinks = navMenu.querySelectorAll('.role-specific-link')
	existingExtraLinks.forEach(link => link.remove())

	// Скрываем "Мои курсы" и "План обучения" для HR и руководителя
	const coursesLink = navMenu.querySelector('a[href*="courses.html"]')
	const planLink = navMenu.querySelector('a[href*="plan.html"]')

	if (isHRManager() || isDepartmentHead()) {
		if (coursesLink) coursesLink.style.display = 'none'
		if (planLink) planLink.style.display = 'none'
	} else {
		if (coursesLink) coursesLink.style.display = ''
		if (planLink) planLink.style.display = ''
	}

	// Определяем текущую страницу для установки active класса
	const currentPath = window.location.pathname.toLowerCase()
	const isInPagesFolder = currentPath.includes('/pages/')

	// Убираем active класс со всех ссылок
	navMenu.querySelectorAll('.nav-link').forEach(link => {
		link.classList.remove('active')
	})

	// Добавляем ссылки в зависимости от роли
	if (isHRManager()) {
		// Меню для HR-менеджера
		const hrLinks = [
			{ path: 'hr-dashboard.html', text: 'Управление персоналом' },
			{ path: 'course-management.html', text: 'Управление курсами' },
			{ path: 'reports.html', text: 'Отчеты' },
		]

		hrLinks.forEach(linkData => {
			const link = document.createElement('a')
			link.href = getPagePath(linkData.path)
			link.className = 'nav-link role-specific-link'
			link.textContent = linkData.text

			// Устанавливаем active если это текущая страница
			if (currentPath.includes(linkData.path.toLowerCase())) {
				link.classList.add('active')
			}

			const userSection = navMenu.querySelector('.user-section')
			if (userSection) {
				userSection.insertAdjacentElement('beforebegin', link)
			}
		})
	} else if (isDepartmentHead()) {
		// Меню для руководителя отдела
		const managerLinks = [
			{ path: 'department-stats.html', text: 'Статистика отдела' },
			{ path: 'team-management.html', text: 'Управление командой' },
		]

		managerLinks.forEach(linkData => {
			const link = document.createElement('a')
			link.href = getPagePath(linkData.path)
			link.className = 'nav-link role-specific-link'
			link.textContent = linkData.text

			// Устанавливаем active если это текущая страница
			if (currentPath.includes(linkData.path.toLowerCase())) {
				link.classList.add('active')
			}

			const userSection = navMenu.querySelector('.user-section')
			if (userSection) {
				userSection.insertAdjacentElement('beforebegin', link)
			}
		})
	}

	// Устанавливаем active для базовых ссылок (только если не установлен для role-specific)
	const allLinks = navMenu.querySelectorAll(
		'.nav-link:not(.role-specific-link)'
	)
	const hasActiveRoleLink = navMenu.querySelector('.role-specific-link.active')

	allLinks.forEach(link => {
		const href = link.getAttribute('href') || ''
		const linkPath = href.toLowerCase()

		if (!hasActiveRoleLink) {
			// Для главной страницы
			if (
				(linkPath.includes('index.html') || linkPath === '../index.html') &&
				(currentPath.endsWith('/') || currentPath.endsWith('index.html'))
			) {
				link.classList.add('active')
			}
			// Для страницы курсов
			else if (
				linkPath.includes('courses.html') &&
				currentPath.includes('courses.html')
			) {
				link.classList.add('active')
			}
			// Для страницы плана
			else if (
				linkPath.includes('plan.html') &&
				currentPath.includes('plan.html')
			) {
				link.classList.add('active')
			}
		}
	})
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initCommon)
