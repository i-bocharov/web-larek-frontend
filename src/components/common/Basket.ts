import { View } from '../base/Component';
import { ensureElement, cloneTemplate, createElement } from '../../utils/utils';
import { EventEmitter } from '../base/Events';
import { IBasketView } from '../../types';

export class Basket extends View<IBasketView> {
	protected listElement: HTMLElement;
	protected totalElement: HTMLElement;
	protected buttonElement: HTMLElement;
	public cloneCardBasketTemplate!: () => HTMLElement;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container, events);

		this.listElement = ensureElement<HTMLElement>(
			'.basket__list',
			this.container
		);
		this.totalElement = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);
		this.buttonElement = ensureElement<HTMLElement>(
			'.basket__button',
			this.container
		);

		this.buttonElement.addEventListener('click', () => {
			events.emit('order:open');
		});
	}

	getContainer(): HTMLElement {
		return this.container;
	}

	render(data: IBasketView): HTMLElement {
		const items = data.items.map((item, index) => {
			const element = this.cloneCardBasketTemplate() as HTMLElement;

			this.setText(element.querySelector('.basket__item-index'), index + 1);
			this.setText(element.querySelector('.card__title'), item.title);
			this.setText(
				element.querySelector('.card__price'),
				item.price ? `${item.price} синапсов` : 'Бесплатно'
			);

			const deleteButton = element.querySelector('.basket__item-delete');
			deleteButton.addEventListener('click', () => {
				this.events.emit('basket:item-removed', { productId: item.id });
			});

			return element;
		});

		this.listElement.replaceChildren(
			...(items.length
				? items
				: [
						createElement<HTMLParagraphElement>('p', {
							textContent: 'Корзина пуста',
						}),
				  ])
		);

		this.setDisabled(this.buttonElement, items.length === 0);

		this.setText(this.totalElement, `${data.total} синапсов`);

		return this.container;
	}
}
