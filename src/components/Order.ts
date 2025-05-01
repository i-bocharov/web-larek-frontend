import { Form } from './common/Form';
import { IOrder } from '../types';
import { EventEmitter } from './base/Events';
import { IFormState } from '../types';

export class Order extends Form<IOrder> {
	protected paymentButtonsElement: { [key: string]: HTMLButtonElement } = {};
	private payment: string = '';
	private address: string = '';

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container, events);

		this.paymentButtonsElement = {
			card: container.querySelector('button[name="card"]') as HTMLButtonElement,
			cash: container.querySelector('button[name="cash"]') as HTMLButtonElement,
		};

		Object.entries(this.paymentButtonsElement).forEach(([method, element]) => {
			element.addEventListener('click', () => {
				const methodName = method === 'card' ? 'online' : 'cash';
				this.events.emit('payment:method:changed', { method: methodName });
				this.validateForm();
			});
		});

		const submitEventName = `${this.container.name}:submit`;
		this.events.on(submitEventName, () => {
			if (this.validateForm()) {
				this.events.emit('order:form-open');
			}
		});

		const addressInput = this.container.querySelector(
			'input[name="address"]'
		) as HTMLInputElement;
		if (addressInput) {
			addressInput.addEventListener('input', () => {
				this.address = addressInput.value.trim();
				this.validateForm();
			});
		}

		this.payment = '';
		this.address = '';
		this.valid = false;
		this.validateForm();
	}

	protected validatePayment(payment: string): boolean {
		return payment === 'online' || payment === 'cash';
	}

	protected validateForm(): boolean {
		this.errors = [];

		if (!this.validatePayment(this.payment)) {
			this.errors.push('Выберите способ оплаты');
		}

		if (!this.address.length) {
			this.errors.push('Укажите адрес доставки');
		}

		this.valid = this.errors.length === 0;
		this.render({ errors: this.errors, valid: this.valid });
		return this.valid;
	}

	setPaymentMethod(method: string): void {
		this.payment = method;
		Object.values(this.paymentButtonsElement).forEach((button) => {
			const isActive =
				button.getAttribute('name') === (method === 'online' ? 'card' : 'cash');
			button.classList.toggle('button_alt-active', isActive);
		});
		this.validateForm();
	}

	getAddress(): string {
		return this.address;
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		const { address, payment, errors = this.errors } = state;

		if (payment) {
			this.payment = payment;
			this.setPaymentMethod(payment);
		}

		if (address) {
			this.address = address;
			const addressInput = this.container.querySelector(
				'input[name="address"]'
			) as HTMLInputElement;
			if (addressInput) {
				addressInput.value = address;
			}
		}

		const result = super.render({
			...state,
			errors,
			valid: this.valid,
		});

		return result;
	}
}
