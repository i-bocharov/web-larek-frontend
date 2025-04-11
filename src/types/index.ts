interface IProductList {
  total: number;        // Общее количество продуктов
  items: IProduct[];    // Массив продуктов
}

interface IProduct {
  id: string;           // Уникальный идентификатор продукта
  description: string;  // Описание продукта
  image: string;        // Путь к изображению продукта
  title: string;        // Название продукта
  category: string;     // Категория продукта
  price: number | null; // Цена продукта (может быть null)
}

