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

	private validateEmail(email: string): boolean {
		return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
	}

	private validatePhone(phone: string): boolean {
		return /^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/.test(
			phone
		);
	}

	private validatePayment(payment: string): boolean {
		return payment === 'card' || payment === 'cash';
	}

	private validateAddress(address: string): boolean {
		return address.length > 0;
	}

	validate(data: Partial<IOrder>): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!data) {
			errors.push('Отсутствуют данные для валидации');
			return { valid: false, errors };
		}

		if ('email' in data) {
			const email = data.email || '';
			if (!email) {
				errors.push('Необходимо указать email');
			} else if (!this.validateEmail(email)) {
				errors.push('Некорректный формат email');
			}
		}

		if ('phone' in data) {
			const phone = data.phone || '';
			if (!phone) {
				errors.push('Необходимо указать телефон');
			} else if (!this.validatePhone(phone)) {
				errors.push('Некорректный формат телефона');
			}
		}

		if ('payment' in data) {
			const payment = data.payment || '';
			if (!payment) {
				errors.push('Необходимо выбрать способ оплаты');
			} else if (!this.validatePayment(payment)) {
				errors.push('Выберите способ оплаты');
			}
		}

		if ('address' in data) {
			const address = data.address || '';
			if (!address) {
				errors.push('Необходимо указать адрес');
			} else if (!this.validateAddress(address)) {
				errors.push('Укажите адрес');
			}
		}

		// Проверка корзины только при полной валидации заказа
		if ('items' in data && (!data.items || data.items.length === 0)) {
			errors.push('Корзина пуста');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	}

	validateOrder(orderData: IOrder): boolean {
		const { valid, errors } = this.validate(orderData);
		if (!valid) {
			this.emitChanges('order:validate', {
				errors: errors.reduce((acc: Record<string, string>, error, index) => {
					acc[`error${index}`] = error;
					return acc;
				}, {}),
			});
		}
		return valid;
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
		console.log('AppState initialized');
	}

	private set(nextState: Partial<IAppState>): void {
		this.state = { ...this.state, ...nextState };
		this.emitChanges('state:updated', this.state);
	}

	setProducts(products: IProduct[]): void {
		console.log('Setting products in catalog:', products.length);
		this.set({ catalog: products });
		this.productModel.setProducts(products);
	}

	setProduct(product: IProduct): void {
		this.productModel.setProduct(product);
	}

	addToBasket(productId: string): void {
		if (!this.state.basket.includes(productId)) {
			console.log('Adding product to basket:', productId);
			this.set({ basket: [...this.state.basket, productId] });
			this.emitChanges('basket:updated', { basket: this.state.basket });
		}
	}

	removeFromBasket(productId: string): void {
		console.log('Removing product from basket:', productId);
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
		console.log('Getting basket items, current basket:', this.state.basket);
		return this.state.basket
			.map((productId) => {
				const product = this.state.catalog.find(
					(item) => item.id === productId
				);

				if (!product) {
					console.warn('Product not found in catalog:', productId);
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
		return this.getBasketItems().reduce((total, item) => {
			return total + (item.price || 0);
		}, 0);
	}

	placeOrder(orderData: IOrder): void {
		if (!this.orderModel.validateOrder(orderData)) {
			return;
		}
		this.set({ order: orderData });
		this.clearBasket();
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

	getCatalog(): IProduct[] {
		return this.state.catalog;
	}

	getBasket(): string[] {
		return this.state.basket;
	}
}
