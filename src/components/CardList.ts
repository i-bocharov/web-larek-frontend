import { Component } from './base/Component';

export class CardList extends Component<{ items: HTMLElement[] }> {
	constructor(container: HTMLElement) {
		super(container);
	}

	render(data?: { items: HTMLElement[] }): HTMLElement {
		const items = data?.items || [];
		this.container.replaceChildren(...items);
		return this.container;
	}
}
