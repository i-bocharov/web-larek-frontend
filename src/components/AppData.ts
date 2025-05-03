import { Model } from './base/Model';
import { IProduct, IOrder, IAppState, IBasketItem } from '../types';
import { WebLarekApi } from './WebLarekApi';
import { IEvents } from './base/Events';

/**
 * Модель для управления продуктами.
 */
export class ProductModel extends Model<IProduct> {
	private api: WebLarekApi;

	constructor(data: Partial<IProduct>, events: IEvents, api: WebLarekApi) {
		super(data, events);
		this.api = api;
	}

	/**
	 * Загружает список продуктов с сервера.
	 */
	async loadProducts(): Promise<{ products: IProduct[] }> {
		try {
			const productList = await this.api.getProducts();

			this.emitChanges('products:loaded', { products: productList.items });

			return { products: productList.items }; // Возвращаем продукты
		} catch (error) {
			this.emitChanges('products:error', {
				error: 'Ошибка при загрузке продуктов',
			});

			throw error; // Пробрасываем ошибку для обработки выше
		}
	}

	/**
	 * Загружает информацию о конкретном продукте по его ID.
	 */
	async loadProductById(id: string): Promise<void> {
		try {
			const product = await this.api.getProductById(id);

			if ('error' in product) {
				this.emitChanges('product:error', { error: product.error });
			} else {
				this.emitChanges('product:loaded', { product });
			}
		} catch (error) {
			this.emitChanges('product:error', {
				error: 'Ошибка при загрузке продукта',
			});
		}
	}
}

/**
 * Модель для управления заказами.
 */
export class OrderModel extends Model<IOrder> {
	private api: WebLarekApi;

	constructor(data: Partial<IOrder>, events: IEvents, api: WebLarekApi) {
		super(data, events);
		this.api = api;
	}

	async placeOrder(orderData: IOrder): Promise<void> {
		try {
			const result = await this.api.placeOrder(orderData);

			if ('error' in result) {
				this.emitChanges('order:error', { error: result.error });
			} else {
				this.emitChanges('order:success', { order: result });
			}
		} catch (error) {
			this.emitChanges('order:error', {
				error: 'Ошибка при размещении заказа',
			});
		}
	}

	validateOrder(orderData: IOrder): boolean {
		const errors: Partial<Record<keyof IOrder, string>> = {};

		if (!orderData.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!orderData.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		if (!orderData.address) {
			errors.address = 'Необходимо указать адрес';
		}
		if (orderData.items.length === 0) {
			errors.items = 'Корзина пуста';
		}

		this.emitChanges('formErrors:change', errors);

		return Object.keys(errors).length === 0;
	}

	protected validateForm(): boolean {
		const email = this.getEmail();
		const phone = this.getPhone();

		this.errors = [];

		if (!email) {
			this.errors.push('Email обязателен');
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			this.errors.push('Некорректный формат email');
		}

		if (!phone) {
			this.errors.push('Телефон обязателен');
		} else if (
			!/^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/.test(
				phone
			)
		) {
			this.errors.push('Некорректный формат телефона');
		}

		this.valid = this.errors.length === 0;
		this.render({ errors: this.errors, valid: this.valid });
		return this.valid;
	}

	if (emailInput && phoneInput) {
		const validateForm = () => {
			this.errors = [];
			const email = this.getEmail();
			const phone = this.getPhone();

			if (!email) {
				this.errors.push('Email обязателен');
			} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				this.errors.push('Некорректный формат email');
			}

			if (!phone) {
				this.errors.push('Телефон обязателен');
			} else if (
				!/^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/.test(
					phone
				)
			) {
				this.errors.push('Некорректный формат телефона');
			}

			this.valid = this.errors.length === 0;
			this.render({ errors: this.errors, valid: this.valid });
		};

		emailInput.addEventListener('input', validateForm);
		phoneInput.addEventListener('input', validateForm);
	}
}

/**
 * Модель для состояния приложения.
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

	loadProducts(): void {
		this.set({ loading: true });
		this.productModel
			.loadProducts()
			.then(({ products }) => {
				this.set({ catalog: products }); // Обновляем каталог продуктов
			})
			.catch(() => {
				// Ошибка уже обработана в ProductModel, здесь можно ничего не делать
			})
			.finally(() => {
				this.set({ loading: false });
			});
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

	async placeOrder(orderData: IOrder): Promise<void> {
		try {
			this.set({ loading: true });

			if (!this.orderModel.validateOrder(orderData)) {
				return; // Валидация не пройдена
			}

			await this.orderModel.placeOrder(orderData);
			this.set({ order: orderData }); // Обновляем состояние заказа
			this.clearBasket(); // Очищаем корзину после успешного заказа
			this.emitChanges('order:placed', { order: orderData });
		} catch (error) {
			this.emitChanges('order:error', {
				error: 'Ошибка при размещении заказа',
			});
		} finally {
			this.set({ loading: false });
		}
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
