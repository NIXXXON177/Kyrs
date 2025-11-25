// Моковые структуры данных для клиентской БД

// Перечисления ролей
const UserRole = {
	EMPLOYEE: 'employee',
	HR: 'hr-manager',
	HEAD: 'department-head',
}

// Пользователи
const Users = [
	{
		id: 1,
		name: 'Петров Алексей Владимирович',
		role: UserRole.EMPLOYEE,
		position: 'инженер-программист',
		departmentId: 1,
		email: 'a.petrov@technoline.ru',
	},
	{
		id: 2,
		name: 'Иванов Сергей Петрович',
		role: UserRole.EMPLOYEE,
		position: 'ведущий разработчик',
		departmentId: 1,
		email: 's.ivanov@technoline.ru',
	},
	{
		id: 3,
		name: 'Сидорова Анна Михайловна',
		role: UserRole.HR,
		position: 'HR менеджер',
		departmentId: 2,
		email: 'a.sidorova@technoline.ru',
	},
	{
		id: 4,
		name: 'Кузнецов Дмитрий Александрович',
		role: UserRole.HEAD,
		position: 'руководитель отдела',
		departmentId: 1,
		email: 'd.kuznetsov@technoline.ru',
	},
]

// Отделы
const Departments = [
	{ id: 1, name: 'IT-отдел' },
	{ id: 2, name: 'Отдел кадров' },
]

// Курсы (доступны только для сотрудников)
const Courses = [
	{
		id: 1,
		title: 'IT-безопасность',
		description: 'Курс по основам информационной безопасности',
		type: 'обязательный',
		duration: 32,
		targetRoles: [UserRole.EMPLOYEE], // Только для сотрудников
	},
	{
		id: 2,
		title: 'Работа с Laravel',
		description: 'Изучение фреймворка Laravel для веб-разработки',
		type: 'рекомендованный',
		duration: 40,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 3,
		title: 'Управление персоналом',
		description: 'Основы управления человеческими ресурсами',
		type: 'обязательный',
		duration: 28,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 4,
		title: 'Управление IT-проектами',
		description: 'Методологии управления проектами в IT',
		type: 'обязательный',
		duration: 36,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 5,
		title: 'Трудовое законодательство',
		description: 'Актуальные нормы трудового права',
		type: 'обязательный',
		duration: 30,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 6,
		title: 'Мотивация и развитие сотрудников',
		description: 'Системы мотивации и карьерного роста',
		type: 'рекомендованный',
		duration: 24,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 7,
		title: 'Лидерство и управление командой',
		description: 'Навыки эффективного руководства',
		type: 'обязательный',
		duration: 32,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 8,
		title: 'Стратегическое планирование',
		description: 'Разработка стратегии развития отдела',
		type: 'рекомендованный',
		duration: 28,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 9,
		title: 'JavaScript для начинающих',
		description: 'Основы JS, синтаксис, переменные, функции.',
		type: 'обязательный',
		duration: 36,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 10,
		title: 'Продвинутый CSS',
		description: 'Flexbox, Grid, препроцессоры, анимации.',
		type: 'рекомендованный',
		duration: 28,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 11,
		title: 'React.js с нуля',
		description: 'Компоненты, Props, State, хуки.',
		type: 'рекомендованный',
		duration: 40,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 12,
		title: 'Node.js и Express',
		description: 'Создание серверов и API, обработка маршрутов.',
		type: 'обязательный',
		duration: 32,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 13,
		title: 'Введение в Data Science',
		description: 'Основы анализа данных на Python. Pandas, Numpy.',
		type: 'рекомендованный',
		duration: 24,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 14,
		title: 'DevOps: основы CI/CD',
		description: 'Автоматизация тестирования и деплоя.',
		type: 'рекомендованный',
		duration: 28,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 15,
		title: 'Психология коммуникаций',
		description: 'Soft skills для работы в команде.',
		type: 'рекомендованный',
		duration: 20,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 16,
		title: 'Введение в Machine Learning',
		description: 'Модели обучения с учителем, sklearn.',
		type: 'рекомендованный',
		duration: 32,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 17,
		title: 'Анализ требований (Business Analysis)',
		description: 'Диаграммы, user stories, работа с заказчиком.',
		type: 'обязательный',
		duration: 28,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 18,
		title: 'SQL для аналитиков',
		description: 'Запросы, join, оптимизация, индексы.',
		type: 'обязательный',
		duration: 24,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 19,
		title: 'Agile/Scrum на практике',
		description: 'Принципы и роли, спринты, ретро.',
		type: 'рекомендованный',
		duration: 20,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 20,
		title: 'Product Management',
		description: 'Лайфцикл продукта, MVP, CustDev.',
		type: 'рекомендованный',
		duration: 28,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 21,
		title: 'QA: основы тестирования',
		description: 'Тест-кейсы, баг-репорты, виды тестов.',
		type: 'обязательный',
		duration: 18,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 22,
		title: 'Git для командной работы',
		description: 'Ветки, Pull Request, разрешение конфликтов.',
		type: 'обязательный',
		duration: 16,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 23,
		title: 'UX/UI Дизайн',
		description: 'Wireframes, прототипирование, основы цветовой теории.',
		type: 'рекомендованный',
		duration: 22,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 24,
		title: 'Основы мобильной верстки',
		description: 'Responsive & adaptive, мобильные first подходы.',
		type: 'рекомендованный',
		duration: 20,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 25,
		title: 'Docker и контейнеризация',
		description: 'Docker Compose, сети и тома.',
		type: 'рекомендованный',
		duration: 28,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 26,
		title: 'Kubernetes: основы оркестрации',
		description: 'Pod, Deployment, Service. Миграции.',
		type: 'рекомендованный',
		duration: 26,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 27,
		title: 'Алгоритмы и структуры данных',
		description: 'Списки, стеки/очереди, сортировки.',
		type: 'обязательный',
		duration: 32,
		targetRoles: [UserRole.EMPLOYEE],
	},
	{
		id: 28,
		title: 'C# для начинающих',
		description: 'Синтаксис C#, .NET, базовые конструкции.',
		type: 'рекомендованный',
		duration: 36,
		targetRoles: [UserRole.EMPLOYEE],
	},
]

// Курс сотрудника (только для сотрудников - EMPLOYEE)
const CourseUsers = [
	// employee id: 1 (Петров) - сотрудник
	{
		userId: 1,
		courseId: 1,
		status: 'пройден',
		progress: 100,
		start: '2024-01-15',
		due: '2025-01-15',
	},
	{
		userId: 1,
		courseId: 2,
		status: 'в процессе',
		progress: 45,
		start: '2025-03-01',
		due: '2025-06-01',
	},
	// employee id: 2 (Иванов) - сотрудник
	{
		userId: 2,
		courseId: 3,
		status: 'в процессе',
		progress: 60,
		start: '2025-02-01',
		due: '2025-05-01',
	},
	{
		userId: 2,
		courseId: 4,
		status: 'назначен',
		progress: 0,
		start: '2025-04-01',
		due: '2025-07-01',
	},
	// HR (id: 3) и Руководитель (id: 4) не проходят курсы - у них нет записей в CourseUsers
]

// Нотификации
const Notifications = [
	{
		id: 1,
		userId: 1,
		type: 'deadline',
		text: 'Курс "Работа с Laravel" истекает через 7 дней!',
		date: '2025-05-25',
	},
	{
		id: 2,
		userId: 4,
		type: 'report',
		text: 'В вашем отделе 2 просроченных курса',
		date: '2025-04-02',
	},
]

// Вспомогательные функции для проверки доступа
const CourseAccess = {
	// Проверяет, может ли пользователь проходить курсы
	canTakeCourses: userRole => {
		return userRole === UserRole.EMPLOYEE
	},

	// Получает курсы, доступные для роли пользователя
	getAvailableCourses: userRole => {
		return Courses.filter(course => course.targetRoles.includes(userRole))
	},

	// Проверяет, назначен ли курс пользователю
	isCourseAssignedToUser: (userId, courseId) => {
		return CourseUsers.some(
			cu => cu.userId === userId && cu.courseId === courseId
		)
	},
}

// Экспорт для подключения к модулям
window.MockDB = {
	Users,
	UserRole,
	Departments,
	Courses,
	CourseUsers,
	Notifications,
	CourseAccess,
}
