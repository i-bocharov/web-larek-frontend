import { View } from './base/Component';
import { IEvents } from './base/Events';
import { ensureElement } from '../utils/utils';
import { IPage } from '../types';

export class Page extends View<IPage> {
	protected basketCounter: HTMLElement;
	protected cardCatalog: HTMLElement;
	protected basketButton: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container, events);

		this.basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
		this.cardCatalog = ensureElement<HTMLElement>('.gallery');
		this.basketButton = ensureElement<HTMLElement>('.header__basket');

		this.basketButton.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	set counter(value: number) {
		this.setText(this.basketCounter, String(value));
	}

	set catalog(items: HTMLElement[]) {
		this.cardCatalog.replaceChildren(...items);
	}
}
