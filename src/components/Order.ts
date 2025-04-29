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
		console.log('Order: Constructor вызван', {
			formElement: container.outerHTML,
			name: container.name,
			submitButton: container.querySelector('button[type="submit"]')?.outerHTML,
		});

		// Находим все кнопки методов оплаты и инициализируем их
		const buttons = this.container.querySelectorAll('.order__buttons .button');
		console.log('Order: Найдены кнопки оплаты', {
			buttonsCount: buttons.length,
			buttons: Array.from(buttons).map((b) => ({
				name: b.getAttribute('name'),
				text: b.textContent,
				type: b.getAttribute('type'),
			})),
		});

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
				console.log('Order: Клик по области кнопок оплаты', {
					targetElement: target.outerHTML,
					isButton: target.classList.contains('button'),
				});

				if (target.classList.contains('button')) {
					const method =
						target.getAttribute('name') === 'card' ? 'online' : 'cash';
					console.log('Order: Выбран метод оплаты', {
						method,
						buttonName: target.getAttribute('name'),
						currentPayment: this._payment,
					});
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
		console.log('Order: Найдено поле адреса', {
			found: !!addressInput,
			element: addressInput?.outerHTML,
		});
		if (addressInput) {
			addressInput.addEventListener('input', () => {
				this._address = addressInput.value.trim();
				console.log('Order: Изменение адреса', {
					address: this._address,
					rawValue: addressInput.value,
				});
				this.validateForm();
			});
		}

		// Подписываемся на событие submit формы заказа
		const submitEventName = `${this.container.name}:submit`;
		console.log('Order: Подписка на событие submit', { submitEventName });
		this.events.on(submitEventName, () => {
			this.validateForm(); // Добавляем валидацию перед проверкой
			console.log('Order: Получено событие submit формы заказа', {
				payment: this._payment,
				address: this._address,
				valid: this.valid,
				submitButton: this._submit?.outerHTML,
				formName: this.container.name,
			});
			if (this.valid) {
				console.log('Order: Форма валидна, эмитим order:form-open');
				this.events.emit('order:form-open');
			} else {
				console.log(
					'Order: Форма невалидна, событие order:form-open не будет отправлено'
				);
			}
		});

		// Инициализируем начальное состояние
		this._payment = '';
		this._address = '';
		this.valid = false; // Явно устанавливаем начальное значение valid

		// Выполняем начальную валидацию формы
		this.validateForm();

		console.log('Order: Начальное состояние формы', {
			payment: this._payment,
			address: this._address,
			formValid: this.valid,
			submitButton: this._submit?.disabled,
		});
	}

	protected validatePayment(payment: string): boolean {
		const isValid = payment === 'online' || payment === 'cash';
		console.log('Order: Валидация способа оплаты', {
			payment,
			isValid,
			acceptableValues: ['online', 'cash'],
		});
		return isValid;
	}

	protected validateForm(): void {
		const isValid =
			this.validatePayment(this._payment) && this._address.length > 0;
		console.log('Order: Результат валидации формы', {
			isValid,
			payment: this._payment,
			address: this._address,
			formName: this.container.name,
			paymentValid: this.validatePayment(this._payment),
			addressValid: this._address.length > 0,
		});
		this.valid = isValid;
	}

	setPaymentMethod(method: string): void {
		console.log('Order: Установка метода оплаты', {
			method,
			previousMethod: this._payment,
			availableButtons: Object.keys(this._paymentButtons),
		});
		this._payment = method;
		Object.values(this._paymentButtons).forEach((button) => {
			const isActive =
				button.getAttribute('name') === (method === 'online' ? 'card' : 'cash');
			console.log('Order: Обновление состояния кнопки', {
				buttonName: button.getAttribute('name'),
				isActive,
				buttonText: button.textContent,
			});
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
		console.log('Order: Получение адреса', { address });
		return address;
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		console.log('Order: Начало рендера', {
			state,
			currentPayment: this._payment,
			currentAddress: this._address,
			formName: this.container.name,
		});
		const { address, payment, errors } = state;

		if (payment) {
			console.log('Order: Обновление способа оплаты при рендере', {
				newPayment: payment,
				currentPayment: this._payment,
			});
			this._payment = payment;
			this.setPaymentMethod(payment);
		}

		if (address) {
			console.log('Order: Обновление адреса при рендере', {
				newAddress: address,
				currentAddress: this._address,
			});
			this._address = address;
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

		console.log('Order: Рендер завершен', {
			payment: this._payment,
			address: this._address,
			valid: this.valid,
			formName: this.container.name,
		});

		return result;
	}
}
