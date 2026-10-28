import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { IExchangeSource, TNullable } from './exchange.interface';
import { green } from 'tool-log';


/**
 * Отправка информации от сервисов и компонентов в NgExchangeSubscribeBaseComponent.
 *
 * @example
 * // Пример использования:
 * this.exchange.send$({name: 'white'}({
 *            from: 'UserSeEvoLoaderComponent',
 *            to: ['EvoRootLighthousesComponent'],
 *            source: {
 *                 name: exchangeNameEnum.ChangeProperty,
 *                        data: {
 *                             name: 'exchChangeText',
 *                             arguments: ['Текст из родительского компонента переданный через систему exchange!!!'],
 *                         }
 *            }
 *         });
 */
@Injectable({
	providedIn: 'root'
})
export class ExchangeLighthouse {
	public lighthouse$: BehaviorSubject<TNullable<IExchangeSource>> = new BehaviorSubject<TNullable<IExchangeSource>>(null);

	public send$(value: IExchangeSource, from: string = 'Не указано'): void {
		if (!value) { return; }

		green(' --- Отправлено из ' + from + ' через BaseLighthouse для exchange ' + value);

		this.lighthouse$.next(value);
	}

	public getValue(): TNullable<IExchangeSource> {
		return this.lighthouse$.getValue();
	}
}
