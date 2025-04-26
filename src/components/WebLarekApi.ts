import { Api } from './base/Api';
import { IProduct } from '../types';

export interface IWebLarekApi {
	getProducts: () => Promise<IProduct[]>;
}

export class WebLarekApi extends Api implements IWebLarekApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProducts(): Promise<IProduct[]> {
		return this.get('/product').then((data: IProduct[]) => {
			return data;
		});
	}
}
