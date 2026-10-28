import { Component, Inject } from '@angular/core';

import { Subject, } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { isLogLocalhost, red } from 'tool-log';

import { exchangeNameEnum, IAction, IChangeProperty, IExchangeSource, TNullable } from './exchange.interface';
import { ExchangeValidators } from './exchange-validators';
import { ExchangeLighthouse } from "./exchange-lighthouse";


@Component({
	selector: 'tool-exchange-subscribe',
	template: `...`
})
export class ExchangeSubscribeComponent {
	private _checkExchange;

	private readonly destroyedExchange$ = new Subject<void>();

	public constructor(
		@Inject(String) public extendsClassName: string,
		public exchange: ExchangeLighthouse,
	) {
		this._checkExchange = new ExchangeValidators();

		this._initEvoAng();
	}

	/** !!! В потомке обязательно - в его ngOnDestroy добавить super.ngOnDestroy(); */
	public ngOnDestroy(): void {
		this.destroyedExchange$.next();
		this.destroyedExchange$.complete();
	}

	// Старт подключения ExchangeSubscribeComponent
	private _initEvoAng(): void {
		if (isLogLocalhost) {
			this._checkExchange.checkLogClassName(this);

			this._checkExchange.checkLogNgOnDestroy(this);
		}

		this._subscribeActions();
	}

	/** Подписываемся на изменения в evo.exchange.lighthouse$ (Обменный пункт) */
	private _subscribeActions(): void {
		this.exchange.lighthouse$
			.pipe(takeUntil(this.destroyedExchange$))
			.subscribe((value: TNullable<IExchangeSource>) => {
				// if (!value?.source) {
				//     throw new Error(`Для работы с this.exchangeSource$ укажите для него адресат и ресурс`);
				// }

				if (
					this.extendsClassName
					&& value?.to
					&& (
						value.to === 'forAllClasses'
						|| value.to === this.extendsClassName
						|| (Array.isArray(value.to) && value.to.includes(this.extendsClassName))
					)
				) {
					if ([
						exchangeNameEnum.ChangeProperty,
						exchangeNameEnum.RunAction
					].includes(value.source.name)) {
						this.executeExchange(value.source.name, JSON.parse(JSON.stringify(value)));
					}
				} else if (value?.to) {
					red(
						'red',
						'exchange',
						'common',
						'Подписка exchange (из' + value.from + '/NgExchangeSubscribeComponent) - Адресат отсутствует - ',
						value?.to
					);
				}
			});
	}

	/**
	 * Выполняет действия на основе данных обмена.
	 * @param name - Тип обмена - exchangeNameEnum.
	 * @param exchangeSource - Данные обмена - IExchangeSource.
	 */
	public executeExchange(name: exchangeNameEnum, exchangeSource: IExchangeSource): void {
		switch (name) {
			case exchangeNameEnum.ChangeProperty:
				this._handleChangeProperty(exchangeSource);
				break;
			case exchangeNameEnum.RunAction:
				this._handleRunAction(exchangeSource);
				break;
		}
	}

	/**
	 * Обрабатывает изменение свойства компонента.
	 * @param {IExchangeSource} exchangeSource - Данные обмена.
	 *
	 * @private
	 */
	private _handleChangeProperty(exchangeSource: IExchangeSource): void {
		const data = exchangeSource?.source?.data as TNullable<IChangeProperty>;

		if (!data) {
			red(
				'red',
				'exchange',
				'common',
				`Подписка exchange (из ${exchangeSource.from}/NgExchangeSubscribeComponent) - у компонента ${this.extendsClassName} отсутствуют данные для изменения свойства`
			);
			return;
		}

		if (Object.keys(this).includes(data.name)) {
			red(
				'green',
				'exchange',
				'common',
				`Подписка exchange (из ${exchangeSource.from}/NgExchangeSubscribeComponent) - у компонента ${this.extendsClassName} свойство -  ${data.name} = ${data.value}`
			);

			// @ts-expect-error — динамический доступ к свойству по имени
			this[data.name] = data.value;
		} else if (isLogLocalhost) {
			red(
				'red',
				'exchange',
				'common',
				`Подписка exchange (из ${exchangeSource.from}/NgExchangeSubscribeComponent) - у компонента ${this.extendsClassName} нет свойства - ${data.name}`
			);
		}
	}

	/**
	 * Обрабатывает вызов метода компонента.
	 * @param {IExchangeSource} exchangeSource - Данные обмена.
	 *
	 * @private
	 */
	private _handleRunAction(exchangeSource: IExchangeSource): void {
		const data = exchangeSource?.source?.data as TNullable<IAction>;

		if (!data) {
			red(
				'red',
				'exchange',
				'common',
				`Подписка exchange (из ${exchangeSource.from}/NgExchangeSubscribeComponent) - у компонента ${this.extendsClassName} отсутствуют данные для вызова метода`
			);
			return;
		}

		// @ts-expect-error — динамический доступ к члену компонента по имени
		const method = this[data.name];

		if (typeof method === 'function') {
			red(
				'green',
				'exchange',
				'common',
				`Подписка exchange (из ${exchangeSource.from}/NgExchangeSubscribeComponent) - у компонента ${this.extendsClassName} метод - ${method.name} с аргументами `,
				data.arguments
			);

			method.apply(this, data.arguments);
		} else if (isLogLocalhost) {
			red(
				'red',
				'exchange',
				'common',
				`Подписка exchange (из ${exchangeSource.from}/NgExchangeSubscribeComponent) - у компонента ${this.extendsClassName} нет метода - ${data.name}`
			);
		}
	}

}
