/**
 * Маркер, по которому распознаются сообщения библиотеки tool-exchange-ang15.
 * Позволяет игнорировать посторонние postMessage-сообщения.
 */
export const EXCHANGE_POST_MESSAGE_MARKER = '__toolExchange__';

/**
 * Конверт сообщения, передаваемого через window.postMessage.
 */
export interface IExchangePostMessageEnvelope<T = unknown> {
	/** Маркер библиотеки. */
	marker: typeof EXCHANGE_POST_MESSAGE_MARKER;

	/** Полезная нагрузка — источник обмена. */
	payload: T;
}

/**
 * Конфигурация сервиса ExchangePostMessageService.
 */
export interface IExchangePostMessageConfig {
	/**
	 * Список разрешённых origin-ов (например, ['https://site-a.com']).
	 * Если пуст — принимаются сообщения с любым origin (только для dev!).
	 */
	allowedOrigins?: string[];

	/**
	 * Целевой origin для отправки (по умолчанию '*').
	 * В production настоятельно рекомендуется указывать конкретный origin.
	 */
	targetOrigin?: string;
}
