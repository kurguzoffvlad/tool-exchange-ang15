// exchange-post-message.service.ts
import { Inject, Injectable, InjectionToken, OnDestroy, Optional } from '@angular/core';

import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { green, red } from 'tool-log';

import {
	EXCHANGE_POST_MESSAGE_MARKER,
	IExchangePostMessageConfig,
	IExchangePostMessageEnvelope,
} from './exchange-post-message.interface';

/**
 * InjectionToken для конфигурации ExchangePostMessageService.
 * Позволяет задать allowedOrigins/targetOrigin через DI.
 */
export const EXCHANGE_POST_MESSAGE_CONFIG = new InjectionToken<IExchangePostMessageConfig>(
	'EXCHANGE_POST_MESSAGE_CONFIG',
	{
		providedIn: 'root',
		factory: (): IExchangePostMessageConfig => ({
			allowedOrigins: [],
			targetOrigin: '*',
		}),
	},
);

/**
 * Транспорт для обмена сообщениями между сайтами (iframe / window.open)
 * на основе window.postMessage.
 *
 * Сервис не знает о структуре payload'а — это «труба». Тип задаёт потребитель
 * через generic. Для обмена IExchangeSource используйте совместно с
 * ExchangeLighthouse / ExchangeSubscribeComponent.
 *
 * @example
 * // Отправка произвольного payload'а
 * this.postMessage.send$<{ hello: string }>(iframe.contentWindow, { hello: 'world' });
 *
 * // Подписка с типизированным payload'ом
 * this.postMessage.listen$<{ hello: string }>()
 *     .subscribe((payload) => { payload.hello: string });
*/
@Injectable({
	providedIn: 'root',
})
export class ExchangePostMessageService implements OnDestroy {
	private readonly _destroyed$ = new Subject<void>();

	private readonly _config: IExchangePostMessageConfig;

	public constructor(
		@Optional() @Inject(EXCHANGE_POST_MESSAGE_CONFIG) config: IExchangePostMessageConfig | null,
	) {
		this._config = config ?? { allowedOrigins: [], targetOrigin: '*' };
	}

	public ngOnDestroy(): void {
		this._destroyed$.next();
		this._destroyed$.complete();
	}

	/**
	 * Отправляет произвольный payload в целевое окно через postMessage.
	 *
	 * @template T - тип полезной нагрузки.
	 * @param targetWindow - окно-получатель (iframe.contentWindow, window.parent, window.opener).
	 * @param payload - произвольные данные.
	 * @param targetOrigin - переопределение targetOrigin из конфигурации.
	 */
	public send$<T = unknown>(
		targetWindow: Window | null,
		payload: T,
		targetOrigin?: string,
	): void {
		if (!targetWindow) {
			red('exchange-post-message', 'targetWindow не задан — сообщение не отправлено');

			return;
		}

		const envelope: IExchangePostMessageEnvelope<T> = {
			marker: EXCHANGE_POST_MESSAGE_MARKER,
			payload,
		};

		const origin = targetOrigin ?? this._config.targetOrigin ?? '*';

		targetWindow.postMessage(envelope, origin);

		green('exchange-post-message', `Отправлено в ${origin}`);
	}

	/**
	 * Поток входящих сообщений, отфильтрованных по маркеру и allowedOrigins.
	 * Автоматически отписывается при уничтожении сервиса.
	 *
	 * @template T - ожидаемый тип полезной нагрузки. Валидация `T` не выполняется —
	 * ответственность на потребителе.
	 */
	public listen$<T = unknown>(): Observable<T> {
		return fromEvent<MessageEvent>(window, 'message')
			.pipe(
				takeUntil(this._destroyed$),
				filter((event: MessageEvent) => this._isValidEnvelope(event)),
				map((event: MessageEvent): T => {
					const envelope = event.data as IExchangePostMessageEnvelope<T>;

					return envelope.payload;
				}),
			);
	}

	/**
	 * Проверяет, что сообщение принадлежит библиотеке и пришло с разрешённого origin.
	 * Структура payload'а не проверяется — это ответственность потребителя.
	 *
	 * @param event - событие message.
	 */
	private _isValidEnvelope(event: MessageEvent): boolean {
		const data = event.data as Partial<IExchangePostMessageEnvelope> | null;

		if (!data || data.marker !== EXCHANGE_POST_MESSAGE_MARKER) {
			return false;
		}

		const allowed = this._config.allowedOrigins ?? [];

		if (allowed.length === 0) {
			return true;
		}

		const isAllowed = allowed.includes(event.origin);

		if (!isAllowed) {
			red('exchange-post-message', `Отклонён origin: ${event.origin}`);

			return false;
		}

		return true;
	}
}
