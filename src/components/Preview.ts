import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { productCategories } from '../utils/constants';
import { IEvents } from './base/Events';
import { IProduct } from '../types';

export class Preview extends Component<IProduct> {
	protected _title: HTMLElement;
	protected _image: HTMLImageElement;
	protected _description: HTMLElement;
	protected _category: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		this._description = ensureElement<HTMLElement>('.card__text', container);
		this._category = ensureElement<HTMLElement>('.card__category', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._button = ensureElement<HTMLButtonElement>('.card__button', container);

		this._button.addEventListener('click', () => {
			if (!this.isFree) {
				events.emit('preview:button-click', {
					productId: this.container.dataset.id,
				});
			}
		});
	}

	private get isFree(): boolean {
		return this._price.textContent?.includes('Бесплатно') ?? false;
	}

	set buttonText(value: string) {
		this.setText(this._button, value);
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
		this.setText(this._price, value ? `${value} синапсов` : 'Бесплатно');
		if (!value) {
			this._button.setAttribute('disabled', 'true');
			this._button.classList.add('button_disabled');
			this._button.textContent = 'Бесплатно';
		} else {
			this._button.removeAttribute('disabled');
			this._button.classList.remove('button_disabled');
			this._button.textContent = 'В корзину';
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
		this.setText(this._description, value);
	}

	render(data: IProduct): HTMLElement {
		this.id = data.id;
		this.title = data.title;
		this.price = data.price;
		this.category = data.category;
		this.image = data.image;
		this.description = data.description;
		return this.container;
	}
}
