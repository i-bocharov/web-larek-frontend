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
import { cloneTemplate, ensureElement } from './utils/utils';

// --- ИНИЦИАЛИЗАЦИЯ ---
const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

const productModel = new ProductModel({}, events);
const orderModel = new OrderModel({}, events);
const appState = new AppState(events, productModel, orderModel);

// --- ОДНОКРАТНО ищем шаблоны ---
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// --- СОЗДАНИЕ КОМПОНЕНТОВ ---
const header = new Header(
	document.querySelector('.header') as HTMLElement,
	events
);

const basket = new Basket(cloneTemplate(basketTemplate), events);
basket.cloneCardBasketTemplate = () => cloneTemplate(cardBasketTemplate);

const cardList = new CardList(
	document.querySelector('.gallery') as HTMLElement,
	events
);
const modal = new Modal(
	document.getElementById('modal-container') as HTMLElement,
	events
);
const previewElement = cloneTemplate(cardPreviewTemplate);
const preview = new Preview(previewElement, events);

// --- ПОДПИСКА НА СОБЫТИЯ ---

// Рендер каталога карточек
events.on<{ products: IProduct[] }>('products:loaded', ({ products }) => {
	const items = products.map((product) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), events);
		return card.render(product);
	});
	cardList.render({ items });
});

// Открытие предпросмотра товара
events.on<{ productId: string }>('product:selected', ({ productId }) => {
	const product = appState.getCatalog().find((item) => item.id === productId);
	if (product) {
		preview.render(product);
		// Устанавливаем правильный текст кнопки в зависимости от наличия в корзине
		const isInBasket = appState.getBasket().includes(productId);
		preview.buttonText = isInBasket ? 'Убрать из корзины' : 'В корзину';
		modal.render({ content: previewElement });
	}
});

// Обработка смены текста на кнопке заказа товара
events.on<{ productId: string }>('preview:button-click', ({ productId }) => {
	const isInBasket = appState.getBasket().includes(productId); // проверка наличия товара в корзине
	if (isInBasket) {
		events.emit('basket:item-removed', { productId });
		preview.buttonText = 'В корзину';
	} else {
		events.emit('basket:item-added', { productId });
		preview.buttonText = 'Убрать из корзины';
	}
});

// Открытие корзины
events.on('basket:open', () => {
	basket.render({
		items: appState.getBasketItems(),
		total: appState.calculateBasketTotal(),
		selected: [] as string[],
	});
	modal.render({ content: basket.getContainer() });
});

// Обновление корзины при изменениях
events.on('basket:updated', () => {
	basket.render({
		items: appState.getBasketItems(),
		total: appState.calculateBasketTotal(),
		selected: [] as string[],
	});
});

// Добавление товара в корзину
events.on<{ productId: string }>('basket:item-added', ({ productId }) => {
	appState.addToBasket(productId);
});

// Удаление товара из корзины
events.on<{ productId: string }>('basket:item-removed', ({ productId }) => {
	appState.removeFromBasket(productId);
});

// Обновление счетчика корзины
events.on<{ count: number }>('basket:counter', ({ count }) => {
	header.updateBasketCounter(count);
});

// Открытие и обработка формы заказа
events.on('order:open', () => {
	const orderForm = new Order(cloneTemplate(orderTemplate), events);

	// Проверяем валидность данных с пустыми значениями
	const { valid, errors } = orderModel.validate({
		payment: null,
		address: '',
	});

	modal.render({
		content: orderForm.render({ payment: null, valid, errors }),
	});

	const handlers = {
		submit: (data: { payment: string; address: string }) => {
			const { valid, errors } = orderModel.validate(data);
			orderForm.render({ ...data, valid, errors });
			if (valid) {
				// Сохраняем адрес перед переходом к следующей форме
				appState.setAddress(data.address);
				events.emit('order:next');
			}
		},
		paymentChange: (data: { payment: string; address: string }) => {
			const { valid, errors } = orderModel.validate(data);
			orderForm.render({ ...data, valid, errors });
		},
		addressChange: (data: { payment: string; address: string }) => {
			// Сохраняем текущий метод оплаты из appState
			const currentPayment = appState.getPaymentMethod();
			const { valid, errors } = orderModel.validate({
				...data,
				payment: currentPayment, // Добавляем текущий метод оплаты в валидацию
			});
			// Передаем в рендер текущий метод оплаты
			orderForm.render({ ...data, payment: currentPayment, valid, errors });
		},
	};

	function subscribe() {
		events.on('order:submit', handlers.submit);
		events.on('order:payment:change', handlers.paymentChange);
		events.on('order:address:change', handlers.addressChange);
	}

	function unsubscribe() {
		events.off('order:submit', handlers.submit);
		events.off('order:payment:change', handlers.paymentChange);
		events.off('order:address:change', handlers.addressChange);
	}

	subscribe();
	events.on('modal:close', () => {
		// Сбрасываем способ оплаты и адрес при закрытии модального окна
		appState.setPaymentMethod(null);
		appState.setAddress('');
		unsubscribe();
		events.off('modal:close', unsubscribe);
	});
});

// Открытие и обработка формы контактов
events.on('order:next', () => {
	const contactsForm = new Contacts(cloneTemplate(contactsTemplate), events);

	// Проверяем валидность данных сразу с пустыми значениями
	const { valid, errors } = orderModel.validate({
		email: '',
		phone: '',
	});

	modal.render({
		content: contactsForm.render({ valid, errors }),
	});

	const handlers = {
		submit: (data: { email: string; phone: string }) => {
			const { valid, errors } = orderModel.validate(data);
			contactsForm.render({ ...data, valid, errors });
			if (valid) {
				const basketItems = appState.getBasketItems();
				const orderData: IOrder = {
					email: data.email,
					phone: data.phone,
					payment: appState.getPaymentMethod() || 'online',
					address: appState.getAddress(), // Используем сохраненный адрес
					total: appState.calculateBasketTotal(),
					items: basketItems.map((item) => item.id),
				};

				api.placeOrder(orderData).then((result) => {
					if ('error' in result) {
						console.error(result.error);
						return;
					}
					appState.placeOrder(orderData);
				});
			}
		},
		change: (data: { email: string; phone: string }) => {
			const { valid, errors } = orderModel.validate(data);
			contactsForm.render({ ...data, valid, errors });
		},
	};

	function subscribe() {
		events.on('contacts:submit', handlers.submit);
		events.on('contacts:change', handlers.change);
	}

	function unsubscribe() {
		events.off('contacts:submit', handlers.submit);
		events.off('contacts:change', handlers.change);
	}

	subscribe();
	events.on('modal:close', () => {
		unsubscribe();
		events.off('modal:close', unsubscribe);
	});
});

// Обработка изменения способа оплаты
events.on<{ method: string }>('payment:method:changed', ({ method }) => {
	appState.setPaymentMethod(method as 'online' | 'cash');
});

// Валидация контактов и оформление заказа
events.on<{ emailInput: string; phoneInput: string }>(
	'contacts:validate',
	({ emailInput, phoneInput }) => {
		const basketItems = appState.getBasketItems();
		const address = modal
			.getContent()
			.querySelector('input[name="address"]') as HTMLInputElement;
		const orderData: IOrder = {
			payment: appState.getPaymentMethod() || 'online',
			email: emailInput,
			phone: phoneInput,
			address: address?.value ?? '',
			total: appState.calculateBasketTotal(),
			items: basketItems.map((item) => item.id),
		};

		if (orderModel.validateOrder(orderData)) {
			api.placeOrder(orderData).then((result) => {
				if ('error' in result) {
					console.error(result.error);
					return;
				}
				appState.placeOrder(orderData);
			});
		}
	}
);

// Успешное размещение заказа
events.on<{ order: IOrder }>('order:placed', ({ order }) => {
	const successElement = cloneTemplate(successTemplate);
	const success = new Success(successElement, {
		onClick: () => {
			modal.close();
		},
	});
	success.render({ total: order.total });
	modal.render({ content: successElement });
});

// Загрузка каталога
api
	.getProducts()
	.then((productList) => {
		appState.setProducts(productList.items);
	})
	.catch((error) => {
		console.error('Failed to load products:', error);
	});
