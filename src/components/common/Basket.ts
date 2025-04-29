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

		// Создаем обработчики как методы класса
		this.buttonClickHandler = () => {
			if (
				this._list.children.length > 0 &&
				this._list.innerHTML !== 'Корзина пуста'
			) {
				console.log('Basket: Клик по кнопке оформить', {
					buttonDisabled: this._button.hasAttribute('disabled'),
					listEmpty: this._list.children.length === 0,
					listContent: this._list.innerHTML,
				});
				this.events.emit('order:open');
			}
		};

		this.listClickHandler = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('basket__item-delete')) {
				const item = target.closest('.basket__item');
				if (item) {
					const itemId = item.getAttribute('data-id');
					console.log('Basket: Удаление товара', { itemId });
					if (itemId) {
						this.events.emit('basket:item-removed', { productId: itemId });
					}
				}
			}
		};
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
		console.log('Basket: Обновление списка товаров', {
			itemsCount: items.length,
			currentListContent: this._list.innerHTML,
		});

		this._list.innerHTML = '';
		if (items.length) {
			items.forEach((item) => {
				this._list.appendChild(this.renderItem(item));
			});
			console.log('Basket: Активация кнопки после добавления товаров');
			this._button.removeAttribute('disabled');
		} else {
			this._list.innerHTML = 'Корзина пуста';
			console.log('Basket: Деактивация кнопки - корзина пуста');
			this._button.setAttribute('disabled', 'disabled');
		}

		console.log('Basket: Состояние после обновления', {
			listContent: this._list.innerHTML,
			buttonDisabled: this._button.hasAttribute('disabled'),
		});
	}

	set total(total: number) {
		this._total.textContent = `${formatNumber(total)} синапсов`;
	}

	render(data: Pick<IBasketView, 'items' | 'total'>): HTMLElement {
		console.log('Basket: Начало рендера', {
			hasItems: !!data.items,
			total: data.total,
			currentListContent: this._list.innerHTML,
			buttonDisabled: this._button.hasAttribute('disabled'),
		});

		if (data.items) {
			this.items = data.items;
		}
		if (data.total !== undefined) {
			this.total = data.total;
		}

		// Проверяем состояние кнопки при каждом рендере
		const isEmpty =
			this._list.children.length === 0 ||
			this._list.innerHTML === 'Корзина пуста';
		console.log('Basket: Проверка состояния кнопки', {
			isEmpty,
			listChildren: this._list.children.length,
			listContent: this._list.innerHTML,
		});

		if (isEmpty) {
			console.log('Basket: Деактивация кнопки при рендере');
			this._button.setAttribute('disabled', 'disabled');
		} else {
			console.log('Basket: Активация кнопки при рендере');
			this._button.removeAttribute('disabled');
		}

		// Удаляем старые обработчики
		this._button.removeEventListener('click', this.buttonClickHandler);
		this._list.removeEventListener('click', this.listClickHandler);

		// Добавляем новые обработчики
		this._button.addEventListener('click', this.buttonClickHandler);
		this._list.addEventListener('click', this.listClickHandler);

		console.log('Basket: Завершение рендера', {
			buttonDisabled: this._button.hasAttribute('disabled'),
			listContent: this._list.innerHTML,
		});

		return this.container;
	}
}
