import { Model } from './base/Model';
import { IProduct, IOrder, IAppState } from '../types';
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
	async loadProducts(): Promise<void> {
		try {
			const productList = await this.api.getProducts();

			this.emitChanges('products:loaded', { products: productList.items });
		} catch (error) {
			this.emitChanges('products:error', {
				error: 'Ошибка при загрузке продуктов',
			});
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
}

/**
 * Модель для состояния приложения.
 */
export class AppState extends Model<IAppState> {}
