class ReportsManager {
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
		if (!isHRManager()) {
			window.location.href = '../index.html'
			return
		}

		this.loadEmployeesData()
	}

	loadEmployeesData() {
		// Загружаем данные из MockDB, только сотрудников
		if (
			!(
				window.MockDB &&
				window.MockDB.Users &&
				window.MockDB.Courses &&
				window.MockDB.CourseUsers
			)
		) {
			this.employees = []
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
	}

	generateEmployeeReport() {
		let report = `
			<div class="report-header">
				<h1 class="page-title">Отчет по сотрудникам</h1>
				<p><strong>Дата генерации:</strong> ${new Date().toLocaleDateString(
					'ru-RU'
				)}</p>
			</div>
			<div class="report-section">
				<table class="report-table">
					<thead>
						<tr>
							<th>ФИО</th>
							<th>Должность</th>
							<th>Отдел</th>
							<th>Email</th>
							<th>Прогресс</th>
							<th>Курсов всего</th>
							<th>Пройдено</th>
							<th>В процессе</th>
							<th>Просрочено</th>
						</tr>
					</thead>
					<tbody>
		`

		this.employees.forEach(employee => {
			const coursesSummary = this.getCoursesSummary(employee.courses)
			report += `
				<tr>
					<td>${employee.name}</td>
					<td>${employee.position}</td>
					<td>${employee.department}</td>
					<td>${employee.email}</td>
					<td>${employee.progress}%</td>
					<td>${coursesSummary.total}</td>
					<td>${coursesSummary.completed}</td>
					<td>${coursesSummary.inProgress}</td>
					<td>${coursesSummary.overdue}</td>
				</tr>
			`
		})

		report += `
					</tbody>
				</table>
			</div>
			<div class="report-footer">
				<p>Документ сформирован автоматически системой управления обучением</p>
				<p>Все права защищены © ${new Date().getFullYear()} ТехноЛайн</p>
			</div>
		`

		this.showReport(report)
	}

	generateCoursesReport() {
		const coursesByDepartment = this.groupCoursesByDepartment()

		let report = `
			<h2>Отчет по курсам</h2>
			<p><strong>Дата генерации:</strong> ${new Date().toLocaleDateString(
				'ru-RU'
			)}</p>
		`

		Object.keys(coursesByDepartment).forEach(dept => {
			report += `<h3>${dept}</h3>`
			report += `
				<table class="report-table">
					<thead>
						<tr>
							<th>Курс</th>
							<th>Сотрудников назначено</th>
							<th>Проходят</th>
							<th>Завершили</th>
							<th>Средний прогресс</th>
						</tr>
					</thead>
					<tbody>
			`

			coursesByDepartment[dept].forEach(courseData => {
				report += `
					<tr>
						<td>${courseData.title}</td>
						<td>${courseData.assigned}</td>
						<td>${courseData.inProgress}</td>
						<td>${courseData.completed}</td>
						<td>${courseData.avgProgress}%</td>
					</tr>
				`
			})

			report += `
					</tbody>
				</table>
			`
		})

		this.showReport(report)
	}

	generateOverdueReport() {
		const overdueCourses = []

		this.employees.forEach(employee => {
			employee.courses.forEach(course => {
				if (course.status === 'просрочен') {
					overdueCourses.push({
						employee: employee.name,
						course: course.title,
						progress: course.progress,
					})
				}
			})
		})

		let report = `
			<h2>Отчет о просроченных курсах</h2>
			<p><strong>Дата генерации:</strong> ${new Date().toLocaleDateString(
				'ru-RU'
			)}</p>
			<p><strong>Всего просроченных курсов:</strong> ${overdueCourses.length}</p>
		`

		if (overdueCourses.length > 0) {
			report += `
				<table class="report-table">
					<thead>
						<tr>
							<th>Сотрудник</th>
							<th>Курс</th>
							<th>Прогресс</th>
						</tr>
					</thead>
					<tbody>
			`

			overdueCourses.forEach(item => {
				report += `
					<tr>
						<td>${item.employee}</td>
						<td>${item.course}</td>
						<td>${item.progress}%</td>
					</tr>
				`
			})

			report += `
					</tbody>
				</table>
			`
		} else {
			report += '<p>Просроченных курсов нет.</p>'
		}

		this.showReport(report)
	}

	generateSummaryReport() {
		const totalEmployees = this.employees.length
		const totalCourses = this.employees.reduce(
			(sum, emp) => sum + emp.courses.length,
			0
		)
		const completedCourses = this.employees.reduce(
			(sum, emp) =>
				sum + emp.courses.filter(c => c.status === 'пройден').length,
			0
		)
		const inProgressCourses = this.employees.reduce(
			(sum, emp) =>
				sum + emp.courses.filter(c => c.status === 'в процессе').length,
			0
		)
		const overdueCourses = this.employees.reduce(
			(sum, emp) =>
				sum + emp.courses.filter(c => c.status === 'просрочен').length,
			0
		)

		const avgProgress = Math.round(
			this.employees.reduce((sum, emp) => sum + emp.progress, 0) /
				totalEmployees
		)

		let report = `
			<h2>Общий отчет по обучению</h2>
			<p><strong>Дата генерации:</strong> ${new Date().toLocaleDateString(
				'ru-RU'
			)}</p>

			<h3>Общая статистика</h3>
			<ul>
				<li><strong>Всего сотрудников:</strong> ${totalEmployees}</li>
				<li><strong>Всего курсов:</strong> ${totalCourses}</li>
				<li><strong>Завершенных курсов:</strong> ${completedCourses}</li>
				<li><strong>Курсов в процессе:</strong> ${inProgressCourses}</li>
				<li><strong>Просроченных курсов:</strong> ${overdueCourses}</li>
				<li><strong>Средний процент пройденных курсов:</strong> ${avgProgress}%</li>
			</ul>

			<h3>Статистика по отделам</h3>
		`

		const departmentStats = this.getDepartmentStats()
		Object.keys(departmentStats).forEach(dept => {
			const stats = departmentStats[dept]
			report += `
				<h4>${dept}</h4>
				<ul>
					<li>Сотрудников: ${stats.employees}</li>
					<li>Средний прогресс: ${stats.avgProgress}%</li>
					<li>Завершенных курсов: ${stats.completedCourses}</li>
				</ul>
			`
		})

		this.showReport(report)
	}

	showReport(content) {
		const previewSection = document.getElementById('reportPreview')
		const contentDiv = document.getElementById('reportContent')

		contentDiv.innerHTML = content
		previewSection.style.display = 'block'
		previewSection.scrollIntoView({ behavior: 'smooth' })
	}

	groupCoursesByDepartment() {
		const result = {}

		this.employees.forEach(employee => {
			const dept = employee.department
			if (!result[dept]) {
				result[dept] = {}
			}

			employee.courses.forEach(course => {
				if (!result[dept][course.title]) {
					result[dept][course.title] = {
						title: course.title,
						assigned: 0,
						inProgress: 0,
						completed: 0,
						totalProgress: 0,
						count: 0,
					}
				}

				const courseData = result[dept][course.title]
				courseData.assigned++
				courseData.totalProgress += course.progress
				courseData.count++

				if (course.status === 'в процессе') courseData.inProgress++
				else if (course.status === 'пройден') courseData.completed++
			})
		})

		// Преобразуем в массивы и рассчитываем средний прогресс
		Object.keys(result).forEach(dept => {
			result[dept] = Object.values(result[dept]).map(course => ({
				...course,
				avgProgress: Math.round(course.totalProgress / course.count),
			}))
		})

		return result
	}

	getDepartmentStats() {
		const result = {}

		this.employees.forEach(employee => {
			const dept = employee.department
			if (!result[dept]) {
				result[dept] = {
					employees: 0,
					totalProgress: 0,
					completedCourses: 0,
				}
			}

			result[dept].employees++
			result[dept].totalProgress += employee.progress
			result[dept].completedCourses += employee.courses.filter(
				c => c.status === 'пройден'
			).length
		})

		// Рассчитываем средний прогресс
		Object.keys(result).forEach(dept => {
			result[dept].avgProgress = Math.round(
				result[dept].totalProgress / result[dept].employees
			)
		})

		return result
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
function generateEmployeeReport() {
	window.reportsManager.generateEmployeeReport()
}

function generateCoursesReport() {
	window.reportsManager.generateCoursesReport()
}

function generateOverdueReport() {
	window.reportsManager.generateOverdueReport()
}

function generateSummaryReport() {
	window.reportsManager.generateSummaryReport()
}

function printReport() {
	// Получаем содержимое отчета
	const reportContent = document.getElementById('reportContent')
	if (!reportContent || !reportContent.innerHTML) {
		if (typeof modal !== 'undefined') {
			modal.show('Нет отчета для печати', 'warning', 'Внимание')
		} else {
			alert('Нет отчета для печати')
		}
		return
	}

	// Создаем контейнер для печати
	const printContainer = document.createElement('div')
	printContainer.id = 'printContent'
	printContainer.className = 'print-only'
	printContainer.style.cssText = `
		display: none;
		position: absolute;
		left: -9999px;
		top: -9999px;
	`

	// Копируем содержимое отчета
	printContainer.innerHTML = reportContent.innerHTML
	document.body.appendChild(printContainer)

	// Печатаем
	setTimeout(() => {
		window.print()

		// Удаляем контейнер после печати
		setTimeout(() => {
			document.body.removeChild(printContainer)
		}, 500)
	}, 100)
}

document.addEventListener('DOMContentLoaded', () => {
	if (window.location.pathname.includes('reports.html')) {
		window.reportsManager = new ReportsManager()
	}
})
