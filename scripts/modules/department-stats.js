class DepartmentStats {
	constructor() {
		this.employees = []
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

		this.loadDepartmentData()
		this.renderStats()
	}

	loadDepartmentData() {
		if (
			!(
				window.MockDB &&
				window.MockDB.Users &&
				window.MockDB.Courses &&
				window.MockDB.CourseUsers &&
				window.MockDB.Departments
			)
		) {
			this.employees = []
			return
		}
		// Определить текущего пользователя (руководителя) по залогиненному email
		const userData = JSON.parse(localStorage.getItem('userData'))
		const myEmail = userData?.employee?.email || ''
		const currentUser = window.MockDB.Users.find(u => u.email === myEmail)
		if (!currentUser) {
			this.employees = []
			return
		}
		const departmentId = currentUser.departmentId
		// Собрать всех сотрудников этого отдела (и руководителя)
		const deptUsers = window.MockDB.Users.filter(
			u => u.departmentId === departmentId
		)
		const allDepartments = window.MockDB.Departments
		const departmentName =
			allDepartments.find(d => d.id === departmentId)?.name || ''

		const allCourseUsers = window.MockDB.CourseUsers
		const allCourses = window.MockDB.Courses
		this.employees = deptUsers.map(user => {
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
				email: user.email,
				courses,
				progress,
				department: departmentName,
			}
		})
	}

	renderStats() {
		this.renderDepartmentOverview()
		this.renderEmployeesStats()
		this.renderCoursesStats()
	}

	renderDepartmentOverview() {
		const deptEmployees = this.employees.length
		const totalProgress = this.employees.reduce(
			(sum, emp) => sum + emp.progress,
			0
		)
		const avgProgress = Math.round(totalProgress / deptEmployees)

		const totalCourses = this.employees.reduce(
			(sum, emp) => sum + emp.courses.length,
			0
		)
		const completedCourses = this.employees.reduce(
			(sum, emp) =>
				sum + emp.courses.filter(c => c.status === 'пройден').length,
			0
		)
		const overdueCourses = this.employees.reduce(
			(sum, emp) =>
				sum + emp.courses.filter(c => c.status === 'просрочен').length,
			0
		)

		document.getElementById('deptEmployees').textContent = deptEmployees
		document.getElementById('deptAvgProgress').textContent = `${avgProgress}%`
		document.getElementById('deptCompletedCourses').textContent =
			completedCourses
		document.getElementById('deptOverdueCourses').textContent = overdueCourses
	}

	renderEmployeesStats() {
		const container = document.getElementById('employeesStatsList')
		if (!container) return

		container.innerHTML = ''

		// Сортируем сотрудников по прогрессу (от худшего к лучшему для внимания руководителя)
		const sortedEmployees = [...this.employees].sort(
			(a, b) => a.progress - b.progress
		)

		sortedEmployees.forEach(employee => {
			const employeeStat = this.createEmployeeStatCard(employee)
			container.appendChild(employeeStat)
		})
	}

	createEmployeeStatCard(employee) {
		const card = document.createElement('div')
		card.className = 'employee-stat-card'

		const progressClass =
			employee.progress < 30
				? 'low'
				: employee.progress < 70
				? 'medium'
				: 'high'

		card.innerHTML = `
			<div class="employee-stat-header">
				<div class="employee-stat-info">
					<h4>${employee.name}</h4>
					<p>${employee.position}</p>
				</div>
				<div class="employee-stat-progress progress-${progressClass}">
					<div class="progress-bar" style="width: ${employee.progress}%"></div>
					<span class="progress-text">${employee.progress}%</span>
				</div>
			</div>
			<div class="employee-stat-details">
				<div class="stat-detail">
					<span class="detail-label">Курсов всего:</span>
					<span class="detail-value">${employee.courses.length}</span>
				</div>
				<div class="stat-detail">
					<span class="detail-label">Завершено:</span>
					<span class="detail-value completed">${
						employee.courses.filter(c => c.status === 'пройден').length
					}</span>
				</div>
				<div class="stat-detail">
					<span class="detail-label">В процессе:</span>
					<span class="detail-value in-progress">${
						employee.courses.filter(c => c.status === 'в процессе').length
					}</span>
				</div>
				<div class="stat-detail">
					<span class="detail-label">Просрочено:</span>
					<span class="detail-value overdue">${
						employee.courses.filter(c => c.status === 'просрочен').length
					}</span>
				</div>
			</div>
		`

		return card
	}

	renderCoursesStats() {
		const container = document.getElementById('coursesStatsList')
		if (!container) return

		// Группируем курсы по названию и считаем статистику
		const coursesStats = {}

		this.employees.forEach(employee => {
			employee.courses.forEach(course => {
				if (!coursesStats[course.title]) {
					coursesStats[course.title] = {
						title: course.title,
						assigned: 0,
						completed: 0,
						inProgress: 0,
						overdue: 0,
						totalProgress: 0,
					}
				}

				const stat = coursesStats[course.title]
				stat.assigned++

				if (course.status === 'пройден') stat.completed++
				else if (course.status === 'в процессе') stat.inProgress++
				else if (course.status === 'просрочен') stat.overdue++

				stat.totalProgress += course.progress
			})
		})

		// Преобразуем в массив и сортируем по количеству участников
		const coursesArray = Object.values(coursesStats)
			.map(stat => ({
				...stat,
				avgProgress: Math.round(stat.totalProgress / stat.assigned),
			}))
			.sort((a, b) => b.assigned - a.assigned)

		container.innerHTML = ''

		coursesArray.forEach(courseStat => {
			const courseCard = this.createCourseStatCard(courseStat)
			container.appendChild(courseCard)
		})
	}

	createCourseStatCard(courseStat) {
		const card = document.createElement('div')
		card.className = 'course-stat-card'

		const completionRate = Math.round(
			(courseStat.completed / courseStat.assigned) * 100
		)

		card.innerHTML = `
			<div class="course-stat-header">
				<h4>${courseStat.title}</h4>
				<div class="course-completion-rate">
					<div class="completion-bar" style="width: ${completionRate}%"></div>
					<span class="completion-text">${completionRate}%</span>
				</div>
			</div>
			<div class="course-stat-details">
				<div class="stat-detail">
					<span class="detail-label">Назначено:</span>
					<span class="detail-value">${courseStat.assigned}</span>
				</div>
				<div class="stat-detail">
					<span class="detail-label">Завершили:</span>
					<span class="detail-value completed">${courseStat.completed}</span>
				</div>
				<div class="stat-detail">
					<span class="detail-label">Проходят:</span>
					<span class="detail-value in-progress">${courseStat.inProgress}</span>
				</div>
				<div class="stat-detail">
					<span class="detail-label">Просрочено:</span>
					<span class="detail-value overdue">${courseStat.overdue}</span>
				</div>
				<div class="stat-detail">
					<span class="detail-label">Средний прогресс:</span>
					<span class="detail-value">${courseStat.avgProgress}%</span>
				</div>
			</div>
		`

		return card
	}
}

document.addEventListener('DOMContentLoaded', () => {
	if (window.location.pathname.includes('department-stats.html')) {
		window.departmentStats = new DepartmentStats()
	}
})
