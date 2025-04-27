import { Component } from './base/Component';
import { IEvents } from './base/Events';
import { IProduct } from '../types';

export class Card extends Component<IProduct> {
	private events: IEvents;
	private productId: string | null = null;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);
		this.events = events;

		this.container.addEventListener('click', () => {
			if (this.productId) {
				this.events.emit('product:selected', { productId: this.productId });
			}
		});
	}

	render(product: IProduct): HTMLElement {
		// ...existing code...
		this.container.querySelector('.card__category')!.textContent =
			product.category;
		this.container.querySelector('.card__title')!.textContent = product.title;
		this.container.querySelector('.card__price')!.textContent = `${
			product.price ?? 'Бесплатно'
		} синапсов`;
		this.container
			.querySelector('.card__image')!
			.setAttribute('src', product.image);

		this.productId = product.id; // сохраняем id для обработчика

		return this.container;
	}
}
