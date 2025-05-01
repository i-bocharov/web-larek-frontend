import { Component } from '../base/Component';
import { ensureElement, formatNumber } from '../../utils/utils';
import { EventEmitter } from '../base/Events';
import { IBasketView, IBasketItem } from '../../types';

export class Basket extends Component<IBasketView> {
	protected listElement: HTMLElement;
	protected totalElement: HTMLElement;
	protected buttonElement: HTMLElement;
	private buttonClickHandler: () => void;
	private listClickHandler: (e: MouseEvent) => void;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this.listElement = ensureElement<HTMLElement>(
			'.basket__list',
			this.container
		);
		this.totalElement = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);
		this.buttonElement = ensureElement<HTMLElement>(
			'.basket__button',
			this.container
		);

		this.buttonClickHandler = () => {
			// Событие клика обрабатываем, только если кнопка не отключена
			if (!this.buttonElement.hasAttribute('disabled')) {
				this.events.emit('order:open');
			}
		};

		this.listClickHandler = (e: MouseEvent) => {
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
		};

		// Инициализируем обработчики событий
		this.buttonElement.addEventListener('click', this.buttonClickHandler);
		this.listElement.addEventListener('click', this.listClickHandler);
	}

	protected renderItem(item: IBasketItem): HTMLElement {
		const itemElement = document.createElement('li');
		itemElement.classList.add(...['basket__item', 'card', 'card_compact']);
		itemElement.setAttribute('data-id', item.id);

		const titleSpan = document.createElement('span');
		titleSpan.classList.add('card__title');
		titleSpan.textContent = item.title;

		const priceSpan = document.createElement('span');
		priceSpan.classList.add('card__price');
		priceSpan.textContent =
			item.price === null
				? 'Бесплатно'
				: `${formatNumber(item.price)} синапсов`;

		const deleteButton = document.createElement('button');
		deleteButton.classList.add('basket__item-delete');
		deleteButton.type = 'button';

		itemElement.appendChild(titleSpan);
		itemElement.appendChild(priceSpan);
		itemElement.appendChild(deleteButton);

		return itemElement;
	}

	private updateButtonState(items: IBasketItem[]): void {
		// Проверяем пустая ли корзина
		if (!items.length) {
			this.buttonElement.setAttribute('disabled', 'disabled');
			return;
		}

		// Проверяем все ли товары бесплатные
		const allItemsFree = items.every((item) => {
			const isFree = item.price === null;

			return isFree;
		});

		if (allItemsFree) {
			this.buttonElement.setAttribute('disabled', 'disabled');
		} else {
			this.buttonElement.removeAttribute('disabled');
		}
	}

	set items(items: IBasketItem[]) {
		// Очищаем список через replaceChildren
		this.listElement.replaceChildren();

		if (items.length) {
			items.forEach((item) => {
				this.listElement.appendChild(this.renderItem(item));
			});
		} else {
			const emptyMessage = document.createElement('span');
			emptyMessage.textContent = 'Корзина пуста';
			this.listElement.appendChild(emptyMessage);
		}

		this.updateButtonState(items);
	}

	set total(total: number) {
		this.totalElement.textContent = `${formatNumber(total)} синапсов`;
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
