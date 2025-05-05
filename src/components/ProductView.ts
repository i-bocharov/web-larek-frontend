import { Component } from './base/Component';
import { productCategories } from '../utils/constants';
import { IProduct } from '../types';

export abstract class ProductView extends Component<IProduct> {
	protected _title: HTMLElement;
	protected _category: HTMLElement;

	set title(value: string) {
		this.setText(this._title, value);
	}

	set category(value: string) {
		this.setText(this._category, value);
		const categoryClass =
			productCategories[value.toLowerCase()] || 'card__category_other';
		this._category.className = `card__category ${categoryClass}`;
	}
}
