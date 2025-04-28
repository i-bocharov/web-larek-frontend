import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

interface IModalData {
	content: HTMLElement;
}

export class Modal extends Component<IModalData> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', () => this.close());
		this.container.addEventListener('click', (event) => {
			if (event.target === this.container) {
				this.close();
			}
		});
	}

	set content(value: HTMLElement | DocumentFragment) {
		const element =
			value instanceof DocumentFragment
				? (value.firstElementChild as HTMLElement)
				: value;
		if (element) {
			this._content.replaceChildren(element);
		}
	}

	open() {
		this.container.classList.add('modal_active');
		this.events.emit('modal:open');
	}

	close() {
		this.container.classList.remove('modal_active');
		this._content.replaceChildren();
		this.events.emit('modal:close');
	}

	render(data: IModalData): HTMLElement {
		if (data.content) {
			this.content = data.content;
			this.open();
		}
		return this.container;
	}

	isActive(): boolean {
		return this.container.classList.contains('modal_active');
	}

	getButton(): HTMLElement | null {
		return this._content.querySelector('.card__button');
	}

	getContent(): HTMLElement {
		return this._content;
	}
}
