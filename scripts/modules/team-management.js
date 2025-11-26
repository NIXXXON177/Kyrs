const TEAM_TASKS_STORAGE_KEY = 'teamManagementTasks'
const DEPARTMENT_GOALS_STORAGE_KEY = 'departmentGoals'

class TeamManagement {
	constructor() {
		this.tasks = []
		this.developmentPlan = []
		this.departmentGoals = []
		this.init()
	}

	init() {
		if (!AuthManager.checkAuth()) {
			window.location.href = buildPathFromRoot('pages/auth/login.html')
			return
		}

		// Проверяем роль
		if (!isDepartmentHead()) {
			window.location.href = buildPathFromRoot('index.html')
			return
		}

		this.loadManagementData()
		this.renderTasks()
		this.renderDevelopmentPlan()
		this.renderDepartmentGoals()
	}

	loadManagementData() {
		// Пытаемся загрузить задачи из localStorage,
		// чтобы их состояние сохранялось между перезагрузками страницы
		try {
			const storedTasks = localStorage.getItem(TEAM_TASKS_STORAGE_KEY)
			if (storedTasks) {
				this.tasks = JSON.parse(storedTasks)
			}
		} catch (e) {
			console.error('Ошибка загрузки задач управления командой:', e)
			this.tasks = []
		}

		if (!Array.isArray(this.tasks)) {
			this.tasks = []
		}

		// Если сохранённых задач ещё нет — инициализируем демо-набором
		if (this.tasks.length === 0) {
			this.tasks = [
				{
					id: 1,
					title: 'Провести оценку эффективности команды',
					description:
						'Организовать quarterly review для всех сотрудников отдела',
					priority: 'высокий',
					dueDate: '2025-12-01',
					status: 'в процессе',
				},
				{
					id: 2,
					title: 'Разработать план обучения на следующий квартал',
					description:
						'Определить необходимые навыки и курсы для развития команды',
					priority: 'высокий',
					dueDate: '2025-11-15',
					status: 'назначен',
				},
				{
					id: 3,
					title: 'Организовать технический митап',
					description: 'Провести внутренний митап по новым технологиям',
					priority: 'средний',
					dueDate: '2025-12-15',
					status: 'запланирован',
				},
				{
					id: 4,
					title: 'Подготовить отчет о достижениях отдела',
					description: 'Составить отчет для руководства компании',
					priority: 'средний',
					dueDate: '2025-11-30',
					status: 'в процессе',
				},
			]
		}

		// Нормализуем существующие записи и сохраняем их в актуальном виде
		this.tasks = this.tasks.map(task => this.normalizeTask(task))
		this.saveTasks()

		this.departmentGoals = this.loadDepartmentGoals()

		// Имитируем план развития
		this.developmentPlan = [
			{
				quarter: 'Q4 2025',
				goals: [
					'Повысить средний уровень владения DevOps практиками до 80%',
					'Внедрить agile-методологии во всех проектах отдела',
					'Организовать сертификацию 3-х ключевых сотрудников',
				],
				initiatives: [
					'Проведение внутреннего тренинга по Docker и Kubernetes',
					'Организация сертификации по Scrum Master',
					'Внедрение code review практики',
				],
			},
			{
				quarter: 'Q1 2026',
				goals: [
					'Увеличить производительность команды на 25%',
					'Внедрить автоматизированное тестирование во всех проектах',
					'Привлечь 2-х новых специалистов',
				],
				initiatives: [
					'Обучение работе с CI/CD инструментами',
					'Внедрение TDD практик',
					'Разработка программы менторства для новых сотрудников',
				],
			},
		]
	}

	saveTasks() {
		try {
			localStorage.setItem(TEAM_TASKS_STORAGE_KEY, JSON.stringify(this.tasks))
		} catch (e) {
			console.error('Ошибка сохранения задач управления командой:', e)
		}
	}

	loadDepartmentGoals() {
		try {
			const stored = localStorage.getItem(DEPARTMENT_GOALS_STORAGE_KEY)
			if (!stored) {
				return []
			}

			const parsed = JSON.parse(stored)
			if (!Array.isArray(parsed)) {
				return []
			}

			return parsed
				.map(goal => this.normalizeGoal(goal))
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				)
		} catch (error) {
			console.error('Ошибка загрузки целей отдела:', error)
			return []
		}
	}

	saveDepartmentGoals() {
		try {
			localStorage.setItem(
				DEPARTMENT_GOALS_STORAGE_KEY,
				JSON.stringify(this.departmentGoals)
			)
		} catch (error) {
			console.error('Ошибка сохранения целей отдела:', error)
		}
	}

	renderTasks() {
		const container = document.getElementById('managementTasks')
		if (!container) return

		container.innerHTML = ''

		this.tasks.forEach(task => {
			const taskCard = this.createTaskCard(task)
			container.appendChild(taskCard)
		})
	}

	createTaskCard(task) {
		const card = document.createElement('div')
		card.className = `task-card ${this.getTaskStatusClass(task.status)}`

		const priorityClass = `priority-${task.priority}`
		const formattedDate = this.formatDate(task.dueDate)

		card.innerHTML = `
			<div class="task-header">
				<h4 class="task-title">${task.title}</h4>
				<div class="task-badges">
					<span class="task-badge ${priorityClass}">${this.getPriorityText(
			task.priority
		)}</span>
					<span class="task-badge status-${task.status}">${this.getStatusText(
			task.status
		)}</span>
				</div>
			</div>
			<p class="task-description">${task.description}</p>
			<div class="task-meta">
				<span class="meta-item">📅 ${formattedDate}</span>
			</div>
			<div class="task-actions">
				<button class="btn btn-sm" onclick="updateTaskStatus(${
					task.id
				}, 'завершен')">Завершить</button>
				<button class="btn btn-outline btn-sm" onclick="editTask(${
					task.id
				})">Редактировать</button>
			</div>
		`

		return card
	}

	renderDevelopmentPlan() {
		const container = document.getElementById('developmentPlan')
		if (!container) return

		container.innerHTML = ''

		this.developmentPlan.forEach(plan => {
			const planCard = this.createPlanCard(plan)
			container.appendChild(planCard)
		})
	}

	createPlanCard(plan) {
		const card = document.createElement('div')
		card.className = 'plan-card'

		let goalsHTML = plan.goals.map(goal => `<li>${goal}</li>`).join('')
		let initiativesHTML = plan.initiatives
			.map(init => `<li>${init}</li>`)
			.join('')

		card.innerHTML = `
			<h3 class="plan-quarter">${plan.quarter}</h3>
			<div class="plan-content">
				<div class="plan-section">
					<h4>🎯 Цели</h4>
					<ul class="plan-goals">
						${goalsHTML}
					</ul>
				</div>
				<div class="plan-section">
					<h4>🚀 Инициативы</h4>
					<ul class="plan-initiatives">
						${initiativesHTML}
					</ul>
				</div>
			</div>
		`

		return card
	}

	renderDepartmentGoals() {
		const container = document.getElementById('departmentGoalsList')
		const emptyState = document.getElementById('departmentGoalsEmpty')
		if (!container) return

		container.innerHTML = ''

		if (!this.departmentGoals.length) {
			container.classList.add('hidden')
			if (emptyState) {
				emptyState.classList.remove('hidden')
			}
			return
		}

		container.classList.remove('hidden')
		if (emptyState) {
			emptyState.classList.add('hidden')
		}

		this.departmentGoals.forEach(goal => {
			container.appendChild(this.createGoalCard(goal))
		})
	}

	createGoalCard(goal) {
		const card = document.createElement('div')
		card.className = 'department-goal-card'

		const safeText =
			typeof sanitizeInput === 'function'
				? sanitizeInput(goal.text)
				: goal.text
		const createdLabel = this.formatGoalTimestamp(goal.createdAt)

		card.innerHTML = `
			<div class="department-goal-icon">🎯</div>
			<div>
				<p class="department-goal-text">${safeText}</p>
				<span class="department-goal-meta">${createdLabel}</span>
			</div>
		`

		return card
	}

	addGoal(goalText) {
		const trimmedGoal = (goalText || '').trim()
		if (!trimmedGoal) {
			this.showValidationMessage(
				'Введите текст цели.',
				'warning',
				'Валидация'
			)
			return null
		}

		const goal = {
			id: Date.now(),
			text: trimmedGoal,
			createdAt: new Date().toISOString(),
		}

		this.departmentGoals.unshift(goal)
		this.saveDepartmentGoals()
		this.renderDepartmentGoals()

		return goal
	}

	getTaskStatusClass(status) {
		switch (status) {
			case 'завершен':
				return 'task-completed'
			case 'в процессе':
				return 'task-in-progress'
			case 'назначен':
				return 'task-assigned'
			case 'запланирован':
				return 'task-planned'
			default:
				return ''
		}
	}

	getPriorityText(priority) {
		const priorities = {
			высокий: 'Высокий',
			средний: 'Средний',
			низкий: 'Низкий',
		}
		return priorities[priority] || priority
	}

	getStatusText(status) {
		const statuses = {
			завершен: 'Завершен',
			'в процессе': 'В процессе',
			назначен: 'Назначен',
			запланирован: 'Запланирован',
		}
		return statuses[status] || status
	}

	formatDate(dateString) {
		if (!dateString) {
			return 'Срок не указан'
		}

		const date = new Date(dateString)
		if (Number.isNaN(date.getTime())) {
			return 'Срок не указан'
		}

		return date.toLocaleDateString('ru-RU')
	}

	formatGoalTimestamp(dateString) {
		if (!dateString) {
			return 'Добавлено недавно'
		}

		const date = new Date(dateString)
		if (Number.isNaN(date.getTime())) {
			return 'Добавлено недавно'
		}

		return `Добавлено ${date.toLocaleString('ru-RU', {
			dateStyle: 'medium',
			timeStyle: 'short',
		})}`
	}

	updateTaskStatus(taskId, newStatus) {
		const task = this.tasks.find(t => t.id === taskId)
		if (task) {
			task.status = newStatus
			this.renderTasks()

			// Сохраняем обновлённый список задач
			this.saveTasks()

			if (typeof NotificationManager !== 'undefined') {
				NotificationManager.showTempNotification(
					`Задача "${task.title}" обновлена`,
					'success'
				)
			}
		}
	}

	async editTask(taskId) {
		const task = this.tasks.find(t => t.id === taskId)
		if (!task) return

		const newTitle =
			typeof modal !== 'undefined'
				? await modal.prompt(
						'Введите новое название задачи:',
						'Редактирование задачи',
						task.title
				  )
				: prompt('Введите новое название задачи:', task.title)

		if (newTitle === null) return

		const trimmedTitle = newTitle.trim()
		if (!trimmedTitle) {
			this.showValidationMessage(
				'Название задачи не может быть пустым.',
				'warning',
				'Валидация'
			)
			return
		}

		const newDescription =
			typeof modal !== 'undefined'
				? await modal.prompt(
						'Введите описание задачи:',
						'Редактирование задачи',
						task.description
				  )
				: prompt('Введите описание задачи:', task.description)

		if (newDescription === null) return

		const trimmedDescription = newDescription.trim()
		if (!trimmedDescription) {
			this.showValidationMessage(
				'Описание задачи не может быть пустым.',
				'warning',
				'Валидация'
			)
			return
		}

		let prioritySelection = task.priority
		if (typeof modal !== 'undefined' && typeof modal.select === 'function') {
			const result = await modal.select(
				'Выберите приоритет задачи:',
				[
					{ value: 'высокий', label: 'Высокий' },
					{ value: 'средний', label: 'Средний' },
					{ value: 'низкий', label: 'Низкий' },
				],
				'Редактирование задачи'
			)
			if (result === null) return
			if (result) {
				prioritySelection = result
			}
		} else {
			const manualPriority = prompt(
				'Введите приоритет (высокий/средний/низкий):',
				task.priority
			)
			if (manualPriority === null) return
			if (manualPriority) {
				prioritySelection = manualPriority
			}
		}

		const normalizedPriority = this.normalizePriority(prioritySelection)

		const dueDateValue = await this.requestValidDueDate({
			defaultValue: task.dueDate || this.getDefaultDueDate(),
			title: 'Редактирование задачи',
		})

		if (dueDateValue === null) return

		task.title = trimmedTitle
		task.description = trimmedDescription
		task.priority = normalizedPriority
		task.dueDate = dueDateValue

		this.saveTasks()
		this.renderTasks()
	}

	async createTask() {
		const titlePrompt =
			typeof modal !== 'undefined'
				? await modal.prompt(
						'Введите название задачи:',
						'Новая задача',
						'Новая управленческая задача'
				  )
				: prompt('Введите название задачи:')

		if (titlePrompt === null) return

		const descriptionPrompt =
			typeof modal !== 'undefined'
				? await modal.prompt(
						'Введите описание задачи:',
						'Новая задача',
						'Описание задачи'
				  )
				: prompt('Введите описание задачи:', 'Описание задачи')

		if (descriptionPrompt === null) return

		const title = titlePrompt
		const description = descriptionPrompt

		let priority = 'средний'
		if (typeof modal !== 'undefined' && typeof modal.select === 'function') {
			const result = await modal.select(
				'Выберите приоритет задачи:',
				[
					{ value: 'высокий', label: 'Высокий' },
					{ value: 'средний', label: 'Средний' },
					{ value: 'низкий', label: 'Низкий' },
				],
				'Приоритет задачи'
			)
			if (result) {
				priority = result
			}
		} else {
			const manualPriority = prompt(
				'Введите приоритет (высокий/средний/низкий):',
				'средний'
			)
			if (manualPriority) {
				priority = manualPriority.toLowerCase()
			}
		}

		const dueDateValue = await this.requestValidDueDate({
			defaultValue: this.getDefaultDueDate(),
			title: 'Срок задачи',
		})

		if (dueDateValue === null) return

		const trimmedTitle = (title || '').trim()
		const trimmedDescription = (description || '').trim()

		const priorityNormalized = this.normalizePriority(priority)

		if (!trimmedTitle) {
			this.showValidationMessage(
				'Введите название задачи.',
				'warning',
				'Валидация'
			)
			return
		}

		if (!trimmedDescription) {
			this.showValidationMessage(
				'Введите описание задачи.',
				'warning',
				'Валидация'
			)
			return
		}

		const newTask = {
			id: Date.now(),
			title: trimmedTitle,
			description: trimmedDescription,
			priority: priorityNormalized,
			dueDate: dueDateValue,
			status: 'запланирован',
		}

		this.tasks.unshift(newTask)
		this.saveTasks()
		this.renderTasks()

		if (typeof NotificationManager !== 'undefined') {
			NotificationManager.showTempNotification(
				`Задача "${newTask.title}" добавлена`,
				'success'
			)
		}
	}
	normalizePriority(priority) {
		const allowed = ['высокий', 'средний', 'низкий']
		const normalized = (priority || '').toLowerCase().trim()
		return allowed.includes(normalized) ? normalized : 'средний'
	}
	
	validateDueDate(dateString, options = {}) {
		const { allowPast = false } = options

		if (!dateString) {
			return { isValid: false, message: 'Срок выполнения обязателен.' }
		}

		const parsed = new Date(dateString)
		if (Number.isNaN(parsed.getTime())) {
			return { isValid: false, message: 'Некорректный формат даты.' }
		}

		const due = new Date(parsed)
		due.setHours(0, 0, 0, 0)
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		if (!allowPast && due < today) {
			return {
				isValid: false,
				message: 'Срок выполнения не может быть в прошлом.',
			}
		}

		return { isValid: true, value: due.toISOString().split('T')[0] }
	}

	getDefaultDueDate(offsetDays = 14) {
		const date = new Date()
		date.setHours(0, 0, 0, 0)
		date.setDate(date.getDate() + offsetDays)
		return date.toISOString().split('T')[0]
	}

	normalizeStatus(status) {
		const allowed = ['запланирован', 'назначен', 'в процессе', 'завершен']
		return allowed.includes(status) ? status : 'запланирован'
	}

	normalizeTask(task = {}) {
		const normalized = { ...task }
		normalized.id = normalized.id || Date.now()
		normalized.title = (normalized.title || 'Без названия задачи').trim()
		normalized.description = (
			normalized.description || 'Описание отсутствует'
		).trim()
		normalized.priority = this.normalizePriority(normalized.priority)

		const dueValidation = this.validateDueDate(normalized.dueDate, {
			allowPast: true,
		})
		normalized.dueDate = dueValidation.isValid
			? dueValidation.value
			: this.getDefaultDueDate()

		normalized.status = this.normalizeStatus(normalized.status)

		return normalized
	}

	normalizeGoal(goal = {}) {
		return {
			id: goal.id || Date.now(),
			text: (goal.text || 'Новая цель').trim(),
			createdAt: goal.createdAt || new Date().toISOString(),
		}
	}

	async requestValidDueDate({
		defaultValue,
		title = 'Срок задачи',
		message = 'Введите срок выполнения (ГГГГ-ММ-ДД):',
		allowPast = false,
	} = {}) {
		let fallback = defaultValue || this.getDefaultDueDate()

		while (true) {
			let input

			if (typeof modal !== 'undefined') {
				input = await modal.prompt(message, title, fallback)
			} else {
				input = prompt(message, fallback)
			}

			if (input === null) {
				return null
			}

			const normalizedInput = (input ?? '').toString().trim()
			const candidate = normalizedInput || fallback || this.getDefaultDueDate()
			const validation = this.validateDueDate(candidate, { allowPast })

			if (validation.isValid) {
				return validation.value
			}

			this.showValidationMessage(
				validation.message || 'Введите корректную дату в формате ГГГГ-ММ-ДД.',
				'warning',
				'Некорректная дата'
			)

			fallback = candidate
		}
	}

	showValidationMessage(message, type = 'warning', title = 'Внимание') {
		if (typeof modal !== 'undefined') {
			modal.show(message, type, title)
		} else {
			alert(message)
		}
	}
}

// Функция выбора сотрудника из отдела руководителя (с optional HR)
async function selectEmployeeFromDepartment(
	title,
	subtitle = '',
	options = {}
) {
	const { includeHR = false } = options
	if (!window.MockDB || !window.MockDB.Users) {
		if (typeof modal !== 'undefined') {
			modal.show('Ошибка загрузки сотрудников', 'error', 'Ошибка')
		} else {
			alert('Ошибка загрузки сотрудников')
		}
		return null
	}

	// Получаем текущего пользователя (руководителя)
	const userData = AuthManager.getUserData()
	if (!userData || !userData.employee) {
		return null
	}

	// Получаем ID отдела руководителя
	const currentUser = window.MockDB.Users.find(
		u => u.email === userData.employee.email
	)
	if (!currentUser) {
		return null
	}

	// Фильтруем сотрудников того же отдела (только обычных сотрудников, не HR и не руководителей)
	const departmentEmployees = window.MockDB.Users.filter(
		user =>
			user.departmentId === currentUser.departmentId &&
			user.role === window.MockDB.UserRole.EMPLOYEE
	).map(employee => {
		const department = window.MockDB.Departments.find(
			d => d.id === employee.departmentId
		)
		return {
			id: employee.id,
			name: employee.name,
			position: employee.position,
			department: department ? department.name : 'Не указан',
			email: employee.email,
		}
	})

	let availableRecipients = [...departmentEmployees]

	if (includeHR) {
		const hrManagers = window.MockDB.Users.filter(
			user => user.role === window.MockDB.UserRole.HR
		).map(hr => {
			const department = window.MockDB.Departments.find(
				d => d.id === hr.departmentId
			)
			return {
				id: hr.id,
				name: hr.name,
				position: hr.position,
				department: department ? department.name : 'HR-отдел',
				email: hr.email,
			}
		})
		availableRecipients = availableRecipients.concat(hrManagers)
	}

	if (availableRecipients.length === 0) {
		if (typeof modal !== 'undefined') {
			modal.show(
				'Нет доступных пользователей для выбора',
				'info',
				'Информация'
			)
		} else {
			alert('Нет доступных пользователей для выбора')
		}
		return null
	}

	// Используем функцию выбора сотрудника из course-management.js
	return await showEmployeeSelectionModalForTeam(
		title,
		subtitle,
		availableRecipients
	)
}

// Модальное окно для выбора сотрудника (адаптированная версия)
function showEmployeeSelectionModalForTeam(title, subtitle, employees) {
	return new Promise(resolve => {
		const modal = document.createElement('div')
		modal.className = 'modal employee-selection-modal'
		modal.innerHTML = `
			<div class="modal-overlay"></div>
			<div class="modal-content employee-selection-content">
				<div class="modal-header">
					<div class="modal-header-info">
						<div class="modal-icon success">👥</div>
						<div>
							<h3>${title}</h3>
							${subtitle ? `<p class="modal-subtitle">${subtitle}</p>` : ''}
						</div>
					</div>
					<button class="modal-close" aria-label="Закрыть">×</button>
				</div>
				<div class="modal-body">
					<div class="employee-search-container">
						<input
							type="text"
							id="employeeSearchInput"
							class="employee-search-input"
							placeholder="🔍 Поиск сотрудника по имени, должности или отделу..."
						/>
					</div>
					<div class="employees-list" id="employeesList">
						${employees
							.map(
								employee => `
							<div class="employee-card" data-employee-id="${employee.id}">
								<div class="employee-card-content">
									<div class="employee-avatar">${employee.name
										.split(' ')
										.map(n => n[0])
										.join('')
										.toUpperCase()}</div>
									<div class="employee-info">
										<div class="employee-name">${employee.name}</div>
										<div class="employee-details">
											<span class="employee-position">${employee.position}</span>
											<span class="employee-separator">•</span>
											<span class="employee-department">${employee.department}</span>
										</div>
										<div class="employee-email">${employee.email}</div>
									</div>
								</div>
								<div class="employee-select-indicator">
									<div class="select-checkbox"></div>
								</div>
							</div>
						`
							)
							.join('')}
					</div>
					<div class="employees-empty hidden" id="employeesEmpty">
						<p>Сотрудники не найдены</p>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-secondary modal-btn-cancel">Отмена</button>
					<button class="btn btn-primary modal-btn-confirm" disabled>
						Выбрать
					</button>
				</div>
			</div>
		`

		const modalContainer =
			document.getElementById('modalContainer') || document.body
		let container = document.getElementById('modalContainer')
		if (!container) {
			container = document.createElement('div')
			container.id = 'modalContainer'
			document.body.appendChild(container)
		}
		container.appendChild(modal)

		let selectedEmployeeId = null
		const employeesList = modal.querySelector('#employeesList')
		const employeeCards = modal.querySelectorAll('.employee-card')
		const searchInput = modal.querySelector('#employeeSearchInput')
		const confirmBtn = modal.querySelector('.modal-btn-confirm')
		const emptyMessage = modal.querySelector('#employeesEmpty')

		// Обработчик выбора сотрудника
		employeeCards.forEach(card => {
			card.addEventListener('click', () => {
				if (card.style.display !== 'none') {
					employeeCards.forEach(c => {
						if (c.style.display !== 'none') {
							c.classList.remove('selected')
						}
					})
					card.classList.add('selected')
					selectedEmployeeId = parseInt(card.dataset.employeeId)
					confirmBtn.disabled = false
				}
			})

			card.addEventListener('dblclick', () => {
				if (card.style.display !== 'none') {
					card.classList.add('selected')
					selectedEmployeeId = parseInt(card.dataset.employeeId)
					confirmBtn.disabled = false
					confirmBtn.click()
				}
			})
		})

		// Поиск сотрудников
		searchInput.addEventListener('input', e => {
			const searchTerm = e.target.value.toLowerCase().trim()
			let visibleCount = 0

			employeeCards.forEach(card => {
				const employeeName = card
					.querySelector('.employee-name')
					.textContent.toLowerCase()
				const employeePosition = card
					.querySelector('.employee-position')
					.textContent.toLowerCase()
				const employeeDepartment = card
					.querySelector('.employee-department')
					.textContent.toLowerCase()
				const employeeEmail = card
					.querySelector('.employee-email')
					.textContent.toLowerCase()

				const matches =
					employeeName.includes(searchTerm) ||
					employeePosition.includes(searchTerm) ||
					employeeDepartment.includes(searchTerm) ||
					employeeEmail.includes(searchTerm)

				if (matches) {
					card.style.display = 'flex'
					visibleCount++
				} else {
					card.style.display = 'none'
					card.classList.remove('selected')
				}
			})

			if (visibleCount === 0) {
				emptyMessage.classList.remove('hidden')
				employeesList.style.display = 'none'
			} else {
				emptyMessage.classList.add('hidden')
				employeesList.style.display = 'block'
			}

			if (searchTerm && selectedEmployeeId) {
				const selectedCard = modal.querySelector(
					`.employee-card[data-employee-id="${selectedEmployeeId}"]`
				)
				if (selectedCard && selectedCard.style.display === 'none') {
					selectedCard.classList.remove('selected')
					selectedEmployeeId = null
					confirmBtn.disabled = true
				}
			}
		})

		// Устанавливаем display: flex для модального окна
		modal.style.display = 'flex'

		setTimeout(() => {
			modal.classList.add('active')
			searchInput.focus()
		}, 10)

		const closeModal = result => {
			modal.classList.remove('active')
			setTimeout(() => {
				modal.remove()
				resolve(result)
			}, 300)
		}

		confirmBtn.addEventListener('click', () => {
			if (selectedEmployeeId) {
				closeModal(selectedEmployeeId)
			}
		})

		modal.querySelector('.modal-btn-cancel').addEventListener('click', () => {
			closeModal(null)
		})

		modal.querySelector('.modal-overlay').addEventListener('click', () => {
			closeModal(null)
		})

		modal.querySelector('.modal-close').addEventListener('click', () => {
			closeModal(null)
		})

		const handleEscape = e => {
			if (e.key === 'Escape') {
				closeModal(null)
				document.removeEventListener('keydown', handleEscape)
			}
		}
		document.addEventListener('keydown', handleEscape)
	})
}

// Глобальные функции для кнопок
async function assignTraining() {
	// Сначала выбираем курс
	if (!window.MockDB || !window.MockDB.Courses) {
		if (typeof modal !== 'undefined') {
			modal.show('Ошибка загрузки курсов', 'error', 'Ошибка')
		} else {
			alert('Ошибка загрузки курсов')
		}
		return
	}

	const courses = window.MockDB.Courses.map(course => ({
		id: course.id,
		label: `${course.title} (${course.type})`,
	}))

	const selectedCourseId =
		typeof modal !== 'undefined'
			? await modal.select(
					'Выберите курс для назначения:',
					courses,
					'Выбор курса'
			  )
			: null

	if (!selectedCourseId) return

	const selectedCourse = window.MockDB.Courses.find(
		c => c.id == selectedCourseId
	)
	if (!selectedCourse) return

	// Затем выбираем сотрудника
	const selectedEmployeeId = await selectEmployeeFromDepartment(
		'Назначение обучения',
		`Курс: ${selectedCourse.title}`
	)

	if (selectedEmployeeId) {
		const selectedEmployee = window.MockDB.Users.find(
			e => e.id == selectedEmployeeId
		)
		if (selectedEmployee) {
			// Сохраняем назначение курса в MockDB
			if (window.MockDB && window.MockDB.CourseUsers) {
				const existingAssignment = window.MockDB.CourseUsers.find(
					cu =>
						cu.userId === selectedEmployeeId && cu.courseId === selectedCourseId
				)

				if (!existingAssignment) {
					window.MockDB.CourseUsers.push({
						userId: selectedEmployeeId,
						courseId: selectedCourseId,
						status: 'назначен',
						progress: 0,
						start: new Date().toISOString().split('T')[0],
						due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
							.toISOString()
							.split('T')[0],
					})
				}
			}

			if (typeof NotificationManager !== 'undefined') {
				NotificationManager.showTempNotification(
					`Курс "${selectedCourse.title}" назначен сотруднику ${selectedEmployee.name}`,
					'success'
				)
			} else if (typeof modal !== 'undefined') {
				modal.show(
					`Курс "${selectedCourse.title}" назначен сотруднику ${selectedEmployee.name}`,
					'success',
					'Успешно'
				)
			} else {
				alert(
					`Курс "${selectedCourse.title}" назначен сотруднику ${selectedEmployee.name}`
				)
			}
		}
	}
}

async function evaluatePerformance() {
	// Выбираем сотрудника
	const selectedEmployeeId = await selectEmployeeFromDepartment(
		'Оценка эффективности',
		'Выберите сотрудника для оценки'
	)

	if (!selectedEmployeeId) return

	const selectedEmployee = window.MockDB.Users.find(
		e => e.id == selectedEmployeeId
	)
	if (!selectedEmployee) return

	// Выбираем оценку
	const ratingOptions = [
		{ id: '5', label: '5 - Отлично' },
		{ id: '4', label: '4 - Хорошо' },
		{ id: '3', label: '3 - Удовлетворительно' },
		{ id: '2', label: '2 - Неудовлетворительно' },
		{ id: '1', label: '1 - Плохо' },
	]

	const rating =
		typeof modal !== 'undefined'
			? await modal.select(
					`Оцените эффективность работы сотрудника ${selectedEmployee.name}:`,
					ratingOptions,
					'Оценка эффективности'
			  )
			: null

	if (rating && selectedEmployee) {
		if (typeof NotificationManager !== 'undefined') {
			NotificationManager.showTempNotification(
				`Оценка ${rating}/5 сохранена для ${selectedEmployee.name}`,
				'success'
			)
		} else if (typeof modal !== 'undefined') {
			modal.show(
				`Оценка ${rating}/5 сохранена для ${selectedEmployee.name}`,
				'success',
				'Успешно'
			)
		} else {
			alert(`Оценка ${rating}/5 сохранена для ${selectedEmployee.name}`)
		}
	}
}

async function setGoals() {
	const goalInput =
		typeof modal !== 'undefined'
			? await modal.prompt(
					'Введите цель развития для отдела:',
					'Установка целей',
					'Цель развития'
			  )
			: prompt('Введите цель развития для отдела:')

	if (goalInput === null) return

	let createdGoal = null

	if (window.teamManagement && typeof window.teamManagement.addGoal === 'function') {
		createdGoal = window.teamManagement.addGoal(goalInput)
	} else if ((goalInput || '').trim()) {
		createdGoal = {
			text: goalInput.trim(),
		}
	}

	if (!createdGoal) {
		return
	}

	const safeGoalText =
		typeof sanitizeInput === 'function'
			? sanitizeInput(createdGoal.text)
			: createdGoal.text

	if (typeof NotificationManager !== 'undefined') {
		NotificationManager.showTempNotification(
			`Цель "${safeGoalText}" установлена для отдела`,
			'success'
		)
	} else if (typeof modal !== 'undefined') {
		modal.show(
			`Цель "${safeGoalText}" установлена для отдела`,
			'success',
			'Успешно'
		)
	} else {
		alert(`Цель "${safeGoalText}" установлена для отдела`)
	}
}

async function provideFeedback() {
	const selectedUserId = await selectEmployeeFromDepartment(
		'Обратная связь',
		'Выберите сотрудника или HR-менеджера для предоставления обратной связи',
		{ includeHR: true }
	)

	if (!selectedUserId) return

	const selectedEmployee = window.MockDB.Users.find(
		e => e.id == selectedUserId
	)
	if (!selectedEmployee) return

	// Получаем информацию о текущем руководителе
	const userData = AuthManager.getUserData()
	if (!userData || !userData.employee) return

	const managerName = userData.employee.name

	// Вводим текст обратной связи
	const feedback =
		typeof modal !== 'undefined'
			? await modal.prompt(
					`Введите обратную связь для ${selectedEmployee.name}:`,
					'Обратная связь',
					'Текст обратной связи'
			  )
			: prompt(`Введите обратную связь для ${selectedEmployee.name}:`)

	if (feedback && selectedEmployee) {
		// Сохраняем обратную связь в localStorage
		saveFeedbackToEmployee(selectedUserId, feedback, managerName)

		if (typeof NotificationManager !== 'undefined') {
			NotificationManager.showTempNotification(
				`Обратная связь отправлена ${selectedEmployee.name}`,
				'success'
			)
		} else if (typeof modal !== 'undefined') {
			modal.show(
				`Обратная связь отправлена ${selectedEmployee.name}`,
				'success',
				'Успешно'
			)
		} else {
			alert(`Обратная связь отправлена ${selectedEmployee.name}`)
		}
	}
}

// Функция сохранения обратной связи для сотрудника
function saveFeedbackToEmployee(employeeId, feedbackText, managerName) {
	try {
		// Получаем существующие обратные связи из localStorage
		let allFeedbacks = {}
		const storedFeedbacks = localStorage.getItem('employeeFeedbacks')
		if (storedFeedbacks) {
			allFeedbacks = JSON.parse(storedFeedbacks)
		}

		// Инициализируем массив обратных связей для сотрудника, если его нет
		if (!allFeedbacks[employeeId]) {
			allFeedbacks[employeeId] = []
		}

		// Добавляем новую обратную связь
		const newFeedback = {
			id: Date.now(),
			text: feedbackText,
			from: managerName,
			date: new Date().toISOString(),
			read: false,
		}

		allFeedbacks[employeeId].unshift(newFeedback) // Добавляем в начало массива

		// Сохраняем обратно в localStorage
		localStorage.setItem('employeeFeedbacks', JSON.stringify(allFeedbacks))
	} catch (error) {
		console.error('Ошибка сохранения обратной связи:', error)
	}
}

function updateTaskStatus(taskId, newStatus) {
	if (window.teamManagement) {
		window.teamManagement.updateTaskStatus(taskId, newStatus)
	}
}

function editTask(taskId) {
	if (window.teamManagement) {
		window.teamManagement.editTask(taskId)
	}
}

function createManagementTask() {
	if (window.teamManagement) {
		window.teamManagement.createTask()
	}
}

document.addEventListener('DOMContentLoaded', () => {
	if (window.location.pathname.includes('team-management.html')) {
		window.teamManagement = new TeamManagement()
	}
})
