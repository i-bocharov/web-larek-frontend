import { Form } from './common/Form';
import { IOrder } from '../types';
import { EventEmitter } from './base/Events';
import { IFormState } from '../types';

export class Order extends Form<IOrder> {
	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		const { address, payment, errors } = state;

		// Устанавливаем валидность формы
		this.valid = !!address && !!payment;

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
}
