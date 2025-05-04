import { Component } from './base/Component';
import { IEvents } from './base/Events';

interface ICardList {
	items: HTMLElement[];
}

export class CardList extends Component<ICardList> {
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
		console.log('CardList initialized');
	}

	render(data: ICardList): HTMLElement {
		console.log('Rendering CardList with items:', data.items.length);
		this.container.replaceChildren(...data.items);
		return this.container;
	}
}
