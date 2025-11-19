// Компонент модальных окон

class Modal {
	constructor() {
		this.modalContainer = null
		this.init()
	}

	init() {
		// Создаем контейнер для модальных окон, если его еще нет
		if (!document.getElementById('modalContainer')) {
			this.modalContainer = document.createElement('div')
			this.modalContainer.id = 'modalContainer'
			document.body.appendChild(this.modalContainer)
		} else {
			this.modalContainer = document.getElementById('modalContainer')
		}
	}

	/**
	 * Показывает модальное окно с сообщением
	 * @param {string} message - Текст сообщения
	 * @param {string} type - Тип модального окна: 'info', 'warning', 'error', 'success'
	 * @param {string} title - Заголовок модального окна
	 * @returns {Promise} - Промис, который резолвится при закрытии
	 */
	show(message, type = 'info', title = null) {
		return new Promise(resolve => {
			const modal = this.createModal(message, type, title)
			this.modalContainer.appendChild(modal)

			// Анимация появления
			setTimeout(() => {
				modal.classList.add('active')
			}, 10)

			const closeModal = () => {
				modal.classList.remove('active')
				setTimeout(() => {
					modal.remove()
					resolve()
				}, 300)
			}

			// Закрытие по клику на фон или кнопку
			modal.querySelector('.modal-overlay').addEventListener('click', closeModal)
			modal.querySelector('.modal-close').addEventListener('click', closeModal)
			modal.querySelector('.modal-btn').addEventListener('click', closeModal)

			// Закрытие по Escape
			const handleEscape = e => {
				if (e.key === 'Escape') {
					closeModal()
					document.removeEventListener('keydown', handleEscape)
				}
			}
			document.addEventListener('keydown', handleEscape)
		})
	}

	/**
	 * Показывает модальное окно подтверждения
	 * @param {string} message - Текст сообщения
	 * @param {string} title - Заголовок
	 * @returns {Promise<boolean>} - true если подтверждено, false если отменено
	 */
	confirm(message, title = 'Подтверждение') {
		return new Promise(resolve => {
			const modal = this.createConfirmModal(message, title)
			this.modalContainer.appendChild(modal)

			setTimeout(() => {
				modal.classList.add('active')
			}, 10)

			const closeModal = result => {
				modal.classList.remove('active')
				setTimeout(() => {
					modal.remove()
					resolve(result)
				}, 300)
			}

			modal.querySelector('.modal-btn-confirm').addEventListener('click', () => {
				closeModal(true)
			})

			modal.querySelector('.modal-btn-cancel').addEventListener('click', () => {
				closeModal(false)
			})

			modal.querySelector('.modal-overlay').addEventListener('click', () => {
				closeModal(false)
			})

			const handleEscape = e => {
				if (e.key === 'Escape') {
					closeModal(false)
					document.removeEventListener('keydown', handleEscape)
				}
			}
			document.addEventListener('keydown', handleEscape)
		})
	}

	createModal(message, type, title) {
		const modal = document.createElement('div')
		modal.className = 'modal'

		const icon = this.getIcon(type)
		const defaultTitle = this.getDefaultTitle(type)

		modal.innerHTML = `
			<div class="modal-overlay"></div>
			<div class="modal-content">
				<div class="modal-header">
					<div class="modal-icon ${type}">${icon}</div>
					<h3 class="modal-title">${title || defaultTitle}</h3>
					<button class="modal-close" aria-label="Закрыть">×</button>
				</div>
				<div class="modal-body">
					<p>${message}</p>
				</div>
				<div class="modal-footer">
					<button class="btn modal-btn">ОК</button>
				</div>
			</div>
		`

		return modal
	}

	createConfirmModal(message, title) {
		const modal = document.createElement('div')
		modal.className = 'modal'

		modal.innerHTML = `
			<div class="modal-overlay"></div>
			<div class="modal-content">
				<div class="modal-header">
					<div class="modal-icon warning">⚠️</div>
					<h3 class="modal-title">${title}</h3>
					<button class="modal-close" aria-label="Закрыть">×</button>
				</div>
				<div class="modal-body">
					<p>${message}</p>
				</div>
				<div class="modal-footer">
					<button class="btn btn-secondary modal-btn-cancel">Отмена</button>
					<button class="btn modal-btn-confirm">Подтвердить</button>
				</div>
			</div>
		`

		return modal
	}

	getIcon(type) {
		const icons = {
			info: 'ℹ️',
			warning: '⚠️',
			error: '❌',
			success: '✅',
		}
		return icons[type] || icons.info
	}

	getDefaultTitle(type) {
		const titles = {
			info: 'Информация',
			warning: 'Предупреждение',
			error: 'Ошибка',
			success: 'Успешно',
		}
		return titles[type] || titles.info
	}
}

// Создаем глобальный экземпляр
const modal = new Modal()

// Добавляем стили для модальных окон
const style = document.createElement('style')
style.textContent = `
	#modalContainer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 10000;
		pointer-events: none;
	}

	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: all;
	}

	.modal.active {
		opacity: 1;
	}

	.modal-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
	}

	.modal-content {
		position: relative;
		background: var(--glass-bg);
		backdrop-filter: blur(25px) saturate(180%);
		-webkit-backdrop-filter: blur(25px) saturate(180%);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius);
		box-shadow: var(--glass-shadow), var(--accent-glow);
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		transform: scale(0.9);
		transition: transform 0.3s ease;
		z-index: 1;
	}

	.modal.active .modal-content {
		transform: scale(1);
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		border-bottom: 1px solid var(--glass-border);
	}

	.modal-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.modal-icon.info {
		color: #2196f3;
	}

	.modal-icon.warning {
		color: #ff9800;
	}

	.modal-icon.error {
		color: #f44336;
	}

	.modal-icon.success {
		color: #4caf50;
	}

	.modal-title {
		flex: 1;
		margin: 0;
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--text-light);
	}

	.modal-close {
		background: none;
		border: none;
		color: var(--text-muted);
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.3s ease;
	}

	.modal-close:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-light);
	}

	.modal-body {
		padding: 1.5rem;
		color: var(--text-light);
		line-height: 1.6;
	}

	.modal-body p {
		margin: 0;
	}

	.modal-footer {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		padding: 1.5rem;
		border-top: 1px solid var(--glass-border);
	}

	.modal-footer .btn {
		min-width: 120px;
	}

	@media (max-width: 768px) {
		.modal-content {
			width: 95%;
			max-height: 85vh;
		}

		.modal-header {
			padding: 1rem;
		}

		.modal-body {
			padding: 1rem;
		}

		.modal-footer {
			padding: 1rem;
			flex-direction: column;
		}

		.modal-footer .btn {
			width: 100%;
		}
	}
`
document.head.appendChild(style)

