import { Component } from './base/Component';
import { IEvents } from './base/Events';
import { ensureElement } from '../utils/utils';

export class Header extends Component<{}> {
	protected basketCounter: HTMLElement;
	protected basketButton: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this.basketCounter = ensureElement<HTMLElement>(
			'.header__basket-counter',
			container
		);
		this.basketButton = ensureElement<HTMLElement>(
			'.header__basket',
			container
		);

		this.basketButton.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	updateBasketCounter(count: number): void {
		this.setText(this.basketCounter, count.toString());
	}
}
