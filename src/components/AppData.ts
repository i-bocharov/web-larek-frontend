import { Model } from './base/Model';
import { IProduct, IOrder, IAppState, IBasketItem } from '../types';
import { IEvents } from './base/Events';

/**
 * Модель для управления продуктами.
 * Только хранение и обработка данных, никаких запросов к API!
 */
export class ProductModel extends Model<IProduct> {
	constructor(data: Partial<IProduct>, events: IEvents) {
		super(data, events);
	}

	setProducts(products: IProduct[]): void {
		this.emitChanges('products:loaded', { products });
	}

	setProduct(product: IProduct): void {
		this.emitChanges('product:loaded', { product });
	}
}

/**
 * Модель для управления заказами.
 * Только хранение и валидация данных, никаких запросов к API!
 */
export class OrderModel extends Model<IOrder> {
	constructor(data: Partial<IOrder>, events: IEvents) {
		super(data, events);
	}

	/**
	 * Валидация данных заказа.
	 * Возвращает true, если ошибок нет, иначе false и эмитит событие с ошибками.
	 */
	validateOrder(orderData: IOrder): boolean {
		const errors: Partial<Record<keyof IOrder, string>> = {};

		// Проверка способа оплаты
		if (
			!orderData.payment ||
			(orderData.payment !== 'online' && orderData.payment !== 'cash')
		) {
			errors.payment = 'Выберите способ оплаты';
		}

		// Email
		if (!orderData.email) {
			errors.email = 'Необходимо указать email';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.email)) {
			errors.email = 'Некорректный формат email';
		}

		// Телефон
		if (!orderData.phone) {
			errors.phone = 'Необходимо указать телефон';
		} else if (
			!/^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/.test(
				orderData.phone
			)
		) {
			errors.phone = 'Некорректный формат телефона';
		}

		// Адрес
		if (!orderData.address) {
			errors.address = 'Необходимо указать адрес';
		}

		// Корзина
		if (!orderData.items || orderData.items.length === 0) {
			errors.items = 'Корзина пуста';
		}

		this.emitChanges('formErrors:change', errors);

		return Object.keys(errors).length === 0;
	}
}

/**
 * Модель для состояния приложения.
 * Хранит состояние, обновляет его и эмитит события.
 */
export class AppState extends Model<IAppState> {
	private state: IAppState;
	private productModel: ProductModel;
	private orderModel: OrderModel;

	constructor(
		events: IEvents,
		productModel: ProductModel,
		orderModel: OrderModel
	) {
		super(
			{
				catalog: [],
				basket: [],
				preview: null,
				order: null,
				loading: false,
				paymentMethod: null,
			},
			events
		);
		this.productModel = productModel;
		this.orderModel = orderModel;
		this.state = {
			catalog: [],
			basket: [],
			preview: null,
			order: null,
			loading: false,
			paymentMethod: null,
		};
	}

	private set(nextState: Partial<IAppState>): void {
		this.state = { ...this.state, ...nextState };
		this.emitChanges('state:updated', this.state);
	}

	setProducts(products: IProduct[]): void {
		this.set({ catalog: products });
		this.productModel.setProducts(products);
	}

	setProduct(product: IProduct): void {
		this.productModel.setProduct(product);
	}

	addToBasket(productId: string): void {
		if (!this.state.basket.includes(productId)) {
			this.set({ basket: [...this.state.basket, productId] });
			this.emitChanges('basket:updated', { basket: this.state.basket });
		}
	}

	removeFromBasket(productId: string): void {
		this.set({
			basket: this.state.basket.filter((id) => id !== productId),
		});
		this.emitChanges('basket:updated', { basket: this.state.basket });
	}

	clearBasket(): void {
		this.set({ basket: [] });
		this.updateBasketCounter();
		this.emitChanges('basket:updated', { basket: [] });
	}

	setPreview(productId: string | null): void {
		this.set({ preview: productId });
		this.emitChanges('preview:changed', { preview: productId });
	}

	getBasketItems(): IBasketItem[] {
		if (!this.state.catalog.length) {
			return [];
		}

		return this.state.basket
			.map((productId) => {
				const product = this.state.catalog.find(
					(item) => item.id === productId
				);

				if (!product) {
					return null;
				}

				return {
					id: product.id,
					title: product.title,
					price: product.price,
					quantity: 1,
				};
			})
			.filter(Boolean);
	}

	calculateBasketTotal(): number {
		if (!this.state.catalog.length) {
			return 0;
		}

		return this.state.basket.reduce((total, productId) => {
			const product = this.state.catalog.find((item) => item.id === productId);

			return total + (product?.price || 0);
		}, 0);
	}

	placeOrder(orderData: IOrder): void {
		if (!this.orderModel.validateOrder(orderData)) {
			return; // Валидация не пройдена
		}
		this.set({ order: orderData }); // Обновляем состояние заказа
		this.clearBasket(); // Очищаем корзину после успешного заказа
		this.emitChanges('order:placed', { order: orderData });
	}

	updateBasketCounter(): void {
		const count = this.state.basket.length;

		this.emitChanges('basket:counter', { count });
	}

	setPaymentMethod(method: 'online' | 'cash'): void {
		this.set({ paymentMethod: method });
		this.emitChanges('payment:method', { method });
	}

	getPaymentMethod(): 'online' | 'cash' | null {
		return this.state.paymentMethod;
	}
}
