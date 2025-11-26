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
			window.location.href = buildPathFromRoot('pages/auth/login.html')
			return
		}

		this.createGlassEffect()

		await this.loadEmployeeData()

		this.renderEmployeeInfo()
		this.renderProgress()
		this.renderActiveCourses()
		this.renderFeedback()

		// Для HR и руководителя показываем информационное сообщение
		if (isHRManager() || isDepartmentHead()) {
			this.renderRoleInfo()
		}

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

	// Генерирует модули для курса на основе его названия и описания
	generateCourseModules(course) {
		const moduleCount = Math.ceil(course.duration / 15) // Примерно 15 минут на модуль
		const modules = []
		
		const moduleTypes = ['video', 'text']
		const completedCount = Math.floor((course.progress / 100) * moduleCount)
		
		for (let i = 0; i < moduleCount; i++) {
			const isCompleted = i < completedCount
			const type = moduleTypes[i % 2]
			const duration = Math.floor(course.duration / moduleCount)
			
			modules.push({
				title: `Модуль ${i + 1}: ${course.title}`,
				type: type,
				duration: `${duration} мин`,
				completed: isCompleted,
				content: `Содержимое модуля ${i + 1} курса "${course.title}".\n\n${course.description}\n\nВ этом модуле вы изучите важные аспекты темы и получите практические навыки. Материал разработан с учетом современных требований и лучших практик в данной области.\n\nПосле завершения этого модуля вы сможете:\n- Понимать основные концепции\n- Применять полученные знания на практике\n- Решать типовые задачи\n\nУделите достаточно времени для изучения материала и выполнения практических заданий.`
			})
		}
			
		return modules
	}

	async loadEmployeeData() {
		const cachedUserData = this.getCachedUserData()

		try {
			// Всегда подтягиваем актуальное состояние из MockDB по email пользователя,
			// чтобы личный кабинет, HR‑панели и отчёты работали с одной и той же "БД"
			const storedUserData = AuthManager.getUserData()
			const email =
				storedUserData &&
				storedUserData.employee &&
				storedUserData.employee.email
			let userMock = null

			if (email && window.MockDB && window.MockDB.Users) {
				userMock = window.MockDB.Users.find(u => u.email === email)
			}

			if (userMock) {
				const isHR = userMock.role === window.MockDB.UserRole.HR
				const isHead = userMock.role === window.MockDB.UserRole.HEAD

				let mappedCourses = []
				if (
					!isHR &&
					!isHead &&
					window.MockDB.CourseUsers &&
					window.MockDB.Courses
				) {
					const courseRefs = window.MockDB.CourseUsers.filter(
						cu => cu.userId === userMock.id
					)
					const allCourses = window.MockDB.Courses
					mappedCourses = courseRefs.map(cu => {
						const courseInfo = allCourses.find(c => c.id === cu.courseId)
						const course = {
							...courseInfo,
							status: cu.status,
							progress: cu.progress,
							start_date: cu.start,
							due_date: cu.due,
						}

					if (
						courseInfo &&
						Array.isArray(courseInfo.modules) &&
						courseInfo.modules.length > 0
					) {
						course.modules = courseInfo.modules.map(module => ({
							...module,
							completed: Boolean(module.completed),
						}))
					} else {
						course.modules = this.generateCourseModules(course)
					}

					course.certificateAvailable =
						courseInfo?.certificateAvailable !== false
					course.materials =
						(Array.isArray(courseInfo?.materials) && courseInfo.materials) || []
						return course
					})
				}

				if (cachedUserData?.courses?.length) {
					mappedCourses = this.mergeCoursesWithCache(mappedCourses, cachedUserData.courses)
				}

				this.employeeData = {
					employee: {
						id: userMock.id,
						name: userMock.name,
						position: userMock.position,
						department:
							window.MockDB.Departments.find(
								d => d.id === userMock.departmentId
							)?.name || '',
						email: userMock.email,
					},
					courses: mappedCourses,
					progress:
						mappedCourses.length > 0
							? this.calculateOverallProgress(mappedCourses)
							: 0,
				}

				localStorage.setItem('userData', JSON.stringify(this.employeeData))
			}

			// Если по каким‑то причинам курсов нет (демо‑режим без MockDB),
			// подставляем мок‑данные, как раньше
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

				this.employeeData.courses = this.employeeData.courses.map(course => ({
					...course,
					certificateAvailable: course.certificateAvailable !== false,
				}))

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

	getCachedUserData() {
		try {
			const raw = localStorage.getItem('userData')
			return raw ? JSON.parse(raw) : null
		} catch (error) {
			console.error('Ошибка чтения кэша userData:', error)
			return null
		}
	}

	mergeCoursesWithCache(latestCourses = [], cachedCourses = []) {
		return latestCourses.map(course => {
			const cached = cachedCourses.find(c => c.id === course.id)
			if (!cached) {
				return course
			}

			const merged = { ...course }

			if (Array.isArray(cached.modules) && cached.modules.length) {
				merged.modules = this.mergeModulesWithCache(
					merged.modules || [],
					cached.modules
				)
			}

			const cachedProgress =
				typeof cached.progress === 'number' ? cached.progress : null
			if (cachedProgress !== null && cachedProgress > (merged.progress ?? 0)) {
				merged.progress = cachedProgress
			}

			if (
				cached.status &&
				this.getStatusPriority(cached.status) >
					this.getStatusPriority(merged.status)
			) {
				merged.status = cached.status
			}

			return merged
		})
	}

	mergeModulesWithCache(latestModules = [], cachedModules = []) {
		if (!latestModules.length) {
			return cachedModules.map(module => ({ ...module }))
		}

		return latestModules.map(latest => {
			const cached =
				cachedModules.find(
					item =>
						item.title &&
						latest.title &&
						item.title.toLowerCase() === latest.title.toLowerCase()
				) || cachedModules.find(item => item.content === latest.content)

			if (cached) {
				return { ...latest, completed: Boolean(cached.completed) }
			}

			return latest
		})
	}

	getStatusPriority(status) {
		switch (status) {
			case 'пройден':
				return 4
			case 'в процессе':
				return 3
			case 'назначен':
				return 2
			case 'просрочен':
				return 1
			default:
				return 0
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
		// HR и руководитель не проходят курсы - скрываем секцию прогресса
		if (isHRManager() || isDepartmentHead()) {
			const progressSection = document.querySelector('.progress-card')
			if (progressSection) {
				progressSection.style.display = 'none'
			}
			return
		}

		const progressPercent = document.getElementById('progressPercent')
		const progressFill = document.getElementById('progressFill')

		if (!progressPercent || !progressFill || !this.employeeData) return

		const progress = this.employeeData.progress || 0

		progressPercent.textContent = `${progress}%`
		progressFill.style.width = `${progress}%`
	}

	renderActiveCourses() {
		// HR и руководитель не проходят курсы - скрываем секцию
		if (isHRManager() || isDepartmentHead()) {
			const coursesSection = document.querySelector('.courses-card')
			if (coursesSection) {
				coursesSection.style.display = 'none'
			}
			return
		}

		const container = document.getElementById('activeCourses')
		if (!container || !this.employeeData) return

		// Сортируем курсы: сначала незавершенные, потом завершенные
		const sortedCourses = [...this.employeeData.courses].sort((a, b) => {
			const aCompleted = a.status === 'пройден'
			const bCompleted = b.status === 'пройден'

			// Если один завершен, а другой нет - незавершенный идет первым
			if (aCompleted && !bCompleted) return 1
			if (!aCompleted && bCompleted) return -1

			// Если оба в одном статусе - сохраняем исходный порядок
			return 0
		})

		const activeCourses = sortedCourses.slice(0, 3)

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
			const isInPagesFolder = window.location.pathname.includes('/pages/')
			const coursePath = isInPagesFolder
				? `course-details.html?id=${course.id}`
				: `pages/employee/course-details.html?id=${course.id}`
			window.location.href = coursePath
		})

		// Цветовой бейдж-индикатор
		const statusClass = this.getStatusClass(course.status)
		const badge = document.createElement('span')
		badge.className = `course-status-badge ${statusClass}`
		badge.title = this.getStatusText(course.status)
		card.appendChild(badge)

		const title = document.createElement('h3')
		title.className = 'course-title'
		title.textContent = course.title

		const status = document.createElement('div')
		status.className = `course-status ${statusClass}`
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

	renderRoleInfo() {
		// На странице профиля дополнительную карточку роли не показываем
		if (window.location.pathname.includes('profile.html')) {
			return
		}

		// Добавляем информационную карточку для HR и руководителя на главной
		const container = document.querySelector('.container')
		if (!container) return

		const infoCard = document.createElement('section')
		infoCard.className = 'card role-info-card'

		if (isHRManager()) {
			infoCard.innerHTML = `
				<div class="card-header">
					<h2 class="card-title">Роль: HR-менеджер</h2>
				</div>
				<div class="role-info-content">
					<p>Вы управляете обучением сотрудников компании.</p>
					<ul>
						<li>📋 Управление каталогом курсов</li>
						<li>👥 Назначение курсов сотрудникам</li>
						<li>📊 Просмотр статистики и отчетов</li>
						<li>⚙️ Контроль соблюдения сроков обучения</li>
					</ul>
					<p style="margin-top: 1rem; color: var(--text-muted);">
						<strong>Примечание:</strong> HR-менеджеры не проходят курсы, а управляют процессом обучения сотрудников.
					</p>
				</div>
			`
		} else if (isDepartmentHead()) {
			infoCard.innerHTML = `
				<div class="card-header">
					<h2 class="card-title">Роль: Руководитель отдела</h2>
				</div>
				<div class="role-info-content">
					<p>Вы отслеживаете успеваемость сотрудников вашего отдела.</p>
					<ul>
						<li>📈 Просмотр статистики отдела</li>
						<li>👥 Управление командой</li>
						<li>📊 Анализ эффективности обучения</li>
						<li>🎯 Контроль выполнения планов развития</li>
					</ul>
					<p style="margin-top: 1rem; color: var(--text-muted);">
						<strong>Примечание:</strong> Руководители отдела не проходят курсы, а отслеживают успеваемость своих подчиненных.
					</p>
				</div>
			`
		}

		// Вставляем после секции прогресса (или вместо неё, если она скрыта)
		const progressCard = document.querySelector('.progress-card')
		if (progressCard && progressCard.style.display !== 'none') {
			progressCard.insertAdjacentElement('afterend', infoCard)
		} else {
			const employeeCard = document.querySelector('.employee-card')
			if (employeeCard) {
				employeeCard.insertAdjacentElement('afterend', infoCard)
			}
		}
	}

	renderFeedback() {
		// Показываем обратную связь только для сотрудников (не для HR и руководителей)
		if (isDepartmentHead()) {
			return
		}

		const feedbackCard = document.getElementById('feedbackCard')
		const feedbackList = document.getElementById('feedbackList')
		if (!feedbackCard || !feedbackList) return

		// Получаем ID текущего пользователя
		const userData = AuthManager.getUserData()
		if (!userData || !userData.employee) return

		const currentUser = window.MockDB?.Users?.find(
			u => u.email === userData.employee.email
		)
		if (!currentUser) return

		// Загружаем обратную связь из localStorage
		let allFeedbacks = {}
		try {
			const storedFeedbacks = localStorage.getItem('employeeFeedbacks')
			if (storedFeedbacks) {
				allFeedbacks = JSON.parse(storedFeedbacks)
			}
		} catch (error) {
			console.error('Ошибка загрузки обратной связи:', error)
			return
		}

		const employeeFeedbacks = allFeedbacks[currentUser.id] || []

		if (employeeFeedbacks.length === 0) {
			feedbackCard.style.display = 'none'
			return
		}

		// Показываем карточку обратной связи
		feedbackCard.style.display = 'block'

		// Очищаем список
		feedbackList.innerHTML = ''

		// Отображаем каждую обратную связь
		employeeFeedbacks.forEach(feedback => {
			const feedbackItem = document.createElement('div')
			feedbackItem.className = `feedback-item ${
				feedback.read ? 'read' : 'unread'
			}`
			feedbackItem.style.cssText =
				'padding: 1.5rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius); margin-bottom: 1rem; position: relative; transition: all 0.3s ease;'

			if (!feedback.read) {
				feedbackItem.style.borderLeft = '4px solid var(--primary)'
				feedbackItem.style.background = 'rgba(0, 89, 255, 0.05)'
			}

			const date = new Date(feedback.date)
			const formattedDate = date.toLocaleDateString('ru-RU', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})

			feedbackItem.innerHTML = `
				<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
					<div>
						<div style="font-weight: 600; color: var(--text-light); margin-bottom: 0.25rem;">
							От: ${feedback.from}
						</div>
						<div style="font-size: 0.9rem; color: var(--text-muted);">
							${formattedDate}
						</div>
					</div>
					${
						!feedback.read
							? '<span style="background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">Новое</span>'
							: ''
					}
				</div>
				<div style="color: var(--text-light); line-height: 1.6; white-space: pre-wrap;">
					${sanitizeInput(feedback.text)}
				</div>
				${
					!feedback.read
						? `
					<button class="btn btn-sm btn-outline" style="margin-top: 1rem;" data-feedback-id="${feedback.id}">
						Отметить как прочитанное
					</button>
				`
						: ''
				}
			`

			// Обработчик для кнопки "Отметить как прочитанное"
			if (!feedback.read) {
				const markReadBtn = feedbackItem.querySelector('button')
				if (markReadBtn) {
					markReadBtn.addEventListener('click', () => {
						removeFeedback(currentUser.id, feedback.id)
						this.renderFeedback() // Перерисовываем список
					})
				}
			}

			feedbackList.appendChild(feedbackItem)
		})
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

// Функция для удаления обратной связи (после отметки как прочитанной)
function removeFeedback(employeeId, feedbackId) {
	try {
		const storedFeedbacks = localStorage.getItem('employeeFeedbacks')
		if (!storedFeedbacks) return

		const allFeedbacks = JSON.parse(storedFeedbacks)
		if (!allFeedbacks[employeeId]) return

		// Удаляем обратную связь из массива
		allFeedbacks[employeeId] = allFeedbacks[employeeId].filter(
			f => f.id !== feedbackId
		)

		// Если у сотрудника больше нет обратной связи, удаляем его из объекта
		if (allFeedbacks[employeeId].length === 0) {
			delete allFeedbacks[employeeId]
		}

		// Сохраняем обновленные данные
		localStorage.setItem('employeeFeedbacks', JSON.stringify(allFeedbacks))
	} catch (error) {
		console.error('Ошибка удаления обратной связи:', error)
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new MainApp()
})
