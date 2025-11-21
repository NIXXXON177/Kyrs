// Инициализация страницы деталей курса

// Глобальные переменные для плеера
let currentCourse = null
let currentModuleIndex = 0

function loadCourseDetails() {
	const urlParams = new URLSearchParams(window.location.search)
	const courseId = urlParams.get('id')
	const container = document.getElementById('courseDetails')

	if (!courseId) {
		showCourseNotFound(container, 'Неверный идентификатор курса')
		return
	}

	const userData = AuthManager.getUserData()
	currentCourse = userData?.courses?.find(c => c.id == courseId)

	if (!currentCourse) {
		showCourseNotFound(
			container,
			'Запрошенный курс не существует или у вас нет к нему доступа'
		)
		return
	}

	// Проверяем, есть ли параметр mode для отображения плеера
	const mode = urlParams.get('mode')
	if (mode === 'study') {
		renderCoursePlayer(container)
	} else {
		renderCourseDetails(container, currentCourse)
	}
}

function showCourseNotFound(container, message) {
	while (container.firstChild) {
		container.removeChild(container.firstChild)
	}

	const card = document.createElement('div')
	card.className = 'card text-center'

	const title = document.createElement('h2')
	title.textContent = 'Курс не найден'

	const text = document.createElement('p')
	text.textContent = message

	card.appendChild(title)
	card.appendChild(text)
	container.appendChild(card)
}

function renderCourseDetails(container, course) {
	while (container.firstChild) {
		container.removeChild(container.firstChild)
	}

	const card = document.createElement('div')
	card.className = 'card'

	const header = createCourseHeader(course)
	const content = createCourseContent(course)
	const actions = createCourseActions(course)

	card.appendChild(header)
	card.appendChild(content)
	card.appendChild(actions)
	container.appendChild(card)
}

function createCourseHeader(course) {
	const header = document.createElement('div')
	header.className = 'card-header'

	const title = document.createElement('h1')
	title.className = 'card-title'
	title.style.fontSize = '1.5rem'
	title.textContent = course.title

	const status = document.createElement('div')
	status.className = `course-status ${getStatusClass(course.status)}`
	status.textContent = getStatusText(course.status)

	header.appendChild(title)
	header.appendChild(status)
	return header
}

function createCourseContent(course) {
	const content = document.createElement('div')
	content.className = 'course-content'

	const infoGrid = createCourseInfoGrid(course)
	const description = createCourseDescription(course)
	const modules = createCourseModulesPreview(course)
	const materials = createCourseMaterials(course)

	content.appendChild(infoGrid)
	content.appendChild(description)
	content.appendChild(modules)
	content.appendChild(materials)
	return content
}

function createCourseInfoGrid(course) {
	const grid = document.createElement('div')
	grid.style.cssText =
		'display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;'

	const items = [
		{ title: 'Дата начала', value: formatDate(course.start_date) },
		{ title: 'Срок окончания', value: formatDate(course.due_date) },
		{ title: 'Прогресс', value: createProgressElement(course.progress) },
		{ title: 'Статус сертификата', value: getCertificateStatus(course) },
	]

	items.forEach(item => {
		const infoItem = document.createElement('div')
		infoItem.className = 'info-item'

		const title = document.createElement('h3')
		title.textContent = item.title

		infoItem.appendChild(title)

		if (typeof item.value === 'string') {
			const value = document.createElement('p')
			value.textContent = item.value
			infoItem.appendChild(value)
		} else {
			infoItem.appendChild(item.value)
		}

		grid.appendChild(infoItem)
	})

	return grid
}

function createProgressElement(progress) {
	const container = document.createElement('div')
	container.className = 'progress-container'

	const progressBar = document.createElement('div')
	progressBar.className = 'progress-bar'

	const progressFill = document.createElement('div')
	progressFill.className = 'progress-fill'
	progressFill.style.width = `${progress}%`

	const progressLabel = document.createElement('div')
	progressLabel.className = 'progress-label'

	const span = document.createElement('span')
	span.textContent = `${progress}%`
	progressLabel.appendChild(span)

	progressBar.appendChild(progressFill)
	container.appendChild(progressBar)
	container.appendChild(progressLabel)

	return container
}

function createCourseDescription(course) {
	const container = document.createElement('div')
	container.className = 'course-description'
	container.style.marginBottom = '2rem'

	const title = document.createElement('h3')
	title.textContent = 'Описание курса'

	const description = document.createElement('p')
	description.textContent = course.description || 'Описание курса отсутствует.'

	container.appendChild(title)
	container.appendChild(description)
	return container
}

function createCourseModulesPreview(course) {
	const container = document.createElement('div')
	container.className = 'course-modules-preview'
	container.style.marginBottom = '2rem'

	const title = document.createElement('h3')
	title.textContent = 'Модули курса'
	title.style.marginBottom = '1rem'

	const modulesList = document.createElement('div')
	modulesList.className = 'modules-preview-list'

	if (
		course.modules &&
		Array.isArray(course.modules) &&
		course.modules.length > 0
	) {
		const completedCount = course.modules.filter(m => m && m.completed).length

		const summary = document.createElement('div')
		summary.className = 'modules-summary'
		summary.style.marginBottom = '1rem'
		summary.textContent = `Пройдено модулей: ${completedCount}/${course.modules.length}`

		// Показываем только первые 3 модуля для превью
		const previewModules = course.modules.slice(0, 3)

		previewModules.forEach((module, index) => {
			if (module) {
				const moduleItem = createModulePreviewItem(module, index)
				modulesList.appendChild(moduleItem)
			}
		})

		// Если модулей больше 3, показываем кнопку "Показать все"
		if (course.modules.length > 3) {
			const showAllBtn = document.createElement('button')
			showAllBtn.className = 'btn btn-secondary'
			showAllBtn.textContent = `Показать все ${course.modules.length} модулей`
			showAllBtn.style.marginTop = '1rem'
			showAllBtn.addEventListener('click', () => {
				switchToStudyMode()
			})
			modulesList.appendChild(showAllBtn)
		}

		container.appendChild(title)
		container.appendChild(summary)
		container.appendChild(modulesList)
	} else {
		const noModules = document.createElement('p')
		noModules.textContent = 'Модули курса пока не добавлены.'
		noModules.style.color = 'var(--text-muted)'

		container.appendChild(title)
		container.appendChild(noModules)
	}

	return container
}

function createModulePreviewItem(module, index) {
	const item = document.createElement('div')
	item.className = `module-preview-item ${module.completed ? 'completed' : ''}`
	item.style.cssText =
		'display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.5rem;'

	const icon = document.createElement('span')
	icon.style.fontSize = '1.2rem'
	icon.textContent = module.completed
		? '✅'
		: module.type === 'video'
		? '🎥'
		: '📖'

	const content = document.createElement('div')
	content.style.flex = '1'

	const moduleTitle = document.createElement('div')
	moduleTitle.style.fontWeight = '600'
	moduleTitle.style.color = 'var(--text-light)'
	moduleTitle.textContent = module.title

	const moduleMeta = document.createElement('div')
	moduleMeta.style.fontSize = '0.9rem'
	moduleMeta.style.color = 'var(--text-muted)'
	moduleMeta.textContent = `${module.type === 'video' ? 'Видео' : 'Текст'} • ${
		module.duration
	} ${module.completed ? '• Пройдено' : ''}`

	content.appendChild(moduleTitle)
	content.appendChild(moduleMeta)
	item.appendChild(icon)
	item.appendChild(content)

	return item
}

function createCourseMaterials(course) {
	const container = document.createElement('div')
	container.className = 'course-materials'

	const title = document.createElement('h3')
	title.className = 'materials-title'
	title.textContent = 'Материалы курса'

	const materialsList = document.createElement('div')
	materialsList.className = 'materials-list'

	const mockMaterials = [
		{
			type: 'pdf',
			title: 'Учебное пособие по IT-безопасности',
			url: '#',
		},
		{ type: 'video', title: 'Вводное видео к курсу', url: '#' },
		{
			type: 'link',
			title: 'Дополнительные ресурсы и документация',
			url: '#',
		},
	]

	mockMaterials.forEach(material => {
		const materialItem = createMaterialItem(material)
		materialsList.appendChild(materialItem)
	})

	container.appendChild(title)
	container.appendChild(materialsList)
	return container
}

function createMaterialItem(material) {
	const item = document.createElement('div')
	item.className = 'material-item'

	const icon = document.createElement('div')
	icon.className = `material-icon ${material.type}`
	icon.textContent =
		material.type === 'pdf' ? '📄' : material.type === 'video' ? '🎥' : '🔗'

	const content = document.createElement('div')
	content.className = 'material-content'

	const itemTitle = document.createElement('div')
	itemTitle.className = 'material-title'
	itemTitle.textContent = material.title

	const itemType = document.createElement('div')
	itemType.className = 'material-type'
	itemType.textContent =
		material.type === 'pdf'
			? 'PDF документ'
			: material.type === 'video'
			? 'Видео материал'
			: 'Ссылка на ресурс'

	const button = document.createElement('a')
	button.href = material.url
	button.className = `material-btn ${material.type}`
	button.target = '_blank'
	button.textContent =
		material.type === 'pdf'
			? 'Скачать'
			: material.type === 'video'
			? 'Смотреть'
			: 'Перейти'

	content.appendChild(itemTitle)
	content.appendChild(itemType)
	item.appendChild(icon)
	item.appendChild(content)
	item.appendChild(button)

	return item
}

function createCourseActions(course) {
	const actions = document.createElement('div')
	actions.className = 'course-actions'
	actions.style.marginTop = '2rem'
	actions.style.paddingTop = '2rem'
	actions.style.borderTop = '1px solid var(--glass-border)'
	actions.style.display = 'flex'
	actions.style.gap = '1rem'
	actions.style.flexWrap = 'wrap'

	const startBtn = document.createElement('button')
	startBtn.className = 'btn btn-primary'
	startBtn.style.padding = '1rem 2rem'
	startBtn.style.fontSize = '1.1rem'

	if (course.status === 'пройден') {
		startBtn.textContent = 'Повторить курс'
	} else if (course.status === 'в процессе') {
		startBtn.textContent = 'Продолжить обучение'
	} else {
		startBtn.textContent = 'Начать обучение'
	}

	startBtn.addEventListener('click', switchToStudyMode)

	// Кнопка для просмотра всех модулей
	const viewModulesBtn = document.createElement('button')
	viewModulesBtn.className = 'btn btn-secondary'
	viewModulesBtn.textContent = 'Посмотреть модули'
	viewModulesBtn.addEventListener('click', switchToStudyMode)

	actions.appendChild(startBtn)

	if (course.modules && course.modules.length > 0) {
		actions.appendChild(viewModulesBtn)
	}

	return actions
}

function switchToStudyMode() {
	// Добавляем параметр mode=study к текущему URL
	const currentUrl = new URL(window.location.href)
	currentUrl.searchParams.set('mode', 'study')
	window.history.pushState({}, '', currentUrl)

	// Перезагружаем контент страницы
	const container = document.getElementById('courseDetails')
	renderCoursePlayer(container)
}

function renderCoursePlayer(container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild)
	}

	if (!currentCourse) {
		showCourseNotFound(container, 'Курс не найден')
		return
	}

	const playerCard = document.createElement('div')
	playerCard.className = 'card'

	// Заголовок с кнопкой назад
	const header = document.createElement('div')
	header.className = 'card-header'
	header.style.marginBottom = '2rem'

	const backBtn = document.createElement('button')
	backBtn.className = 'btn btn-secondary'
	backBtn.innerHTML = '← Назад к описанию'
	backBtn.addEventListener('click', () => {
		// Убираем параметр mode из URL
		const currentUrl = new URL(window.location.href)
		currentUrl.searchParams.delete('mode')
		window.history.pushState({}, '', currentUrl)

		// Возвращаемся к обычному виду
		renderCourseDetails(container, currentCourse)
	})

	const title = document.createElement('h1')
	title.className = 'card-title'
	title.textContent = `Обучение: ${currentCourse.title}`

	header.appendChild(backBtn)
	header.appendChild(title)
	playerCard.appendChild(header)

	// Основной контент плеера
	const playerContent = document.createElement('div')
	playerContent.className = 'course-player-content'
	playerContent.style.display = 'grid'
	playerContent.style.gridTemplateColumns = '300px 1fr'
	playerContent.style.gap = '2rem'
	playerContent.style.minHeight = '500px'

	const sidebar = createPlayerSidebar()
	const contentArea = createPlayerContentArea()

	playerContent.appendChild(sidebar)
	playerContent.appendChild(contentArea)
	playerCard.appendChild(playerContent)

	container.appendChild(playerCard)

	// Загружаем первый модуль
	loadPlayerModule(currentModuleIndex)
}

function createPlayerSidebar() {
	const sidebar = document.createElement('div')
	sidebar.className = 'player-sidebar'
	sidebar.style.background = 'var(--glass-bg)'
	sidebar.style.backdropFilter = 'blur(25px)'
	sidebar.style.border = '1px solid var(--glass-border)'
	sidebar.style.borderRadius = 'var(--radius)'
	sidebar.style.padding = '1.5rem'
	sidebar.style.height = 'fit-content'
	sidebar.style.position = 'sticky'
	sidebar.style.top = '2rem'

	const modulesTitle = document.createElement('h3')
	modulesTitle.textContent = 'Модули курса'
	modulesTitle.style.marginBottom = '1rem'
	modulesTitle.style.color = 'var(--text-light)'

	const modulesList = document.createElement('div')
	modulesList.className = 'player-modules-list'

	if (currentCourse.modules && Array.isArray(currentCourse.modules)) {
		currentCourse.modules.forEach((module, index) => {
			if (module) {
				const moduleItem = createPlayerModuleItem(module, index)
				modulesList.appendChild(moduleItem)
			}
		})
	}

	const progressSection = createPlayerProgressSection()

	sidebar.appendChild(modulesTitle)
	sidebar.appendChild(modulesList)
	sidebar.appendChild(progressSection)

	return sidebar
}

function createPlayerModuleItem(module, index) {
	const item = document.createElement('div')
	item.className = `player-module-item ${module.completed ? 'completed' : ''} ${
		index === currentModuleIndex ? 'active' : ''
	}`
	item.style.cssText =
		'display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.3s ease; border: 1px solid transparent;'

	item.addEventListener('click', () => {
		loadPlayerModule(index)
	})

	const icon = document.createElement('span')
	icon.style.cssText =
		'width: 24px; height: 24px; border-radius: 50%; background: var(--glass-bg); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0;'
	icon.textContent = module.completed
		? '✓'
		: module.type === 'video'
		? '🎥'
		: '📖'

	if (module.completed) {
		icon.style.background = 'rgba(76, 175, 80, 0.2)'
		icon.style.color = '#4caf50'
	}

	const content = document.createElement('div')
	content.style.flex = '1'

	const title = document.createElement('div')
	title.style.cssText =
		'color: var(--text-light); font-weight: 500; font-size: 0.95rem; margin-bottom: 0.25rem; line-height: 1.3;'
	title.textContent = module.title

	const meta = document.createElement('div')
	meta.style.cssText = 'color: var(--text-muted); font-size: 0.8rem;'
	meta.textContent = `${module.type === 'video' ? 'Видео' : 'Текст'} • ${
		module.duration
	}`

	content.appendChild(title)
	content.appendChild(meta)
	item.appendChild(icon)
	item.appendChild(content)

	return item
}

function createPlayerProgressSection() {
	const section = document.createElement('div')
	section.style.paddingTop = '1rem'
	section.style.borderTop = '1px solid var(--glass-border)'
	section.style.marginTop = '1rem'

	const completedModules = currentCourse.modules
		? currentCourse.modules.filter(m => m && m.completed).length
		: 0
	const totalModules = currentCourse.modules ? currentCourse.modules.length : 0

	const progressText = document.createElement('div')
	progressText.style.cssText =
		'color: var(--text-light); font-weight: 500; margin-bottom: 0.5rem;'
	progressText.textContent = `Прогресс: ${completedModules}/${totalModules}`

	const progressBar = document.createElement('div')
	progressBar.style.cssText =
		'height: 8px; background: var(--glass-bg); border-radius: 4px; overflow: hidden; margin-bottom: 1rem;'

	const progressFill = document.createElement('div')
	progressFill.style.cssText =
		'height: 100%; background: var(--gradient); border-radius: 4px; transition: width 0.3s ease;'
	progressFill.style.width = `${(completedModules / totalModules) * 100}%`

	progressBar.appendChild(progressFill)
	section.appendChild(progressText)
	section.appendChild(progressBar)

	return section
}

function createPlayerContentArea() {
	const content = document.createElement('div')
	content.className = 'player-content-area'

	const navigation = document.createElement('div')
	navigation.style.cssText =
		'display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--glass-border);'

	const prevBtn = document.createElement('button')
	prevBtn.className = 'btn btn-secondary'
	prevBtn.innerHTML = '← Предыдущий'
	prevBtn.addEventListener('click', () => {
		loadPlayerModule(currentModuleIndex - 1)
	})

	const nextBtn = document.createElement('button')
	nextBtn.className = 'btn btn-primary'
	nextBtn.innerHTML = 'Следующий →'
	nextBtn.addEventListener('click', () => {
		loadPlayerModule(currentModuleIndex + 1)
	})

	navigation.appendChild(prevBtn)
	navigation.appendChild(nextBtn)

	const moduleContent = document.createElement('div')
	moduleContent.id = 'playerModuleContent'

	content.appendChild(navigation)
	content.appendChild(moduleContent)

	return content
}

function loadPlayerModule(moduleIndex) {
	if (
		!currentCourse.modules ||
		moduleIndex < 0 ||
		moduleIndex >= currentCourse.modules.length
	) {
		return
	}

	currentModuleIndex = moduleIndex
	const module = currentCourse.modules[moduleIndex]
	const contentArea = document.getElementById('playerModuleContent')

	// Очищаем контент
	while (contentArea.firstChild) {
		contentArea.removeChild(contentArea.firstChild)
	}

	// Создаем заголовок модуля
	const moduleHeader = document.createElement('div')
	moduleHeader.style.marginBottom = '2rem'

	const title = document.createElement('h2')
	title.style.cssText =
		'color: var(--text-light); font-size: 1.8rem; font-weight: 600; margin-bottom: 0.5rem;'
	title.textContent = module.title

	const meta = document.createElement('div')
	meta.style.cssText = 'color: var(--text-muted); font-size: 1rem;'
	meta.textContent = `${module.type === 'video' ? 'Видео' : 'Текст'} • ${
		module.duration
	} • ${module.completed ? 'Пройдено' : 'Не пройдено'}`

	moduleHeader.appendChild(title)
	moduleHeader.appendChild(meta)
	contentArea.appendChild(moduleHeader)

	// Создаем контент модуля
	const content = document.createElement('div')
	content.style.lineHeight = '1.7'

	if (module.type === 'video') {
		const videoPlaceholder = document.createElement('div')
		videoPlaceholder.style.marginBottom = '2rem'
		videoPlaceholder.innerHTML = `
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; overflow: hidden; border: 1px solid var(--glass-border);">
                <div style="position: relative; height: 300px; background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%); display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--primary); transition: all 0.3s ease;">▶</div>
                </div>
                <div style="padding: 1rem; color: var(--text-light);">
                    <p>Видео материал: ${module.title}</p>
                    <p>Длительность: ${module.duration}</p>
                </div>
            </div>
        `
		content.appendChild(videoPlaceholder)
	}

	const textContent = document.createElement('div')
	textContent.style.cssText =
		'background: rgba(255,255,255,0.05); padding: 2rem; border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 2rem; color: var(--text-light); line-height: 1.7; white-space: pre-line;'
	textContent.textContent = module.content || 'Содержимое модуля отсутствует.'
	content.appendChild(textContent)

	// Кнопка завершения модуля
	if (!module.completed) {
		const completeBtn = document.createElement('button')
		completeBtn.className = 'btn btn-primary'
		completeBtn.textContent = 'Отметить как пройденное'
		completeBtn.addEventListener('click', () => {
			completePlayerModule(moduleIndex)
		})
		content.appendChild(completeBtn)
	}

	contentArea.appendChild(content)

	// Обновляем активный модуль в сайдбаре
	updatePlayerActiveModule()
}

function completePlayerModule(moduleIndex) {
	currentCourse.modules[moduleIndex].completed = true

	// Проверяем, все ли модули пройдены
	const totalModules = currentCourse.modules.length
	const completedModules = currentCourse.modules.filter(
		m => m && m.completed
	).length
	const isCourseCompleted = completedModules === totalModules

	// Обновляем данные в localStorage
	const userData = JSON.parse(localStorage.getItem('userData'))
	const courseIndex = userData.courses.findIndex(c => c.id === currentCourse.id)

	if (isCourseCompleted) {
		// Меняем статус курса на "пройден" и устанавливаем прогресс 100%
		userData.courses[courseIndex].status = 'пройден'
		userData.courses[courseIndex].progress = 100
		currentCourse.status = 'пройден'
		currentCourse.progress = 100

		// Пересчитываем общий прогресс пользователя
		const totalCourses = userData.courses.length
		const completedCourses = userData.courses.filter(
			c => c.status === 'пройден'
		).length
		userData.progress = Math.round((completedCourses / totalCourses) * 100)
	} else {
		// Обновляем прогресс курса
		const progressPercent = Math.round((completedModules / totalModules) * 100)
		userData.courses[courseIndex].progress = progressPercent
		currentCourse.progress = progressPercent

		// Меняем статус на "в процессе", если еще не
		if (userData.courses[courseIndex].status !== 'в процессе') {
			userData.courses[courseIndex].status = 'в процессе'
			currentCourse.status = 'в процессе'
		}
	}

	localStorage.setItem('userData', JSON.stringify(userData))

	// Показываем уведомление
	const message = isCourseCompleted
		? 'Поздравляем! Курс успешно пройден!'
		: 'Модуль успешно пройден!'

	if (typeof NotificationManager !== 'undefined') {
		NotificationManager.showTempNotification(message, 'info')
	}

	// Перезагружаем плеер
	const container = document.getElementById('courseDetails')
	renderCoursePlayer(container)
}

function updatePlayerActiveModule() {
	const moduleItems = document.querySelectorAll('.player-module-item')
	moduleItems.forEach((item, index) => {
		if (index === currentModuleIndex) {
			item.style.background = 'rgba(0, 89, 255, 0.1)'
			item.style.borderColor = 'var(--primary)'
		} else {
			item.style.background = 'transparent'
			item.style.borderColor = 'transparent'
		}
	})
}

// Вспомогательные функции
function getStatusClass(status) {
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

function getStatusText(status) {
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

function formatDate(dateString) {
	const date = new Date(dateString)
	return date.toLocaleDateString('ru-RU')
}

function getCertificateStatus(course) {
	if (course.status === 'пройден') {
		return 'Сертификат получен'
	} else if (course.status === 'в процессе') {
		return 'Сертификат будет доступен после завершения'
	} else {
		return 'Сертификат не доступен'
	}
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function () {
	if (!AuthManager.checkAuth()) {
		window.location.href = 'login.html'
		return
	}

	// Загрузка деталей курса
	loadCourseDetails()
})
