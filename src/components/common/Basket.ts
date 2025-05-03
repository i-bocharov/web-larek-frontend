import { View } from '../base/Component';
import { ensureElement, cloneTemplate, createElement } from '../../utils/utils';
import { EventEmitter } from '../base/Events';
import { IBasketView } from '../../types';

export class Basket extends View<IBasketView> {
	static template = ensureElement<HTMLTemplateElement>('#basket');

	protected listElement: HTMLElement;
	protected totalElement: HTMLElement;
	protected buttonElement: HTMLElement;

	constructor(events: EventEmitter) {
		super(events, cloneTemplate(Basket.template));

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

		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this.listElement.replaceChildren(...items);
			this.buttonElement.removeAttribute('disabled');
		} else {
			this.listElement.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this.buttonElement.setAttribute('disabled', 'disabled');
		}
	}

	set total(total: number) {
		this.setText(this.totalElement, `${total} синапсов`);
	}
}
