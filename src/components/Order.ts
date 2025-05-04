import { Form } from './common/Form';
import { IEvents } from './base/Events';
import { ensureElement } from '../utils/utils';
import { IOrder, IFormState } from '../types';

export class Order extends Form<IOrder> {
	protected _buttons: HTMLButtonElement[];
	protected _buttonsContainer: HTMLElement;
	protected _address: HTMLInputElement;
	protected _payment: string = '';

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._buttons = Array.from(container.querySelectorAll('.button_alt'));
		this._buttonsContainer = ensureElement<HTMLElement>(
			'.order__buttons',
			container
		);
		this._address = ensureElement<HTMLInputElement>(
			'input[name="address"]',
			container
		);

		this.init();

		this._buttons.forEach((button) => {
			button.addEventListener('click', () => {
				this.updateButtons(button.name);
				// Добавляем эмит события изменения способа оплаты
				events.emit('payment:method:changed', {
					method: button.name === 'card' ? 'online' : 'cash',
				});
				events.emit('order:payment:change', {
					payment: this._payment,
					address: this.address,
				});
			});
		});

		this._address.addEventListener('input', () => {
			events.emit('order:address:change', {
				payment: this._payment,
				address: this.address,
			});
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			events.emit('order:submit', {
				payment: this._payment,
				address: this.address,
			});
		});
	}

	protected init() {
		// Установка начального состояния
		this.valid = false;
		this.errors = [];
	}

	protected updateButtons(name: string) {
		// Проверяем соответствие payment и button.name
		const expectedButtonName = this._payment === 'online' ? 'card' : 'cash';

		this._buttons.forEach((button) => {
			// Устанавливаем класс active для кнопки, соответствующей текущему способу оплаты
			this.toggleClass(
				button,
				'button_alt-active',
				button.name === expectedButtonName
			);
		});

		// Обновляем значение payment в зависимости от нажатой кнопки
		if (name === 'card') {
			this._payment = 'online';
		} else if (name === 'cash') {
			this._payment = 'cash';
		}
	}

	set address(value: string) {
		this._address.value = value;
	}

	get address(): string {
		return this._address.value;
	}

	render(state: Partial<IOrder> & IFormState): HTMLFormElement {
		const { payment, valid, errors } = state;
		if (payment) {
			this.updateButtons(payment);
		}
		if (valid !== undefined) {
			this.valid = valid;
		}
		if (errors && Array.isArray(errors)) {
			this.setErrors(errors);
		} else {
			this.setErrors([]);
		}
		return this.container;
	}
}
