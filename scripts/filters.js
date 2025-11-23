class FilterManager {
	constructor() {
		this.courses = []
		this.filteredCourses = []
		this.currentFilters = {
			status: 'all',
			search: '',
		}
		this.currentPage = 1
		this.pageSize = 6
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

		this.currentPage = 1 // сброс на первую страницу при фильтрации
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
			this.renderPagination() // отрисуем даже при отсутствии (скроется)
			return
		}

		const startIdx = (this.currentPage - 1) * this.pageSize
		const endIdx = startIdx + this.pageSize
		this.filteredCourses.slice(startIdx, endIdx).forEach(course => {
			const courseCard = this.createCourseCard(course)
			container.appendChild(courseCard)
		})
		this.renderPagination()
	}

	createCourseCard(course) {
		const card = document.createElement('div')
		card.className = 'card course-card'
		card.addEventListener('click', () => {
			this.showCourseModal(course)
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

	showCourseModal(course) {
		// Create modal content
		const modalContent = `
			<div class="course-modal-header">
				<h2 class="course-modal-title">${course.title}</h2>
				<div class="course-modal-status ${this.getStatusClass(course.status)}">
					${this.getStatusText(course.status)}
				</div>
			</div>
			<div class="course-modal-body">
				<div class="course-modal-info">
					<div class="info-grid">
						<div class="info-item">
							<h4>Дата начала</h4>
							<p>${this.formatDate(course.start_date)}</p>
						</div>
						<div class="info-item">
							<h4>Срок окончания</h4>
							<p>${this.formatDate(course.due_date)}</p>
						</div>
						<div class="info-item">
							<h4>Прогресс</h4>
							<p>${course.progress}%</p>
						</div>
						<div class="info-item">
							<h4>Статус сертификата</h4>
							<p>${
								course.status === 'пройден'
									? 'Сертификат получен'
									: course.status === 'в процессе'
									? 'Сертификат будет доступен после завершения'
									: 'Сертификат не доступен'
							}</p>
						</div>
					</div>
					<div class="course-description">
						<h4>Описание курса</h4>
						<p>${course.description || 'Описание курса отсутствует.'}</p>
					</div>
				</div>
			</div>
			<div class="course-modal-actions">
				<button class="btn btn-secondary close-modal-btn">Закрыть</button>
				<button class="btn btn-primary start-course-btn" data-course-id="${course.id}">
					${
						course.status === 'пройден'
							? 'Повторить курс'
							: course.status === 'в процессе'
							? 'Продолжить обучение'
							: 'Начать обучение'
					}
				</button>
			</div>
		`

		// Use the modal system
		if (typeof modal !== 'undefined') {
			// Create a custom modal
			const customModal = document.createElement('div')
			customModal.className = 'modal course-details-modal'
			customModal.innerHTML = `
				<div class="modal-overlay"></div>
				<div class="modal-content course-modal-content">
					<button class="modal-close">×</button>
					${modalContent}
				</div>
			`

			// Get or create modal container
			let modalContainer = document.getElementById('modalContainer')
			if (!modalContainer) {
				modalContainer = document.createElement('div')
				modalContainer.id = 'modalContainer'
				document.body.appendChild(modalContainer)
			}

			modalContainer.appendChild(customModal)

			// Add event listeners
			const modalContent = customModal.querySelector('.modal-content')
			const closeBtn = customModal.querySelector('.modal-close')
			const closeModalBtn = customModal.querySelector('.close-modal-btn')
			const startCourseBtn = customModal.querySelector('.start-course-btn')

			// Close modal when clicking outside content
			customModal.addEventListener('click', e => {
				if (e.target === customModal) {
					closeCourseModal()
				}
			})

			if (closeBtn) {
				closeBtn.addEventListener('click', closeCourseModal)
			}
			if (closeModalBtn) {
				closeModalBtn.addEventListener('click', closeCourseModal)
			}
			if (startCourseBtn) {
				startCourseBtn.addEventListener('click', () => {
					const courseId = parseInt(startCourseBtn.dataset.courseId)
					startCourse(courseId)
				})
			}

			// Close on Escape key
			window.currentEscapeHandler = e => {
				if (e.key === 'Escape') {
					closeCourseModal()
				}
			}
			document.addEventListener('keydown', window.currentEscapeHandler)

			// Show modal with animation
			setTimeout(() => {
				customModal.classList.add('active')
			}, 10)

			// Store reference for closing
			window.currentCourseModal = customModal
		} else {
			// Fallback to alert
			alert(
				`Курс: ${course.title}\nСтатус: ${this.getStatusText(
					course.status
				)}\nОписание: ${course.description}`
			)
		}
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
			if (typeof modal !== 'undefined') {
				modal
					.show(
						'Необходимо авторизоваться для печати сертификатов',
						'warning',
						'Требуется авторизация'
					)
					.then(() => {
						window.location.href = 'login.html'
					})
			} else {
				alert('Необходимо авторизоваться для печати сертификатов')
				window.location.href = 'login.html'
			}
			return
		}

		const userData = JSON.parse(localStorage.getItem('userData'))

		if (!userData || !userData.courses) {
			if (typeof modal !== 'undefined') {
				modal.show('Нет данных для печати сертификатов', 'error', 'Ошибка')
			} else {
				alert('Нет данных для печати сертификатов')
			}
			return
		}

		// Фильтруем только пройденные курсы
		const completedCourses = userData.courses.filter(
			course => course.status === 'пройден'
		)

		if (completedCourses.length === 0) {
			if (typeof modal !== 'undefined') {
				modal.show(
					'У вас нет пройденных курсов для печати сертификатов',
					'info',
					'Информация'
				)
			} else {
				alert('У вас нет пройденных курсов для печати сертификатов')
			}
			return
		}

		// Создаем контейнер для печати на текущей странице
		const printContainer = document.createElement('div')
		printContainer.id = 'printContent'
		printContainer.className = 'print-only'
		printContainer.style.cssText = `
			display: none;
			position: absolute;
			left: -9999px;
			top: -9999px;
		`
		document.body.appendChild(printContainer)

		// Заголовок документа (уменьшенный)
		const header = document.createElement('div')
		header.style.cssText = `
			text-align: center;
			border-bottom: 2px solid #000;
			padding-bottom: 10px;
			margin-bottom: 15px;
		`

		const title = document.createElement('h1')
		title.style.cssText = `
			font-size: 20pt;
			font-weight: bold;
			color: #000;
			margin: 0;
			text-transform: uppercase;
		`
		title.textContent = 'СЕРТИФИКАТЫ ОБ ОБУЧЕНИИ'

		const subtitle = document.createElement('p')
		subtitle.style.cssText = `
			font-size: 12pt;
			color: #666;
			margin: 5px 0 0 0;
		`
		subtitle.textContent = 'ТехноЛайн - Система управления обучением персонала'

		header.appendChild(title)
		header.appendChild(subtitle)
		printContainer.appendChild(header)

		// Информация о сотруднике (уменьшенная)
		const employeeInfo = document.createElement('div')
		employeeInfo.style.cssText = `
			background: #f5f5f5;
			padding: 12px;
			border-radius: 6px;
			margin-bottom: 15px;
			border: 1px solid #ddd;
			font-size: 11pt;
		`

		employeeInfo.innerHTML = `
			<h2 style="margin-top: 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 6px; font-size: 14pt;">
				Информация о сотруднике
			</h2>
			<p style="margin: 4px 0; font-size: 11pt; color: #000;">
				<strong>ФИО:</strong> ${userData.employee.name}
			</p>
			<p style="margin: 4px 0; font-size: 11pt; color: #000;">
				<strong>Должность:</strong> ${userData.employee.position}
			</p>
			<p style="margin: 4px 0; font-size: 11pt; color: #000;">
				<strong>Подразделение:</strong> ${userData.employee.department}
			</p>
			<p style="margin: 4px 0; font-size: 11pt; color: #000;">
				<strong>Email:</strong> ${userData.employee.email}
			</p>
			<p style="margin: 4px 0; font-size: 11pt; color: #000;">
				<strong>Дата выдачи:</strong> ${new Date().toLocaleDateString('ru-RU')}
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

		// Подвал документа (уменьшенный)
		const footer = document.createElement('div')
		footer.style.cssText = `
			margin-top: 20px;
			padding-top: 10px;
			border-top: 1px solid #000;
			text-align: center;
			font-size: 9pt;
			color: #666;
		`
		footer.innerHTML = `
			<p style="margin: 4px 0;">Документ сформирован автоматически системой управления обучением</p>
			<p style="margin: 4px 0;">Все права защищены © ${new Date().getFullYear()} ТехноЛайн</p>
		`
		printContainer.appendChild(footer)

		// Используем стили для печати из style.css (@media print)
		// Печатаем
		setTimeout(() => {
			window.print()

			// Удаляем контейнер после печати
			setTimeout(() => {
				document.body.removeChild(printContainer)
			}, 500)
		}, 100)
	}

	// Создание элемента сертификата для одного курса
	createCertificateElement(course, certificateNumber, userData) {
		const certificate = document.createElement('div')
		certificate.className = 'certificate'
		certificate.style.cssText = `
			page-break-inside: avoid;
			page-break-after: always;
			position: relative;
			height: 270mm;
			max-height: 270mm;
			padding: 15mm;
			margin: 0;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		`

		// Декоративный элемент
		const decoration = document.createElement('div')
		decoration.style.cssText = `
			position: absolute;
			top: 10px;
			right: 10px;
			width: 50px;
			height: 50px;
			background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 20px;
			color: white;
			font-weight: bold;
		`
		decoration.textContent = '✓'
		certificate.appendChild(decoration)

		// Номер сертификата
		const certNumber = document.createElement('div')
		certNumber.style.cssText = `
			position: absolute;
			top: 10px;
			left: 10px;
			background: #4CAF50;
			color: white;
			padding: 4px 10px;
			border-radius: 15px;
			font-size: 10px;
			font-weight: bold;
		`
		certNumber.textContent = `СЕРТИФИКАТ № ${certificateNumber}`
		certificate.appendChild(certNumber)

		// Заголовок сертификата
		const title = document.createElement('h3')
		title.className = 'certificate-title'
		title.textContent = 'СЕРТИФИКАТ О ПРОХОЖДЕНИИ КУРСА'
		certificate.appendChild(title)

		// ФИО сотрудника
		const employeeName = document.createElement('h4')
		employeeName.className = 'certificate-name'
		employeeName.textContent = userData.employee.name
		certificate.appendChild(employeeName)

		// Текст "прошел(а) обучение по курсу"
		const courseText = document.createElement('p')
		courseText.className = 'certificate-content'
		courseText.textContent = 'прошел(а) обучение по курсу'
		certificate.appendChild(courseText)

		// Название курса
		const courseTitle = document.createElement('h4')
		courseTitle.className = 'certificate-course'
		courseTitle.style.cssText = `
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
			padding: 12px;
			border-radius: 6px;
			margin: 10px 0;
			border-left: 3px solid #4CAF50;
			font-size: 11pt;
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

		// Описание курса (сокращенное, чтобы поместилось на лист)
		if (course.description) {
			const description = document.createElement('div')
			description.style.cssText = `
				margin: 8px 0;
				padding: 10px;
				background: #fff;
				border: 1px solid #ddd;
				border-radius: 4px;
				font-size: 10pt;
				max-height: 60px;
				overflow: hidden;
			`
			const shortDescription =
				course.description.length > 150
					? course.description.substring(0, 150) + '...'
					: course.description
			description.innerHTML = `
				<strong>Описание:</strong> ${shortDescription}
			`
			certificate.appendChild(description)
		}

		// Подпись руководства
		const signature = document.createElement('div')
		signature.style.cssText = `
			margin-top: 15px;
			padding-top: 10px;
			border-top: 2px solid #4CAF50;
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			flex-shrink: 0;
		`

		// Левая подпись - сотрудника
		const employeeSignature = document.createElement('div')
		employeeSignature.style.cssText = `
			text-align: center;
			flex: 1;
		`

		const employeeSigLabel = document.createElement('p')
		employeeSigLabel.style.cssText = `
			margin: 0 0 25px 0;
			color: #666;
			font-size: 10pt;
		`
		employeeSigLabel.textContent = 'Подпись сотрудника'

		const employeeSigLine = document.createElement('div')
		employeeSigLine.style.cssText = `
			border-bottom: 1px solid #000;
			width: 120px;
			margin: 0 auto 3px auto;
		`

		const employeeSigName = document.createElement('p')
		employeeSigName.style.cssText = `
			margin: 0;
			font-size: 10pt;
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
			margin: 0 0 25px 0;
			color: #666;
			font-size: 10pt;
		`
		managerSigLabel.textContent = 'Руководитель отдела обучения'

		const managerSigLine = document.createElement('div')
		managerSigLine.style.cssText = `
			border-bottom: 1px solid #000;
			width: 120px;
			margin: 0 auto 3px auto;
		`

		const managerSigName = document.createElement('p')
		managerSigName.style.cssText = `
			margin: 0;
			font-size: 10pt;
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

	renderPagination() {
		// Удаляем существующую пагинацию
		let paginator = document.getElementById('coursesPaginator')
		if (paginator) paginator.remove()

		const pageCount = Math.ceil(this.filteredCourses.length / this.pageSize)
		if (pageCount <= 1) return // не рендерим

		// Создаем контейнер для пагинации (можно указать конкретный существующий элемент)
		const paginationContainer =
			document.getElementById('paginationContainer') || document.body

		paginator = document.createElement('div')
		paginator.id = 'coursesPaginator'
		paginator.className = 'pagination'

		// Кнопка prev
		const prev = document.createElement('button')
		prev.textContent = '<'
		prev.className = 'pagination-btn'
		prev.disabled = this.currentPage === 1
		prev.onclick = () => {
			this.currentPage--
			this.renderCourses()
		}
		paginator.appendChild(prev)

		// Кнопки страниц (макс 5)
		let first = Math.max(1, this.currentPage - 2)
		let last = Math.min(pageCount, first + 4)
		if (last - first < 4) first = Math.max(1, last - 4)

		for (let p = first; p <= last; p++) {
			const btn = document.createElement('button')
			btn.textContent = p
			btn.className =
				'pagination-btn' + (p === this.currentPage ? ' active' : '')
			btn.onclick = () => {
				this.currentPage = p
				this.renderCourses()
			}
			paginator.appendChild(btn)
		}

		// Кнопка next
		const next = document.createElement('button')
		next.textContent = '>'
		next.className = 'pagination-btn'
		next.disabled = this.currentPage === pageCount
		next.onclick = () => {
			this.currentPage++
			this.renderCourses()
		}
		paginator.appendChild(next)

		// Добавляем пагинацию в отдельный контейнер
		paginationContainer.appendChild(paginator)
	}
}

// Global functions for course modal
function closeCourseModal() {
	if (window.currentCourseModal) {
		window.currentCourseModal.classList.remove('active')
		setTimeout(() => {
			if (window.currentCourseModal && window.currentCourseModal.parentNode) {
				window.currentCourseModal.parentNode.removeChild(
					window.currentCourseModal
				)
			}
			window.currentCourseModal = null
		}, 300)
	}
	// Убираем обработчик клавиатуры, если он был добавлен
	if (window.currentEscapeHandler) {
		document.removeEventListener('keydown', window.currentEscapeHandler)
		window.currentEscapeHandler = null
	}
}

function startCourse(courseId) {
	closeCourseModal()
	// Redirect to course details with study mode
	window.location.href = `course-details.html?id=${courseId}&mode=study`
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

			// Функциональность печати сертификатов (только один обработчик)
			const printCertificatesBtn = document.getElementById(
				'printCertificatesBtn'
			)
			if (printCertificatesBtn) {
				// Удаляем все предыдущие обработчики, клонируя элемент
				const newBtn = printCertificatesBtn.cloneNode(true)
				printCertificatesBtn.parentNode.replaceChild(
					newBtn,
					printCertificatesBtn
				)

				// Флаг для предотвращения двойного вызова
				let isPrinting = false

				// Добавляем один обработчик
				newBtn.addEventListener(
					'click',
					function (e) {
						e.preventDefault()
						e.stopPropagation()
						e.stopImmediatePropagation()

						// Предотвращаем повторный вызов
						if (isPrinting) {
							return
						}

						isPrinting = true

						if (filterManager) {
							filterManager.printCertificates()
						}

						// Разблокируем через задержку
						setTimeout(() => {
							isPrinting = false
						}, 2000)
					},
					{ once: false, passive: false }
				)
			}
		}
	})
}
