# Изображения для акций

Режим: встроенный imagegen; инструмент не предоставляет выбор идентификатора модели. Изображения созданы для этого сайта, затем конвертированы в WebP без изменения композиции.

## offer-family-mortgage.webp

Файл: public/photos/offer-family-mortgage.webp

Использованы три приложенных пользователем изображения логотипов банков как референсы.

Промпт:

Use case: ads-marketing. Create a polished photographic campaign illustration for Russian timber-frame home builder Derevyaga. Landscape 3:2 image, quiet Scandinavian architectural aesthetic, warm cream, muted moss green, natural oak, charcoal metal roofs, soft natural light, no watermark. Not a UI mockup. A beautiful attainable single-storey finished dark moss timber house with a warm timber porch in a pine clearing, afternoon sun, foreground elegant large sculptural cream numerals '6%' beside a small house key on a stone ledge. This is a family mortgage promotion. In the LOWER 20% of the image include a crisp clean WHITE horizontal strip containing THREE bank logos reproduced faithfully from the provided references, in order: Банк ДОМ.РФ, СБЕРБАНК, Альфа-Банк. Preserve their original wordmark letterforms and colors, no rebranding, balanced equal visual weight and wide spacing. Logos must be sharp, fully visible and readable, not on tilted objects. No other lettering. Image 1 DOM.RF logo reference; image 2 Sberbank logo reference; image 3 Alfa-Bank logo reference.

## offer-delivery.webp

Файл: public/photos/offer-delivery.webp

Новая генерация без референсов.

Промпт:

Use case: ads-marketing. Create a polished photographic campaign illustration for Russian timber-frame home builder Derevyaga. Landscape 3:2 image, quiet Scandinavian architectural aesthetic, warm cream, muted moss green, natural oak, charcoal metal roofs, soft natural light, no watermark. Not a UI mockup. A refined moss-green flatbed delivery truck transporting neatly wrapped timber-frame house panels and stacked dry wood toward a modern one-storey dark-green timber house in a pine forest. Three-quarter side view, truck and load are main subjects, believable proportions, tidy construction access road, no people. Warm morning light. Premium editorial photo, appealing clean delivery scene. No text, no numbers, no logos. Truck fits entirely in frame with generous margins. Leave upper left calm forest background for a small HTML badge.

## offer-planning.webp

Файл: public/photos/offer-planning.webp

Новая генерация без референсов.

Промпт:

Use case: ads-marketing. Create a polished photographic campaign illustration for Russian timber-frame home builder Derevyaga. Landscape 3:2 image, quiet Scandinavian architectural aesthetic, warm cream, muted moss green, natural oak, charcoal metal roofs, soft natural light, no watermark. Not a UI mockup. Close-up editorial tabletop architectural planning scene on a warm pale oak desk: a beautiful realistic small scale model of a Scandinavian moss-green timber house with graphite gable roof, precise floor plan drawings on cream paper, mechanical pencil, muted sage material swatch. Window light, soft forest blurred background, photorealistic tactile materials. The house model and floorplan are equally important, communicate personalized home planning. No people, no legible text, no numerical labels, no logos. Landscape 3:2, generous composition, unified moss cream oak palette.

## Реализация

Главная: блок #promotions. Страница: /promotions. Старый адрес /technology перенаправляется кодом 308. Третье предложение — адаптация планировки при заказе строительства. Условия указаны рядом с каждым предложением.

Форма передаёт promotion-family-mortgage, promotion-delivery или promotion-planning в существующий API заявок; для amoCRM добавлены русские названия сделок и теги. Для фактической доставки заявок нужна настройка существующей интеграции amoCRM.

