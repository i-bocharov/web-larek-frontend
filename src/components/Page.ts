import { EventEmitter } from './base/Events';
import { ProductModel, OrderModel, AppState } from './AppData';
import { WebLarekApi } from './WebLarekApi';
import { API_URL, CDN_URL } from '../utils/constants';
import { Header } from './Header';
import { CardList } from './CardList';
import { Basket } from './common/Basket';
import { Modal } from './common/Modal';
import { Preview } from './Preview';
import { Order } from './Order';
import { Contacts } from './Contacts';
import { Success } from './common/Success';
import { IProduct, IOrder } from '../types';

export class Page {
	private events: EventEmitter;
	private api: WebLarekApi;
	private appState: AppState;
	private productModel: ProductModel;
	private orderModel: OrderModel;

	private header: Header;
	private cardList: CardList;
	private basket: Basket;
	private modal: Modal;
	private preview: Preview;
	private orderForm: Order;
	private contactsForm: Contacts;
	private success: Success;

	// Ссылки на контейнеры компонентов
	private basketContainer: HTMLElement;
	private previewContainer: HTMLElement;
	private orderFormContainer: HTMLFormElement;
	private contactsFormContainer: HTMLFormElement;
	private successContainer: HTMLElement;

	constructor() {
		// Инициализация системы событий
		this.events = new EventEmitter();

		// Инициализация API
		this.api = new WebLarekApi(CDN_URL, API_URL);

		// Инициализация моделей
		this.productModel = new ProductModel({}, this.events, this.api);
		this.orderModel = new OrderModel({}, this.events, this.api);
		this.appState = new AppState(
			this.events,
			this.productModel,
			this.orderModel
		);

		// Инициализация компонентов и сохранение ссылок на контейнеры
		const headerContainer = document.querySelector('.header') as HTMLElement;
		this.header = new Header(headerContainer, this.events);

		const galleryContainer = document.querySelector('.gallery') as HTMLElement;
		this.cardList = new CardList(galleryContainer, this.events);

		const modalContainer = document.querySelector(
			'#modal-container'
		) as HTMLElement;
		this.modal = new Modal(modalContainer, this.events);

		// Создаем контейнеры из шаблонов один раз
		const basketTemplate = document.querySelector(
			'#basket'
		) as HTMLTemplateElement;
		this.basketContainer = basketTemplate.content.cloneNode(
			true
		) as HTMLElement;
		this.basket = new Basket(this.basketContainer, this.events);

		const previewTemplate = document.querySelector(
			'#card-preview'
		) as HTMLTemplateElement;
		this.previewContainer = previewTemplate.content.cloneNode(
			true
		) as HTMLElement;
		this.preview = new Preview(this.previewContainer, this.events);

		const orderTemplate = document.querySelector(
			'#order'
		) as HTMLTemplateElement;
		this.orderFormContainer = orderTemplate.content.cloneNode(
			true
		) as HTMLFormElement;
		this.orderForm = new Order(this.orderFormContainer, this.events);

		const contactsTemplate = document.querySelector(
			'#contacts'
		) as HTMLTemplateElement;
		this.contactsFormContainer = contactsTemplate.content.cloneNode(
			true
		) as HTMLFormElement;
		this.contactsForm = new Contacts(this.contactsFormContainer, this.events);

		const successTemplate = document.querySelector(
			'#success'
		) as HTMLTemplateElement;
		this.successContainer = successTemplate.content.cloneNode(
			true
		) as HTMLElement;
		this.success = new Success(this.successContainer, {
			onClick: () => this.closeModal(),
		});

		// Подписка на события
		this.subscribeToEvents();
	}

	private subscribeToEvents(): void {
		// Загрузка продуктов
		this.events.on<{ products: IProduct[] }>(
			'products:loaded',
			({ products }) => {
				this.cardList.render({ items: products });
			}
		);

		// Открытие предпросмотра товара
		this.events.on<{ productId: string }>(
			'product:selected',
			async ({ productId }) => {
				await this.productModel.loadProductById(productId);
			}
		);

		// Загрузка данных для предпросмотра
		this.events.on<{ product: IProduct }>('product:loaded', ({ product }) => {
			const previewTemplate = document.querySelector(
				'#card-preview'
			) as HTMLTemplateElement;
			const previewFragment = previewTemplate.content.cloneNode(
				true
			) as DocumentFragment;
			const previewElement = previewFragment.firstElementChild as HTMLElement;

			// Проверяем есть ли товар в корзине
			const basketItems = this.appState.getBasketItems();
			const isInBasket = basketItems.some((item) => item.id === product.id);

			this.preview = new Preview(previewElement, this.events);
			this.preview.render(product);

			// Устанавливаем правильный текст кнопки
			const button = previewElement.querySelector('.card__button');
			if (button) {
				button.textContent = isInBasket ? 'Убрать из корзины' : 'В корзину';
			}

			this.modal.render({
				content: previewElement,
			});
		});

		// Открытие корзины
		this.events.on('basket:open', () => {
			// Создаем новый контейнер из шаблона
			const basketTemplate = document.querySelector(
				'#basket'
			) as HTMLTemplateElement;
			this.basketContainer = basketTemplate.content.cloneNode(
				true
			) as HTMLElement;

			// Создаем новый экземпляр корзины
			this.basket = new Basket(this.basketContainer, this.events);

			const basketItems = this.appState.getBasketItems();
			this.basket.render({
				items: basketItems,
				total: this.appState.calculateBasketTotal(),
			});

			this.modal.render({
				content: this.basketContainer,
			});
		});

		// Добавление продукта в корзину
		this.events.on<{ productId: string }>(
			'basket:item-added',
			({ productId }) => {
				this.appState.addToBasket(productId);
				this.updateBasketCounter();

				// Обновляем текст кнопки в модальном окне
				const button = this.modal.getButton();
				if (button) {
					button.textContent = 'Убрать из корзины';
				}
			}
		);

		// Удаление продукта из корзины
		this.events.on<{ productId: string }>(
			'basket:item-removed',
			({ productId }) => {
				this.appState.removeFromBasket(productId);
				this.updateBasketCounter();

				// Если открыта корзина, обновляем её содержимое
				const modalContent = this.modal.getContent();
				if (modalContent.querySelector('.basket')) {
					const basketItems = this.appState.getBasketItems();
					this.basket.render({
						items: basketItems,
						total: this.appState.calculateBasketTotal(),
					});
				}

				// Обновляем текст кнопки в модальном окне
				const button = this.modal.getButton();
				if (button) {
					button.textContent = 'В корзину';
				}
			}
		);

		// Очистка корзины
		this.events.on('basket:clear', () => {
			this.appState.clearBasket();
			this.updateBasketCounter();
		});

		// Обновление счетчика корзины
		this.events.on<{ count: number }>('basket:counter', ({ count }) => {
			this.header.updateBasketCounter(count);
		});

		// Открытие формы заказа
		this.events.on('order:open', () => {
			// Создаем новый экземпляр формы заказа
			const orderTemplate = document.querySelector(
				'#order'
			) as HTMLTemplateElement;
			this.orderFormContainer = orderTemplate.content.cloneNode(
				true
			) as HTMLFormElement;
			this.orderForm = new Order(this.orderFormContainer, this.events);

			this.modal.render({
				content: this.orderFormContainer,
			});
		});

		// Валидация и переход к форме контактов
		this.events.on('order:form-open', () => {
			if (this.orderForm.valid) {
				this.modal.render({
					content: this.contactsFormContainer,
				});
			}
		});

		// Обработка изменения способа оплаты
		this.events.on<{ method: string }>(
			'payment:method:changed',
			({ method }) => {
				console.log('Page: Получено событие payment:method:changed', {
					method,
				});
				this.appState.setPaymentMethod(method as 'online' | 'cash');
				// После обновления состояния в AppState, обновляем UI формы
				this.orderForm.render({
					payment: method,
					valid: this.orderForm['validatePayment'](method),
					errors: [], // Добавляем обязательное поле errors
				});
			}
		);

		// Размещение заказа
		this.events.on('order:submit', () => {
			const basketItems = this.appState.getBasketItems();
			// Фильтруем только товары с ценой
			const itemsWithPrice = basketItems.filter((item) => item.price !== null);

			if (itemsWithPrice.length > 0) {
				const orderData = {
					payment: this.appState.getPaymentMethod() || 'online',
					email: this.contactsForm.getEmail(),
					phone: this.contactsForm.getPhone(),
					address: this.contactsForm.getAddress(),
					total: itemsWithPrice.reduce(
						(sum, item) => sum + (item.price || 0),
						0
					),
					items: itemsWithPrice.map((item) => item.id),
				};
				this.appState.placeOrder(orderData);
			}
		});

		// Успешное размещение заказа
		this.events.on<{ order: IOrder }>('order:placed', ({ order }) => {
			this.success.render({
				total: order.total,
			});
			this.modal.render({
				content: this.successContainer,
			});
		});

		// Закрытие модального окна
		this.events.on('modal:close', () => {
			this.closeModal();
		});
	}

	private updateBasketCounter(): void {
		this.appState.updateBasketCounter();
	}

	closeModal(): void {
		// Проверяем, что модальное окно активно перед закрытием
		if (this.modal.isActive()) {
			this.modal.close();
		}
	}

	start(): void {
		// Загрузка продуктов при старте приложения
		this.appState.loadProducts();
	}
}
