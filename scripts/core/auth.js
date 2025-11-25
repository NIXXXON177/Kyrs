// Модуль авторизации

class AuthManager {
	// Функция для расчета общего прогресса
	calculateOverallProgress(courses) {
		if (!courses || courses.length === 0) return 0

		const totalCourses = courses.length
		const completedCourses = courses.filter(
			course => course.status === 'пройден'
		).length

		return Math.round((completedCourses / totalCourses) * 100)
	}
	constructor() {
		this.init()
	}

	init() {
		if (window.location.pathname.includes('login.html')) {
			if (AuthManager.checkAuth()) {
				// Если пользователь уже авторизован, перенаправляем в кабинет по роли
				const userData = AuthManager.getUserData()
				const position =
					(userData && userData.employee && userData.employee.position) || ''
				const positionLower = position.toLowerCase()

				let targetPath = '../index.html'

				if (positionLower.includes('hr')) {
					// HR-менеджер → управление персоналом
					targetPath = 'hr-dashboard.html'
				} else if (positionLower.includes('руководитель')) {
					// Руководитель отдела → статистика отдела
					targetPath = 'department-stats.html'
				}

				window.location.href = targetPath
				return
			}
			this.setupLoginForm()
		}
	}

	setupLoginForm() {
		const loginForm = document.getElementById('loginForm')

		if (loginForm) {
			loginForm.addEventListener('submit', e => {
				e.preventDefault()
				this.handleLogin()
			})
		}
	}

	async handleLogin() {
		const loginInput = document.getElementById('login')
		const passwordInput = document.getElementById('password')
		const errorDiv = document.getElementById('loginError')

		const login = sanitizeInput(loginInput.value.trim())
		const password = sanitizeInput(passwordInput.value)

		if (errorDiv) {
			errorDiv.classList.add('hidden')
		}

		if (!login || !password) {
			this.showError('Заполните все поля')
			return
		}

		try {
			const authResult = await this.mockAuthRequest(login, password)

			if (authResult.success) {
				localStorage.setItem('authToken', authResult.token)
				localStorage.setItem('userData', JSON.stringify(authResult.userData))

				// Определяем страницу назначения в зависимости от роли
				const employee = authResult.userData && authResult.userData.employee
				const position = (employee && employee.position) || ''
				const positionLower = position.toLowerCase()

				let targetPath = '../index.html'

				if (positionLower.includes('hr')) {
					// HR-менеджер → управление персоналом
					targetPath = 'hr-dashboard.html'
				} else if (positionLower.includes('руководитель')) {
					// Руководитель отдела → статистика отдела
					targetPath = 'department-stats.html'
				}

				window.location.href = targetPath
			} else {
				this.showError(authResult.message || 'Ошибка авторизации')
			}
		} catch (error) {
			console.error('Ошибка авторизации:', error)
			this.showError('Ошибка соединения с сервером')
		}
	}

	async mockAuthRequest(login, password) {
		await new Promise(resolve => setTimeout(resolve, 1000))

		// Общие курсы для всех пользователей
		const commonCourses = [
			{
				id: 1,
				title: 'IT-безопасность',
				status: 'пройден',
				start_date: '2024-01-15',
				due_date: '2025-01-15',
				progress: 100,
				description: 'Курс по основам информационной безопасности',
				modules: [
					{
						title: 'Введение в IT-безопасность',
						type: 'video',
						duration: '15 мин',
						completed: true,
						content:
							'В этом модуле вы узнаете основы информационной безопасности...',
					},
					{
						title: 'Пароли и аутентификация',
						type: 'text',
						duration: '20 мин',
						completed: true,
						content: 'Пароли являются первым рубежом защиты...',
					},
					{
						title: 'Защита от вредоносного ПО',
						type: 'video',
						duration: '25 мин',
						completed: true,
						content: 'Вирус, трояны, ransomware...',
					},
				],
			},
			{
				id: 2,
				title: 'Работа с Laravel',
				status: 'в процессе',
				start_date: '2025-03-01',
				due_date: '2025-06-01',
				progress: 33,
				description: 'Изучение фреймворка Laravel для веб-разработки',
				modules: [
					{
						title: 'Установка и настройка Laravel',
						type: 'text',
						duration: '30 мин',
						completed: true,
						content: 'Установка Composer, создание нового проекта Laravel...',
					},
					{
						title: 'Маршрутизация и контроллеры',
						type: 'video',
						duration: '45 мин',
						completed: false,
						content: 'Основы маршрутизации в Laravel...',
					},
					{
						title: 'Работа с базой данных',
						type: 'text',
						duration: '40 мин',
						completed: false,
						content: 'Миграции, модели Eloquent...',
					},
				],
			},
			{
				id: 3,
				title: 'Git и командная разработка',
				status: 'назначен',
				start_date: '2025-04-10',
				due_date: '2025-07-10',
				progress: 0,
				description: 'Освоение системы контроля версий и совместной работы',
				modules: [
					{
						title: 'Основы Git',
						type: 'video',
						duration: '35 мин',
						completed: false,
						content: 'Что такое Git, установка, базовые команды...',
					},
					{
						title: 'Ветки и слияние',
						type: 'text',
						duration: '30 мин',
						completed: false,
						content: 'Работа с ветками, merge и rebase...',
					},
				],
			},
			{
				id: 4,
				title: 'Основы Docker',
				status: 'в процессе',
				start_date: '2025-02-01',
				due_date: '2025-05-01',
				progress: 50,
				description: 'Контейнеризация приложений и развёртывание микросервисов',
				modules: [
					{
						title: 'Что такое Docker',
						type: 'video',
						duration: '20 мин',
						completed: true,
						content: 'Контейнеризация vs виртуализация...',
					},
					{
						title: 'Создание Dockerfile',
						type: 'text',
						duration: '35 мин',
						completed: false,
						content: 'Написание Dockerfile, основные инструкции...',
					},
				],
			},
			{
				id: 5,
				title: 'SQL и оптимизация запросов',
				status: 'пройден',
				start_date: '2024-09-01',
				due_date: '2024-12-01',
				progress: 100,
				description: 'Продвинутые техники работы с базами данных',
				modules: [
					{
						title: 'Индексы и оптимизация',
						type: 'video',
						duration: '40 мин',
						completed: true,
						content: 'Типы индексов, EXPLAIN план...',
					},
					{
						title: 'Транзакции и ACID',
						type: 'text',
						duration: '25 мин',
						completed: true,
						content: 'Принципы ACID, уровни изоляции...',
					},
				],
			},
			{
				id: 6,
				title: 'JavaScript: углублённый курс',
				status: 'в процессе',
				start_date: '2025-01-20',
				due_date: '2025-04-20',
				progress: 67,
				description: 'Замыкания, асинхронность, TypeScript basics',
				modules: [
					{
						title: 'Замыкания и scope',
						type: 'video',
						duration: '50 мин',
						completed: true,
						content: 'Лексическое окружение, замыкания...',
					},
					{
						title: 'Promises и async/await',
						type: 'text',
						duration: '45 мин',
						completed: true,
						content: 'Асинхронное программирование...',
					},
					{
						title: 'Введение в TypeScript',
						type: 'video',
						duration: '60 мин',
						completed: false,
						content: 'Типизация, интерфейсы, generics...',
					},
				],
			},
			{
				id: 7,
				title: 'DevOps-практики',
				status: 'назначен',
				start_date: '2025-05-15',
				due_date: '2025-08-15',
				progress: 0,
				description: 'CI/CD, автоматизация развёртывания, мониторинг',
				modules: [
					{
						title: 'CI/CD конвейеры',
						type: 'video',
						duration: '55 мин',
						completed: false,
						content: 'Непрерывная интеграция и доставка...',
					},
				],
			},
			{
				id: 8,
				title: 'Архитектура ПО',
				status: 'просрочен',
				start_date: '2024-06-01',
				due_date: '2024-11-30',
				progress: 0,
				description: 'Паттерны проектирования, SOLID, микросервисы',
				modules: [
					{
						title: 'SOLID принципы',
						type: 'text',
						duration: '40 мин',
						completed: false,
						content: 'Принципы SOLID...',
					},
					{
						title: 'Паттерны проектирования',
						type: 'video',
						duration: '70 мин',
						completed: false,
						content: 'Singleton, Factory, Observer...',
					},
				],
			},
		]

		// Курсы для HR менеджера
		const hrCourses = [
			{
				id: 9,
				title: 'Управление персоналом',
				status: 'пройден',
				start_date: '2024-02-01',
				due_date: '2025-02-01',
				progress: 100,
				description: 'Основы управления человеческими ресурсами',
				modules: [
					{
						title: 'Введение в HR',
						type: 'video',
						duration: '20 мин',
						completed: true,
						content: 'Роль HR в современной организации...',
					},
					{
						title: 'Подбор персонала',
						type: 'text',
						duration: '30 мин',
						completed: true,
						content: 'Процессы рекрутинга и отбора...',
					},
				],
			},
			{
				id: 10,
				title: 'Трудовое законодательство',
				status: 'в процессе',
				start_date: '2025-01-15',
				due_date: '2025-04-15',
				progress: 60,
				description: 'Актуальные нормы трудового права',
				modules: [
					{
						title: 'Основы ТК РФ',
						type: 'video',
						duration: '45 мин',
						completed: true,
						content: 'Ключевые положения Трудового кодекса...',
					},
					{
						title: 'Охрана труда',
						type: 'text',
						duration: '35 мин',
						completed: false,
						content: 'Требования к охране труда...',
					},
				],
			},
			{
				id: 11,
				title: 'Мотивация и развитие сотрудников',
				status: 'назначен',
				start_date: '2025-03-01',
				due_date: '2025-06-01',
				progress: 0,
				description: 'Системы мотивации и карьерного роста',
				modules: [
					{
						title: 'Теории мотивации',
						type: 'video',
						duration: '40 мин',
						completed: false,
						content: 'Теории Маслоу, Герцберга...',
					},
				],
			},
		]

		// Курсы для руководителя отдела
		const managerCourses = [
			{
				id: 12,
				title: 'Управление IT-проектами',
				status: 'пройден',
				start_date: '2024-03-01',
				due_date: '2025-03-01',
				progress: 100,
				description: 'Методологии управления проектами в IT',
				modules: [
					{
						title: 'Agile и Scrum',
						type: 'video',
						duration: '50 мин',
						completed: true,
						content: 'Основы гибких методологий...',
					},
					{
						title: 'Планирование проектов',
						type: 'text',
						duration: '40 мин',
						completed: true,
						content: 'Создание плана проекта...',
					},
				],
			},
			{
				id: 13,
				title: 'Лидерство и управление командой',
				status: 'в процессе',
				start_date: '2025-02-01',
				due_date: '2025-05-01',
				progress: 75,
				description: 'Навыки эффективного руководства',
				modules: [
					{
						title: 'Стили лидерства',
						type: 'video',
						duration: '45 мин',
						completed: true,
						content: 'Авторитарный, демократический стили...',
					},
					{
						title: 'Мотивация команды',
						type: 'text',
						duration: '35 мин',
						completed: true,
						content: 'Как мотивировать сотрудников...',
					},
					{
						title: 'Конфликтология',
						type: 'video',
						duration: '40 мин',
						completed: false,
						content: 'Управление конфликтами в команде...',
					},
				],
			},
			{
				id: 14,
				title: 'Стратегическое планирование',
				status: 'назначен',
				start_date: '2025-04-01',
				due_date: '2025-07-01',
				progress: 0,
				description: 'Разработка стратегии развития отдела',
				modules: [
					{
						title: 'SWOT-анализ',
						type: 'text',
						duration: '30 мин',
						completed: false,
						content: 'Методика SWOT-анализа...',
					},
				],
			},
		]

		const mockUsers = {
			petrov: {
				password: 'password123',
				userData: {
					employee: {
						name: 'Петров Алексей Владимирович',
						position: 'инженер-программист',
						department: 'IT-отдел',
						email: 'a.petrov@technoline.ru',
					},
					courses: commonCourses,
					progress: this.calculateOverallProgress(commonCourses),
				},
			},
			ivanov: {
				password: 'password123',
				userData: {
					employee: {
						name: 'Иванов Сергей Петрович',
						position: 'ведущий разработчик',
						department: 'IT-отдел',
						email: 's.ivanov@technoline.ru',
					},
					courses: commonCourses,
					progress: this.calculateOverallProgress(commonCourses),
				},
			},
			sidorova: {
				password: 'password123',
				userData: {
					employee: {
						name: 'Сидорова Анна Михайловна',
						position: 'HR менеджер',
						department: 'Отдел кадров',
						email: 'a.sidorova@technoline.ru',
					},
					courses: [], // HR не проходят курсы - только назначают их
					progress: 0,
				},
			},
			kuznetsov: {
				password: 'password123',
				userData: {
					employee: {
						name: 'Кузнецов Дмитрий Александрович',
						position: 'руководитель отдела',
						department: 'IT-отдел',
						email: 'd.kuznetsov@technoline.ru',
					},
					courses: [], // Руководитель не проходят курсы - только смотрит успеваемость
					progress: 0,
				},
			},
		}

		const user = mockUsers[login.toLowerCase()]

		if (user && user.password === password) {
			return {
				success: true,
				token: 'mock-jwt-token-' + Date.now(),
				userData: user.userData,
			}
		} else {
			return {
				success: false,
				message: 'Неверный логин или пароль',
			}
		}
	}

	showError(message) {
		const errorDiv = document.getElementById('loginError')

		if (errorDiv) {
			errorDiv.textContent = message
			errorDiv.classList.remove('hidden')
		} else {
			const errorElement = document.createElement('div')
			errorElement.className = 'notification error'
			errorElement.innerHTML = `
                <div class="notification-icon">⚠️</div>
                <div class="notification-content">
                    <h4>Ошибка авторизации</h4>
                    <p>${message}</p>
                </div>
            `

			const form = document.getElementById('loginForm')
			if (form) {
				form.prepend(errorElement)

				setTimeout(() => {
					errorElement.remove()
				}, 5000)
			}
		}
	}
	static checkAuth() {
		const token = localStorage.getItem('authToken')
		return !!token
	}

	static getUserData() {
		try {
			return JSON.parse(localStorage.getItem('userData'))
		} catch {
			return null
		}
	}

	/**
	 * Обновляет имя пользователя в header на всех страницах
	 */
	static updateUserNameInHeader() {
		const userData = AuthManager.getUserData()
		const userNameElement = document.getElementById('userName')

		if (userNameElement && userData && userData.employee) {
			const fullName = userData.employee.name
			const nameParts = fullName.split(' ')

			// Форматируем имя в формате "Фамилия И."
			if (nameParts.length >= 2) {
				const lastName = nameParts[0]
				const firstNameInitial = nameParts[1].charAt(0) + '.'
				userNameElement.textContent = `${lastName} ${firstNameInitial}`
			} else {
				userNameElement.textContent = fullName
			}
		}
	}
}

if (window.location.pathname.includes('login.html')) {
	document.addEventListener('DOMContentLoaded', () => {
		new AuthManager()
	})
}
