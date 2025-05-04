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
		console.log('WebLarekApi initialized with CDN:', cdn);
	}

	getProducts(): Promise<IProductList> {
		console.log('Fetching products list');
		return this.get('/product').then((data: IProductList) => {
			const products = {
				...data,
				items: data.items.map((item) => ({
					...item,
					image: this.cdn + item.image.replace('.svg', '.png'),
				})),
			};
			console.log('Products fetched successfully:', products.items.length);
			return products;
		});
	}

	getProductById(id: string): Promise<IProduct | IProductNotFound> {
		console.log('Fetching product by ID:', id);
		return this.get(`/product/${id}`).then(
			(data: IProduct | IProductNotFound) => {
				if ('error' in data) {
					// Если сервер вернул ошибку
					console.log('Error fetching product:', data);
					return data as IProductNotFound;
				}
				// Добавляем CDN к пути изображения
				const product = {
					...data,
					image: this.cdn + (data as IProduct).image.replace('.svg', '.png'),
				};
				console.log('Product fetched successfully:', product);
				return product;
			}
		);
	}

	placeOrder(order: IOrder): Promise<IOrderSuccess | IOrderError> {
		console.log('Placing order:', order);
		return this.post('/order', order).then(
			(data: IOrderSuccess | IOrderError) => {
				if ('error' in data) {
					// Если сервер вернул ошибку
					console.log('Error placing order:', data);
					return data as IOrderError;
				}
				// Возвращаем успешный результат
				console.log('Order placed successfully:', data);
				return data as IOrderSuccess;
			}
		);
	}
}
