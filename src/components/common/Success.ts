import { Component } from '../base/Component';
import { ensureElement, formatNumber } from '../../utils/utils';

interface ISuccess {
	total: number;
}

interface ISuccessActions {
	onClick: () => void;
}

export class Success extends Component<ISuccess> {
	protected closeElement: HTMLElement;
	protected descriptionElement: HTMLElement;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);

		this.closeElement = ensureElement<HTMLElement>(
			'.order-success__close',
			container
		);
		this.descriptionElement = ensureElement<HTMLElement>(
			'.order-success__description',
			container
		);

		if (actions?.onClick) {
			this.closeElement.addEventListener('click', actions.onClick);
		}
	}

	render(data: ISuccess): HTMLElement {
		this.descriptionElement.textContent = `Списано ${formatNumber(
			data.total
		)} синапсов`;
		return this.container;
	}
}
