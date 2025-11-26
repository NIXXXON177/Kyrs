// Общие функции для всех страниц

/**
 * Санитизация пользовательского ввода для защиты от XSS
 */
function sanitizeInput(input) {
	if (typeof input !== 'string') return input
	return input
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/'/g, '&#39;')
		.replace(/"/g, '&quot;')
		.replace(/&/g, '&amp;')
}

/**
 * Возвращает относительный путь от текущей страницы до корня проекта
 */
function getRelativeRootPath() {
	const pagesIndex = window.location.pathname.indexOf('/pages/')
	if (pagesIndex === -1) {
		return ''
	}

	const afterPages = window.location.pathname.slice(pagesIndex + 7)
	const segments = afterPages.split('/').filter(Boolean)

	if (!segments.length) {
		return ''
	}

	return '../'.repeat(segments.length)
}

/**
 * Строит путь от корня проекта с учетом текущей вложенности
 */
function buildPathFromRoot(relativePath) {
	const prefix = getRelativeRootPath()
	return `${prefix}${relativePath}`
}

const ASSIGNED_COURSES_STORAGE_KEY = 'assignedCoursesData'
const CUSTOM_COURSES_STORAGE_KEY = 'customCoursesData'

function loadAssignedCoursesData() {
	try {
		const raw = localStorage.getItem(ASSIGNED_COURSES_STORAGE_KEY)
		return raw ? JSON.parse(raw) : {}
	} catch (error) {
		console.error('Ошибка чтения назначенных курсов:', error)
		return {}
	}
}

function saveAssignedCoursesData(data) {
	try {
		localStorage.setItem(ASSIGNED_COURSES_STORAGE_KEY, JSON.stringify(data))
	} catch (error) {
		console.error('Ошибка сохранения назначенных курсов:', error)
	}
}

function addAssignedCourseRecord(employeeId, record) {
	if (!employeeId || !record || !record.courseId) return false

	const numericId = Number(employeeId)
	const data = loadAssignedCoursesData()
	const list = data[numericId] || []

	// Не допускаем повторного назначения одного и того же курса
	if (list.some(item => item.courseId === record.courseId)) {
		return false
	}

	list.push({
		acknowledged: false,
		...record,
	})
	data[numericId] = list
	saveAssignedCoursesData(data)
	return true
}

function getAssignedCourseRecords(employeeId) {
	if (!employeeId) return []
	const data = loadAssignedCoursesData()
	return data[Number(employeeId)] || []
}

function markAssignedCourseAcknowledged(employeeId, assignmentId) {
	if (!employeeId || !assignmentId) return
	const numericId = Number(employeeId)
	const data = loadAssignedCoursesData()
	const list = data[numericId]

	if (!list) return

	const updated = list.map(entry =>
		entry.id === assignmentId ? { ...entry, acknowledged: true } : entry
	)
	data[numericId] = updated
	saveAssignedCoursesData(data)
}

function updateAssignedCourseRecord(employeeId, courseId, updates = {}) {
	if (!employeeId || !courseId || !updates || typeof updates !== 'object') return

	const numericId = Number(employeeId)
	const data = loadAssignedCoursesData()
	const list = data[numericId]
	if (!list) return

	let changed = false
	data[numericId] = list.map(entry => {
		if (entry.courseId === courseId) {
			changed = true
			return { ...entry, ...updates }
		}
		return entry
	})

	if (changed) {
		saveAssignedCoursesData(data)
	}
}

function loadCustomCoursesData() {
	try {
		const raw = localStorage.getItem(CUSTOM_COURSES_STORAGE_KEY)
		return raw ? JSON.parse(raw) : []
	} catch (error) {
		console.error('Ошибка чтения пользовательских курсов:', error)
		return []
	}
}

function saveCustomCoursesData(data) {
	try {
		localStorage.setItem(CUSTOM_COURSES_STORAGE_KEY, JSON.stringify(data))
	} catch (error) {
		console.error('Ошибка сохранения пользовательских курсов:', error)
	}
}

function syncCustomCoursesWithMockDB() {
	if (!window.MockDB || !Array.isArray(window.MockDB.Courses)) return

	const customCourses = loadCustomCoursesData()
	customCourses.forEach(course => {
		if (!course || !course.id) return
		const index = window.MockDB.Courses.findIndex(c => c.id === course.id)
		if (index > -1) {
			window.MockDB.Courses[index] = { ...window.MockDB.Courses[index], ...course }
		} else {
			window.MockDB.Courses.push(course)
		}
	})
}

function upsertCustomCourseData(course) {
	if (!course || !course.id) return
	const list = loadCustomCoursesData()
	const index = list.findIndex(c => c.id === course.id)
	if (index > -1) {
		list[index] = course
	} else {
		list.push(course)
	}
	saveCustomCoursesData(list)
	if (window.MockDB && Array.isArray(window.MockDB.Courses)) {
		const existingIndex = window.MockDB.Courses.findIndex(c => c.id === course.id)
		if (existingIndex > -1) {
			window.MockDB.Courses[existingIndex] = course
		} else {
			window.MockDB.Courses.push(course)
		}
	}
}

function removeCustomCourseData(courseId) {
	if (!courseId) return
	const filtered = loadCustomCoursesData().filter(c => c.id !== courseId)
	saveCustomCoursesData(filtered)
	if (window.MockDB && Array.isArray(window.MockDB.Courses)) {
		window.MockDB.Courses = window.MockDB.Courses.filter(c => c.id !== courseId)
	}
}

function syncAssignedCoursesWithMockDB() {
	if (
		!window.MockDB ||
		!window.MockDB.CourseUsers ||
		!Array.isArray(window.MockDB.CourseUsers)
	) {
		return
	}

	const data = loadAssignedCoursesData()
	Object.entries(data).forEach(([employeeId, assignments]) => {
		assignments.forEach(entry => {
			const numericId = Number(employeeId)
			let assignment = window.MockDB.CourseUsers.find(
				cu => cu.userId === numericId && cu.courseId === entry.courseId
			)

			if (!assignment) {
				const startDate =
					entry.startDate ||
					(entry.assignedAt ? entry.assignedAt.split('T')[0] : '')
				assignment = {
					userId: numericId,
					courseId: entry.courseId,
					status: entry.status || 'назначен',
					progress:
						typeof entry.progress === 'number' ? entry.progress : 0,
					start: startDate,
					due: entry.dueDate || '',
				}
				window.MockDB.CourseUsers.push(assignment)
			} else {
				if (entry.status) {
					assignment.status = entry.status
				}
				if (typeof entry.progress === 'number') {
					assignment.progress = entry.progress
				}
				if (entry.startDate) {
					assignment.start = entry.startDate
				}
				if (entry.dueDate) {
					assignment.due = entry.dueDate
				}
			}
		})
	})
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
		if (!isHR) window.location.href = buildPathFromRoot('index.html')
	}
	if (headPages.some(p => path.includes(p))) {
		if (!isHead) window.location.href = buildPathFromRoot('index.html')
	}
	// HR и руководитель не могут заходить на страницы курсов
	if (employeeOnlyPages.some(p => path.includes(p))) {
		if (!isEmployee) window.location.href = buildPathFromRoot('index.html')
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

	// Клик по логотипу: переход в "домашнюю" страницу по роли
	const logoLink = document.querySelector('.nav-logo a')
	if (logoLink) {
		logoLink.addEventListener('click', e => {
			e.preventDefault()

			let target
			if (isHRManager()) {
				// HR-менеджер → управление персоналом
				target = getPagePath('hr/hr-dashboard.html')
			} else if (isDepartmentHead()) {
				// Руководитель отдела → статистика отдела
				target = getPagePath('manager/department-stats.html')
			} else {
				// Обычный сотрудник → личный кабинет
				target = buildPathFromRoot('index.html')
			}

			window.location.href = target
		})
	}

	// Настройка меню в зависимости от роли
	setupRoleBasedMenu()

	// Обработчик выхода
	const logoutBtn = document.getElementById('logoutBtn')
	if (logoutBtn) {
		logoutBtn.addEventListener('click', () => {
			localStorage.removeItem('authToken')
			localStorage.removeItem('userData')
			window.location.href = buildPathFromRoot('pages/auth/login.html')
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
	return buildPathFromRoot(`pages/${pageName}`)
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
			{ path: 'hr/hr-dashboard.html', text: 'Управление персоналом' },
			{ path: 'hr/course-management.html', text: 'Управление курсами' },
			{ path: 'hr/reports.html', text: 'Отчеты' },
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
			{ path: 'manager/department-stats.html', text: 'Статистика отдела' },
			{ path: 'manager/team-management.html', text: 'Управление командой' },
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
				linkPath.includes('index.html') &&
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

syncCustomCoursesWithMockDB()
syncAssignedCoursesWithMockDB()

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initCommon)
