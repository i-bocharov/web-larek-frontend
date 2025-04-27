import { Component } from './base/Component';
import { IEvents } from './base/Events';
import { IProduct } from '../types';

export class Preview extends Component<IProduct> {
	private events: IEvents;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);
		this.events = events; // Сохраняем events локально
	}

	render(data?: Partial<IProduct>): HTMLElement {
		const product = data as IProduct;

		if (!product) {
			throw new Error('Для рендеринга требуются данные о продукте');
		}

		const template = document.getElementById(
			'card-preview'
		) as HTMLTemplateElement;
		const preview = template.content.cloneNode(true) as HTMLElement;

		preview.querySelector('.card__category')!.textContent = product.category;
		preview.querySelector('.card__title')!.textContent = product.title;
		preview.querySelector('.card__text')!.textContent = product.description;
		preview.querySelector('.card__price')!.textContent = `${
			product.price ?? 'Бесплатно'
		} синапсов`;
		preview.querySelector('.card__image')!.setAttribute('src', product.image);

		const addToBasketButton = preview.querySelector(
			'.card__button'
		) as HTMLButtonElement;
		addToBasketButton.addEventListener('click', () => {
			this.events.emit('basket:item-added', { productId: product.id });
		});

		this.container.replaceChildren(preview);
		return this.container; // Возвращаем контейнер для совместимости с базовым классом
	}
}
