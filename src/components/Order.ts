import { Form } from './common/Form';
import { IOrder } from '../types';
import { EventEmitter } from './base/Events';
import { IFormState } from '../types';

export class Order extends Form<IOrder> {
	protected _paymentButtons: { [key: string]: HTMLButtonElement } = {};
	private _payment: string = '';
	private _address: string = '';

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container, events);

		// Находим все кнопки методов оплаты и инициализируем их
		const buttons = this.container.querySelectorAll('.order__buttons .button');
		buttons.forEach((button) => {
			const buttonEl = button as HTMLButtonElement;
			const name = buttonEl.getAttribute('name');
			if (name) {
				this._paymentButtons[name] = buttonEl;
			}
		});

		// Инициализируем обработчик кликов по кнопкам оплаты
		this.container
			.querySelector('.order__buttons')
			?.addEventListener('click', (event: Event) => {
				const target = event.target as HTMLElement;
				if (target.classList.contains('button')) {
					const method =
						target.getAttribute('name') === 'card' ? 'online' : 'cash';
					console.log('Order: Выбран метод оплаты', { method, target });
					this._payment = method;
					this.setPaymentMethod(method);
					this.events.emit('payment:method:changed', { method });
					this.validateForm();
				}
			});

		// Инициализируем обработчик изменения адреса
		const addressInput = this.container.querySelector(
			'input[name="address"]'
		) as HTMLInputElement;
		if (addressInput) {
			addressInput.addEventListener('input', () => {
				this._address = addressInput.value.trim();
				this.validateForm();
			});
		}

		// Добавляем обработчик отправки формы
		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			if (this.valid) {
				this.events.emit('order:form-open');
			}
		});
	}

	protected validatePayment(payment: string): boolean {
		return payment === 'online' || payment === 'cash';
	}

	protected validateForm(): void {
		const isValid =
			this.validatePayment(this._payment) && this._address.length > 0;
		this.valid = isValid;
		console.log('Order: Валидация формы', {
			payment: this._payment,
			address: this._address,
			isValid,
		});
	}

	setPaymentMethod(method: string): void {
		this._payment = method;
		console.log('Order: Установка метода оплаты', { method });

		Object.values(this._paymentButtons).forEach((button) => {
			const isActive =
				button.getAttribute('name') === (method === 'online' ? 'card' : 'cash');
			button.classList.toggle('button_alt-active', isActive);
		});
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		const { address, payment, errors } = state;
		console.log('Order: Рендер с состоянием', { payment, address });

		if (payment) {
			this._payment = payment;
			this.setPaymentMethod(payment);
		}

		if (address) {
			this._address = address;
			const addressInput = this.container.querySelector(
				'input[name="address"]'
			) as HTMLInputElement;
			if (addressInput) {
				addressInput.value = address;
			}
		}

		this.validateForm();

		return super.render({
			...state,
			errors: errors || [],
		});
	}
}
