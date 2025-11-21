class TeamManagement {
	constructor() {
		this.tasks = []
		this.developmentPlan = []
		this.init()
	}

	init() {
		if (!AuthManager.checkAuth()) {
			window.location.href = 'login.html'
			return
		}

		// Проверяем роль
		if (!isDepartmentHead()) {
			window.location.href = '../index.html'
			return
		}

		this.loadManagementData()
		this.renderTasks()
		this.renderDevelopmentPlan()
	}

	loadManagementData() {
		// Имитируем управленческие задачи
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
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU')
	}

	updateTaskStatus(taskId, newStatus) {
		const task = this.tasks.find(t => t.id === taskId)
		if (task) {
			task.status = newStatus
			this.renderTasks()

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
		if (task) {
			const newTitle =
				typeof modal !== 'undefined'
					? await modal.prompt(
							'Введите новое название задачи:',
							'Редактирование задачи',
							task.title
					  )
					: prompt('Введите новое название задачи:', task.title)

			if (newTitle) {
				task.title = newTitle
				this.renderTasks()
			}
		}
	}
}

// Глобальные функции для кнопок
async function assignTraining() {
	const courseName =
		typeof modal !== 'undefined'
			? await modal.prompt(
					'Введите название курса для назначения:',
					'Назначение обучения',
					'Название курса'
			  )
			: prompt('Введите название курса для назначения:')

	if (!courseName) return

	const employeeName =
		typeof modal !== 'undefined'
			? await modal.prompt(
					'Введите имя сотрудника:',
					'Назначение обучения',
					'Имя сотрудника'
			  )
			: prompt('Введите имя сотрудника:')

	if (courseName && employeeName) {
		if (typeof NotificationManager !== 'undefined') {
			NotificationManager.showTempNotification(
				`Курс "${courseName}" назначен сотруднику ${employeeName}`,
				'success'
			)
		} else if (typeof modal !== 'undefined') {
			modal.show(
				`Курс "${courseName}" назначен сотруднику ${employeeName}`,
				'success',
				'Успешно'
			)
		} else {
			alert(`Курс "${courseName}" назначен сотруднику ${employeeName}`)
		}
	}
}

async function evaluatePerformance() {
	const employeeName =
		typeof modal !== 'undefined'
			? await modal.prompt(
					'Введите имя сотрудника для оценки:',
					'Оценка эффективности',
					'Имя сотрудника'
			  )
			: prompt('Введите имя сотрудника для оценки:')

	if (!employeeName) return

	const rating =
		typeof modal !== 'undefined'
			? await modal.prompt(
					'Оценка (1-5):',
					'Оценка эффективности',
					'Оценка от 1 до 5'
			  )
			: prompt('Оценка (1-5):')

	if (employeeName && rating) {
		if (typeof NotificationManager !== 'undefined') {
			NotificationManager.showTempNotification(
				`Оценка ${rating}/5 сохранена для ${employeeName}`,
				'success'
			)
		} else if (typeof modal !== 'undefined') {
			modal.show(
				`Оценка ${rating}/5 сохранена для ${employeeName}`,
				'success',
				'Успешно'
			)
		} else {
			alert(`Оценка ${rating}/5 сохранена для ${employeeName}`)
		}
	}
}

async function setGoals() {
	const goal =
		typeof modal !== 'undefined'
			? await modal.prompt(
					'Введите цель развития для отдела:',
					'Установка целей',
					'Цель развития'
			  )
			: prompt('Введите цель развития для отдела:')

	if (goal) {
		if (typeof NotificationManager !== 'undefined') {
			NotificationManager.showTempNotification(
				`Цель "${goal}" установлена для отдела`,
				'success'
			)
		} else if (typeof modal !== 'undefined') {
			modal.show(`Цель "${goal}" установлена для отдела`, 'success', 'Успешно')
		} else {
			alert(`Цель "${goal}" установлена для отдела`)
		}
	}
}

async function provideFeedback() {
	const employeeName =
		typeof modal !== 'undefined'
			? await modal.prompt(
					'Введите имя сотрудника:',
					'Обратная связь',
					'Имя сотрудника'
			  )
			: prompt('Введите имя сотрудника:')

	if (!employeeName) return

	const feedback =
		typeof modal !== 'undefined'
			? await modal.prompt(
					'Введите обратную связь:',
					'Обратная связь',
					'Текст обратной связи'
			  )
			: prompt('Введите обратную связь:')

	if (employeeName && feedback) {
		if (typeof NotificationManager !== 'undefined') {
			NotificationManager.showTempNotification(
				`Обратная связь отправлена ${employeeName}`,
				'success'
			)
		} else if (typeof modal !== 'undefined') {
			modal.show(
				`Обратная связь отправлена ${employeeName}`,
				'success',
				'Успешно'
			)
		} else {
			alert(`Обратная связь отправлена ${employeeName}`)
		}
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

document.addEventListener('DOMContentLoaded', () => {
	if (window.location.pathname.includes('team-management.html')) {
		window.teamManagement = new TeamManagement()
	}
})
