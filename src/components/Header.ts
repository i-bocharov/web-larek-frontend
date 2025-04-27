import { Component } from './base/Component';
import { IEvents } from './base/Events';

export class Header extends Component<{}> {
	private basketCounter: HTMLElement;
	private events: IEvents;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);
		this.events = events; // Сохраняем events локально
		this.basketCounter = this.container.querySelector(
			'.header__basket-counter'
		)!;
		this.initBasketButton();
	}

	private initBasketButton(): void {
		const basketButton = this.container.querySelector(
			'.header__basket'
		) as HTMLButtonElement;
		basketButton.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	updateBasketCounter(count: number): void {
		this.basketCounter.textContent = count.toString();
	}
}
