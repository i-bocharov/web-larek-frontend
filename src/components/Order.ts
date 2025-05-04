import { Form } from './common/Form';
import { IEvents } from './base/Events';
import { ensureElement } from '../utils/utils';
import { IOrder, IFormState } from '../types';

export class Order extends Form<IOrder> {
	protected _buttons: HTMLButtonElement[];
	protected _buttonsContainer: HTMLElement;
	protected _address: HTMLInputElement;
	protected _payment: string = '';

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._buttons = Array.from(container.querySelectorAll('.button_alt'));
		this._buttonsContainer = ensureElement<HTMLElement>(
			'.order__buttons',
			container
		);
		this._address = ensureElement<HTMLInputElement>(
			'input[name="address"]',
			container
		);

		this._buttons.forEach((button) => {
			button.addEventListener('click', () => {
				this.updateButtons(button.name);
				events.emit('order:payment:change', {
					payment: this._payment,
					address: this.address,
				});
			});
		});

		this._address.addEventListener('input', () => {
			events.emit('order:address:change', {
				payment: this._payment,
				address: this.address,
			});
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			events.emit('order:submit', {
				payment: this._payment,
				address: this.address,
			});
		});
	}

	protected updateButtons(name: string) {
		this._buttons.forEach((button) => {
			button.classList.toggle('button_alt-active', button.name === name);
		});
		this._payment = name;
	}

	set address(value: string) {
		this._address.value = value;
	}

	get address(): string {
		return this._address.value;
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		const { payment, valid, errors } = state;
		if (payment) {
			this.updateButtons(payment);
		}
		if (valid !== undefined) {
			this.valid = valid;
		}
		if (errors) {
			this.errors = errors;
		}
		return this.container;
	}
}
