export interface IProductList {
  total: number;        // Общее количество продуктов
  items: IProduct[];    // Массив продуктов
}

export interface IProduct {
  id: string;           // Уникальный идентификатор продукта
  description: string;  // Описание продукта
  image: string;        // Путь к изображению продукта
  title: string;        // Название продукта
  category: string;     // Категория продукта
  price: number | null; // Цена продукта (может быть null)
}

export interface IProductNotFound {
  error: string;        // Сообщение об ошибке ("NotFound")
}

export interface IOrder {
  payment: string;      // Способ оплаты ("online")
  email: string;        // Электронная почта
  phone: string;        // Телефон
  address: string;      // Адрес доставки
  total: number;        // Общая сумма заказа
  items: string[];      // Массив идентификаторов продуктов
}

export interface IOrderSuccess {
  id: string;           // Уникальный идентификатор заказа
  total: number;        // Общая сумма заказа
}

export interface IOrderError {
  error: string;        // Сообщение об ошибке
}