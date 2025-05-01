import { Form } from './common/Form';
import { IOrder } from '../types';
import { EventEmitter } from './base/Events';
import { IFormState } from '../types';

export class Contacts extends Form<IOrder> {
	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);

		const submitEventName = `${this.container.name}:submit`;

		this.events.on(submitEventName, () => {
			if (this.validateForm()) {
				this.events.emit('order:submit');
			}
		});

		const emailInput = this.container.querySelector(
			'input[name="email"]'
		) as HTMLInputElement;
		const phoneInput = this.container.querySelector(
			'input[name="phone"]'
		) as HTMLInputElement;

		if (emailInput && phoneInput) {
			const validateForm = () => {
				this.errors = [];
				const email = this.getEmail();
				const phone = this.getPhone();

				if (!email) {
					this.errors.push('Email обязателен');
				} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
					this.errors.push('Некорректный формат email');
				}

				if (!phone) {
					this.errors.push('Телефон обязателен');
				} else if (
					!/^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/.test(
						phone
					)
				) {
					this.errors.push('Некорректный формат телефона');
				}

				this.valid = this.errors.length === 0;
				this.render({ errors: this.errors, valid: this.valid });
			};

			emailInput.addEventListener('input', validateForm);
			phoneInput.addEventListener('input', validateForm);
		}
	}

	protected validateForm(): boolean {
		const email = this.getEmail();
		const phone = this.getPhone();

		this.errors = [];

		if (!email) {
			this.errors.push('Email обязателен');
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			this.errors.push('Некорректный формат email');
		}

		if (!phone) {
			this.errors.push('Телефон обязателен');
		} else if (
			!/^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/.test(
				phone
			)
		) {
			this.errors.push('Некорректный формат телефона');
		}

		this.valid = this.errors.length === 0;
		this.render({ errors: this.errors, valid: this.valid });
		return this.valid;
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		const result = super.render({
			...state,
			errors: this.errors,
			valid: this.valid,
		});
		return result;
	}

	getEmail(): string {
		return (
			(this.container.querySelector('input[name="email"]') as HTMLInputElement)
				?.value || ''
		);
	}

	getPhone(): string {
		return (
			(this.container.querySelector('input[name="phone"]') as HTMLInputElement)
				?.value || ''
		);
	}
}
