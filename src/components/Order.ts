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

		// Находим все кнопки методов оплаты и инициализируем их
		const buttons = this.container.querySelectorAll('.order__buttons .button');

		buttons.forEach((button) => {
			const buttonEl = button as HTMLButtonElement;
			const name = buttonEl.getAttribute('name');

			if (name) {
				this.paymentButtonsElement[name] = buttonEl;
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

					this.payment = method;
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
				this.address = addressInput.value.trim();

				this.validateForm();
			});
		}

		// Подписываемся на событие submit формы заказа
		const submitEventName = `${this.container.name}:submit`;

		this.events.on(submitEventName, () => {
			this.validateForm(); // Добавляем валидацию перед проверкой

			if (this.valid) {
				this.events.emit('order:form-open');
			} else {
				console.error('Order: Форма не валидна, отправка отменена');
			}
		});

		// Инициализируем начальное состояние
		this.payment = '';
		this.address = '';
		this.valid = false; // Явно устанавливаем начальное значение valid

		// Выполняем начальную валидацию формы
		this.validateForm();
	}

	protected validatePayment(payment: string): boolean {
		const isValid = payment === 'online' || payment === 'cash';

		return isValid;
	}

	protected validateForm(): void {
		const isValid =
			this.validatePayment(this.payment) && this.address.length > 0;

		this.valid = isValid;
	}

	setPaymentMethod(method: string): void {
		this.payment = method;
		Object.values(this.paymentButtonsElement).forEach((button) => {
			const isActive =
				button.getAttribute('name') === (method === 'online' ? 'card' : 'cash');

			button.classList.toggle('button_alt-active', isActive);
		});
	}

	public getAddress(): string {
		const address =
			(
				this.container.querySelector(
					'input[name="address"]'
				) as HTMLInputElement
			)?.value || '';

		return address;
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		const { address, payment, errors } = state;

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

		this.validateForm();

		const result = super.render({
			...state,
			errors: errors || [],
		});

		return result;
	}
}
