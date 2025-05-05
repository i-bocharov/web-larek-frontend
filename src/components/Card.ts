import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { productCategories } from '../utils/constants';
import { IEvents } from './base/Events';
import { IProduct } from '../types';

export class Card extends Component<IProduct> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _category: HTMLElement;
	protected _image: HTMLImageElement;
	protected _description: HTMLElement | null;
	protected _button: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._category = ensureElement<HTMLElement>('.card__category', container);
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		this._description = container.querySelector('.card__text');
		this._button = container;

		// Модифицируем обработчик клика
		this._button.addEventListener('click', (evt) => {
			const target = evt.target as HTMLElement;
			// Если клик был не по кнопке "В корзину", или товар не бесплатный - открываем карточку
			if (!target.closest('.button') || !this.isFree) {
				events.emit('product:selected', {
					productId: this.container.dataset.id,
				});
			}
		});
	}

	private get isFree(): boolean {
		return this._price.textContent?.includes('Бесплатно') ?? false;
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number | null) {
		const button = this.container.querySelector('.button') as HTMLButtonElement;

		this.setText(this._price, value ? `${value} синапсов` : 'Бесплатно');
		this.setDisabled(button, !value);
		if (button) {
			this.toggleClass(button, 'button_disabled', !value);
		}
	}

	set category(value: string) {
		this.setText(this._category, value);
		const categoryClass =
			productCategories[value.toLowerCase()] || 'card__category_other';
		this._category.className = `card__category ${categoryClass}`;
	}

	set image(value: string) {
		this.setImage(this._image, value, this._title.textContent || '');
	}

	set description(value: string) {
		if (this._description) {
			this.setText(this._description, value);
		}
	}

	render(data: IProduct): HTMLElement {
		this.id = data.id;
		this.title = data.title;
		this.price = data.price;
		this.category = data.category;
		this.image = data.image;
		if (data.description) {
			this.description = data.description;
		}
		return this.container;
	}
}
