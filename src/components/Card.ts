import { ProductView } from './ProductView';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/Events';
import { IProduct } from '../types';

export class Card extends ProductView {
	protected _price: HTMLElement;
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

	set price(value: number | null) {
		const button = this.container.querySelector('.button') as HTMLButtonElement;

		this.setText(this._price, value ? `${value} синапсов` : 'Бесплатно');
		this.setDisabled(button, !value);
		if (button) {
			this.toggleClass(button, 'button_disabled', !value);
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
