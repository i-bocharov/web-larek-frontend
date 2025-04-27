import { Form } from './common/Form';
import { IOrder } from '../types';
import { EventEmitter } from './base/Events';
import { IFormState } from '../types';

export class Order extends Form<IOrder> {
	protected _paymentButton: HTMLButtonElement;

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container, events);

		this._paymentButton = this.container.querySelector(
			'button[name="card"]'
		) as HTMLButtonElement;

		this.container
			.querySelector('.order__buttons')
			?.addEventListener('click', (event: Event) => {
				const target = event.target as HTMLElement;
				if (target.classList.contains('button')) {
					const method =
						target.getAttribute('name') === 'card' ? 'online' : 'cash';
					this.events.emit('payment:method:changed', { method });
				}
			});
	}

	protected validatePayment(payment: string): boolean {
		return payment === 'online' || payment === 'cash';
	}

	setPaymentMethod(method: string): void {
		const buttons = this.container.querySelectorAll('.order__buttons .button');
		buttons.forEach((button) => {
			button.classList.remove('button_alt-active');
			if (
				(method === 'online' &&
					(button as HTMLElement).getAttribute('name') === 'card') ||
				(method === 'cash' &&
					(button as HTMLElement).getAttribute('name') === 'cash')
			) {
				button.classList.add('button_alt-active');
			}
		});
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		const { address, payment, errors } = state;

		if (payment) {
			this.setPaymentMethod(payment);
		}

		return super.render({
			...state,
			valid: this.validatePayment(payment) && !!address,
			errors: errors || [],
		});
	}
}
