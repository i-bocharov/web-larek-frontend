import { Component } from './base/Component';
import { IEvents } from './base/Events';
import { IProduct } from '../types';

export class Card extends Component<IProduct> {
	private events: IEvents;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);
		this.events = events; // Сохраняем events локально
	}

	render(product: IProduct): HTMLElement {
		this.container.querySelector('.card__category')!.textContent =
			product.category;
		this.container.querySelector('.card__title')!.textContent = product.title;
		this.container.querySelector('.card__price')!.textContent = `${
			product.price ?? 'Бесплатно'
		} синапсов`;
		this.container
			.querySelector('.card__image')!
			.setAttribute('src', product.image);

		this.container.addEventListener('click', () => {
			this.events.emit('product:selected', { productId: product.id });
		});

		return this.container; // Возвращаем контейнер для совместимости с базовым классом
	}
}
