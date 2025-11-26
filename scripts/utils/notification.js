class NotificationManager {
	constructor(employeeData) {
		this.employeeData = employeeData
		this.notifications = []
		this.dismissedNotifications = []
		this.init()
	}

	init() {
		this.loadDismissedNotifications()
		this.checkCourseDeadlines()
		this.checkAssignedCourseNotifications()
		this.renderNotifications()
	}

	loadDismissedNotifications() {
		try {
			const dismissed = localStorage.getItem('dismissedNotifications')
			this.dismissedNotifications = dismissed ? JSON.parse(dismissed) : []
		} catch (error) {
			console.error('Ошибка загрузки скрытых уведомлений:', error)
			this.dismissedNotifications = []
		}
	}

	saveDismissedNotifications() {
		try {
			localStorage.setItem(
				'dismissedNotifications',
				JSON.stringify(this.dismissedNotifications)
			)
		} catch (error) {
			console.error('Ошибка сохранения скрытых уведомлений:', error)
		}
	}

	checkCourseDeadlines() {
		// HR и руководитель не проходят курсы - уведомления не нужны
		if (typeof isHRManager !== 'undefined' && isHRManager()) return
		if (typeof isDepartmentHead !== 'undefined' && isDepartmentHead()) return

		if (!this.employeeData || !this.employeeData.courses) return

		const now = new Date()
		const oneWeekMs = 7 * 24 * 60 * 60 * 1000

		this.employeeData.courses.forEach(course => {
			const dueDate = new Date(course.due_date)
			const timeDiff = dueDate - now

			// Уведомление об истечении срока
			if (timeDiff > 0 && timeDiff <= oneWeekMs) {
				const notificationId = `course-deadline-${course.id}`
				if (!this.dismissedNotifications.includes(notificationId)) {
					const daysLeft = Math.ceil(timeDiff / (24 * 60 * 60 * 1000))
					this.notifications.push({
						id: notificationId,
						type: 'warning',
						title: 'Срок сдачи курса',
						message: `Курс "${
							course.title
						}" истекает через ${daysLeft} ${this.getDayText(daysLeft)}`,
						courseId: course.id,
					})
				}
			}

			// Уведомление о просроченном курсе
			if (timeDiff < 0 && course.status !== 'пройден') {
				const notificationId = `course-expired-${course.id}`
				if (!this.dismissedNotifications.includes(notificationId)) {
					this.notifications.push({
						id: notificationId,
						type: 'error',
						title: 'Просроченный курс',
						message: `Курс "${course.title}" просрочен`,
						courseId: course.id,
					})
				}
			}
		})

		// Приветственное уведомление
		const welcomeId = 'welcome-message'
		if (
			this.notifications.length === 0 &&
			!this.dismissedNotifications.includes(welcomeId)
		) {
			this.notifications.push({
				id: welcomeId,
				type: 'info',
				title: 'Добро пожаловать!',
				message: 'Все курсы актуальны. Приятного обучения!',
			})
		}
	}

	checkAssignedCourseNotifications() {
		if (
			!this.employeeData ||
			!this.employeeData.employee ||
			typeof getAssignedCourseRecords !== 'function'
		) {
			return
		}

		const employeeId = this.employeeData.employee.id
		if (!employeeId) return

		const assignments = getAssignedCourseRecords(employeeId)
		assignments.forEach(assignment => {
			if (assignment.acknowledged) {
				return
			}

			const notificationId = `assigned-course-${assignment.id}`
			if (this.dismissedNotifications.includes(notificationId)) {
				return
			}

			this.notifications.push({
				id: notificationId,
				type: 'info',
				title: 'Назначен новый курс',
				message: `Вам назначен курс "${assignment.title}"`,
				courseId: assignment.courseId,
				assignmentInfo: {
					employeeId,
					assignmentId: assignment.id,
				},
			})
		})
	}

	getDayText(days) {
		if (days === 1) return 'день'
		if (days >= 2 && days <= 4) return 'дня'
		return 'дней'
	}

	renderNotifications() {
		const container = document.getElementById('notificationsContainer')
		if (!container) return

		while (container.firstChild) {
			container.removeChild(container.firstChild)
		}

		this.notifications.forEach(notification => {
			const notificationElement = this.createNotificationElement(notification)
			container.appendChild(notificationElement)
		})
	}

	createNotificationElement(notification) {
		const element = document.createElement('div')
		element.className = `notification ${notification.type} fade-in`

		// Кнопка закрытия
		const closeBtn = document.createElement('button')
		closeBtn.className = 'notification-close'
		closeBtn.innerHTML = '&times;'
		closeBtn.setAttribute('aria-label', 'Закрыть уведомление')
		closeBtn.addEventListener('click', e => {
			e.stopPropagation()
			this.dismissNotification(notification, element)
		})

		const icon = document.createElement('div')
		icon.className = 'notification-icon'
		icon.textContent = this.getNotificationIcon(notification.type)

		const content = document.createElement('div')
		content.className = 'notification-content'

		const title = document.createElement('h4')
		title.textContent = notification.title

		const message = document.createElement('p')
		message.textContent = notification.message

		content.appendChild(title)
		content.appendChild(message)

		element.appendChild(closeBtn) // ← добавили кнопку
		element.appendChild(icon)
		element.appendChild(content)

		// Сохраняем ссылку на уведомление в DOM-элемент для возможного доступа
		element._notificationData = notification

		if (notification.courseId) {
			element.style.cursor = 'pointer'
			element.addEventListener('click', () => {
				const isInPagesFolder = window.location.pathname.includes('/pages/')
				const coursePath = isInPagesFolder
					? `course-details.html?id=${notification.courseId}`
					: `pages/employee/course-details.html?id=${notification.courseId}`
				this.dismissNotification(notification, element)
				window.location.href = coursePath
			})
		}

		return element
	}

	/*************  ✨ Windsurf Command ⭐  *************/
	/**
	 * Returns an icon corresponding to the notification type
	 * @param {string} type - Type of the notification: 'warning', 'error', 'info'
	 * @returns {string} - Icon text content
	 */
	/*******  a2561f21-7551-486d-bfb3-b4ed6b279806  *******/
	getNotificationIcon(type) {
		switch (type) {
			case 'warning':
				return '⚠️'
			case 'error':
				return '❌'
			case 'info':
				return 'ℹ️'
			default:
				return '📢'
		}
	}

	dismissNotification(notification, element) {
		if (element && typeof element.remove === 'function') {
			element.remove()
		}

		if (notification.id) {
			this.dismissedNotifications.push(notification.id)
			this.saveDismissedNotifications()
		}

		const index = this.notifications.indexOf(notification)
		if (index > -1) {
			this.notifications.splice(index, 1)
		}

		if (
			notification.assignmentInfo &&
			typeof markAssignedCourseAcknowledged === 'function'
		) {
			markAssignedCourseAcknowledged(
				notification.assignmentInfo.employeeId,
				notification.assignmentInfo.assignmentId
			)
		}
	}

	static showTempNotification(message, type = 'info', duration = 5000) {
		const notification = document.createElement('div')
		notification.className = `notification ${type} fade-in`
		notification.style.position = 'fixed'
		notification.style.top = '20px'
		notification.style.right = '20px'
		notification.style.zIndex = '10000'
		notification.style.maxWidth = '400px'

		const icon = document.createElement('div')
		icon.className = 'notification-icon'
		icon.textContent =
			type === 'warning'
				? '⚠️'
				: type === 'error'
				? '❌'
				: type === 'info'
				? 'ℹ️'
				: '📢'

		const content = document.createElement('div')
		content.className = 'notification-content'

		const messageElement = document.createElement('p')
		messageElement.textContent = message

		content.appendChild(messageElement)
		notification.appendChild(icon)
		notification.appendChild(content)

		document.body.appendChild(notification)

		setTimeout(() => {
			notification.remove()
		}, duration)

		return notification
	}
}
