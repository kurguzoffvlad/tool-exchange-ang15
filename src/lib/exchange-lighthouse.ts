import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { IExchangeSource, TNullable } from './exchange.interface';
import { green } from 'tool-log';


/**
 * Отправка информации от сервисов и компонентов в NgExchangeSubscribeBaseComponent.
 *
 * @example
 * // Пример использования:
 * const exchange = new ExchangeLighthouse();
 *
 * exchange.send$(
 *      {
 *          name: exchangeNameEnum.ChangeProperty,
 *          data: {
 *              name: 'exchChangeText',
 *              arguments: ['Текст из родительского компонента переданный через систему exchange!!!'],
 *          },
 *      },
 *      'UserSeEvoLoaderComponent',
 * );
 */
@Injectable({
	providedIn: 'root'
})
export class ExchangeLighthouse {
	public lighthouse$: BehaviorSubject<TNullable<IExchangeSource>> = new BehaviorSubject<TNullable<IExchangeSource>>(null);

	public send$(value: IExchangeSource, from: string = 'Не указано'): void {
		if (!value) { return; }

		green(' --- Отправлено из ' + from + ' через ExchangeLighthouse ' + JSON.stringify(value));

		this.lighthouse$.next(value);
	}

	public getValue(): TNullable<IExchangeSource> {
		return this.lighthouse$.getValue();
	}
}
