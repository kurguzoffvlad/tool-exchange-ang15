import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { IExchangeSource, TNullable } from './exchange.interface';
import { green } from 'tool-log';


/**
 * Отправка информации от сервисов и компонентов в NgExchangeSubscribeBaseComponent.
 *
 * ## Семантика шины
 *
 * `lighthouse$` — это **событийная шина**, а не store состояния:
 * - сообщение доставляется **только активным подписчикам в момент отправки**;
 * - история **не проигрывается** новым подписчикам (используется `Subject`, а не `BehaviorSubject`);
 * - фильтрация по адресату (`to`) выполняется на стороне подписчика
 *   (`ExchangeSubscribeComponent._subscribeActions`).
 *
 * Если в будущем потребуется сценарий «текущее состояние» (например, подписчик
 * должен узнать актуальное значение свойства, установленное до его создания),
 * это нужно реализовывать **отдельным механизмом** (store-сервис или
 * `ReplaySubject(1)` для конкретного типа сообщения), а не менять семантику
 * всей шины на `BehaviorSubject` — иначе `RunAction` начнёт «проигрываться»
 * повторно у новых подписчиков, что приведёт к нежелательным побочным эффектам.
 *
 * @example
 * // Пример использования:
 * const exchange = new ExchangeLighthouse();
 *
 * exchange.send$(
 *      {
 *          name: exchangeNameEnum.ChangeProperty,
 *          data: {
 *              name: 'exch_exchChangeText',
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
	/**
	 * Поток сообщений обмена.
	 *
	 * `Subject` (не `BehaviorSubject`): новые подписчики **не получают**
	 * последнее отправленное сообщение — только те, что будут отправлены
	 * после подписки. Это предотвращает «эхо» старых сообщений у компонентов,
	 * смонтированных позже (например, через `*ngIf` или навигацию).
	 */
	public readonly lighthouse$: Subject<TNullable<IExchangeSource>> = new Subject<TNullable<IExchangeSource>>();

	public send$(value: IExchangeSource, from: string = 'Не указано'): void {
		if (!value) { return; }

		green(' --- Отправлено из ' + from + ' через ExchangeLighthouse ' + JSON.stringify(value));

		this.lighthouse$.next(value);
	}
}
