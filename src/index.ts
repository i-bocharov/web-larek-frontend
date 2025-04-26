import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { WebLarekApi } from './components/WebLarekApi';
import { EventEmitter } from './components/base/Events';

const api = new WebLarekApi(CDN_URL, API_URL);
const events = new EventEmitter();

api
	.getProducts()
	.then((products) => {
		console.log('Список продуктов:', products);
	})
	.catch((error: Error) => {
		console.error('Ошибка при загрузке продуктов:', error.message);
	});
