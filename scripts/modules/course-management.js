class CourseManagement {
	constructor() {
		this.courses = []
		this.filteredCourses = []
		this.editingCourseId = null
		this.init()
	}

	init() {
		if (!AuthManager.checkAuth()) {
			window.location.href = buildPathFromRoot('pages/auth/login.html')
			return
		}

		// Проверяем роль
		if (!isHRManager()) {
			window.location.href = buildPathFromRoot('index.html')
			return
		}

		this.loadCourses()
		this.setupEventListeners()
		// Инициализируем фильтрованные курсы
		this.filterCourses('all')
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
				modules: Array.isArray(course.modules) ? course.modules : [],
				materials: Array.isArray(course.materials) ? course.materials : [],
				createdAt: course.createdAt || course.created_at || null,
				certificateAvailable: course.certificateAvailable !== false,
			}))
		} else {
			// Fallback данные, если MockDB не загружен
			this.courses = []
		}

		// Если курсов нет, используем fallback
		if (this.courses.length === 0) {
			const now = Date.now()
			this.courses = [
				{
					id: 1,
					title: 'IT-безопасность',
					description: 'Курс по основам информационной безопасности',
					duration: 24,
					type: 'обязательный',
					createdAt: new Date(now).toISOString(),
				},
				{
					id: 2,
					title: 'Работа с Laravel',
					description: 'Изучение фреймворка Laravel для веб-разработки',
					duration: 32,
					type: 'рекомендованный',
					createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 3,
					title: 'Git и командная разработка',
					description: 'Освоение системы контроля версий и совместной работы',
					duration: 16,
					type: 'обязательный',
					createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 4,
					title: 'Основы Docker',
					description:
						'Контейнеризация приложений и развёртывание микросервисов',
					duration: 20,
					type: 'рекомендованный',
					createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 5,
					title: 'SQL и оптимизация запросов',
					description: 'Продвинутые техники работы с базами данных',
					duration: 28,
					type: 'обязательный',
					createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 6,
					title: 'JavaScript: углублённый курс',
					description: 'Замыкания, асинхронность, TypeScript basics',
					duration: 40,
					type: 'рекомендованный',
					createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 7,
					title: 'DevOps-практики',
					description: 'CI/CD, автоматизация развёртывания, мониторинг',
					duration: 36,
					type: 'рекомендованный',
					createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 8,
					title: 'Архитектура ПО',
					description: 'Паттерны проектирования, SOLID, микросервисы',
					duration: 48,
					type: 'рекомендованный',
					createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 9,
					title: 'Управление персоналом',
					description: 'Основы управления человеческими ресурсами',
					duration: 24,
					type: 'обязательный',
					createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 10,
					title: 'Трудовое законодательство',
					description: 'Актуальные нормы трудового права',
					duration: 18,
					type: 'обязательный',
					createdAt: new Date(now - 9 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 11,
					title: 'Мотивация и развитие сотрудников',
					description: 'Системы мотивации и карьерного роста',
					duration: 22,
					type: 'рекомендованный',
					createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 12,
					title: 'Управление IT-проектами',
					description: 'Методологии управления проектами в IT',
					duration: 30,
					type: 'обязательный',
					createdAt: new Date(now - 11 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 13,
					title: 'Лидерство и управление командой',
					description: 'Навыки эффективного руководства',
					duration: 26,
					type: 'обязательный',
					createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: 14,
					title: 'Стратегическое планирование',
					description: 'Разработка стратегии развития отдела',
					duration: 20,
					type: 'рекомендованный',
					createdAt: new Date(now - 13 * 24 * 60 * 60 * 1000).toISOString(),
				},
			]
		}

		this.courses = this.courses.map(course => ({
			...course,
			certificateAvailable: course.certificateAvailable !== false,
		}))

		this.sortCoursesByDate()
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

		const addModuleBtn = document.getElementById('addModuleBtn')
		if (addModuleBtn) {
			addModuleBtn.addEventListener('click', () => this.addModuleField())
		}

		const addMaterialBtn = document.getElementById('addMaterialBtn')
		if (addMaterialBtn) {
			addMaterialBtn.addEventListener('click', () => this.addMaterialField())
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

	sortCoursesByDate() {
		this.courses.sort((a, b) => {
			const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
			const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
			return dateB - dateA
		})
	}

	renderCourses() {
		const container = document.getElementById('coursesList')
		if (!container) {
			console.error('Контейнер coursesList не найден!')
			return
		}

		console.log('Рендерим курсы. Количество:', this.filteredCourses.length)
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

		const modalTitle = document.getElementById('modalTitle')
		const courseForm = document.getElementById('courseForm')

		if (modalTitle) {
			modalTitle.textContent = 'Добавить курс'
		}
		if (courseForm) {
			courseForm.reset()
		}

		this.populateDynamicFormSections([], [])

		const certificateCheckbox = document.getElementById('courseCertificate')
		if (certificateCheckbox) {
			certificateCheckbox.checked = true
		}

		// Открываем модальное окно
		modal.style.cssText = ''
		modal.style.display = 'flex'
		modal.style.visibility = 'visible'
		modal.style.opacity = '1'

		// Фокус на первое поле
		setTimeout(() => {
			const firstInput = document.getElementById('courseTitle')
			if (firstInput) {
				firstInput.focus()
			}
		}, 100)
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
			const certificateCheckbox = document.getElementById('courseCertificate')
			if (certificateCheckbox) {
				certificateCheckbox.checked = Boolean(course.certificateAvailable)
			}
			this.populateDynamicFormSections(
				course.modules || [],
				course.materials || []
			)
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
		this.populateDynamicFormSections([], [])
		this.editingCourseId = null
	}

	populateDynamicFormSections(modules = [], materials = []) {
		const modulesContainer = document.getElementById('modulesList')
		if (modulesContainer) {
			modulesContainer.innerHTML = ''
			if (modules.length === 0) {
				this.addModuleField()
			} else {
				modules.forEach(module => this.addModuleField(module))
			}
		}

		const materialsContainer = document.getElementById('materialsList')
		if (materialsContainer) {
			materialsContainer.innerHTML = ''
			if (materials.length === 0) {
				this.addMaterialField()
			} else {
				materials.forEach(material => this.addMaterialField(material))
			}
		}
	}

	addModuleField(module = {}) {
		const container = document.getElementById('modulesList')
		if (!container) return

		const item = document.createElement('div')
		item.className = 'dynamic-item module-form-item'
		item.innerHTML = `
			<div class="dynamic-row">
				<input
					type="text"
					class="form-input module-title-input"
					placeholder="Название модуля"
					value="${module.title || ''}"
					required
				/>
			</div>
			<div class="dynamic-row multi">
				<select class="form-select module-type-select">
					<option value="video" ${module.type === 'video' ? 'selected' : ''}>Видео</option>
					<option value="text" ${
						!module.type || module.type === 'text' ? 'selected' : ''
					}>Материал</option>
				</select>
				<input
					type="text"
					class="form-input module-duration-input"
					placeholder="Длительность (напр. 40 мин)"
					value="${module.duration || ''}"
				/>
			</div>
			<textarea
				class="form-input module-content-input"
				rows="2"
				placeholder="Краткое содержание модуля"
			>${module.content || ''}</textarea>
			<button type="button" class="btn btn-sm btn-outline remove-module-btn">
				Удалить модуль
			</button>
		`

		const removeBtn = item.querySelector('.remove-module-btn')
		if (removeBtn) {
			removeBtn.addEventListener('click', () => {
				item.remove()
				if (!container.children.length) {
					this.addModuleField()
				}
			})
		}

		container.appendChild(item)
	}

	addMaterialField(material = {}) {
		const container = document.getElementById('materialsList')
		if (!container) return

		const item = document.createElement('div')
		item.className = 'dynamic-item material-form-item'
		item.innerHTML = `
			<div class="dynamic-row multi">
				<input
					type="text"
					class="form-input material-title-input"
					placeholder="Название материала"
					value="${material.title || ''}"
				/>
				<select class="form-select material-type-select">
					<option value="pdf" ${
						!material.type || material.type === 'pdf' ? 'selected' : ''
					}>PDF</option>
					<option value="video" ${material.type === 'video' ? 'selected' : ''}>
						Видео
					</option>
					<option value="link" ${material.type === 'link' ? 'selected' : ''}>
						Ссылка
					</option>
				</select>
			</div>
			<input
				type="text"
				class="form-input material-url-input"
				placeholder="Ссылка или путь к файлу"
				value="${material.url || ''}"
			/>
			<button type="button" class="btn btn-sm btn-outline remove-material-btn">
				Удалить материал
			</button>
		`

		const removeBtn = item.querySelector('.remove-material-btn')
		if (removeBtn) {
			removeBtn.addEventListener('click', () => {
				item.remove()
				if (!container.children.length) {
					this.addMaterialField()
				}
			})
		}

		container.appendChild(item)
	}

	getModulesFromForm() {
		const container = document.getElementById('modulesList')
		if (!container) return []

		const items = container.querySelectorAll('.module-form-item')
		const modules = []
		items.forEach(item => {
			const title =
				item.querySelector('.module-title-input')?.value.trim() || ''
			const type =
				item.querySelector('.module-type-select')?.value || 'text'
			const duration =
				item.querySelector('.module-duration-input')?.value.trim() || ''
			const content =
				item.querySelector('.module-content-input')?.value.trim() || ''

			if (!title) {
				return
			}

			modules.push({
				title,
				type,
				duration,
				content,
				completed: false,
			})
		})
		return modules
	}

	getMaterialsFromForm() {
		const container = document.getElementById('materialsList')
		if (!container) return []

		const items = container.querySelectorAll('.material-form-item')
		const materials = []
		items.forEach(item => {
			const title =
				item.querySelector('.material-title-input')?.value.trim() || ''
			const type =
				item.querySelector('.material-type-select')?.value || 'pdf'
			const url =
				item.querySelector('.material-url-input')?.value.trim() || ''

			if (!title || !url) {
				return
			}

			materials.push({ title, type, url })
		})
		return materials
	}

	persistCustomCourse(course) {
		if (typeof upsertCustomCourseData === 'function') {
			upsertCustomCourseData(course)
		}
	}

	removeCustomCourse(courseId) {
		if (typeof removeCustomCourseData === 'function') {
			removeCustomCourseData(courseId)
		}
	}

	saveCourse() {
		const title = document.getElementById('courseTitle').value.trim()
		const description = document
			.getElementById('courseDescription')
			.value.trim()
		const duration = parseInt(document.getElementById('courseDuration').value)
		const type = document.getElementById('courseType').value
		const certificateAvailable =
			document.getElementById('courseCertificate')?.checked || false
		const modules = this.getModulesFromForm()
		const materials = this.getMaterialsFromForm()

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
				course.modules = modules
				course.materials = materials
				course.certificateAvailable = certificateAvailable
				course.createdAt = course.createdAt || new Date().toISOString()

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
						dbCourse.modules = modules
						dbCourse.materials = materials
						dbCourse.certificateAvailable = certificateAvailable
						dbCourse.createdAt = course.createdAt
					}
				}

				this.persistCustomCourse(course)
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
				certificateAvailable,
				modules,
				materials,
				createdAt: new Date().toISOString(),
				// По умолчанию все новые курсы доступны сотрудникам
				targetRoles:
					window.MockDB && window.MockDB.UserRole
						? [window.MockDB.UserRole.EMPLOYEE]
						: ['employee'],
			}

			console.log('Добавляем новый курс:', newCourse)
			this.courses.push(newCourse)
			this.sortCoursesByDate()

			// Добавляем курс в MockDB
			if (window.MockDB && window.MockDB.Courses) {
				window.MockDB.Courses.push(newCourse)
				console.log(
					'Курс добавлен в MockDB. Всего курсов:',
					window.MockDB.Courses.length
				)
			}

			this.persistCustomCourse(newCourse)
		}

		console.log('Текущее количество курсов:', this.courses.length)
		console.log(
			'Применяем фильтр:',
			document.getElementById('courseFilter').value
		)

		this.sortCoursesByDate()
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
			this.removeCustomCourse(courseId)

			// Удаляем курс из MockDB.Courses
			if (window.MockDB && window.MockDB.Courses) {
				window.MockDB.Courses = window.MockDB.Courses.filter(
					c => c.id !== courseId
				)
			}

			// Удаляем все назначения этого курса из MockDB.CourseUsers,
			// чтобы статистика и отчёты не ссылались на несуществующий курс
			if (window.MockDB && window.MockDB.CourseUsers) {
				window.MockDB.CourseUsers = window.MockDB.CourseUsers.filter(
					cu => cu.courseId !== courseId
				)
			}

			this.filterCourses(document.getElementById('courseFilter').value)

			if (typeof NotificationManager !== 'undefined') {
				NotificationManager.showTempNotification('Курс удален', 'success')
			}
		}
	}
}

// Вспомогательная функция для гарантированного создания инстанса
function ensureCourseManagementInstance() {
	if (!window.courseManagement) {
		window.courseManagement = new CourseManagement()
	}
}

// Глобальные функции для кнопок
function showAddCourseModal() {
	ensureCourseManagementInstance()
	if (window.courseManagement) {
		window.courseManagement.showAddCourseModal()
	}
}

function editCourse(courseId) {
	ensureCourseManagementInstance()
	if (window.courseManagement) {
		window.courseManagement.editCourse(courseId)
	}
}

async function assignCourseToEmployees(courseId) {
	ensureCourseManagementInstance()
	const course = window.courseManagement.courses.find(c => c.id === courseId)
	if (!course) {
		return
	}

	if (!window.MockDB || !window.MockDB.Users) {
		if (typeof modal !== 'undefined') {
			modal.show('Ошибка загрузки сотрудников', 'error', 'Ошибка')
		} else {
			alert('Ошибка загрузки сотрудников')
		}
		return
	}

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

	const selectedEmployeeIds = await showEmployeeSelectionModal(course, employees)
	if (!Array.isArray(selectedEmployeeIds) || selectedEmployeeIds.length === 0) {
		return
	}

	const assignedEmployees = []

	for (const employeeId of selectedEmployeeIds) {
		const numericId = Number(employeeId)
		const selectedEmployee = window.MockDB.Users.find(
			e => e.id === numericId
		)
		if (!selectedEmployee) continue

		const existingAssignment = window.MockDB.CourseUsers.find(
			cu => cu.userId === numericId && cu.courseId === courseId
		)
		if (existingAssignment) continue

		const startDate = new Date().toISOString().split('T')[0]
		const dueDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0]

		window.MockDB.CourseUsers.push({
			userId: numericId,
			courseId: courseId,
			status: 'назначен',
			progress: 0,
			start: startDate,
			due: dueDate,
		})

		if (typeof addAssignedCourseRecord === 'function') {
			addAssignedCourseRecord(numericId, {
				id: `assignment-${courseId}-${numericId}-${Date.now()}`,
				courseId,
				title: course.title,
				assignedAt: new Date().toISOString(),
				startDate,
				dueDate,
			})
		}

		assignedEmployees.push(selectedEmployee)
	}

	if (assignedEmployees.length === 0) {
		const message = 'Выбранным сотрудникам этот курс уже был назначен ранее'
		if (typeof modal !== 'undefined') {
			modal.show(message, 'info', 'Информация')
		} else {
			alert(message)
		}
		return
	}

	const namesList = assignedEmployees
		.map(employee => employee.name.split(' ')[0])
		.join(', ')
	const successMessage =
		assignedEmployees.length === 1
			? `Курс "${course.title}" назначен сотруднику ${assignedEmployees[0].name}`
			: `Курс "${course.title}" назначен сотрудникам: ${namesList}`

	if (typeof NotificationManager !== 'undefined') {
		NotificationManager.showTempNotification(successMessage, 'success')
	} else if (typeof modal !== 'undefined') {
		modal.show(successMessage, 'success', 'Успешно')
	} else {
		alert(successMessage)
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
					<p class="modal-hint">
						Можно выбрать сразу несколько сотрудников. Нажмите на карточку, чтобы добавить или убрать из списка назначения.
					</p>
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
						Назначить
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

		const selectedEmployeeIds = new Set()
		const employeesList = modal.querySelector('#employeesList')
		const employeeCards = modal.querySelectorAll('.employee-card')
		const searchInput = modal.querySelector('#employeeSearchInput')
		const confirmBtn = modal.querySelector('.modal-btn-confirm')
		const emptyMessage = modal.querySelector('#employeesEmpty')

		const updateConfirmState = () => {
			const count = selectedEmployeeIds.size
			confirmBtn.disabled = count === 0
			confirmBtn.textContent = count > 0 ? `Назначить (${count})` : 'Назначить'
		}

		const toggleSelection = card => {
			const employeeId = parseInt(card.dataset.employeeId, 10)
			if (card.classList.contains('selected')) {
				card.classList.remove('selected')
				selectedEmployeeIds.delete(employeeId)
			} else {
				card.classList.add('selected')
				selectedEmployeeIds.add(employeeId)
			}
			updateConfirmState()
		}

		updateConfirmState()

		employeeCards.forEach(card => {
			card.addEventListener('click', () => {
				if (card.style.display !== 'none') {
					toggleSelection(card)
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
					if (card.classList.contains('selected')) {
						card.classList.remove('selected')
						selectedEmployeeIds.delete(
							parseInt(card.dataset.employeeId, 10)
						)
					}
				}
			})

			if (visibleCount === 0) {
				emptyMessage.classList.remove('hidden')
				employeesList.style.display = 'none'
			} else {
				emptyMessage.classList.add('hidden')
				employeesList.style.display = 'block'
			}

			updateConfirmState()
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
			if (selectedEmployeeIds.size === 0) return
			closeModal(Array.from(selectedEmployeeIds))
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

function showAddCourseModal() {
	ensureCourseManagementInstance()
	if (window.courseManagement) {
		window.courseManagement.showAddCourseModal()
	}
}

function editCourse(courseId) {
	ensureCourseManagementInstance()
	if (window.courseManagement) {
		window.courseManagement.editCourse(courseId)
	}
}

function deleteCourse(courseId) {
	ensureCourseManagementInstance()
	if (window.courseManagement) {
		window.courseManagement.deleteCourse(courseId)
	}
}

function closeCourseModal() {
	ensureCourseManagementInstance()
	if (window.courseManagement) {
		window.courseManagement.closeCourseModal()
	}
}

document.addEventListener('DOMContentLoaded', () => {
	// Более надёжная проверка: инициализируем, если на странице есть форма курса
	const courseForm = document.getElementById('courseForm')
	if (courseForm) {
		window.courseManagement = new CourseManagement()
	}
})
