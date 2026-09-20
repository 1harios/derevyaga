# Акции: баннеры и модальные окна

Генерация: встроенный imagegen (выбор идентификатора модели инструментом не предоставляется). Формат 3:2, WebP quality 90. Надписи — HTML, логотипы — оригинальные приложения пользователя без перерисовки. Исходные файлы логотипов скопированы в public/brand/bank-{domrf,sber,alfa}.png; пустые поля скрываются CSS.

## mortgage

Файл: public/photos/promotion-mortgage-v2.webp

Промпт:

Use case: ads-marketing. Generate one photorealistic premium Russian timber-frame house campaign background, landscape 3:2. Vivid appealing sunlit colors, lush green landscaping, clear blue sky, honey timber, moss green facades, aspirational yet attainable Scandinavian architecture. Crisp editorial advertising photograph. NO text, NO numbers, NO logos, NO watermarks, no UI. This is a background for a banner with live white typography placed in upper left 55% of frame: keep that area calm and darker green-blue enough for white lettering; main subject in lower right, all essential objects within frame. Beautiful finished single-storey moss-green wooden home with graphite gabled metal roof and welcoming honey-colored timber porch in a lush pine garden. Three-quarter architectural view, warm late afternoon sunshine, tall pines and rich azure sky. House dominates lower right two-thirds, upper left is clear blue sky fading into shaded pines. Bottom 14% will be covered by an HTML white bank logo strip. No people.

## delivery

Файл: public/photos/promotion-delivery-v2.webp

Промпт:

Use case: ads-marketing. Generate one photorealistic premium Russian timber-frame house campaign background, landscape 3:2. Vivid appealing sunlit colors, lush green landscaping, clear blue sky, honey timber, moss green facades, aspirational yet attainable Scandinavian architecture. Crisp editorial advertising photograph. NO text, NO numbers, NO logos, NO watermarks, no UI. This is a background for a banner with live white typography placed in upper left 55% of frame: keep that area calm and darker green-blue enough for white lettering; main subject in lower right, all essential objects within frame. A handsome moss-green flatbed delivery truck carrying neatly bundled timber wall panels, parked in front of a beautiful contemporary wooden family house. Truck fully visible in lower half, perspective believable, lush lawn, sunny driveway. House in right background, bright blue sky and green trees above. Upper left third kept calm forest shade for white headline. Not a dusty construction site: clean, beautiful, welcoming.

## planning

Файл: public/photos/promotion-planning-v2.webp

Промпт:

Use case: ads-marketing. Generate one photorealistic premium Russian timber-frame house campaign background, landscape 3:2. Vivid appealing sunlit colors, lush green landscaping, clear blue sky, honey timber, moss green facades, aspirational yet attainable Scandinavian architecture. Crisp editorial advertising photograph. NO text, NO numbers, NO logos, NO watermarks, no UI. This is a background for a banner with live white typography placed in upper left 55% of frame: keep that area calm and darker green-blue enough for white lettering; main subject in lower right, all essential objects within frame. An exquisite realistic architectural scale model of a warm timber and moss-green modern family home, with removable roof revealing elegantly laid out rooms, on large ivory floor-plan paper on a warm oak studio table. Model dominates lower right two-thirds, sharp beautiful wood textures, lush garden visible through sunlit window in upper right background. Upper left third is a softly blurred deep green studio wall for white headline. Bright sunlight across the model, rich saturated greens and honey tones. No legible labels or numbers on plan.

## Проверка формы без отправки заявок

Запустить основной сайт на 3000, затем `node scripts/preview-promotions-mock.mjs` и открыть порт 3001. Все POST /api/lead перехватываются: planning возвращает 503, остальные акции — 200 с задержкой 2.5 секунды. Другие записи блокируются. Персональные данные не записываются в лог. Фикстура не включается в production и не пересылает заявки в CRM.

## Навигация

Карточка добавляет hash акции в историю. Назад закрывает окно, Вперёд открывает его снова. Прямые ссылки /promotions#family-mortgage, #delivery, #planning сохранены; закрытие прямой ссылки оставляет страницу акций. Формы используют прежние значения promotion-*.

## Выполненные проверки — 13.09.2026

- ESLint изменённых компонентов, данных и тестовой фикстуры: без ошибок. Production-сборка: успешно.
- Ширины 360, 390, 768, 1280: соответственно 1, 1, 2, 3 колонки; горизонтального переполнения нет. Баннеры сохраняют 3:2.
- Визуально проверены баннеры, логотипы, зелёный экран при наведении и клавиатурном фокусе, мобильное и настольное окно.
- Открыты все три акции; проверены Escape, крестик, подложка, Назад/Вперёд, возврат фокуса, удержание фокуса в диалоге и блокировка прокрутки.
- Прямые ссылки на ипотеку и доставку открывают нужный диалог. Акция с главной открывается без ухода на другую страницу, закрытие возвращает #promotions.
- Изолированная форма: пустой телефон и отсутствие согласия показывают ошибки, кнопка блокируется во время отправки, доставка получает тестовый успех, планировка — тестовую ошибку 503 с возможностью повторить. В логах фикстуры подтверждены promotion-delivery и promotion-planning; ипотечная форма использует promotion-family-mortgage. Реальные заявки не отправлялись; тестовый сервер остановлен.
- Правило prefers-reduced-motion отключает CSS-переход; системная настройка пользователя не менялась. Ошибок JavaScript в просмотре основного сайта не обнаружено.
