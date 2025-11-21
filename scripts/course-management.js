class CourseManagement {
	constructor() {
		this.courses = []
		this.filteredCourses = []
		this.editingCourseId = null
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

		this.loadCourses()
		this.setupEventListeners()
		this.renderCourses()
	}

	loadCourses() {
		// Загружаем курсы из MockDB
		if (window.MockDB && window.MockDB.Courses) {
			this.courses = window.MockDB.Courses.map(course => ({
				id: course.id,
				title: course.title,
				description: course.description || '',
				duration: course.duration || 0,
				type: course.type || 'рекомендованный',
			}))
		} else {
			// Fallback данные, если MockDB не загружен
			this.courses = []
		}

		// Если курсов нет, используем fallback
		if (this.courses.length === 0) {
			this.courses = [
				{
					id: 1,
					title: 'IT-безопасность',
					description: 'Курс по основам информационной безопасности',
					duration: 24,
					type: 'обязательный',
				},
				{
					id: 2,
					title: 'Работа с Laravel',
					description: 'Изучение фреймворка Laravel для веб-разработки',
					duration: 32,
					type: 'рекомендованный',
				},
				{
					id: 3,
					title: 'Git и командная разработка',
					description: 'Освоение системы контроля версий и совместной работы',
					duration: 16,
					type: 'обязательный',
				},
				{
					id: 4,
					title: 'Основы Docker',
					description:
						'Контейнеризация приложений и развёртывание микросервисов',
					duration: 20,
					type: 'рекомендованный',
				},
				{
					id: 5,
					title: 'SQL и оптимизация запросов',
					description: 'Продвинутые техники работы с базами данных',
					duration: 28,
					type: 'обязательный',
				},
				{
					id: 6,
					title: 'JavaScript: углублённый курс',
					description: 'Замыкания, асинхронность, TypeScript basics',
					duration: 40,
					type: 'рекомендованный',
				},
				{
					id: 7,
					title: 'DevOps-практики',
					description: 'CI/CD, автоматизация развёртывания, мониторинг',
					duration: 36,
					type: 'рекомендованный',
				},
				{
					id: 8,
					title: 'Архитектура ПО',
					description: 'Паттерны проектирования, SOLID, микросервисы',
					duration: 48,
					type: 'рекомендованный',
				},
				{
					id: 9,
					title: 'Управление персоналом',
					description: 'Основы управления человеческими ресурсами',
					duration: 24,
					type: 'обязательный',
				},
				{
					id: 10,
					title: 'Трудовое законодательство',
					description: 'Актуальные нормы трудового права',
					duration: 18,
					type: 'обязательный',
				},
				{
					id: 11,
					title: 'Мотивация и развитие сотрудников',
					description: 'Системы мотивации и карьерного роста',
					duration: 22,
					type: 'рекомендованный',
				},
				{
					id: 12,
					title: 'Управление IT-проектами',
					description: 'Методологии управления проектами в IT',
					duration: 30,
					type: 'обязательный',
				},
				{
					id: 13,
					title: 'Лидерство и управление командой',
					description: 'Навыки эффективного руководства',
					duration: 26,
					type: 'обязательный',
				},
				{
					id: 14,
					title: 'Стратегическое планирование',
					description: 'Разработка стратегии развития отдела',
					duration: 20,
					type: 'рекомендованный',
				},
			]
		}

		this.filteredCourses = [...this.courses]
	}

	setupEventListeners() {
		const courseFilter = document.getElementById('courseFilter')
		if (courseFilter) {
			courseFilter.addEventListener('change', e => {
				this.filterCourses(e.target.value)
			})
		}

		const courseForm = document.getElementById('courseForm')
		if (courseForm) {
			courseForm.addEventListener('submit', e => {
				e.preventDefault()
				this.saveCourse()
			})
		}

		// Закрытие модального окна при клике вне его области
		const courseModal = document.getElementById('courseModal')
		if (courseModal) {
			courseModal.addEventListener('click', e => {
				if (e.target === courseModal) {
					this.closeCourseModal()
				}
			})

			// Закрытие по Escape
			const handleEscape = e => {
				if (
					e.key === 'Escape' &&
					(courseModal.style.display === 'flex' ||
						courseModal.style.display === 'block')
				) {
					this.closeCourseModal()
					document.removeEventListener('keydown', handleEscape)
				}
			}
			document.addEventListener('keydown', handleEscape)
		}
	}

	filterCourses(type) {
		if (type === 'all') {
			this.filteredCourses = [...this.courses]
		} else {
			this.filteredCourses = this.courses.filter(course => course.type === type)
		}
		this.renderCourses()
	}

	renderCourses() {
		const container = document.getElementById('coursesList')
		if (!container) return

		container.innerHTML = ''

		if (this.filteredCourses.length === 0) {
			container.innerHTML = '<p class="text-center">Курсы не найдены</p>'
			return
		}

		this.filteredCourses.forEach(course => {
			const courseCard = this.createCourseCard(course)
			container.appendChild(courseCard)
		})
	}

	createCourseCard(course) {
		const card = document.createElement('div')
		card.className = 'course-management-card card'

		const typeClass = `type-${course.type}`

		card.innerHTML = `
			<div class="course-management-header">
				<div class="course-management-info">
					<h3 class="course-management-title">${course.title}</h3>
					<p class="course-management-description">${course.description}</p>
					<div class="course-management-meta">
						<span class="meta-item">⏱️ ${course.duration} часов</span>
						<span class="meta-item type-badge ${typeClass}">${this.getTypeText(
			course.type
		)}</span>
					</div>
				</div>
				<div class="course-management-actions">
					<button class="btn btn-sm btn-outline" onclick="editCourse(${course.id})">
						✏️ Редактировать
					</button>
					<button class="btn btn-sm btn-outline" onclick="assignCourseToEmployees(${
						course.id
					})">
						👥 Назначить
					</button>
					<button class="btn btn-sm btn-danger" onclick="deleteCourse(${course.id})">
						🗑️ Удалить
					</button>
				</div>
			</div>
		`

		return card
	}

	getTypeText(type) {
		const types = {
			обязательный: 'Обязательный',
			рекомендованный: 'Рекомендованный',
		}
		return types[type] || type
	}

	showAddCourseModal() {
		this.editingCourseId = null
		const modal = document.getElementById('courseModal')
		if (!modal) {
			console.error('Модальное окно не найдено')
			return
		}
		document.getElementById('modalTitle').textContent = 'Добавить курс'
		document.getElementById('courseForm').reset()
		modal.style.display = 'flex'
		modal.style.visibility = 'visible'
	}

	editCourse(courseId) {
		const course = this.courses.find(c => c.id === courseId)
		if (course) {
			const modal = document.getElementById('courseModal')
			if (!modal) {
				console.error('Модальное окно не найдено')
				return
			}
			this.editingCourseId = courseId
			document.getElementById('modalTitle').textContent = 'Редактировать курс'
			document.getElementById('courseTitle').value = course.title
			document.getElementById('courseDescription').value = course.description
			document.getElementById('courseDuration').value = course.duration
			document.getElementById('courseType').value = course.type
			modal.style.display = 'flex'
			modal.style.visibility = 'visible'
		}
	}

	closeCourseModal() {
		const modal = document.getElementById('courseModal')
		if (modal) {
			modal.style.display = 'none'
			modal.style.visibility = 'hidden'
		}
		const form = document.getElementById('courseForm')
		if (form) {
			form.reset()
		}
		this.editingCourseId = null
	}

	saveCourse() {
		const title = document.getElementById('courseTitle').value.trim()
		const description = document
			.getElementById('courseDescription')
			.value.trim()
		const duration = parseInt(document.getElementById('courseDuration').value)
		const type = document.getElementById('courseType').value

		if (!title || !description || !duration || !type) {
			if (typeof modal !== 'undefined') {
				modal.show('Заполните все поля', 'warning', 'Предупреждение')
			} else {
				alert('Заполните все поля')
			}
			return
		}

		if (this.editingCourseId) {
			// Редактирование существующего курса
			const course = this.courses.find(c => c.id === this.editingCourseId)
			if (course) {
				course.title = title
				course.description = description
				course.duration = duration
				course.type = type

				// Обновляем курс в MockDB
				if (window.MockDB && window.MockDB.Courses) {
					const dbCourse = window.MockDB.Courses.find(
						c => c.id === this.editingCourseId
					)
					if (dbCourse) {
						dbCourse.title = title
						dbCourse.description = description
						dbCourse.duration = duration
						dbCourse.type = type
					}
				}
			}
		} else {
			// Добавление нового курса
			// Генерируем новый ID
			let newId = 1
			if (this.courses.length > 0) {
				newId = Math.max(...this.courses.map(c => c.id)) + 1
			} else if (window.MockDB && window.MockDB.Courses) {
				if (window.MockDB.Courses.length > 0) {
					newId = Math.max(...window.MockDB.Courses.map(c => c.id)) + 1
				}
			}

			const newCourse = {
				id: newId,
				title,
				description,
				duration,
				type,
			}
			this.courses.push(newCourse)

			// Добавляем курс в MockDB
			if (window.MockDB && window.MockDB.Courses) {
				window.MockDB.Courses.push(newCourse)
			}
		}

		this.filterCourses(document.getElementById('courseFilter').value)
		this.closeCourseModal()

		if (typeof NotificationManager !== 'undefined') {
			NotificationManager.showTempNotification(
				`Курс "${title}" ${this.editingCourseId ? 'обновлен' : 'добавлен'}`,
				'success'
			)
		}
	}

	async deleteCourse(courseId) {
		const confirmed =
			typeof modal !== 'undefined'
				? await modal.confirm(
						'Вы уверены, что хотите удалить этот курс?',
						'Подтверждение удаления'
				  )
				: confirm('Вы уверены, что хотите удалить этот курс?')

		if (confirmed) {
			this.courses = this.courses.filter(c => c.id !== courseId)

			// Удаляем курс из MockDB
			if (window.MockDB && window.MockDB.Courses) {
				window.MockDB.Courses = window.MockDB.Courses.filter(
					c => c.id !== courseId
				)
			}

			this.filterCourses(document.getElementById('courseFilter').value)

			if (typeof NotificationManager !== 'undefined') {
				NotificationManager.showTempNotification('Курс удален', 'success')
			}
		}
	}
}

// Глобальные функции для кнопок
function showAddCourseModal() {
	if (window.courseManagement) {
		window.courseManagement.showAddCourseModal()
	}
}

function editCourse(courseId) {
	if (window.courseManagement) {
		window.courseManagement.editCourse(courseId)
	}
}

async function assignCourseToEmployees(courseId) {
	const course = window.courseManagement.courses.find(c => c.id === courseId)
	if (!course) {
		return
	}

	// Получаем список сотрудников из MockDB
	if (!window.MockDB || !window.MockDB.Users) {
		if (typeof modal !== 'undefined') {
			modal.show('Ошибка загрузки сотрудников', 'error', 'Ошибка')
		} else {
			alert('Ошибка загрузки сотрудников')
		}
		return
	}

	// Фильтруем только сотрудников (не HR и не руководителей)
	const employees = window.MockDB.Users.filter(
		user => user.role === window.MockDB.UserRole.EMPLOYEE
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

	if (employees.length === 0) {
		if (typeof modal !== 'undefined') {
			modal.show(
				'Нет доступных сотрудников для назначения',
				'info',
				'Информация'
			)
		} else {
			alert('Нет доступных сотрудников для назначения')
		}
		return
	}

	// Показываем улучшенное модальное окно для выбора сотрудника
	const selectedEmployeeId = await showEmployeeSelectionModal(course, employees)

	if (selectedEmployeeId) {
		const selectedEmployee = window.MockDB.Users.find(
			e => e.id == selectedEmployeeId
		)
		if (selectedEmployee) {
			// Сохраняем назначение курса в MockDB
			if (window.MockDB && window.MockDB.CourseUsers) {
				// Проверяем, не назначен ли уже курс этому сотруднику
				const existingAssignment = window.MockDB.CourseUsers.find(
					cu => cu.userId === selectedEmployeeId && cu.courseId === courseId
				)

				if (!existingAssignment) {
					window.MockDB.CourseUsers.push({
						userId: selectedEmployeeId,
						courseId: courseId,
						status: 'назначен',
						progress: 0,
						start: new Date().toISOString().split('T')[0],
						due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
							.toISOString()
							.split('T')[0], // 90 дней от текущей даты
					})
				}
			}

			if (typeof NotificationManager !== 'undefined') {
				NotificationManager.showTempNotification(
					`Курс "${course.title}" назначен сотруднику ${selectedEmployee.name}`,
					'success'
				)
			} else if (typeof modal !== 'undefined') {
				modal.show(
					`Курс "${course.title}" назначен сотруднику ${selectedEmployee.name}`,
					'success',
					'Успешно'
				)
			} else {
				alert(
					`Курс "${course.title}" назначен сотруднику ${selectedEmployee.name}`
				)
			}
		}
	}
}

function showEmployeeSelectionModal(course, employees) {
	return new Promise(resolve => {
		const modal = document.createElement('div')
		modal.className = 'modal employee-selection-modal'
		modal.innerHTML = `
			<div class="modal-overlay"></div>
			<div class="modal-content employee-selection-content">
				<div class="modal-header">
					<div class="modal-header-info">
						<div class="modal-icon success">📚</div>
						<div>
							<h3>Назначение курса</h3>
							<p class="modal-subtitle">${course.title}</p>
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

		// Используем modalContainer из modal.js или создаем свой
		let modalContainer = document.getElementById('modalContainer')
		if (!modalContainer) {
			modalContainer = document.createElement('div')
			modalContainer.id = 'modalContainer'
			document.body.appendChild(modalContainer)
		}
		modalContainer.appendChild(modal)

		let selectedEmployeeId = null
		const employeesList = modal.querySelector('#employeesList')
		const employeeCards = modal.querySelectorAll('.employee-card')
		const searchInput = modal.querySelector('#employeeSearchInput')
		const confirmBtn = modal.querySelector('.modal-btn-confirm')
		const emptyMessage = modal.querySelector('#employeesEmpty')

		// Обработчик выбора сотрудника
		employeeCards.forEach(card => {
			card.addEventListener('click', () => {
				// Убираем выделение с других видимых карточек
				employeeCards.forEach(c => {
					if (c.style.display !== 'none') {
						c.classList.remove('selected')
					}
				})
				// Выделяем выбранную карточку
				card.classList.add('selected')
				selectedEmployeeId = parseInt(card.dataset.employeeId)
				confirmBtn.disabled = false
			})

			// Двойной клик для быстрого выбора
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

			// Сбрасываем выбор при поиске
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

		// Анимация появления
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

function deleteCourse(courseId) {
	if (window.courseManagement) {
		window.courseManagement.deleteCourse(courseId)
	}
}

function closeCourseModal() {
	if (window.courseManagement) {
		window.courseManagement.closeCourseModal()
	}
}

document.addEventListener('DOMContentLoaded', () => {
	if (window.location.pathname.includes('course-management.html')) {
		window.courseManagement = new CourseManagement()
	}
})
