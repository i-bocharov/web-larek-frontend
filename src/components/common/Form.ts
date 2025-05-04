import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Form<T> extends Component<IFormState> {
	protected submitButtonElement: HTMLButtonElement;
	protected errorsElement: HTMLElement;
	protected _errors: string[] = [];
	private _valid: boolean = false;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this.submitButtonElement = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);

		// Ищем элемент ошибок в modal__actions
		this.errorsElement = this.container.querySelector(
			'.modal__actions .form__errors'
		) as HTMLElement;
		if (!this.errorsElement) {
			// Если не нашли в modal__actions, ищем в корне формы
			this.errorsElement = ensureElement<HTMLElement>(
				'.form__errors',
				this.container
			);
		}

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
			this.validateForm();
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			if (this.valid) {
				this.events.emit(`${this.container.name}:submit`);
			}
		});
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	set valid(value: boolean) {
		this._valid = value;
		if (this.submitButtonElement) {
			this.setDisabled(this.submitButtonElement, !value);
		}
	}

	get valid(): boolean {
		return this._valid;
	}

	set errors(value: string[]) {
		this._errors = value;
		this.setErrors(value);
	}

	get errors(): string[] {
		return this._errors;
	}

	protected setErrors(errors: string[]) {
		this.setText(this.errorsElement, errors.join(', '));
	}

	protected validateForm(): boolean {
		return true;
	}

	protected setFieldError(field: keyof T, error: string) {
		const input = this.container.querySelector(
			`[name="${String(field)}"]`
		) as HTMLInputElement;
		if (input) {
			this.toggleClass(input, 'input_error');
			this.errors = [...this.errors, error];
		}
	}

	protected clearFieldError(field: keyof T) {
		const input = this.container.querySelector(
			`[name="${String(field)}"]`
		) as HTMLInputElement;
		if (input) {
			this.toggleClass(input, 'input_error', false);
			this.errors = this.errors.filter(
				(error) => !error.includes(String(field))
			);
		}
	}

	render(state: Partial<T> & IFormState): HTMLFormElement {
		const { valid, errors = [], ...inputs } = state;
		if (valid !== undefined) {
			this.valid = valid;
		}
		this.errors = errors;
		Object.assign(this, inputs);
		return this.container;
	}
}
