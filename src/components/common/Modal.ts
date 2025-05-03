import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

interface IModalData {
	content: HTMLElement;
}

export class Modal extends Component<IModalData> {
	protected closeButtonElement: HTMLButtonElement;
	protected contentElement: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this.closeButtonElement = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this.contentElement = ensureElement<HTMLElement>(
			'.modal__content',
			container
		);

		this.closeButtonElement.addEventListener('click', () => this.close());
		this.container.addEventListener('click', (event) => {
			if (event.target === this.container) {
				this.close();
			}
		});
	}

	set content(value: HTMLElement | DocumentFragment) {
		// Очищаем текущее содержимое
		this.contentElement.replaceChildren();

		if (value instanceof DocumentFragment) {
			if (value.firstElementChild) {
				this.contentElement.appendChild(value.firstElementChild);
			}
		} else if (value) {
			this.contentElement.appendChild(value);
		}
	}

	open() {
		this.toggleClass(this.container, 'modal_active', true);
		this.events.emit('modal:open');
	}

	close() {
		this.toggleClass(this.container, 'modal_active', false);
		this.contentElement.replaceChildren();
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
		return this.contentElement.querySelector('.card__button');
	}

	getContent(): HTMLElement {
		return this.contentElement;
	}
}
