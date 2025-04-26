import { Model } from './base/Model';
import { IProduct, IOrder, IAppState } from '../types';

/**
 * Модель для управления продуктами.
 */
export class ProductModel extends Model<IProduct> {}

/**
 * Модель для управления заказами.
 */
export class OrderModel extends Model<IOrder> {}

/**
 * Модель для состояния приложения.
 */
export class AppState extends Model<IAppState> {}
