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

// Курсы
const Courses = [
	{
		id: 1,
		title: 'IT-безопасность',
		description: 'Курс по основам информационной безопасности',
		type: 'обязательный',
		duration: 32,
	},
	{
		id: 2,
		title: 'Работа с Laravel',
		description: 'Изучение фреймворка Laravel для веб-разработки',
		type: 'рекомендованный',
		duration: 40,
	},
	{
		id: 3,
		title: 'Управление персоналом',
		description: 'Основы управления человеческими ресурсами',
		type: 'обязательный',
		duration: 28,
	},
	{
		id: 4,
		title: 'Управление IT-проектами',
		description: 'Методологии управления проектами в IT',
		type: 'обязательный',
		duration: 36,
	},
	{
		id: 5,
		title: 'Трудовое законодательство',
		description: 'Актуальные нормы трудового права',
		type: 'обязательный',
		duration: 30,
	},
	{
		id: 6,
		title: 'Мотивация и развитие сотрудников',
		description: 'Системы мотивации и карьерного роста',
		type: 'рекомендованный',
		duration: 24,
	},
	{
		id: 7,
		title: 'Лидерство и управление командой',
		description: 'Навыки эффективного руководства',
		type: 'обязательный',
		duration: 32,
	},
	{
		id: 8,
		title: 'Стратегическое планирование',
		description: 'Разработка стратегии развития отдела',
		type: 'рекомендованный',
		duration: 28,
	},
	// Дополнительные курсы для HR
	{
		id: 9,
		title: 'Управление персоналом (расширенный)',
		description: 'Продвинутые техники управления человеческими ресурсами',
		type: 'рекомендованный',
		duration: 35,
	},
	// Дополнительные курсы для руководителя
	{
		id: 10,
		title: 'Финансовый менеджмент для руководителей',
		description: 'Основы финансового планирования и бюджетирования',
		type: 'рекомендованный',
		duration: 30,
	},
]

// Курс сотрудника (progress, status персонифицированы)
const CourseUsers = [
	// employee id: 1 (Петров)
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
	// HR и Руководитель отдела не проходят курсы - они только управляют обучением
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

// Экспорт для подключения к модулям
window.MockDB = {
	Users,
	UserRole,
	Departments,
	Courses,
	CourseUsers,
	Notifications,
}
