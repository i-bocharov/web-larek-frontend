import { Form } from './common/Form';
import { IOrder } from '../types';
import { EventEmitter } from './base/Events';
import { IFormState } from '../types';

export class Contacts extends Form<IOrder> {
	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		const { email, phone, errors } = state;

		// Устанавливаем валидность формы
		this.valid = !!email && !!phone;

		// Вызываем родительский метод render
		return super.render({
			...state,
			valid: this.valid,
			errors: errors || [],
		});
	}

	isValid(): boolean {
		return this.valid;
	}

	getEmail(): string {
		return this.container.email.value;
	}

	getPhone(): string {
		return this.container.phone.value;
	}

	getAddress(): string {
		return this.container.address.value;
	}
}
