```markdown
# tool-exchange-ang15

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

- `ExchangeLighthouse` — сервис-«маяк» для отправки сообщений.
- `ExchangeSubscribeComponent` — базовый компонент для подписки на сообщения.
- Типы обмена: `ChangeProperty` (изменение свойства) и `RunAction` (вызов метода).

## Использование

### Отправка сообщения

```ts
import { ExchangeLighthouse, exchangeNameEnum } from 'tool-exchange-ang15';

constructor(private exchange: ExchangeLighthouse) {}

this.exchange.send$(
  {
    from: 'MyService',
    to: 'MyComponent',
    source: {
      name: exchangeNameEnum.ChangeProperty,
      data: { name: 'title', value: 'Новый заголовок' },
    },
  },
  'MyService'
);
```

### Подписка в компоненте

```ts
import { Component, OnDestroy } from '@angular/core';
import { ExchangeSubscribeComponent, exchangeNameEnum } from 'tool-exchange-ang15';

@Component({ ... })
export class MyComponent extends ExchangeSubscribeComponent implements OnDestroy {
  static readonly extendsClassName = 'MyComponent';

  constructor(exchange: ExchangeLighthouse) {
    super(MyComponent.extendsClassName, exchange);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
```

> `extendsClassName` должен совпадать с именем класса. В `ngOnDestroy` обязательно вызывать `super.ngOnDestroy()`.

### Адресация

- `to: 'MyComponent'` — конкретный компонент
- `to: 'forAllClasses'` — все подписчики
- `to: ['A', 'B']` — несколько адресатов

## Сборка

```bash
ng build tool-exchange-ang15
```

Артефакты — в `dist/tool-exchange-ang15`.

## Публикация

```bash
cd dist/tool-exchange-ang15
npm publish
```

## Тесты

```bash
ng test tool-exchange-ang15
```
```
