export interface IProductList {
	total: number; // Общее количество продуктов
	items: IProduct[]; // Массив продуктов
}

export interface IProduct {
	id: string; // Уникальный идентификатор продукта
	description: string; // Описание продукта
	image: string; // Путь к изображению продукта
	title: string; // Название продукта
	category: string; // Категория продукта
	price: number | null; // Цена продукта (может быть null)
}

export interface IProductNotFound {
	error: string; // Сообщение об ошибке ("NotFound")
}

export interface IOrder {
	payment: string; // Способ оплаты ("online")
	email: string; // Электронная почта
	phone: string; // Телефон
	address: string; // Адрес доставки
	total: number; // Общая сумма заказа
	items: string[]; // Массив идентификаторов продуктов
}

export interface IOrderSuccess {
	id: string; // Уникальный идентификатор заказа
	total: number; // Общая сумма заказа
}

export interface IOrderError {
	error: string; // Сообщение об ошибке
}

export interface IAppState {
	catalog: IProduct[]; // Каталог всех доступных продуктов.
	basket: string[]; // Массив ID продуктов, добавленных в корзину.
	preview: string | null; // ID продукта, который отображается в предпросмотре (или null, если предпросмотра нет).
	order: {
		payment: string; // Способ оплаты ("online")
		email: string; // Электронная почта
		phone: string; // Телефон
		address: string; // Адрес доставки
		total: number; // Общая сумма заказа
		items: string[]; // Массив ID продуктов в заказе
	} | null; // Информация о текущем заказе (или null, если заказа нет).
	loading: boolean; // Флаг загрузки данных (например, при загрузке каталога продуктов).
	paymentMethod: 'online' | 'cash' | null; // Выбранный способ оплаты
}

export type IBasketItem = Pick<IProduct, 'id' | 'title' | 'price'> & {
	quantity: number; // Количество единиц продукта в корзине.
};

export interface IFormState {
	valid: boolean; // Флаг валидности формы
	errors: string[]; // Массив сообщений об ошибках
}

export interface IBasketView {
	items: IBasketItem[]; // Массив продуктов в корзине с их количеством
	total: number; // Общая стоимость всех продуктов в корзине
	selected: string[]; // Массив ID выбранных продуктов (например, для удаления)
}
