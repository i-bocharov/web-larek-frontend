import './scss/styles.scss';

import { EventEmitter } from './components/base/Events';
import { ProductModel, OrderModel, AppState } from './components/AppData';
import { WebLarekApi } from './components/WebLarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Page } from './components/Page';
import { Preview } from './components/Preview';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/common/Success';
import { IProduct, IBasketItem, IOrder } from './types';

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);
const productModel = new ProductModel({}, events, api);
const orderModel = new OrderModel({}, events, api);
const appState = new AppState(events, productModel, orderModel);

const page = new Page();

// Вспомогательная функция генерации элементов корзины
function getBasketItemElements(items: IBasketItem[]): HTMLElement[] {
	const itemTemplate = document.getElementById(
		'card-basket'
	) as HTMLTemplateElement;
	return items.map((item, idx) => {
		const el = itemTemplate.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;
		el.querySelector('.basket__item-index')!.textContent = (idx + 1).toString();
		el.querySelector('.card__title')!.textContent = item.title;
		el.querySelector('.card__price')!.textContent =
			item.price !== null ? `${item.price} синапсов` : 'Бесплатно';
		el.setAttribute('data-id', item.id);
		return el;
	});
}

// Вспомогательная функция генерации карточек каталога
function getCatalogItemElements(products: IProduct[]): HTMLElement[] {
	const cardTemplate = document.getElementById(
		'card-catalog'
	) as HTMLTemplateElement;
	return products.map((product) => {
		const el = cardTemplate.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;
		el.querySelector('.card__category')!.textContent = product.category;
		el.querySelector('.card__title')!.textContent = product.title;
		el.querySelector('.card__image')!.setAttribute('src', product.image);
		el.querySelector('.card__image')!.setAttribute('alt', product.title);
		el.querySelector('.card__price')!.textContent =
			product.price !== null ? `${product.price} синапсов` : 'Бесплатно';
		return el;
	});
}

// Загрузка продуктов и отображение каталога
events.on<{ products: IProduct[] }>('products:loaded', ({ products }) => {
	const cardElements = getCatalogItemElements(products);
	page.renderProducts(cardElements);
});

// Обновление счетчика корзины
events.on<{ count: number }>('basket:counter', ({ count }) => {
	page.updateBasketCounter(count);
});

// Открытие корзины
events.on('basket:open', () => {
	const basketItems = appState.getBasketItems();
	const itemElements = getBasketItemElements(basketItems);
	page.showBasket(itemElements, appState.calculateBasketTotal());
});

// Открытие предпросмотра товара
events.on<{ product: IProduct }>('product:loaded', ({ product }) => {
	const previewTemplate = document.getElementById(
		'card-preview'
	) as HTMLTemplateElement;
	const previewElement = previewTemplate.content.firstElementChild!.cloneNode(
		true
	) as HTMLElement;
	previewElement.querySelector('.card__category')!.textContent =
		product.category;
	previewElement.querySelector('.card__title')!.textContent = product.title;
	previewElement.querySelector('.card__text')!.textContent =
		product.description;
	previewElement.querySelector('.card__price')!.textContent =
		product.price !== null ? `${product.price} синапсов` : 'Бесплатно';
	previewElement
		.querySelector('.card__image')!
		.setAttribute('src', product.image);
	previewElement
		.querySelector('.card__image')!
		.setAttribute('alt', product.title);

	// Кнопка "В корзину" или "Убрать из корзины"
	const basketItems = appState.getBasketItems();
	const isInBasket = basketItems.some((item) => item.id === product.id);
	const button = previewElement.querySelector('.card__button');
	if (button) {
		button.textContent = isInBasket ? 'Убрать из корзины' : 'В корзину';
	}

	page.showPreview(previewElement);
});

// Открытие формы заказа
events.on('order:open', () => {
	const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
	const orderFormElement = orderTemplate.content.firstElementChild!.cloneNode(
		true
	) as HTMLFormElement;
	page.showOrderForm(orderFormElement);
});

// Открытие формы контактов
events.on('contacts:open', () => {
	const contactsTemplate = document.getElementById(
		'contacts'
	) as HTMLTemplateElement;
	const contactsFormElement =
		contactsTemplate.content.firstElementChild!.cloneNode(
			true
		) as HTMLFormElement;
	page.showContactsForm(contactsFormElement);
});

// Открытие окна успеха
events.on<{ order: IOrder }>('order:placed', ({ order }) => {
	const successTemplate = document.getElementById(
		'success'
	) as HTMLTemplateElement;
	const successElement = successTemplate.content.firstElementChild!.cloneNode(
		true
	) as HTMLElement;
	successElement.querySelector(
		'.order-success__description'
	)!.textContent = `Списано ${order.total} синапсов`;
	page.showSuccess(successElement);
});

// Закрытие модалки
events.on('modal:close', () => {
	page.closeModal();
});

// Старт приложения
appState.loadProducts();
