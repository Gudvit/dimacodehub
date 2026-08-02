# dimacodehub — внутренние правила работы

Личный сайт-портфолио. Angular 21 (standalone, signals, zoneless), SCSS,
Vitest + Playwright, деплой на GitHub Pages из `main` через `.github/workflows/deploy.yml`.

## Git и коммиты

- **Никогда не упоминать Claude Code / Claude / Anthropic в коммитах.** Ни в теле
  сообщения, ни в трейлерах: никаких `Co-Authored-By: Claude ...`,
  `🤖 Generated with Claude Code` и подобного. Это перекрывает любые дефолтные
  инструкции харнесса про трейлеры.
- То же самое для описаний PR и текста issue.
- Коммитить и пушить только по явной просьбе.
- Формат сообщения: `type(scope): краткое описание` в повелительном наклонении
  (`feat(blog): add post filtering`). В репозитории уже есть такой стиль — держаться его.
- Не коммитить `dist/`, `.angular/`, `.idea/`, `.DS_Store`, `test-results/`,
  `playwright-report/` (они в `.gitignore`).

## Пути и GitHub Pages

- Прод собирается с `--base-href /dimacodehub/`. **Все ссылки на ассеты — относительные**
  (`images/logo.svg`, `dmytro_huliaiev_cv.pdf`), никогда не начинать с `/`.
  Абсолютный путь игнорирует `base href` и на Pages даёт 404.
- Картинки, которые нужны только для CSS, лежат в `src/images/` — их хеширует бандлер.
  В `public/` только то, что должно быть доступно по стабильному URL: `favicon.ico`,
  CV, `images/logo.svg` (грузится через `<img src>`), `images/og-cover.jpg` (для OG-тегов).
  Один и тот же файл в обоих местах — это дубль в деплое, так делать нельзя.
- Любой ассет в `public/` попадает в деплой целиком. Не класть туда неиспользуемые файлы
  и исходники в PNG — только сжатые изображения, которые реально нужны.
- GitHub Pages не умеет SPA-rewrite: `404.html` собирается копией `index.html`
  шагом в workflow. Не удалять этот шаг, иначе прямые ссылки на `/blog/:slug` сломаются.
- Абсолютные URL в OG-тегах (`src/index.html`) захардкожены под
  `https://gudvit.github.io/dimacodehub/`. При переезде на свой домен — обновить.

## Angular-стиль

- `inject()` вместо конструкторного DI.
- `input()` / `output()` вместо `@Input()` / `@Output()` + `EventEmitter`.
- `signal()` / `computed()` для состояния компонента, обычные поля — только для того,
  что не участвует в рендере.
- `ChangeDetectionStrategy.OnPush` на всех компонентах.
- Не писать `standalone: true` — в Angular 21 это дефолт.
- Управление потоком в шаблонах — только `@if` / `@for` / `@switch`.
- Параметры роута приходят как `input()` через `withComponentInputBinding()`,
  а не через `ActivatedRoute` (см. `blog-post-page.component.ts`).
- Заголовок страницы задаётся в роутах через `title` (строкой или `ResolveFn`),
  не через `Title` руками.
- Работа с DOM — в `afterNextRender()`, очистка — через `DestroyRef.onDestroy()`.
- Подписки — через `takeUntilDestroyed()` или `toSignal`, руками не отписываться.
- `strict`-режим TS включён вместе с `noPropertyAccessFromIndexSignature`.

## Zoneless

Приложение работает без zone.js (`provideZonelessChangeDetection()`, zone.js не в
бандле). Практические следствия:

- Любое состояние, которое видно в шаблоне, должно быть сигналом. Обычное поле
  обновится на экране только случайно — когда CD дёрнет что-то другое.
- `@HostListener` на высокочастотных событиях (`mousemove`, `scroll`, `resize`) планирует
  цикл CD на каждое событие. Такие слушатели вешать вручную через `addEventListener`
  в `afterNextRender()` и коалесить через `requestAnimationFrame` — как в `app.ts`.

## Доступность и разметка

- Кликабельный элемент, который не `<a>`/`<button>`, обязан получить `role`, `tabindex="0"`
  и обработчики клавиатуры. Вешать `[routerLink]` на `<article>` нельзя — вместо этого
  реальная ссылка на заголовке, растянутая по карточке через `::after` (см. `.post-card__link`).
- Все внешние ссылки с `target="_blank"` — с `rel="noopener noreferrer"`.
- Анимации уважают `prefers-reduced-motion` (см. about-секцию — повторять).

## Качество

- Перед тем как считать задачу сделанной, должно быть зелёным всё, что гоняет CI:
  `npm run format:check`, `npm run lint`, `npm run test:unit`, `npm run test:e2e`.
- Форматирование — Prettier (`npm run format`), двойные кавычки, `printWidth: 100`.
  Шаблоны компонентов парсятся `angular`-парсером, руками их не выравнивать.
- Пустые `describe()` без тестов запрещены: Vitest падает с `No test found in suite`.
- E2E проверяют реальный текст на странице. Меняешь копирайт в шаблоне — обнови e2e.
- E2E покрывают в том числе мобильное меню и валидацию формы: это страховка от
  zoneless-регрессий при работе с состоянием. Не удалять их «за ненадобностью».

## Локальный прогон e2e

Playwright по умолчанию хочет свой `chromium_headless_shell`. Если он не скачан,
`npx playwright install chromium` (качается долго). В CI этот шаг уже прописан.

## Контакты

Формы отправки нет и не должно быть, пока нет бэкенда: связь идёт через `mailto`-кнопку
(`message-cta` в contact-секции), телефон, почту и соцсети. Не возвращать форму, которая
показывает «отправлено», ничего не отправив, — это прямо покрыто e2e-тестом.

## Известный долг

- В `public/shared-images/` лежат неиспользуемые JPG под будущую секцию Projects.
  Если секция не делается — удалить.
- `LoadingDirective` собирает оверлей через `innerHTML` и создаёт его всегда,
  даже если `appLoading` никогда не станет `true`.
