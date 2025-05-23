import { Component } from './base/Component';
import { productCategories } from '../utils/constants';
import { IProduct } from '../types';

export abstract class ProductView extends Component<IProduct> {
	protected _title: HTMLElement;
	protected _category: HTMLElement;
	protected _image: HTMLImageElement;
	protected _description?: HTMLElement | null;
	protected _price: HTMLElement;

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set category(value: string) {
		this.setText(this._category, value);
		const categoryClass =
			productCategories[value.toLowerCase()] || 'card__category_other';
		this._category.className = `card__category ${categoryClass}`;
	}

	set image(value: string) {
		this.setImage(this._image, value, this._title.textContent || '');
	}

	set description(value: string) {
		if (this._description) {
			this.setText(this._description, value);
		}
	}

	set price(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесплатно');
	}

	get isFree(): boolean {
		return this._price.textContent?.includes('Бесплатно') ?? false;
	}

	render(data: IProduct): HTMLElement {
		this.id = data.id;
		this.title = data.title;
		this.category = data.category;
		this.image = data.image;
		this.price = data.price;

		return this.container;
	}
}
