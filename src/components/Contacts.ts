import { Form } from './common/Form';
import { IEvents } from './base/Events';
import { ensureElement } from '../utils/utils';
import { IOrder } from '../types';

export class Contacts extends Form<IOrder> {
	private _phone: HTMLInputElement;
	private _email: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._phone = ensureElement<HTMLInputElement>(
			'input[name="phone"]',
			container
		);
		this._email = ensureElement<HTMLInputElement>(
			'input[name="email"]',
			container
		);

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			const formData = {
				email: this._email.value,
				phone: this._phone.value,
			};
			events.emit('contacts:submit', formData);
		});

		this._email.addEventListener('input', () => {
			events.emit('contacts:change', this.values);
		});

		this._phone.addEventListener('input', () => {
			events.emit('contacts:change', this.values);
		});
	}

	protected get values() {
		return {
			email: this._email.value,
			phone: this._phone.value,
		};
	}

	set phone(value: string) {
		this._phone.value = value;
	}

	set email(value: string) {
		this._email.value = value;
	}
}
