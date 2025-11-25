class HRDashboard {
	constructor() {
		this.employees = []
		this.filteredEmployees = []
		this.init()
	}

	init() {
		if (!AuthManager.checkAuth()) {
			window.location.href = 'login.html'
			return
		}

		// Проверяем роль
		if (!isHRManager()) {
			window.location.href = '../index.html'
			return
		}

		this.loadEmployeesData()
		this.setupEventListeners()
		this.renderDashboard()
	}

	loadEmployeesData() {
		// Забирать всех пользователей из MockDB
		if (
			!(
				window.MockDB &&
				window.MockDB.Users &&
				window.MockDB.Courses &&
				window.MockDB.CourseUsers
			)
		) {
			this.employees = []
			this.filteredEmployees = []
			return
		}
		// Берём только сотрудников (не HR и не руководителей)
		const allUsers = window.MockDB.Users.filter(
			user => user.role === window.MockDB.UserRole.EMPLOYEE
		)
		const allDepartments = window.MockDB.Departments
		const allCourseUsers = window.MockDB.CourseUsers
		const allCourses = window.MockDB.Courses

		this.employees = allUsers.map(user => {
			// Обрабатываем только сотрудников (EMPLOYEE)
			const department =
				allDepartments.find(d => d.id === user.departmentId)?.name || ''
			const courseRefs = allCourseUsers.filter(cu => cu.userId === user.id)
			const courses = courseRefs.map(cu => {
				const courseInfo = allCourses.find(c => c.id === cu.courseId)
				return {
					title: courseInfo?.title || 'Не найдено',
					status: cu.status,
					progress: cu.progress,
					description: courseInfo?.description || '',
					due: cu.due,
					start: cu.start,
				}
			})
			// Средний прогресс
			const progress = courses.length
				? Math.round(
						courses.reduce((sum, c) => sum + (c.progress || 0), 0) /
							courses.length
				  )
				: 0
			return {
				id: user.id,
				name: user.name,
				position: user.position,
				department,
				email: user.email,
				courses,
				progress,
			}
		})
		this.filteredEmployees = [...this.employees]
	}

	setupEventListeners() {
		const departmentFilter = document.getElementById('departmentFilter')
		const statusFilter = document.getElementById('statusFilter')
		const searchInput = document.getElementById('searchInput')

		if (departmentFilter) {
			departmentFilter.addEventListener('change', () => {
				this.applyFilters()
			})
		}

		if (statusFilter) {
			statusFilter.addEventListener('change', () => {
				this.applyFilters()
			})
		}

		if (searchInput) {
			searchInput.addEventListener('input', () => {
				this.applyFilters()
			})
		}
	}

	applyFilters() {
		const department =
			document.getElementById('departmentFilter')?.value || 'all'
		const status = document.getElementById('statusFilter')?.value || 'all'
		const search =
			document.getElementById('searchInput')?.value.toLowerCase() || ''

		let filtered = [...this.employees]

		// Фильтр по отделу
		if (department !== 'all') {
			filtered = filtered.filter(emp => emp.department === department)
		}

		// Фильтр по статусу курсов
		if (status !== 'all') {
			filtered = filtered.filter(emp => {
				const courses = emp.courses || []
				switch (status) {
					case 'completed':
						return courses.some(c => c.status === 'пройден')
					case 'in-progress':
						return courses.some(c => c.status === 'в процессе')
					case 'overdue':
						return courses.some(c => c.status === 'просрочен')
					default:
						return true
				}
			})
		}

		// Поиск по имени, должности или email
		if (search) {
			filtered = filtered.filter(emp => {
				const searchText =
					`${emp.name} ${emp.position} ${emp.email}`.toLowerCase()
				return searchText.includes(search)
			})
		}

		this.filteredEmployees = filtered
		this.renderEmployees()
		this.updateResultsCount()
	}

	updateResultsCount() {
		const countElement = document.getElementById('resultsCount')
		if (countElement) {
			countElement.textContent = this.filteredEmployees.length
		}
	}

	renderDashboard() {
		this.renderStats()
		this.renderEmployees()
		this.updateResultsCount()
	}

	renderStats() {
		const totalEmployees = this.employees.length
		const allCourses = this.employees.flatMap(emp => emp.courses)
		const activeCourses = allCourses.filter(
			course => course.status === 'в процессе'
		).length
		const completedCourses = allCourses.filter(
			course => course.status === 'пройден'
		).length
		const overdueCourses = allCourses.filter(
			course => course.status === 'просрочен'
		).length

		document.getElementById('totalEmployees').textContent = totalEmployees
		document.getElementById('activeCourses').textContent = activeCourses
		document.getElementById('completedCourses').textContent = completedCourses
		document.getElementById('overdueCourses').textContent = overdueCourses
	}

	renderEmployees() {
		const container = document.getElementById('employeesList')
		if (!container) return

		container.innerHTML = ''

		if (this.filteredEmployees.length === 0) {
			container.innerHTML =
				'<p class="text-center" style="padding: 2rem; color: var(--text-muted);">Сотрудники не найдены</p>'
			return
		}

		this.filteredEmployees.forEach(employee => {
			const employeeCard = this.createEmployeeCard(employee)
			container.appendChild(employeeCard)
		})

		this.updateResultsCount()
	}

	createEmployeeCard(employee) {
		const card = document.createElement('div')
		card.className = 'employee-card card'

		const coursesSummary = this.getCoursesSummary(employee.courses)

		card.innerHTML = `
			<div class="employee-header">
				<div class="employee-info">
					<h3 class="employee-name">${employee.name}</h3>
					<p class="employee-position">${employee.position}</p>
					<p class="employee-department">${employee.department}</p>
					<p class="employee-email">${employee.email}</p>
				</div>
				<div class="employee-progress">
					<div class="progress-circle" style="--progress: ${employee.progress}%">
						<span class="progress-text">${employee.progress}%</span>
					</div>
				</div>
			</div>
			<div class="employee-courses-summary">
				<div class="summary-item">
					<span class="summary-label">Всего курсов:</span>
					<span class="summary-value">${coursesSummary.total}</span>
				</div>
				<div class="summary-item">
					<span class="summary-label">Пройдено:</span>
					<span class="summary-value completed">${coursesSummary.completed}</span>
				</div>
				<div class="summary-item">
					<span class="summary-label">В процессе:</span>
					<span class="summary-value in-progress">${coursesSummary.inProgress}</span>
				</div>
				<div class="summary-item">
					<span class="summary-label">Просрочено:</span>
					<span class="summary-value overdue">${coursesSummary.overdue}</span>
				</div>
			</div>
			<div class="employee-actions">
				<button class="btn btn-outline btn-sm" onclick="viewEmployeeDetails(${employee.id})">
					Подробнее
				</button>
				<button class="btn btn-primary btn-sm" onclick="assignCourse(${employee.id})">
					Назначить курс
				</button>
			</div>
		`

		return card
	}

	getCoursesSummary(courses) {
		return {
			total: courses.length,
			completed: courses.filter(c => c.status === 'пройден').length,
			inProgress: courses.filter(c => c.status === 'в процессе').length,
			overdue: courses.filter(c => c.status === 'просрочен').length,
		}
	}
}

// Глобальные функции для кнопок
function viewEmployeeDetails(employeeId) {
	// Имитируем просмотр деталей сотрудника
	const employee = hrDashboard.employees.find(emp => emp.id === employeeId)
	if (employee) {
		let details = `Детали сотрудника:\n\n`
		details += `ФИО: ${employee.name}\n`
		details += `Должность: ${employee.position}\n`
		details += `Отдел: ${employee.department}\n`
		details += `Email: ${employee.email}\n\n`
		details += `Курсы:\n`
		employee.courses.forEach(course => {
			details += `- ${course.title}: ${course.status} (${course.progress}%)\n`
		})

		if (typeof modal !== 'undefined') {
			modal.show(details, 'info', 'Информация о сотруднике')
		} else {
			alert(details)
		}
	}
}

async function assignCourse(employeeId) {
	// Получаем список доступных курсов из MockDB
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
		label: `${course.title} (${course.duration} ч.)`,
	}))

	if (courses.length === 0) {
		if (typeof modal !== 'undefined') {
			modal.show('Нет доступных курсов для назначения', 'info', 'Информация')
		} else {
			alert('Нет доступных курсов для назначения')
		}
		return
	}

	// Показываем выбор курса
	const selectedCourseId =
		typeof modal !== 'undefined'
			? await modal.select(
					'Выберите курс для назначения:',
					courses,
					'Назначение курса'
			  )
			: null

	if (selectedCourseId) {
		const selectedCourse = window.MockDB.Courses.find(
			c => c.id == selectedCourseId
		)
		if (selectedCourse) {
			// Сохраняем назначение курса в общую "БД" CourseUsers,
			// чтобы все панели и отчёты видели одно и то же состояние
			if (window.MockDB && window.MockDB.CourseUsers) {
				const existingAssignment = window.MockDB.CourseUsers.find(
					cu => cu.userId === employeeId && cu.courseId == selectedCourseId
				)

				if (!existingAssignment) {
					window.MockDB.CourseUsers.push({
						userId: employeeId,
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
					`Курс "${selectedCourse.title}" назначен сотруднику`,
					'success'
				)
			} else if (typeof modal !== 'undefined') {
				modal.show(
					`Курс "${selectedCourse.title}" назначен сотруднику`,
					'success',
					'Успешно'
				)
			} else {
				alert(`Курс "${selectedCourse.title}" назначен сотруднику`)
			}
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	if (window.location.pathname.includes('hr-dashboard.html')) {
		window.hrDashboard = new HRDashboard()
	}
})
