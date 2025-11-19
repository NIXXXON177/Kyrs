class MainApp {
	constructor() {
		this.employeeData = null
		this.init()
	}

	// Функция для расчета общего прогресса
	calculateOverallProgress(courses) {
		if (!courses || courses.length === 0) return 0

		const totalCourses = courses.length
		const completedCourses = courses.filter(
			course => course.status === 'пройден'
		).length

		return Math.round((completedCourses / totalCourses) * 100)
	}

	// Функция для расчета прогресса курса на основе модулей
	calculateCourseProgress(course) {
		if (
			!course.modules ||
			!Array.isArray(course.modules) ||
			course.modules.length === 0
		) {
			return course.status === 'пройден' ? 100 : 0
		}

		const totalModules = course.modules.length
		const completedModules = course.modules.filter(m => m && m.completed).length

		return Math.round((completedModules / totalModules) * 100)
	}

	async init() {
		if (!this.checkAuth()) {
			window.location.href = 'pages/login.html'
			return
		}

		this.createGlassEffect()

		await this.loadEmployeeData()

		this.renderEmployeeInfo()
		this.renderProgress()
		this.renderActiveCourses()

		if (typeof NotificationManager !== 'undefined') {
			new NotificationManager(this.employeeData)
		}
	}

	createGlassEffect() {
		const glassBg = document.createElement('div')
		glassBg.className = 'glass-bg'

		for (let i = 0; i < 4; i++) {
			const bubble = document.createElement('div')
			bubble.className = 'glass-bubble'
			glassBg.appendChild(bubble)
		}

		document.body.appendChild(glassBg)
	}

	checkAuth() {
		const token = localStorage.getItem('authToken')
		const userData = localStorage.getItem('userData')

		if (!token || !userData) {
			return false
		}

		try {
			this.employeeData = JSON.parse(userData)
			return true
		} catch (error) {
			console.error('Ошибка парсинга данных пользователя:', error)
			return false
		}
	}

	async loadEmployeeData() {
		try {
			// Данные уже загружены из localStorage при авторизации
			// Если курсов нет, добавляем mock данные
			if (!this.employeeData.courses) {
				this.employeeData.courses = [
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
									'В этом модуле вы узнаете основы информационной безопасности, включая основные угрозы и принципы защиты.',
							},
							{
								title: 'Пароли и аутентификация',
								type: 'text',
								duration: '20 мин',
								completed: true,
								content:
									'Пароли являются первым рубежом защиты. Узнайте, как создавать сильные пароли и использовать многофакторную аутентификацию.',
							},
							{
								title: 'Защита от вредоносного ПО',
								type: 'video',
								duration: '25 мин',
								completed: true,
								content:
									'Вирус, трояны, ransomware - основные виды вредоносного ПО и способы защиты от них.',
							},
						],
					},
					{
						id: 2,
						title: 'Работа с Laravel',
						status: 'в процессе',
						start_date: '2025-03-01',
						due_date: '2025-06-01',
						progress: 45,
						description: 'Изучение фреймворка Laravel для веб-разработки',
						modules: [
							{
								title: 'Установка и настройка Laravel',
								type: 'text',
								duration: '30 мин',
								completed: true,
								content:
									'Установка Composer, создание нового проекта Laravel, базовая конфигурация.',
							},
							{
								title: 'Маршрутизация и контроллеры',
								type: 'video',
								duration: '45 мин',
								completed: false,
								content:
									'Основы маршрутизации в Laravel, создание контроллеров и обработка HTTP запросов.',
							},
							{
								title: 'Работа с базой данных',
								type: 'text',
								duration: '40 мин',
								completed: false,
								content: 'Миграции, модели Eloquent, запросы к базе данных.',
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
								content:
									'Что такое Git, установка, базовые команды: init, add, commit, status.',
							},
							{
								title: 'Ветки и слияние',
								type: 'text',
								duration: '30 мин',
								completed: false,
								content:
									'Работа с ветками, merge и rebase, разрешение конфликтов.',
							},
						],
					},
					{
						id: 4,
						title: 'Основы Docker',
						status: 'в процессе',
						start_date: '2025-02-01',
						due_date: '2025-05-01',
						progress: 30,
						description:
							'Контейнеризация приложений и развёртывание микросервисов',
						modules: [
							{
								title: 'Что такое Docker',
								type: 'video',
								duration: '20 мин',
								completed: true,
								content:
									'Контейнеризация vs виртуализация, преимущества Docker.',
							},
							{
								title: 'Создание Dockerfile',
								type: 'text',
								duration: '35 мин',
								completed: false,
								content:
									'Написание Dockerfile, основные инструкции, best practices.',
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
								content: 'Типы индексов, EXPLAIN план, оптимизация запросов.',
							},
							{
								title: 'Транзакции и ACID',
								type: 'text',
								duration: '25 мин',
								completed: true,
								content: 'Принципы ACID, уровни изоляции транзакций.',
							},
						],
					},
					{
						id: 6,
						title: 'JavaScript: углублённый курс',
						status: 'в процессе',
						start_date: '2025-01-20',
						due_date: '2025-04-20',
						progress: 75,
						description: 'Замыкания, асинхронность, TypeScript basics',
						modules: [
							{
								title: 'Замыкания и scope',
								type: 'video',
								duration: '50 мин',
								completed: true,
								content:
									'Лексическое окружение, замыкания, поднятие переменных.',
							},
							{
								title: 'Promises и async/await',
								type: 'text',
								duration: '45 мин',
								completed: true,
								content:
									'Асинхронное программирование в JavaScript, обработка ошибок.',
							},
							{
								title: 'Введение в TypeScript',
								type: 'video',
								duration: '60 мин',
								completed: false,
								content: 'Типизация, интерфейсы, generics в TypeScript.',
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
								content:
									'Непрерывная интеграция и доставка, инструменты Jenkins, GitLab CI.',
							},
						],
					},
					{
						id: 8,
						title: 'Архитектура ПО',
						status: 'просрочен',
						start_date: '2024-06-01',
						due_date: '2024-11-30',
						progress: 20,
						description: 'Паттерны проектирования, SOLID, микросервисы',
						modules: [
							{
								title: 'SOLID принципы',
								type: 'text',
								duration: '40 мин',
								completed: false,
								content:
									'Принципы SOLID: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.',
							},
							{
								title: 'Паттерны проектирования',
								type: 'video',
								duration: '70 мин',
								completed: false,
								content:
									'Singleton, Factory, Observer, Strategy и другие паттерны.',
							},
						],
					},
				]

				// Пересчитываем прогресс курсов на основе модулей
				this.employeeData.courses.forEach(course => {
					course.progress = this.calculateCourseProgress(course)
				})

				// Обновляем общий прогресс
				this.employeeData.progress = this.calculateOverallProgress(
					this.employeeData.courses
				)

				// Сохраняем обновленные данные
				localStorage.setItem('userData', JSON.stringify(this.employeeData))
			}
		} catch (error) {
			console.error('Ошибка загрузки данных:', error)
			this.showError('Не удалось загрузить данные')
		}
	}

	renderEmployeeInfo() {
		const container = document.getElementById('employeeInfo')
		if (!container || !this.employeeData) return

		const { employee } = this.employeeData

		while (container.firstChild) {
			container.removeChild(container.firstChild)
		}

		const detailsDiv = document.createElement('div')
		detailsDiv.className = 'employee-details'

		const fields = [
			{ label: 'ФИО', value: employee.name },
			{ label: 'Должность', value: employee.position },
			{ label: 'Подразделение', value: employee.department },
			{ label: 'Email', value: employee.email },
		]

		fields.forEach(field => {
			const p = document.createElement('p')
			const strong = document.createElement('strong')
			strong.textContent = `${field.label}: `
			p.appendChild(strong)
			p.appendChild(document.createTextNode(field.value))
			detailsDiv.appendChild(p)
		})

		container.appendChild(detailsDiv)
	}

	renderProgress() {
		const progressPercent = document.getElementById('progressPercent')
		const progressFill = document.getElementById('progressFill')

		if (!progressPercent || !progressFill || !this.employeeData) return

		const progress = this.employeeData.progress || 0

		progressPercent.textContent = `${progress}%`
		progressFill.style.width = `${progress}%`
	}

	renderActiveCourses() {
		const container = document.getElementById('activeCourses')
		if (!container || !this.employeeData) return

		const activeCourses = this.employeeData.courses.slice(0, 3)

		while (container.firstChild) {
			container.removeChild(container.firstChild)
		}

		if (activeCourses.length === 0) {
			const emptyMessage = document.createElement('p')
			emptyMessage.className = 'text-center'
			emptyMessage.textContent = 'Нет активных курсов'
			container.appendChild(emptyMessage)
			return
		}

		activeCourses.forEach(course => {
			const courseCard = this.createCourseCard(course)
			container.appendChild(courseCard)
		})
	}

	createCourseCard(course) {
		const card = document.createElement('div')
		card.className = 'card course-card'
		card.addEventListener('click', () => {
			window.location.href = `pages/course-details.html?id=${course.id}`
		})

		const title = document.createElement('h3')
		title.className = 'course-title'
		title.textContent = course.title

		const status = document.createElement('div')
		status.className = `course-status ${this.getStatusClass(course.status)}`
		status.textContent = this.getStatusText(course.status)

		const meta = document.createElement('div')
		meta.className = 'course-meta'

		const startDate = document.createElement('p')
		const startStrong = document.createElement('strong')
		startStrong.textContent = 'Дата начала: '
		startDate.appendChild(startStrong)
		startDate.appendChild(
			document.createTextNode(this.formatDate(course.start_date))
		)

		const dueDate = document.createElement('p')
		const dueStrong = document.createElement('strong')
		dueStrong.textContent = 'Срок окончания: '
		dueDate.appendChild(dueStrong)
		dueDate.appendChild(
			document.createTextNode(this.formatDate(course.due_date))
		)

		meta.appendChild(startDate)
		meta.appendChild(dueDate)

		if (course.progress > 0) {
			const progress = document.createElement('p')
			const progressStrong = document.createElement('strong')
			progressStrong.textContent = 'Прогресс: '
			progress.appendChild(progressStrong)
			progress.appendChild(document.createTextNode(`${course.progress}%`))
			meta.appendChild(progress)
		}

		card.appendChild(title)
		card.appendChild(status)
		card.appendChild(meta)

		return card
	}

	getStatusClass(status) {
		switch (status) {
			case 'пройден':
				return 'status-completed'
			case 'в процессе':
				return 'status-in-progress'
			case 'назначен':
				return 'status-upcoming'
			case 'просрочен':
				return 'status-expired'
			default:
				return ''
		}
	}

	getStatusText(status) {
		switch (status) {
			case 'пройден':
				return 'Пройден'
			case 'в процессе':
				return 'В процессе'
			case 'назначен':
				return 'Назначен'
			case 'просрочен':
				return 'Просрочен'
			default:
				return status
		}
	}

	formatDate(dateString) {
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU')
	}

	showError(message) {
		const notification = document.createElement('div')
		notification.className = 'notification error'

		const icon = document.createElement('div')
		icon.className = 'notification-icon'
		icon.textContent = '⚠️'

		const content = document.createElement('div')
		content.className = 'notification-content'

		const title = document.createElement('h4')
		title.textContent = 'Ошибка'

		const text = document.createElement('p')
		text.textContent = message

		content.appendChild(title)
		content.appendChild(text)
		notification.appendChild(icon)
		notification.appendChild(content)

		const container =
			document.getElementById('notificationsContainer') || document.body
		container.appendChild(notification)

		setTimeout(() => {
			notification.remove()
		}, 5000)
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new MainApp()
})
