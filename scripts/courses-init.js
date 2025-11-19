// Инициализация страницы курсов

document.addEventListener('DOMContentLoaded', function () {
	// Проверка авторизации уже выполняется в filters.js

	// Обработчик кнопки печати сертификатов
	const printCertificatesBtn = document.getElementById('printCertificatesBtn')
	if (printCertificatesBtn) {
		printCertificatesBtn.addEventListener('click', function () {
			if (window.filterManager) {
				window.filterManager.printCertificates()
			}
		})
	}
})
