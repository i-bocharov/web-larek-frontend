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
	private _valid: boolean = false;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this.submitButtonElement = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this.errorsElement = ensureElement<HTMLElement>(
			'.form__errors',
			this.container
		);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
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
		this.submitButtonElement.disabled = !value;
	}

	get valid(): boolean {
		return this._valid;
	}

	set errors(value: string) {
		this.setText(this.errorsElement, value);
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}
