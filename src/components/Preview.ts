import { ProductView } from './ProductView';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/Events';
import { IProduct } from '../types';

export class Preview extends ProductView {
	protected _image: HTMLImageElement;
	protected _description: HTMLElement;
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

	set price(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесплатно');
		this.setText(this._button, value ? 'В корзину' : 'Бесплатно');
		this.setDisabled(this._button, !value);
		this.toggleClass(this._button, 'button_disabled', !value);
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
