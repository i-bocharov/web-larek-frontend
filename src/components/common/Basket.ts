import { Component } from '../base/Component';
import { ensureElement, formatNumber } from '../../utils/utils';
import { EventEmitter } from '../base/Events';
import { IBasketView, IBasketItem } from '../../types';

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;
	private buttonClickHandler: () => void;
	private listClickHandler: (e: MouseEvent) => void;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = ensureElement<HTMLElement>('.basket__price', this.container);
		this._button = ensureElement<HTMLElement>(
			'.basket__button',
			this.container
		);

		this.buttonClickHandler = () => {
			// Событие клика обрабатываем, только если кнопка не отключена
			if (!this._button.hasAttribute('disabled')) {
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
		this._button.addEventListener('click', this.buttonClickHandler);
		this._list.addEventListener('click', this.listClickHandler);
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

	private updateButtonState(items: IBasketItem[]): void {
		console.log('Basket: Проверка товаров в корзине:', items);

		// Проверяем пустая ли корзина
		if (!items.length) {
			console.log('Basket: Корзина пуста - деактивируем кнопку');
			this._button.setAttribute('disabled', 'disabled');
			return;
		}

		// Проверяем все ли товары бесплатные
		const allItemsFree = items.every((item) => {
			const isFree = item.price === null;
			console.log(
				`Basket: Товар ${item.title} ${
					isFree ? 'бесплатный' : 'платный'
				} (price: ${item.price})`
			);
			return isFree;
		});

		if (allItemsFree) {
			console.log('Basket: Все товары бесплатные - деактивируем кнопку');
			this._button.setAttribute('disabled', 'disabled');
		} else {
			console.log('Basket: Есть платные товары - активируем кнопку');
			this._button.removeAttribute('disabled');
		}
	}

	set items(items: IBasketItem[]) {
		console.log('Basket: Установка товаров:', items);

		this._list.innerHTML = '';

		if (items.length) {
			items.forEach((item) => {
				this._list.appendChild(this.renderItem(item));
			});
		} else {
			this._list.innerHTML = 'Корзина пуста';
		}

		this.updateButtonState(items);
	}

	set total(total: number) {
		this._total.textContent = `${formatNumber(total)} синапсов`;
	}

	render(data: Pick<IBasketView, 'items' | 'total'>): HTMLElement {
		console.log('Basket: Начало рендера', data);

		if (data.items) {
			this.items = data.items;
		}
		if (data.total !== undefined) {
			this.total = data.total;
		}

		console.log('Basket: Состояние кнопки после рендера:', {
			disabled: this._button.hasAttribute('disabled'),
			items: data.items,
		});

		return this.container;
	}
}
