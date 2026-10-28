/**
 * Типы данных для 'общения компонентов и сервисов'.
 */

export type TNullable<T> = T | null;

export enum exchangeNameEnum {
    Start = 'start', // Инициализация обмена (данные отсутствуют).
    RunAction = 'runAction', // Запуск действия (данные: IAction).
    ChangeProperty = 'changeProperty', //  Изменение свойства (данные: IChangeProperty).
}

/** Интерфейс действия. */
export interface IAction {
    /** Название действия. */
    name: string;

    /** Аргументы функции. */
    arguments: any[];
}

/**  Интерфейс изменения свойства. */
export interface IChangeProperty {
    /** Название свойства. */
    name: string;

    /**  Новое значение свойства. */
    value: any;
}

/**
 * Объединённый тип для всех источников обмена.
 * - exchangeNameEnum.Start: Инициализация обмена (данные отсутствуют).
 * - exchangeNameEnum.RunAction: Запуск действия (данные: IAction).
 * - exchangeNameEnum.ChangeProperty: Изменение свойства (данные: IChangeProperty).
 */
export type TExchangeSource = { name: exchangeNameEnum.Start; data: null }
    | { name: exchangeNameEnum.RunAction; data: IAction }
    | { name: exchangeNameEnum.ChangeProperty; data: IChangeProperty };

/** Интерфейс общения компонентов и сервисов */
export interface IExchangeSource {
    /** Название класса сервиса/компонента, откуда отправляется сообщение. */
    from: string;

    /** Название класса/ов компонента/ов, куда отправляется сообщение. */
    to: string | string[];

    /** Источник действия или данных. */
    source: TExchangeSource;

    /** Дополнительные теги для фильтрации. */
    tags?: string[];

    /** Дополнительные опции для обмена. */
    options?: any;
}
