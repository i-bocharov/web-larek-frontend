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

	validate(data: Partial<IOrder>): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!data) {
			errors.push('Отсутствуют данные для валидации');
			return { valid: false, errors };
		}

		// Проверяем только если поле передано
		if ('payment' in data && !data.payment) {
			errors.push('Необходимо выбрать способ оплаты');
		}

		if ('address' in data && !data.address) {
			errors.push('Необходимо указать адрес');
		}

		if ('email' in data && !data.email) {
			errors.push('Необходимо указать email');
		}

		if ('phone' in data && !data.phone) {
			errors.push('Необходимо указать телефон');
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
	private _address: string = '';

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
			this.updateBasketCounter();
		}
	}

	removeFromBasket(productId: string): void {
		this.set({
			basket: this.state.basket.filter((id) => id !== productId),
		});
		this.emitChanges('basket:updated', { basket: this.state.basket });
		this.updateBasketCounter();
	}

	clearBasket(): void {
		this.set({ basket: [] });
		this.emitChanges('basket:updated', { basket: [] });
		this.updateBasketCounter();
	}

	setPreview(productId: string | null): void {
		this.set({ preview: productId });
		this.emitChanges('preview:changed', { preview: productId });
	}

	getBasketItems(): IBasketItem[] {
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

	setPaymentMethod(method: 'online' | 'cash' | null): void {
		this.set({ paymentMethod: method });
		if (method) {
			this.emitChanges('payment:method', { method });
		}
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

	isInBasket(productId: string): boolean {
		return this.state.basket.includes(productId);
	}

	getAddress(): string {
		return this._address;
	}

	setAddress(address: string): void {
		this._address = address;
	}
}
