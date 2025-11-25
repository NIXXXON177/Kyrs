class CoursePlayer {
	constructor() {
		this.currentCourse = null
		this.currentModuleIndex = 0
		this.init()
	}

	init() {
		this.loadCourseData()
		this.renderCoursePlayer()
		this.setupEventListeners()
	}

	loadCourseData() {
		const urlParams = new URLSearchParams(window.location.search)
		const courseId = urlParams.get('id')

		const userData = JSON.parse(localStorage.getItem('userData'))
		this.currentCourse = userData?.courses?.find(c => c.id == courseId)

		if (!this.currentCourse) {
			this.showError('Курс не найден')
			return
		}
	}

	renderCoursePlayer() {
		const container = document.getElementById('coursePlayer')
		if (!container || !this.currentCourse) return

		while (container.firstChild) {
			container.removeChild(container.firstChild)
		}

		const playerLayout = this.createPlayerLayout()
		container.appendChild(playerLayout)

		this.loadModule(this.currentModuleIndex)
	}

	createPlayerLayout() {
		const layout = document.createElement('div')
		layout.className = 'course-player-layout'

		const sidebar = this.createSidebar()
		const content = this.createContentArea()

		layout.appendChild(sidebar)
		layout.appendChild(content)

		return layout
	}

	createSidebar() {
		const sidebar = document.createElement('div')
		sidebar.className = 'course-sidebar'

		const courseTitle = document.createElement('h2')
		courseTitle.className = 'sidebar-title'
		courseTitle.textContent = this.currentCourse.title

		const modulesList = document.createElement('div')
		modulesList.className = 'modules-list'

		this.currentCourse.modules.forEach((module, index) => {
			const moduleItem = this.createModuleItem(module, index)
			modulesList.appendChild(moduleItem)
		})

		const progressSection = this.createProgressSection()

		sidebar.appendChild(courseTitle)
		sidebar.appendChild(modulesList)
		sidebar.appendChild(progressSection)

		return sidebar
	}

	createModuleItem(module, index) {
		const item = document.createElement('div')
		item.className = `module-item ${module.completed ? 'completed' : ''} ${
			index === this.currentModuleIndex ? 'active' : ''
		}`

		const icon = document.createElement('span')
		icon.className = 'module-icon'
		icon.textContent = module.completed
			? '✓'
			: module.type === 'video'
			? '🎥'
			: '📖'

		const content = document.createElement('div')
		content.className = 'module-content'

		const title = document.createElement('div')
		title.className = 'module-title'
		title.textContent = module.title

		const meta = document.createElement('div')
		meta.className = 'module-meta'
		meta.textContent = `${module.type === 'video' ? 'Видео' : 'Текст'} • ${
			module.duration
		}`

		content.appendChild(title)
		content.appendChild(meta)

		item.appendChild(icon)
		item.appendChild(content)

		item.addEventListener('click', () => {
			this.loadModule(index)
		})

		return item
	}

	createProgressSection() {
		const section = document.createElement('div')
		section.className = 'progress-section'

		const progressText = document.createElement('div')
		progressText.className = 'progress-text'

		const completedModules = this.currentCourse.modules.filter(
			m => m.completed
		).length
		progressText.textContent = `Прогресс: ${completedModules}/${this.currentCourse.modules.length}`

		const progressBar = document.createElement('div')
		progressBar.className = 'progress-bar'

		const progressFill = document.createElement('div')
		progressFill.className = 'progress-fill'
		progressFill.style.width = `${
			(completedModules / this.currentCourse.modules.length) * 100
		}%`

		const continueBtn = document.createElement('button')
		continueBtn.className = 'btn btn-primary continue-btn'
		continueBtn.textContent = 'Продолжить обучение'
		continueBtn.addEventListener('click', () => {
			this.loadNextUncompletedModule()
		})

		const testBtn = document.createElement('button')
		testBtn.className = 'btn btn-secondary test-btn'
		testBtn.textContent = 'Пройти тест'
		testBtn.addEventListener('click', () => {
			this.startTest()
		})

		progressBar.appendChild(progressFill)
		section.appendChild(progressText)
		section.appendChild(progressBar)
		section.appendChild(continueBtn)

		if (completedModules === this.currentCourse.modules.length) {
			section.appendChild(testBtn)
		}

		return section
	}

	createContentArea() {
		const content = document.createElement('div')
		content.className = 'course-content'

		const contentHeader = document.createElement('div')
		contentHeader.className = 'content-header'

		const navigation = document.createElement('div')
		navigation.className = 'module-navigation'

		const prevBtn = document.createElement('button')
		prevBtn.className = 'btn btn-secondary prev-btn'
		prevBtn.innerHTML = '← Предыдущий'
		prevBtn.addEventListener('click', () => {
			this.loadModule(this.currentModuleIndex - 1)
		})

		const nextBtn = document.createElement('button')
		nextBtn.className = 'btn btn-primary next-btn'
		nextBtn.innerHTML = 'Следующий →'
		nextBtn.addEventListener('click', () => {
			this.loadModule(this.currentModuleIndex + 1)
		})

		const moduleContent = document.createElement('div')
		moduleContent.className = 'module-content-area'
		moduleContent.id = 'moduleContent'

		navigation.appendChild(prevBtn)
		navigation.appendChild(nextBtn)
		contentHeader.appendChild(navigation)
		content.appendChild(contentHeader)
		content.appendChild(moduleContent)

		return content
	}

	loadModule(moduleIndex) {
		if (moduleIndex < 0 || moduleIndex >= this.currentCourse.modules.length) {
			return
		}

		this.currentModuleIndex = moduleIndex
		const module = this.currentCourse.modules[moduleIndex]
		const contentArea = document.getElementById('moduleContent')

		while (contentArea.firstChild) {
			contentArea.removeChild(contentArea.firstChild)
		}

		const moduleHeader = document.createElement('div')
		moduleHeader.className = 'module-header'

		const title = document.createElement('h2')
		title.className = 'module-content-title'
		title.textContent = module.title

		const meta = document.createElement('div')
		meta.className = 'module-content-meta'
		meta.textContent = `${module.type === 'video' ? 'Видео' : 'Текст'} • ${
			module.duration
		} • ${module.completed ? 'Пройдено' : 'Не пройдено'}`

		moduleHeader.appendChild(title)
		moduleHeader.appendChild(meta)
		contentArea.appendChild(moduleHeader)

		const content = document.createElement('div')
		content.className = 'module-main-content'

		if (module.type === 'video') {
			const videoPlaceholder = document.createElement('div')
			videoPlaceholder.className = 'video-placeholder'
			videoPlaceholder.innerHTML = `
                <div class="video-player">
                    <div class="video-thumbnail">
                        <div class="play-button">▶</div>
                    </div>
                    <div class="video-info">
                        <p>Видео материал: ${module.title}</p>
                        <p>Длительность: ${module.duration}</p>
                    </div>
                </div>
            `
			content.appendChild(videoPlaceholder)
		}

		const textContent = document.createElement('div')
		textContent.className = 'module-text-content'
		textContent.textContent = module.content
		content.appendChild(textContent)

		if (!module.completed) {
			const completeBtn = document.createElement('button')
			completeBtn.className = 'btn btn-primary complete-btn'
			completeBtn.textContent = 'Отметить как пройденное'
			completeBtn.addEventListener('click', () => {
				this.completeModule(moduleIndex)
			})
			content.appendChild(completeBtn)
		}

		contentArea.appendChild(content)

		this.updateActiveModule()
	}

	completeModule(moduleIndex) {
		this.currentCourse.modules[moduleIndex].completed = true

		const userData = JSON.parse(localStorage.getItem('userData'))
		const courseIndex = userData.courses.findIndex(
			c => c.id === this.currentCourse.id
		)
		userData.courses[courseIndex] = this.currentCourse
		localStorage.setItem('userData', JSON.stringify(userData))

		NotificationManager.showTempNotification('Модуль успешно пройден!', 'info')

		this.renderCoursePlayer()
	}

	loadNextUncompletedModule() {
		const nextModuleIndex = this.currentCourse.modules.findIndex(
			module => !module.completed
		)
		if (nextModuleIndex !== -1) {
			this.loadModule(nextModuleIndex)
		}
	}

	updateActiveModule() {
		const moduleItems = document.querySelectorAll('.module-item')
		moduleItems.forEach((item, index) => {
			item.classList.toggle('active', index === this.currentModuleIndex)
		})
	}

	startTest() {
		window.location.href = `course-test.html?courseId=${this.currentCourse.id}`
	}

	showError(message) {
		const container = document.getElementById('coursePlayer')
		if (container) {
			const errorDiv = document.createElement('div')
			errorDiv.className = 'error-message'
			errorDiv.textContent = message
			container.appendChild(errorDiv)
		}
	}
}
