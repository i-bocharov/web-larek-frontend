import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

interface IModalData {
	content: HTMLElement;
}

export class Modal extends Component<IModalData> {
	private _closeButton: HTMLButtonElement;
	private _content: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	getContent(): HTMLElement {
		return this._content;
	}

	open() {
		this.container.classList.add('modal_active');
		this.events.emit('modal:open');
	}

	close() {
		this.container.classList.remove('modal_active');
		this.content = null;
		this.events.emit('modal:close');
	}

	render(data: IModalData): HTMLElement {
		this.content = data.content;
		this.open();
		return this.container;
	}
}
