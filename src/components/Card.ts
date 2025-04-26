import { IProduct } from '../types';

// Класс Card
export class Card implements IProduct {
	// Поля класса
	private _id: string;
	private _description: string;
	private _title: string;
	private _category: string;
	private _price: number | null;
	private _image: string;

	// Конструктор
	constructor(
		id: string,
		description: string,
		title: string,
		category: string,
		price: number | null,
		image: string
	) {
		this._id = id;
		this._description = description;
		this._title = title;
		this._category = category;
		this._price = price;
		this._image = image;
	}

	// Метод для рендеринга карточки товара
	render(): HTMLElement {
		// Создаем корневой элемент карточки
		const card = document.createElement('div');
		card.classList.add('card');

		// Создаем элемент для изображения
		const image = document.createElement('img');
		image.src = this._image;
		image.alt = this._title;
		image.classList.add('card__image');

		// Создаем элемент для названия
		const title = document.createElement('h2');
		title.textContent = this._title;
		title.classList.add('card__title');

		// Создаем элемент для описания
		const description = document.createElement('p');
		description.textContent = this._description;
		description.classList.add('card__text');

		// Создаем элемент для категории
		const category = document.createElement('span');
		category.textContent = this._category;
		category.classList.add('card__category');

		// Создаем элемент для цены
		const price = document.createElement('span');
		price.textContent =
			this._price !== null ? `${this._price} синапсов` : 'Цена не указана';
		price.classList.add('card__price');

		// Добавляем все элементы в корневой элемент карточки
		card.append(image, title, description, category, price);

		return card;
	}

	// Геттеры для доступа к данным карточки
	get id(): string {
		return this._id;
	}

	get description(): string {
		return this._description;
	}

	get title(): string {
		return this._title;
	}

	get category(): string {
		return this._category;
	}

	get price(): number | null {
		return this._price;
	}

	get image(): string {
		return this._image;
	}
}
