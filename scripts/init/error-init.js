// Инициализация страниц ошибок (error.html и 404.html)

document.addEventListener('DOMContentLoaded', function () {
	// Получаем код ошибки из URL параметров
	const urlParams = new URLSearchParams(window.location.search)
	const errorCode = urlParams.get('code') || '404'
	const errorMessage = urlParams.get('message')

	// Обновляем код ошибки
	const errorCodeElement = document.getElementById('errorCode')
	if (errorCodeElement) {
		errorCodeElement.textContent = errorCode
	}

	// Обновляем сообщение об ошибке
	if (errorMessage) {
		const errorMessageElement = document.getElementById('errorMessage')
		if (errorMessageElement) {
			errorMessageElement.textContent = decodeURIComponent(errorMessage)
		}
	}

	// Обновляем заголовок в зависимости от кода ошибки
	const errorTitle = document.querySelector('.error-title')
	if (errorTitle) {
		const titles = {
			404: 'Страница не найдена',
			403: 'Доступ запрещен',
			500: 'Внутренняя ошибка сервера',
			503: 'Сервис временно недоступен',
		}
		errorTitle.textContent = titles[errorCode] || 'Произошла ошибка'
	}
})

