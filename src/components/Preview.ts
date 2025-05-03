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

		this.setText(preview.querySelector('.card__category'), product.category);
		this.setText(preview.querySelector('.card__title'), product.title);
		this.setText(preview.querySelector('.card__text'), product.description);
		this.setText(
			preview.querySelector('.card__price'),
			`${product.price ?? 'Бесплатно'} синапсов`
		);
		preview.querySelector('.card__image')!.setAttribute('src', product.image);

		const addToBasketButton = preview.querySelector(
			'.card__button'
		) as HTMLButtonElement;

		addToBasketButton.addEventListener('click', () => {
			if (addToBasketButton.textContent === 'В корзину') {
				this.events.emit('basket:item-added', { productId: product.id });
			} else {
				this.events.emit('basket:item-removed', { productId: product.id });
			}
		});

		this.container.replaceChildren(preview);

		return this.container; // Возвращаем контейнер для совместимости с базовым классом
	}
}
