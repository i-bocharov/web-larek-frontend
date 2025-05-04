import { Component } from './base/Component';
import { IEvents } from './base/Events';

interface ICardList {
	items: HTMLElement[];
}

export class CardList extends Component<ICardList> {
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
	}

	render(data: ICardList): HTMLElement {
		this.container.replaceChildren(...data.items);
		return this.container;
	}
}
