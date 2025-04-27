import './scss/styles.scss';

import { Page } from './components/Page';

document.addEventListener('DOMContentLoaded', () => {
	try {
		const page = new Page();
		page.start();
	} catch (error) {
		console.error('Не удалось выполнить инициализацию:', error);
	}
});
