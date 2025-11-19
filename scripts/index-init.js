// Инициализация главной страницы

document.addEventListener('DOMContentLoaded', function () {
	// Основная инициализация уже выполняется в main.js
	// Здесь только дополнительные обработчики, если нужны
})

// Preloader
window.addEventListener('load', function () {
	const preloader = document.getElementById('preloader')
	if (preloader) {
		setTimeout(() => {
			preloader.classList.add('hidden')
			setTimeout(() => {
				preloader.style.display = 'none'
			}, 500) // Match transition duration
		}, 1000) // Minimum show time
	}
})
