import { Api } from './base/Api';
import { IProductList, IProduct, IProductNotFound } from '../types';

export interface IWebLarekApi {
	getProducts: () => Promise<IProductList>;
	getProductById: (id: string) => Promise<IProduct | IProductNotFound>;
}

export class WebLarekApi extends Api implements IWebLarekApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProducts(): Promise<IProductList> {
		return this.get('/product').then((data: IProductList) => {
			// Добавляем CDN к путям изображений
			return {
				...data,
				items: data.items.map((item) => ({
					...item,
					image: this.cdn + item.image,
				})),
			};
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
				return {
					...data,
					image: this.cdn + (data as IProduct).image,
				};
			}
		);
	}
}
