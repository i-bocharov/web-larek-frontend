import { Form } from './common/Form';
import { IOrder } from '../types';
import { EventEmitter } from './base/Events';
import { IFormState } from '../types';

export class Contacts extends Form<IOrder> {
	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);
		console.log('Contacts: Constructor вызван', {
			formElement: container.outerHTML,
			name: container.name,
		});

		// Подписываемся на событие submit
		const submitEventName = `${this.container.name}:submit`;
		console.log('Contacts: Подписка на событие submit', { submitEventName });

		this.events.on(submitEventName, () => {
			console.log('Contacts: Получено событие submit', {
				email: this.getEmail(),
				phone: this.getPhone(),
				valid: this.valid,
			});

			if (this.valid) {
				console.log('Contacts: Форма валидна, эмитим order:submit');
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

				console.log('Contacts: Валидация формы', {
					email,
					phone,
					isValidEmail,
					isValidPhone,
				});

				this.valid = isValidEmail && isValidPhone;
			};

			emailInput.addEventListener('input', validateForm);
			phoneInput.addEventListener('input', validateForm);
		}
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		console.log('Contacts: Рендер формы', state);
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
		console.log('Contacts: getEmail вызван', { value });
		return value;
	}

	getPhone(): string {
		const phoneInput = this.container.querySelector(
			'input[name="phone"]'
		) as HTMLInputElement;
		const value = phoneInput?.value || '';
		console.log('Contacts: getPhone вызван', { value });
		return value;
	}
}
