import { Component } from '../base/Component';
import { ensureElement, formatNumber } from '../../utils/utils';
import { EventEmitter } from '../base/Events';
import { IBasketView, IBasketItem } from '../../types';

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = ensureElement<HTMLElement>('.basket__price', this.container);
		this._button = ensureElement<HTMLElement>(
			'.basket__button',
			this.container
		);

		this._button.addEventListener('click', () => {
			this.events.emit('order:open');
		});

		this._list.addEventListener('click', (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('basket__item-delete')) {
				const item = target.closest('.basket__item');
				if (item) {
					const itemId = item.getAttribute('data-id');
					if (itemId) {
						this.events.emit('basket:item-removed', { productId: itemId });
					}
				}
			}
		});
	}

	protected renderItem(item: IBasketItem): HTMLElement {
		const itemElement = document.createElement('li');
		itemElement.classList.add('basket__item');
		itemElement.setAttribute('data-id', item.id);
		itemElement.innerHTML = `
            <span class="basket__item-title">${item.title}</span>
            <span class="basket__item-price">${
							item.price === null
								? 'Бесплатно'
								: `${formatNumber(item.price)} синапсов`
						}</span>
            <button class="basket__item-delete" type="button"></button>
        `;
		return itemElement;
	}

	set items(items: IBasketItem[]) {
		this._list.innerHTML = '';
		if (items.length) {
			items.forEach((item) => {
				this._list.appendChild(this.renderItem(item));
			});
		} else {
			this._list.innerHTML = 'Корзина пуста';
		}
	}

	set total(total: number) {
		this._total.textContent = `${formatNumber(total)} синапсов`;
	}

	render(data: Pick<IBasketView, 'items' | 'total'>): HTMLElement {
		if (data.items) {
			this.items = data.items;
		}
		if (data.total !== undefined) {
			this.total = data.total;
		}
		return this.container;
	}
}
