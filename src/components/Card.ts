import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
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
		console.log('Initializing Card component');

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._category = ensureElement<HTMLElement>('.card__category', container);
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		this._description = container.querySelector('.card__text');
		this._button = container;

		this._button.addEventListener('click', () => {
			console.log(
				'Card clicked, emitting product:selected event with ID:',
				this.container.dataset.id
			);
			events.emit('product:selected', {
				productId: this.container.dataset.id,
			});
		});
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
	}

	set category(value: string) {
		this.setText(this._category, value);
		const categoryClass =
			'card__category_' + value.toLowerCase().replace(/\s+/g, '-');
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
		console.log('Rendering card with data:', data);
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
