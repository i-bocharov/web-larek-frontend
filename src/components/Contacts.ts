import { Form } from './common/Form';
import { IOrder } from '../types';
import { EventEmitter } from './base/Events';
import { IFormState } from '../types';

export class Contacts extends Form<IOrder> {
	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);

		// Подписываемся на событие submit
		const submitEventName = `${this.container.name}:submit`;

		this.events.on(submitEventName, () => {
			if (this.valid) {
				this.events.emit('order:submit');
			}
		});

		// Добавляем обработчики для email и phone
		const emailInput = this.container.querySelector(
			'input[name="email"]'
		) as HTMLInputElement;
		const phoneInput = this.container.querySelector(
			'input[name="phone"]'
		) as HTMLInputElement;

		if (emailInput && phoneInput) {
			const validateForm = () => {
				const email = this.getEmail();
				const phone = this.getPhone();

				const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
				const isValidPhone =
					/^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/.test(
						phone
					);

				this.valid = isValidEmail && isValidPhone;
			};

			emailInput.addEventListener('input', validateForm);
			phoneInput.addEventListener('input', validateForm);
		}
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		return super.render({
			...state,
			errors: state.errors || [],
		});
	}

	getEmail(): string {
		const emailInput = this.container.querySelector(
			'input[name="email"]'
		) as HTMLInputElement;
		const value = emailInput?.value || '';

		return value;
	}

	getPhone(): string {
		const phoneInput = this.container.querySelector(
			'input[name="phone"]'
		) as HTMLInputElement;
		const value = phoneInput?.value || '';

		return value;
	}
}
