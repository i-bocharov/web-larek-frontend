import { Api } from './base/Api';
import {
	IProductList,
	IProduct,
	IProductNotFound,
	IOrder,
	IOrderSuccess,
	IOrderError,
} from '../types';

export interface IWebLarekApi {
	getProducts: () => Promise<IProductList>;
	getProductById: (id: string) => Promise<IProduct | IProductNotFound>;
	placeOrder: (order: IOrder) => Promise<IOrderSuccess | IOrderError>;
}

export class WebLarekApi extends Api implements IWebLarekApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProducts(): Promise<IProductList> {
		return this.get('/product')
			.then((data: IProductList) => {
				const products = {
					...data,
					items: data.items.map((item) => ({
						...item,
						image: this.cdn + item.image.replace('.svg', '.png'),
					})),
				};
				return products;
			})
			.catch((error) => {
				console.error('Failed to fetch products:', error);
				throw error;
			});
	}

	getProductById(id: string): Promise<IProduct | IProductNotFound> {
		return this.get(`/product/${id}`).then(
			(data: IProduct | IProductNotFound) => {
				if ('error' in data) {
					// Если сервер вернул ошибку
					return data as IProductNotFound;
				}
				// Добавляем CDN к пути изображения
				const product = {
					...data,
					image: this.cdn + (data as IProduct).image.replace('.svg', '.png'),
				};
				return product;
			}
		);
	}

	placeOrder(order: IOrder): Promise<IOrderSuccess | IOrderError> {
		return this.post('/order', order).then(
			(data: IOrderSuccess | IOrderError) => {
				if ('error' in data) {
					// Если сервер вернул ошибку
					return data as IOrderError;
				}
				// Возвращаем успешный результат
				return data as IOrderSuccess;
			}
		);
	}
}
