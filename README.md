# tool-exchange-ang15

## Использование в https://github.com/kurguzoffvlad/tool-libs-ang15

Библиотека для обмена данными и функционалом между компонентами и сервисами Angular 15.

## Установка

```bash
npm install tool-exchange-ang15
```

Требуемые peer-зависимости:

- `@angular/common` ^15.2.0
- `@angular/core` ^15.2.0
- `tool-log` ^0.0.18

## Возможности

- **`ExchangeLighthouse`** — сервис-«маяк» (`providedIn: 'root'`) для отправки сообщений через `BehaviorSubject`.
- **`ExchangeSubscribeComponent`** — базовый компонент для подписки на сообщения с автоматической отпиской.
- **`ExchangeValidators`** — внутренние валидаторы (проверка `extendsClassName`, `ngOnDestroy`, префикса `exch_`).
- **Типы обмена** (`exchangeNameEnum`):
	- `Start` — инициализация обмена (данные отсутствуют);
	- `ChangeProperty` — изменение свойства (`IChangeProperty`);
	- `RunAction` — вызов метода (`IAction`).

## Использование

### Отправка сообщения

```ts
import { ExchangeLighthouse, exchangeNameEnum } from 'tool-exchange-ang15';

constructor(private exchange: ExchangeLighthouse) {}

// Изменение свойства
this.exchange.send$(
  {
    from: 'MyService',
    to: 'MyComponent',
    source: {
      name: exchangeNameEnum.ChangeProperty,
      data: { name: 'exch_title', value: 'Новый заголовок' },
    },
  },
  'MyService'
);

// Вызов метода
this.exchange.send$(
  {
    from: 'MyService',
    to: 'MyComponent',
    source: {
      name: exchangeNameEnum.RunAction,
      data: { name: 'exch_doSomething', arguments: [1, 2, 3] },
    },
  },
  'MyService'
);
```

> Второй аргумент `send$` — имя отправителя (по умолчанию `'Не указано'`), используется только для логирования. Основное имя отправителя задаётся в поле `from` объекта `IExchangeSource`.

### Подписка в компоненте

```ts
import { Component, OnDestroy } from '@angular/core';
import { ExchangeSubscribeComponent, ExchangeLighthouse } from 'tool-exchange-ang15';

@Component({ ... })
export class MyComponent extends ExchangeSubscribeComponent implements OnDestroy {
  static readonly extendsClassName = 'MyComponent';

  exch_title = '';

  constructor(exchange: ExchangeLighthouse) {
    super(MyComponent.extendsClassName, exchange);
  }

  exch_doSomething(a: number, b: number, c: number): void {
    console.log(a, b, c);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
```

### Правила именования (обязательно)

Валидаторы (`ExchangeValidators`) в dev-режиме (`isLogLocalhost`) выбрасывают исключения при нарушении правил:

1. **`extendsClassName`** должен быть инициализирован и **точно совпадать** с именем класса-наследника (`self.constructor.name`).
2. **`ngOnDestroy`** должен быть реализован (класс `implements OnDestroy`) и содержать вызов **`super.ngOnDestroy()`**.
3. Имена свойств и методов, к которым адресуются сообщения, должны начинаться с префикса **`exch_`**.

### Адресация

| Значение `to`              | Получатели                          |
| -------------------------- | ----------------------------------- |
| `'MyComponent'`            | конкретный компонент                |
| `'forAllClasses'`          | все подписчики                      |
| `['A', 'B']`               | несколько адресатов                 |

Если `to` не указан (`null`/`undefined`), в лог пишется предупреждение, и сообщение игнорируется.

### Интерфейсы

```ts
interface IExchangeSource {
  from: string;              // имя класса-отправителя
  to: string | string[];     // адресат(ы) или 'forAllClasses'
  source: TExchangeSource;   // { name, data }
  tags?: string[];           // дополнительные теги
  options?: any;             // дополнительные опции
}

interface IChangeProperty {
  name: string;   // имя свойства (с префиксом exch_)
  value: any;     // новое значение
}

interface IAction {
  name: string;      // имя метода (с префиксом exch_)
  arguments: any[];  // аргументы вызова
}
```

## Модуль

Для использования в `NgModule`-приложении подключите `ToolExchangeAng15Module`:

```ts
import { ToolExchangeAng15Module } from 'tool-exchange-ang15';

@NgModule({
  imports: [ToolExchangeAng15Module],
})
export class AppModule {}
```

`ExchangeLighthouse` доступен через `providedIn: 'root'` — отдельная регистрация провайдера не требуется.

## Сборка

```bash
ng build tool-exchange-ang15
```

Артефакты — в `dist/tool-exchange-ang15`. Production-сборка использует `tsconfig.lib.prod.json` (`compilationMode: "partial"`).

## Публикация

```bash
cd dist/tool-exchange-ang15
npm publish
```

## Тесты

```bash
ng test tool-exchange-ang15
```

## Требования

- Angular 15.2+
- TypeScript (совместимый с Angular 15)
- `tool-log` ^0.0.18
