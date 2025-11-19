class FilterManager {
	constructor() {
		this.courses = []
		this.filteredCourses = []
		this.currentFilters = {
			status: 'all',
			search: '',
		}
		this.init()
	}

	init() {
		this.loadCourses()
		this.setupEventListeners()
		this.applyFilters()
	}

	loadCourses() {
		const userData = JSON.parse(localStorage.getItem('userData'))

		if (userData && userData.courses) {
			this.courses = userData.courses
		} else {
			this.courses = [
				{
					id: 1,
					title: 'IT-безопасность',
					status: 'пройден',
					start_date: '2024-01-15',
					due_date: '2025-01-15',
					progress: 100,
					description: 'Курс по основам информационной безопасности',
				},
				{
					id: 2,
					title: 'Работа с Laravel',
					status: 'в процессе',
					start_date: '2025-03-01',
					due_date: '2025-06-01',
					progress: 45,
					description: 'Изучение фреймворка Laravel для веб-разработки',
				},
				{
					id: 3,
					title: 'Основы DevOps',
					status: 'назначен',
					start_date: '2025-04-01',
					due_date: '2025-07-01',
					progress: 0,
					description: 'Введение в практики DevOps',
				},
				{
					id: 4,
					title: 'Управление проектами',
					status: 'в процессе',
					start_date: '2025-02-01',
					due_date: '2025-05-01',
					progress: 30,
					description: 'Методологии управления IT-проектами',
				},
			]
		}

		this.filteredCourses = [...this.courses]
	}

	setupEventListeners() {
		const statusFilter = document.getElementById('statusFilter')
		const searchInput = document.getElementById('searchInput')

		if (statusFilter) {
			statusFilter.addEventListener('change', e => {
				this.currentFilters.status = e.target.value
				this.applyFilters()
			})
		}

		if (searchInput) {
			searchInput.addEventListener('input', e => {
				this.currentFilters.search = e.target.value.toLowerCase()
				this.applyFilters()
			})
		}
	}

	applyFilters() {
		this.filteredCourses = this.courses.filter(course => {
			if (
				this.currentFilters.status !== 'all' &&
				course.status !== this.currentFilters.status
			) {
				return false
			}

			if (
				this.currentFilters.search &&
				!course.title.toLowerCase().includes(this.currentFilters.search)
			) {
				return false
			}

			return true
		})

		this.renderCourses()
		this.updateResultsCount()
	}

	renderCourses() {
		const container = document.getElementById('coursesContainer')
		if (!container) return

		while (container.firstChild) {
			container.removeChild(container.firstChild)
		}

		if (this.filteredCourses.length === 0) {
			const emptyCard = document.createElement('div')
			emptyCard.className = 'card text-center'

			const title = document.createElement('h3')
			title.textContent = 'Курсы не найдены'

			const message = document.createElement('p')
			message.textContent = 'Попробуйте изменить параметры фильтрации'

			emptyCard.appendChild(title)
			emptyCard.appendChild(message)
			container.appendChild(emptyCard)
			return
		}

		this.filteredCourses.forEach(course => {
			const courseCard = this.createCourseCard(course)
			container.appendChild(courseCard)
		})
	}

	createCourseCard(course) {
		const card = document.createElement('div')
		card.className = 'card course-card'
		card.addEventListener('click', () => {
			window.location.href = `course-details.html?id=${course.id}`
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

		const description = document.createElement('p')
		description.className = 'course-description'
		description.textContent = course.description

		meta.appendChild(description)

		card.appendChild(title)
		card.appendChild(status)
		card.appendChild(meta)

		return card
	}

	updateResultsCount() {
		const countElement = document.getElementById('resultsCount')
		if (countElement) {
			countElement.textContent = `Найдено курсов: ${this.filteredCourses.length}`
		}
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

	resetFilters() {
		this.currentFilters = {
			status: 'all',
			search: '',
		}

		const statusFilter = document.getElementById('statusFilter')
		const searchInput = document.getElementById('searchInput')

		if (statusFilter) statusFilter.value = 'all'
		if (searchInput) searchInput.value = ''

		this.applyFilters()
	}

	// Функция печати сертификатов пройденных курсов
	printCertificates() {
		// Проверяем авторизацию
		if (!AuthManager.checkAuth()) {
			alert('Необходимо авторизоваться для печати сертификатов')
			window.location.href = 'login.html'
			return
		}

		const userData = JSON.parse(localStorage.getItem('userData'))
		console.log('Данные пользователя для сертификатов:', userData)

		if (!userData || !userData.courses) {
			alert('Нет данных для печати сертификатов')
			return
		}

		// Фильтруем только пройденные курсы
		const completedCourses = userData.courses.filter(
			course => course.status === 'пройден'
		)

		console.log('Найденные пройденные курсы:', completedCourses)

		if (completedCourses.length === 0) {
			alert('У вас нет пройденных курсов для печати сертификатов')
			return
		}

		// Создаем контейнер для печати на текущей странице
		const printContainer = document.createElement('div')
		printContainer.id = 'printContent'
		printContainer.style.cssText = `
			display: none;
			font-family: Arial, sans-serif;
			font-size: 12px;
			line-height: 1.4;
			color: #000;
			background: white;
			padding: 20px;
			position: absolute;
			left: -9999px;
			top: -9999px;
			width: 210mm;
			max-width: 210mm;
			margin: 0;
			z-index: -1;
		`
		document.body.appendChild(printContainer)

		// Заголовок документа
		const header = document.createElement('div')
		header.style.cssText = `
			text-align: center;
			border-bottom: 3px solid #000;
			padding-bottom: 20px;
			margin-bottom: 30px;
		`

		const title = document.createElement('h1')
		title.style.cssText = `
			font-size: 28px;
			font-weight: bold;
			color: #000;
			margin: 0;
			text-transform: uppercase;
		`
		title.textContent = 'СЕРТИФИКАТЫ ОБ ОБУЧЕНИИ'

		const subtitle = document.createElement('p')
		subtitle.style.cssText = `
			font-size: 16px;
			color: #666;
			margin: 10px 0 0 0;
		`
		subtitle.textContent = 'ТехноЛайн - Система управления обучением персонала'

		header.appendChild(title)
		header.appendChild(subtitle)
		printContainer.appendChild(header)

		// Информация о сотруднике
		const employeeInfo = document.createElement('div')
		employeeInfo.style.cssText = `
			background: #f5f5f5;
			padding: 20px;
			border-radius: 8px;
			margin-bottom: 30px;
			border: 2px solid #ddd;
		`

		employeeInfo.innerHTML = `
			<h2 style="margin-top: 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
				Информация о сотруднике
			</h2>
			<p style="margin: 8px 0; font-size: 14px; color: #000;">
				<strong>ФИО:</strong> ${userData.employee.name}
			</p>
			<p style="margin: 8px 0; font-size: 14px; color: #000;">
				<strong>Должность:</strong> ${userData.employee.position}
			</p>
			<p style="margin: 8px 0; font-size: 14px; color: #000;">
				<strong>Подразделение:</strong> ${userData.employee.department}
			</p>
			<p style="margin: 8px 0; font-size: 14px; color: #000;">
				<strong>Email:</strong> ${userData.employee.email}
			</p>
			<p style="margin: 8px 0; font-size: 14px; color: #000;">
				<strong>Дата выдачи сертификатов:</strong> ${new Date().toLocaleDateString(
					'ru-RU'
				)}
			</p>
		`
		printContainer.appendChild(employeeInfo)

		// Сертификаты для каждого пройденного курса
		completedCourses.forEach((course, index) => {
			const certificate = this.createCertificateElement(
				course,
				index + 1,
				userData
			)
			printContainer.appendChild(certificate)
		})

		// Подвал документа
		const footer = document.createElement('div')
		footer.style.cssText = `
			margin-top: 40px;
			padding-top: 20px;
			border-top: 2px solid #000;
			text-align: center;
			font-size: 12px;
			color: #666;
		`
		footer.innerHTML = `
			<p>Документ сформирован автоматически системой управления обучением</p>
			<p>Все права защищены © ${new Date().getFullYear()} ТехноЛайн</p>
		`
		printContainer.appendChild(footer)

		// Добавляем стили для печати
		const printStyles = document.createElement('style')
		printStyles.id = 'printStyles'
		printStyles.textContent = `
			@media print {
				body * { visibility: hidden; }
				#printContent, #printContent * { visibility: visible; }
				#printContent {
					position: static !important;
					display: block !important;
					left: 0 !important;
					top: 0 !important;
					width: 100% !important;
					max-width: none !important;
					margin: 0 !important;
					padding: 20px !important;
					background: white !important;
					color: black !important;
					z-index: 9999 !important;
				}
			}
		`
		document.head.appendChild(printStyles)

		// Печатаем
		setTimeout(() => {
			console.log('Вызываем window.print()')
			window.print()

			// Удаляем контейнер и стили после печати
			setTimeout(() => {
				document.head.removeChild(printStyles)
				document.body.removeChild(printContainer)
				console.log('Контейнер и стили печати удалены')
			}, 500)
		}, 100)
	}

	// Создание элемента сертификата для одного курса
	createCertificateElement(course, certificateNumber, userData) {
		const certificate = document.createElement('div')
		certificate.style.cssText = `
			border: 3px solid #4CAF50;
			border-radius: 12px;
			padding: 30px;
			margin-bottom: 25px;
			background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
			page-break-inside: avoid;
			position: relative;
		`

		// Декоративный элемент
		const decoration = document.createElement('div')
		decoration.style.cssText = `
			position: absolute;
			top: 15px;
			right: 15px;
			width: 60px;
			height: 60px;
			background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 24px;
			color: white;
			font-weight: bold;
		`
		decoration.textContent = '✓'
		certificate.appendChild(decoration)

		// Номер сертификата
		const certNumber = document.createElement('div')
		certNumber.style.cssText = `
			position: absolute;
			top: 15px;
			left: 15px;
			background: #4CAF50;
			color: white;
			padding: 5px 12px;
			border-radius: 20px;
			font-size: 12px;
			font-weight: bold;
		`
		certNumber.textContent = `СЕРТИФИКАТ № ${certificateNumber}`
		certificate.appendChild(certNumber)

		// Заголовок сертификата
		const title = document.createElement('h3')
		title.style.cssText = `
			color: #2E7D32;
			font-size: 24px;
			font-weight: bold;
			text-align: center;
			margin: 40px 0 10px 0;
			text-transform: uppercase;
			border-bottom: 2px solid #4CAF50;
			padding-bottom: 10px;
		`
		title.textContent = 'СЕРТИФИКАТ О ПРОХОЖДЕНИИ КУРСА'
		certificate.appendChild(title)

		// ФИО сотрудника
		const employeeName = document.createElement('h4')
		employeeName.style.cssText = `
			color: #000;
			font-size: 18px;
			font-weight: bold;
			text-align: center;
			margin: 20px 0 10px 0;
		`
		employeeName.textContent = userData.employee.name
		certificate.appendChild(employeeName)

		// Текст "прошел(а) обучение по курсу"
		const courseText = document.createElement('p')
		courseText.style.cssText = `
			color: #000;
			font-size: 16px;
			text-align: center;
			margin: 10px 0 20px 0;
			font-style: italic;
		`
		courseText.textContent = 'прошел(а) обучение по курсу'
		certificate.appendChild(courseText)

		// Название курса
		const courseTitle = document.createElement('h4')
		courseTitle.style.cssText = `
			color: #000;
			font-size: 20px;
			font-weight: bold;
			text-align: center;
			margin: 10px 0 20px 0;
			text-transform: uppercase;
			border: 2px solid #4CAF50;
			padding: 10px;
			border-radius: 8px;
			background: #f0f8f0;
		`
		courseTitle.textContent = course.title
		certificate.appendChild(courseTitle)

		// Информация о курсе
		const courseInfo = document.createElement('div')
		courseInfo.style.cssText = `
			background: #f0f8f0;
			padding: 20px;
			border-radius: 8px;
			margin: 20px 0;
			border-left: 4px solid #4CAF50;
		`

		const startDate = this.formatDate(course.start_date)
		const endDate = this.formatDate(course.due_date)

		courseInfo.innerHTML = `
			<p style="margin: 8px 0; font-size: 14px; color: #000;">
				<strong>Дата начала обучения:</strong> ${startDate}
			</p>
			<p style="margin: 8px 0; font-size: 14px; color: #000;">
				<strong>Дата завершения обучения:</strong> ${endDate}
			</p>
			<p style="margin: 8px 0; font-size: 14px; color: #000;">
				<strong>Продолжительность курса:</strong> ${this.calculateDuration(
					course.start_date,
					course.due_date
				)}
			</p>
			<p style="margin: 8px 0; font-size: 14px; color: #000;">
				<strong>Результат:</strong> <span style="color: #2E7D32; font-weight: bold;">УСПЕШНО ПРОЙДЕН (100%)</span>
			</p>
		`
		certificate.appendChild(courseInfo)

		// Описание курса
		if (course.description) {
			const description = document.createElement('div')
			description.style.cssText = `
				margin: 20px 0;
				padding: 15px;
				background: #fff;
				border: 1px solid #ddd;
				border-radius: 6px;
			`
			description.innerHTML = `
				<strong>Описание курса:</strong><br>
				${course.description}
			`
			certificate.appendChild(description)
		}

		// Подпись руководства
		const signature = document.createElement('div')
		signature.style.cssText = `
			margin-top: 40px;
			padding-top: 20px;
			border-top: 2px solid #4CAF50;
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
		`

		// Левая подпись - сотрудника
		const employeeSignature = document.createElement('div')
		employeeSignature.style.cssText = `
			text-align: center;
			flex: 1;
		`

		const employeeSigLabel = document.createElement('p')
		employeeSigLabel.style.cssText = `
			margin: 0 0 40px 0;
			color: #666;
			font-size: 12px;
		`
		employeeSigLabel.textContent = 'Подпись сотрудника'

		const employeeSigLine = document.createElement('div')
		employeeSigLine.style.cssText = `
			border-bottom: 1px solid #000;
			width: 150px;
			margin: 0 auto 5px auto;
		`

		const employeeSigName = document.createElement('p')
		employeeSigName.style.cssText = `
			margin: 0;
			font-size: 12px;
			color: #000;
			font-weight: bold;
		`
		employeeSigName.textContent = userData.employee.name

		employeeSignature.appendChild(employeeSigLabel)
		employeeSignature.appendChild(employeeSigLine)
		employeeSignature.appendChild(employeeSigName)

		// Правая подпись - руководителя
		const managerSignature = document.createElement('div')
		managerSignature.style.cssText = `
			text-align: center;
			flex: 1;
		`

		const managerSigLabel = document.createElement('p')
		managerSigLabel.style.cssText = `
			margin: 0 0 40px 0;
			color: #666;
			font-size: 12px;
		`
		managerSigLabel.textContent = 'Руководитель отдела обучения'

		const managerSigLine = document.createElement('div')
		managerSigLine.style.cssText = `
			border-bottom: 1px solid #000;
			width: 150px;
			margin: 0 auto 5px auto;
		`

		const managerSigName = document.createElement('p')
		managerSigName.style.cssText = `
			margin: 0;
			font-size: 12px;
			color: #000;
			font-weight: bold;
		`
		managerSigName.textContent = 'Сидиров С. С.'

		managerSignature.appendChild(managerSigLabel)
		managerSignature.appendChild(managerSigLine)
		managerSignature.appendChild(managerSigName)

		signature.appendChild(employeeSignature)
		signature.appendChild(managerSignature)
		certificate.appendChild(signature)

		// Дата выдачи сертификата
		const issueDate = document.createElement('div')
		issueDate.style.cssText = `
			margin-top: 20px;
			text-align: center;
			font-size: 12px;
			color: #666;
		`
		issueDate.innerHTML = `
			<p>Сертификат выдан: ${new Date().toLocaleDateString('ru-RU')}</p>
			<p>Система управления обучением персонала | ТехноЛайн</p>
		`
		certificate.appendChild(issueDate)

		return certificate
	}

	// Расчет продолжительности курса
	calculateDuration(startDate, endDate) {
		const start = new Date(startDate)
		const end = new Date(endDate)
		const diffTime = Math.abs(end - start)
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

		if (diffDays < 30) {
			return `${diffDays} ${this.getDayWord(diffDays)}`
		} else {
			const months = Math.floor(diffDays / 30)
			return `${months} ${this.getMonthWord(months)}`
		}
	}

	getDayWord(days) {
		if (days === 1) return 'день'
		if (days >= 2 && days <= 4) return 'дня'
		return 'дней'
	}

	getMonthWord(months) {
		if (months === 1) return 'месяц'
		if (months >= 2 && months <= 4) return 'месяца'
		return 'месяцев'
	}

	// Функция печати списка курсов
	printCoursesReport() {
		// Проверяем авторизацию
		if (!AuthManager.checkAuth()) {
			alert('Необходимо авторизоваться для печати списка курсов')
			window.location.href = 'login.html'
			return
		}

		const userData = JSON.parse(localStorage.getItem('userData'))
		console.log('Данные пользователя для списка курсов:', userData)

		if (!userData || !userData.employee) {
			alert('Данные пользователя не найдены')
			return
		}

		console.log('Печать списка курсов, данные пользователя:', userData)
		console.log('Отфильтрованные курсы:', this.filteredCourses)

		// Создаем контейнер для печати на текущей странице
		const printContainer = document.createElement('div')
		printContainer.id = 'printContent'
		printContainer.style.cssText = `
			display: none;
			font-family: Arial, sans-serif;
			font-size: 12px;
			line-height: 1.4;
			color: #000;
			background: white;
			padding: 20px;
			position: absolute;
			left: -9999px;
			top: -9999px;
			width: 210mm;
			max-width: 210mm;
			margin: 0;
			z-index: -1;
		`
		document.body.appendChild(printContainer)

		// Добавляем информацию о пользователе
		const userInfo = document.createElement('div')
		userInfo.className = 'print-user-info'
		userInfo.innerHTML = `
			<h3>Информация о сотруднике</h3>
			<p><strong>ФИО:</strong> ${userData.employee.name}</p>
			<p><strong>Должность:</strong> ${userData.employee.position}</p>
			<p><strong>Подразделение:</strong> ${userData.employee.department}</p>
			<p><strong>Email:</strong> ${userData.employee.email}</p>
			<p><strong>Дата отчета:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
		`
		printContainer.appendChild(userInfo)

		// Добавляем статистику
		const stats = document.createElement('div')
		stats.className = 'card'
		stats.innerHTML = `
			<h3 style="margin-top: 0; color: black;">Статистика обучения</h3>
			<p><strong>Общий прогресс:</strong> ${userData.progress || 0}%</p>
			<p><strong>Всего курсов:</strong> ${
				userData.courses ? userData.courses.length : 0
			}</p>
			<p><strong>Пройдено курсов:</strong> ${
				userData.courses
					? userData.courses.filter(c => c.status === 'пройден').length
					: 0
			}</p>
			<p><strong>Курсов в процессе:</strong> ${
				userData.courses
					? userData.courses.filter(c => c.status === 'в процессе').length
					: 0
			}</p>
		`
		printContainer.appendChild(stats)

		// Добавляем список курсов
		const coursesList = document.createElement('div')
		coursesList.innerHTML =
			'<h3 style="color: black; margin-top: 20px;">Список курсов</h3>'

		if (this.filteredCourses.length > 0) {
			this.filteredCourses.forEach(course => {
				const courseCard = document.createElement('div')
				courseCard.className = 'course-card'
				courseCard.innerHTML = `
					<h4 class="course-title">${course.title}</h4>
					<div class="course-status ${this.getStatusClass(course.status)}">
						${this.getStatusText(course.status)}
					</div>
					<div class="course-meta">
						<p><strong>Дата начала:</strong> ${this.formatDate(course.start_date)}</p>
						<p><strong>Срок окончания:</strong> ${this.formatDate(course.due_date)}</p>
						<p><strong>Прогресс:</strong> ${course.progress || 0}%</p>
						<p><strong>Описание:</strong> ${
							course.description || 'Описание отсутствует'
						}</p>
					</div>
				`
				coursesList.appendChild(courseCard)
			})
		} else {
			coursesList.innerHTML += '<p>Курсы не найдены</p>'
		}

		printContainer.appendChild(coursesList)

		// Добавляем стили для печати
		const printStyles = document.createElement('style')
		printStyles.id = 'printStyles'
		printStyles.textContent = `
			@media print {
				body * { visibility: hidden; }
				#printContent, #printContent * { visibility: visible; }
				#printContent {
					position: static !important;
					display: block !important;
					left: 0 !important;
					top: 0 !important;
					width: 100% !important;
					max-width: none !important;
					margin: 0 !important;
					padding: 20px !important;
					background: white !important;
					color: black !important;
					z-index: 9999 !important;
				}
			}
		`
		document.head.appendChild(printStyles)

		// Печатаем
		setTimeout(() => {
			console.log('Вызываем window.print() для списка курсов')
			window.print()

			// Удаляем контейнер и стили после печати
			setTimeout(() => {
				document.head.removeChild(printStyles)
				document.body.removeChild(printContainer)
				console.log('Контейнер и стили печати списка курсов удалены')
			}, 500)
		}, 100)
	}
}

if (window.location.pathname.includes('courses.html')) {
	document.addEventListener('DOMContentLoaded', () => {
		if (!AuthManager.checkAuth()) {
			window.location.href = 'login.html'
			return
		}

		const filterManager = new FilterManager()

		const filtersContainer = document.querySelector('.filters')
		if (filtersContainer) {
			const resetButton = document.createElement('button')
			resetButton.textContent = 'Сбросить фильтры'
			resetButton.className = 'btn btn-secondary'
			resetButton.addEventListener('click', () => {
				filterManager.resetFilters()
			})
			filtersContainer.appendChild(resetButton)

			window.filterManager = filterManager

			// Функциональность печати
			const printBtn = document.getElementById('printCoursesBtn')
			if (printBtn) {
				printBtn.addEventListener('click', () => {
					filterManager.printCoursesReport()
				})
			}

			const printCertificatesBtn = document.getElementById(
				'printCertificatesBtn'
			)
			if (printCertificatesBtn) {
				printCertificatesBtn.addEventListener('click', () => {
					filterManager.printCertificates()
				})
			}

			// Тестовая кнопка печати
			const testPrintBtn = document.getElementById('testPrintBtn')
			if (testPrintBtn) {
				testPrintBtn.addEventListener('click', () => {
					const testContainer = document.createElement('div')
					testContainer.id = 'printContent'
					testContainer.style.cssText = `
						display: none;
						font-family: Arial, sans-serif;
						font-size: 14px;
						line-height: 1.4;
						color: #000;
						background: white;
						padding: 20px;
						position: absolute;
						left: -9999px;
						top: -9999px;
						width: 210mm;
						max-width: 210mm;
						margin: 0;
						z-index: -1;
					`
					testContainer.innerHTML = `
						<h1>Тест печати</h1>
						<p>Это тестовая страница для проверки функциональности печати.</p>
						<p>Если вы видите этот текст в диалоге печати, значит печать работает корректно!</p>
						<p>Текущее время: ${new Date().toLocaleString('ru-RU')}</p>
						<hr>
						<p>Тест завершен успешно.</p>
					`
					document.body.appendChild(testContainer)

					const printStyles = document.createElement('style')
					printStyles.id = 'printStyles'
					printStyles.textContent = `
						@media print {
							body * { visibility: hidden; }
							#printContent, #printContent * { visibility: visible; }
							#printContent {
								position: static !important;
								display: block !important;
								left: 0 !important;
								top: 0 !important;
								width: 100% !important;
								max-width: none !important;
								margin: 0 !important;
								padding: 20px !important;
								background: white !important;
								color: black !important;
								z-index: 9999 !important;
							}
						}
					`
					document.head.appendChild(printStyles)

					setTimeout(() => {
						window.print()
						setTimeout(() => {
							document.head.removeChild(printStyles)
							document.body.removeChild(testContainer)
						}, 500)
					}, 100)
				})
			}
		}
	})
}
