import { Component } from './base/Component';
import { IEvents } from './base/Events';
import { IProduct } from '../types';

export class Card extends Component<IProduct> {
	private events: IEvents;
	private productId: string | null = null;
	private product: IProduct | null = null;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);
		this.events = events;

		this.container.addEventListener('click', () => {
			if (this.productId) {
				this.events.emit('product:selected', { productId: this.productId });
			}
		});
	}

	// Получить данные о продукте
	getProduct(): IProduct | null {
		return this.product;
	}

	render(product: IProduct): HTMLElement {
		this.product = product;
		this.productId = product.id;

		const categoryEl = this.container.querySelector(
			'.card__category'
		) as HTMLElement;
		const titleEl = this.container.querySelector('.card__title') as HTMLElement;
		const priceEl = this.container.querySelector('.card__price') as HTMLElement;
		const imageEl = this.container.querySelector(
			'.card__image'
		) as HTMLImageElement;

		if (categoryEl) {
			this.setText(categoryEl, product.category);
		}
		if (titleEl) {
			this.setText(titleEl, product.title);
		}
		if (priceEl) {
			this.setText(priceEl, `${product.price ?? 'Бесплатно'} синапсов`);
		}
		if (imageEl) {
			imageEl.src = product.image;
			imageEl.alt = product.title;
		}

		return this.container;
	}
}
