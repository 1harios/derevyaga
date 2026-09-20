# Страницы домов — 14 сентября 2026

Общий шаблон всех восьми проектов: галерея без дублей, шесть параметров, особенности из highlights, интерактивный состав и способы покупки. Исходные фасады сохранены. Цена остаётся priceFrom; ставки за м² не используются. Состав категорий ссылается на includes общего модуля complectations.ts; исключения берутся из выбранного пакета и neverIncluded. Лестница скрыта для одноэтажных проектов.

## Хиты в amoCRM

Локально hit: sosnovka-96, ladoga-132, vuoksa-118, toksovo-78. В уже заполненном каталоге amoCRM вручную открыть Вуоксу и Токсово, установить «Метка → Хит», сохранить. Порядок задаётся полем «Порядок отображения». Существующие настройки публикации сохранить. Массовую синхронизацию/заполнение каталога не запускать. Витрина фильтрует только hit, не добавляет другие дома. Серверный API и formType project-page, projectSlug, area сохранены.

## Генерация

Встроенный imagegen, отдельный запрос на каждый объект. WebP 600 px, quality 90, alphaQuality 100. Sharp подтвердил hasAlpha=true, isOpaque=false для всех шести.

### foundation

Путь: public/images/complectation/foundation.webp

Исходник: C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-ce5bdf0a-4bd5-4071-934e-89519be0084b.png

Промпт: Premium architectural material sample product photograph, square 1024x1024, true transparent alpha background. One isolated construction sample centered with generous margin, consistent three-quarter view from slightly above, soft studio daylight, realistic tactile materials, restrained sage timber graphite palette. No text, no labels, no people, no floor background, no checkerboard. Not a whole building. Subject: two black steel screw foundation piles connected by a real timber foundation beam, neatly cut demonstrator showing screw helices

### frame

Путь: public/images/complectation/frame.webp

Исходник: C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-733b695f-00c1-4886-9c1d-782db4d69579.png

Промпт: Premium architectural material sample product photograph, square 1024x1024, true transparent alpha background. One isolated construction sample centered with generous margin, consistent three-quarter view from slightly above, soft studio daylight, realistic tactile materials, restrained sage timber graphite palette. No text, no labels, no people, no floor background, no checkerboard. Not a whole building. Subject: small corner section of real timber frame wall with a few vertical dry timber studs, partial sage painted horizontal timber cladding

### roof

Путь: public/images/complectation/roof.webp

Исходник: C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-b0b7e252-8673-4ddd-9b97-358b4d343b6a.png

Промпт: Premium architectural material sample product photograph, square 1024x1024, true transparent alpha background. One isolated construction sample centered with generous margin, consistent three-quarter view from slightly above, soft studio daylight, realistic tactile materials, restrained sage timber graphite palette. No text, no labels, no people, no floor background, no checkerboard. Not a whole building. Subject: small roof construction sample with graphite metal tile roofing, timber battens and short gutter segment, clean cut edges

### insulation

Путь: public/images/complectation/insulation.webp

Исходник: C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-8e8014a3-a0da-4779-99ea-f825493b8ae9.png

Промпт: Premium architectural material sample product photograph, square 1024x1024, true transparent alpha background. One isolated construction sample centered with generous margin, consistent three-quarter view from slightly above, soft studio daylight, realistic tactile materials, restrained sage timber graphite palette. No text, no labels, no people, no floor background, no checkerboard. Not a whole building. Subject: cutaway timber wall panel showing golden mineral wool between wooden studs, membrane layers slightly exposed

### windows

Путь: public/images/complectation/windows.webp

Исходник: C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-cf371ec9-e5b0-4e32-b8d8-2e0ae139b55d.png

Промпт: Premium architectural material sample product photograph, square 1024x1024, true transparent alpha background. One isolated construction sample centered with generous margin, consistent three-quarter view from slightly above, soft studio daylight, realistic tactile materials, restrained sage timber graphite palette. No text, no labels, no people, no floor background, no checkerboard. Not a whole building. Subject: one white framed glazed window and one graphite entrance door standing beside it, isolated real product samples

### engineering

Путь: public/images/complectation/engineering.webp

Исходник: C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-08a2f0d9-8798-46ec-80f6-2635f5043c42.png

Промпт: Premium architectural material sample product photograph, square 1024x1024, true transparent alpha background. One isolated construction sample centered with generous margin, consistent three-quarter view from slightly above, soft studio daylight, realistic tactile materials, restrained sage timber graphite palette. No text, no labels, no people, no floor background, no checkerboard. Not a whole building. Subject: neatly arranged material sample of white wall finish, warm oak floor board, short plumbing pipe and small white electrical socket, realistic product photography


## Проверка

ESLint и production-сборка прошли 14.09.2026 (48 маршрутов). Все восемь домов, главная, каталог и калькулятор проверены на ширинах 360, 390, 768, 1280: горизонтального переполнения и текста «Цена актуальна» нет. Проверены 18 сочетаний категории/пакета, выбор Enter, галереи Рощино и Корелы, стрелки, Escape и возврат фокуса. WebP имеют настоящий альфа-канал.

Форма проверена через scripts/preview-promotions-mock.mjs, порт 3001: реальных заявок нет. Ладога: project-page, ladoga-132, area 132 — успешная заявка. Токсово: project-page, toksovo-78, area 78 — ответ 503 и сообщение об ошибке с телефоном. Проверены пустой телефон, обязательное согласие и состояние «Отправляем…». Тестовый прокси перехватывает POST /api/lead, остальные записи блокирует.

Для локального dev-просмотра Next разрешён origin 127.0.0.1. После перезапуска проверена интерактивность по исходному адресу http://127.0.0.1:3000. Каталог amoCRM не изменялся.

## Уточнение дизайна: готовый дом

Выбор трёх комплектаций удалён: категории показывают состав turnkey из общего справочника. Название первого экрана сокращено до имени проекта; фото и панель растягиваются в одном ряду, миниатюры размещены поверх фотографии. Галерея расширена до 1600 px, добавлены масштаб 2× с прокруткой и свайп. Особенности перенесены в описание с иконками.

Для настоящих планов добавлено необязательное поле Project.floorPlans (src, alt). Утверждённых чертежей в проекте нет: вместо выдуманных схем показан запрос планировки. После получения файлов их можно подключить к общей галерее через floorPlans.

Блок покупки: новая интерьерная фотография public/photos/project-purchase-interior.webp, встроенный imagegen. Исходник: C:/Users/kkkar/.codex/generated_images/01a07bf9-6f28-7533-9d96-2e1e57d2b17d/exec-67fa0a7c-472b-4475-ac9e-abfb51e35081.png.
Промпт: Photorealistic premium Scandinavian country house interior editorial photograph, horizontal 3:2 composition. Quiet refined living room, warm oak wall panels, ivory linen sofa, large floor to ceiling windows to sunlit pine forest, soft late afternoon daylight, subtle sage green accents, authentic lived-in natural materials, restrained expensive architectural photography, no CGI look, no people, no text or logos. Sofa and forest window on right two thirds, left third darker warm wood with generous clean space for white website typography overlay. Realistic perspective, crisp timber grain.

Проверены 360/390/768/1280, нет горизонтального переполнения; масштаб галереи, Escape и возврат фокуса работают. ESLint и production-сборка успешны.

## Возврат карточек и новая галерея

Категории снова отдельными округлыми карточками с зелёным выделением, анимацией наведения и появления состава (prefers-reduced-motion отключает анимацию). Блок «Что рассчитывается отдельно» удалён. Миниатюры возвращены под основное фото.

Галерея: тёмный фон, оригинальное изображение без дополнительного сжатия Next, масштаб 100–400%, кнопки +/−, колесо, двойное нажатие, перетаскивание, сброс, клавиши +/−/0, стрелки и Escape. Переключение кадра сбрасывает масштаб и смещение. Проверены масштаб 200%, перетаскивание 100px, сброс и возврат фокуса.

Временный эскиз для Рощино: public/photos/roshchino-plan-demo.webp. Помечен как пример, не рабочий чертёж. Для замены добавить утверждённые изображения в floorPlans проекта: они имеют приоритет над временным эскизом. Правый блок использует те же колонки, что верхняя фотография.

Проверены ширины 360, 390, 768, 1280: без горизонтального переполнения. ESLint и production-сборка успешны.

## Правки по четырём комментариям

Миниатюры: радиус 8 px. Видимая подпись временного плана удалена; происхождение эскиза сохранено в документации и alt. На десктопе план растягивается по высоте описания (проверено: 398 px у описания, 396 px внутри рамки плана); на телефоне сохраняет пропорции. Карточка скидки переработана: крупные −10%, двухстрочный заголовок и тёмная кнопка условий. Ширины 360/390/768/1280 без горизонтального переполнения. ESLint и production-сборка проходят.

## Акции на страницах домов
Прежний блок способов покупки заменён общим PromotionsBlock с пятью действующими акциями и существующими модальными окнами. Якорь #purchase сохранён. У секции комплектации убран верхний padding: остаётся один стандартный отступ после описания и планировки.
Проверено в браузере: 360, 390, 768, 1280 px без горизонтального переполнения; открытие акции доставки, Escape и возврат фокуса на баннер. Реальные заявки не отправлялись.

## Четыре акции и форма обратного звонка
На главной и страницах домов PromotionsBlock показывает первые четыре акции. Страница /promotions сохраняет все пять. Похожие проекты: четыре ближайших по площади, без текущего дома.
Основной CTA переименован в «Заказать звонок». FinalCta переработан: текст и фото, форма обратного звонка, отдельная полоса со всеми пятью социальными ссылками. Идентификаторы форм и привязка проекта сохранены. Отказ от cookie сохраняет только обязательные cookie, аналитика не разрешается.
Проверены 360, 390, 768, 1280 px, количество акций и похожих проектов, валидация пустой формы без отправки и кнопка отказа от cookie. ESLint и production build прошли.

### Исходники баннеров для Photoshop
Все файлы: 1536 × 1024 px, соотношение 3:2, WebP. Для редактирования сохранить этот размер и профиль sRGB. Важные надписи держать с отступом около 6% от краёв. Логотипы банков размещаются отдельно средствами сайта в нижней части ипотечного баннера.
- public/photos/promotion-mortgage-v5.webp
- public/photos/promotion-delivery-v5.webp
- public/photos/promotion-planning-v5.webp
- public/photos/promotion-cash-discount-v5.webp
- public/photos/promotion-metal-door-v5.webp (только полный список акций)
