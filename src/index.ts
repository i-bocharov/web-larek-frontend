import './scss/styles.scss';

import { EventEmitter } from './components/base/Events';
import { ProductModel, OrderModel, AppState } from './components/AppData';
import { WebLarekApi } from './components/WebLarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Header } from './components/Header';
import { CardList } from './components/CardList';
import { Card } from './components/Card';
import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import { Preview } from './components/Preview';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/common/Success';
import { IProduct, IOrder } from './types';
import { cloneTemplate } from './utils/utils';

// --- ИНИЦИАЛИЗАЦИЯ ---

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

const productModel = new ProductModel({}, events);
const orderModel = new OrderModel({}, events);
const appState = new AppState(events, productModel, orderModel);

const header = new Header(
	document.querySelector('.header') as HTMLElement,
	events
);
const cardList = new CardList(
	document.querySelector('.gallery') as HTMLElement
);
const modal = new Modal(
	document.getElementById('modal-container') as HTMLElement,
	events
);

// --- СОБЫТИЯ ---

// Загрузка каталога товаров с сервера через API и помещение в модель
function loadCatalog() {
	api.getProducts().then((productList) => {
		productModel.setProducts(productList.items);
	});
}
loadCatalog();

// Рендер каталога карточек
events.on<{ products: IProduct[] }>('products:loaded', ({ products }) => {
	const cardElements = products.map((product) => {
		const cardElement = cloneTemplate<HTMLButtonElement>('#card-catalog');
		const card = new Card(cardElement, events);
		card.render(product);
		return cardElement;
	});
	cardList.render({ items: cardElements });
});

// Открытие предпросмотра товара (запрос к API)
events.on<{ productId: string }>('product:selected', ({ productId }) => {
	api.getProductById(productId).then((product) => {
		if ('error' in product) {
			alert('Товар не найден!');
			return;
		}
		productModel.setProduct(product);
	});
});

// Рендер предпросмотра товара
events.on<{ product: IProduct }>('product:loaded', ({ product }) => {
	const previewElement = cloneTemplate<HTMLElement>('#card-preview');
	const preview = new Preview(previewElement, events);
	preview.render(product);

	const isInBasket = appState
		.getBasketItems()
		.some((item) => item.id === product.id);
	const button = previewElement.querySelector('.card__button');
	if (button)
		button.textContent = isInBasket ? 'Убрать из корзины' : 'В корзину';

	modal.render({ content: previewElement });
});

// Открытие корзины
events.on('basket:open', () => {
	const basketTemplate = document.querySelector(
		'#basket'
	) as HTMLTemplateElement;
	const basketContainer = basketTemplate.content.cloneNode(true) as HTMLElement;
	const basket = new Basket(events);

	basket.render({
		items: appState.getBasketItems(),
		total: appState.calculateBasketTotal(),
		selected: [],
	});

	modal.render({ content: basketContainer });
});

// Добавление товара в корзину
events.on<{ productId: string }>('basket:item-added', ({ productId }) => {
	appState.addToBasket(productId);
	appState.updateBasketCounter();
	const button = modal.getContent().querySelector('.card__button');
	if (button) button.textContent = 'Убрать из корзины';
});

// Удаление товара из корзины
events.on<{ productId: string }>('basket:item-removed', ({ productId }) => {
	appState.removeFromBasket(productId);
	appState.updateBasketCounter();

	// Если открыта корзина, пересоздаём её заново!
	const modalContent = modal.getContent();
	if (modalContent.querySelector('.basket')) {
		events.emit('basket:open');
	}

	const button = modal.getContent().querySelector('.card__button');
	if (button) button.textContent = 'В корзину';
});

// Обновление счетчика корзины
events.on<{ count: number }>('basket:counter', ({ count }) => {
	header.updateBasketCounter(count);
});

// Открытие формы заказа
events.on('order:open', () => {
	const orderFormElement = cloneTemplate<HTMLFormElement>('#order');
	const orderForm = new Order(orderFormElement, events);
	modal.render({ content: orderFormElement });
});

// Открытие формы контактов после успешной валидации заказа
events.on('order:form-open', () => {
	const contactsFormElement = cloneTemplate<HTMLFormElement>('#contacts');
	const contactsForm = new Contacts(contactsFormElement, events);
	modal.render({ content: contactsFormElement });
});

// Обработка изменения способа оплаты
events.on<{ method: string }>('payment:method:changed', ({ method }) => {
	appState.setPaymentMethod(method as 'online' | 'cash');
	const orderFormElement = modal.getContent().querySelector('form');
	if (orderFormElement) {
		const orderForm = new Order(orderFormElement as HTMLFormElement, events);
		orderForm.render({
			payment: method,
			valid: orderForm['validatePayment'](method),
			errors: [],
		});
	}
});

// Валидация контактов и оформление заказа (запрос к API)
events.on<{ emailInput: string; phoneInput: string }>(
	'contacts:validate',
	({ emailInput, phoneInput }) => {
		const basketItems = appState.getBasketItems();
		const orderData: IOrder = {
			payment: appState.getPaymentMethod() || 'online',
			email: emailInput,
			phone: phoneInput,
			address:
				(
					modal
						.getContent()
						.querySelector('input[name="address"]') as HTMLInputElement
				)?.value ?? '',
			total: appState.calculateBasketTotal(),
			items: basketItems.map((item) => item.id),
		};
		api.placeOrder(orderData).then((result) => {
			if ('error' in result) {
				alert(result.error);
				return;
			}
			appState.placeOrder(orderData);
		});
	}
);

// Успешное размещение заказа
events.on<{ order: IOrder }>('order:placed', ({ order }) => {
	const successElement = cloneTemplate<HTMLElement>('#success');
	const success = new Success(successElement, {
		onClick: () => modal.close(),
	});
	success.render({ total: order.total });
	modal.render({ content: successElement });
});
