// exchange-post-message.service.ts
import { Inject, Injectable, InjectionToken, OnDestroy, Optional } from '@angular/core';

import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { green, red } from 'tool-log';

import { IExchangeSource } from '../exchange.interface';
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
 * Сервис для обмена сообщениями между сайтами (iframe / window.open)
 * на основе window.postMessage.
 *
 * @example
 * // Отправка в iframe
 * this.postMessage.send$(iframe.contentWindow, {
 *     from: 'HostApp',
 *     to: 'ChildApp',
 *     source: {
 *         name: exchangeNameEnum.RunAction,
 *         data: { name: 'exch_doSomething', arguments: [1, 2] },
 *     },
 * });
 *
 * // Подписка
 * this.postMessage.listen$().subscribe((source) => { ... });
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
	 * Отправляет сообщение в целевое окно через postMessage.
	 *
	 * @param targetWindow - окно-получатель (iframe.contentWindow, window.parent, window.opener).
	 * @param source - источник обмена (IExchangeSource).
	 * @param targetOrigin - переопределение targetOrigin из конфигурации.
	 */
	public send$(
		targetWindow: Window | null,
		source: IExchangeSource,
		targetOrigin?: string,
	): void {
		if (!targetWindow) {
			red('exchange-post-message', 'targetWindow не задан — сообщение не отправлено');

			return;
		}

		const envelope: IExchangePostMessageEnvelope = {
			marker: EXCHANGE_POST_MESSAGE_MARKER,
			payload: source,
		};

		const origin = targetOrigin ?? this._config.targetOrigin ?? '*';

		targetWindow.postMessage(envelope, origin);

		green(
			'exchange-post-message',
			`Отправлено в ${origin} из ${source.from} → ${JSON.stringify(source.to)}`,
		);
	}

	/**
	 * Поток входящих сообщений, отфильтрованных по маркеру и allowedOrigins.
	 * Автоматически отписывается при уничтожении сервиса.
	 *
	 * @example
	 * // 1. Просто получить сообщение (без исполнения exch_-методов)
	 * this._postMessage.listen$()
	 *     .pipe(takeUntil(this._destroyed$))
	 *     .subscribe((source: IExchangeSource) => {
	 *         green('host', 'Получено от iframe:', source);
	 *     });
	 *
	 * @example
	 * // 2. Ретрансляция в ExchangeLighthouse — тогда на принимающей стороне
	 * //    ExchangeSubscribeComponent применит exch_-валидацию и вызовет метод
	 * //    (например, exch_add(1, 2) при source.name === exchangeNameEnum.RunAction).
	 * this._postMessage.listen$()
	 *     .pipe(takeUntil(this._destroyed$))
	 *     .subscribe((source: IExchangeSource) => {
	 *         this._exchange.send$(source);
	 *     });
	 *
	 * @example
	 * // 3. Ответное сообщение отправителю (эхо)
	 * this._postMessage.listen$()
	 *     .pipe(takeUntil(this._destroyed$))
	 *     .subscribe((source: IExchangeSource) => {
	 *         this._postMessage.send$(this.childFrame.nativeElement.contentWindow, {
	 *             from: 'HostComponent',
	 *             to: source.from,
	 *             source: {
	 *                 name: exchangeNameEnum.RunAction,
	 *                 data: { name: 'exch_add', arguments: [1, 2] },
	 *             },
	 *         });
	 *     });
	 */
	public listen$(): Observable<IExchangeSource> {
		return fromEvent<MessageEvent>(window, 'message')
			.pipe(
				takeUntil(this._destroyed$),
				filter((event: MessageEvent) => this._isValidEnvelope(event)),
				map((event: MessageEvent): IExchangeSource => {
					const envelope = event.data as IExchangePostMessageEnvelope;

					return envelope.payload;
				}),
			);
	}

	/**
	 * Проверяет, что сообщение принадлежит библиотеке и пришло с разрешённого origin.
	 *
	 * @param event - событие message.
	 */
	private _isValidEnvelope(event: MessageEvent): boolean {
		const data = event.data as Partial<IExchangePostMessageEnvelope> | null;

		if (!data || data.marker !== EXCHANGE_POST_MESSAGE_MARKER || !data.payload) {
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
