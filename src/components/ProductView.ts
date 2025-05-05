import { Component } from './base/Component';
import { IProduct } from '../types';

export abstract class ProductView extends Component<IProduct> {
	protected _title: HTMLElement;

	set title(value: string) {
		this.setText(this._title, value);
	}
}
