import { Form } from './common/Form';
import { IOrder } from '../types';
import { EventEmitter } from './base/Events';
import { IFormState } from '../types';

export class Contacts extends Form<IOrder> {
	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);

		const submitEventName = `${this.container.name}:submit`;

		this.events.on(submitEventName, () => {
			const emailInput = this.getEmail();
			const phoneInput = this.getPhone();

			this.events.emit('contacts:validate', { emailInput, phoneInput });
		});
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
