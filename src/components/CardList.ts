import { Component } from './base/Component';
import { IEvents } from './base/Events';
import { IProductList } from '../types';
import { Card } from './Card';

export class CardList extends Component<IProductList> {
	private items: Card[] = [];
	private events: IEvents;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);
		this.events = events; // Сохраняем events локально
	}

	// Получить все карточки
	getCards(): Card[] {
		return this.items;
	}

	// Найти карточку по ID продукта
	getCardById(productId: string): Card | undefined {
		return this.items.find((card) => {
			const data = card.getProduct();

			return data?.id === productId;
		});
	}

	render(data?: Partial<IProductList>): HTMLElement {
		const products = data?.items || [];

		// Очищаем контейнер с помощью replaceChildren
		this.container.replaceChildren();

		this.items = products.map((product) => {
			const template = document.getElementById(
				'card-catalog'
			) as HTMLTemplateElement;
			const cardFragment = template.content.cloneNode(true) as DocumentFragment;
			const cardElement = cardFragment.firstElementChild as HTMLElement;
			const card = new Card(cardElement, this.events);
			card.render(product);

			this.container.append(cardElement);

			return card;
		});

		return this.container; // Возвращаем контейнер для совместимости с базовым классом
	}
}
