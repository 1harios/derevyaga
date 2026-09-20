# Акции — версия 5

## Реализация
Пять баннеров 3:2, сетка 4/2/1 (четыре колонки от 1200 px, две от 640 px), радиус и промежутки 12 px. Прозрачные WebP для ипотеки и двери размещены на #f5f2eb. Надписи находятся в изображениях; оригинальные логотипы банков добавлены отдельно. Генерация: встроенный imagegen, без переключения на CLI; инструмент не предоставляет выбор идентификатора модели.

На главной акции перенесены сразу после Hero на место удалённого MortgageBanner. Заголовок преимуществ заменён на «Строим надёжно и в срок» со стандартными стилями h2. Краткие описания для наведения отделены от полных описаний окна. В Modal добавлен явный цикл Tab/Shift+Tab.

Новые заявки: promotion-cash-discount и promotion-metal-door. Скидка 10% от всей стоимости дома только за наличные. Модель двери и участвующая комплектация согласуются индивидуально. Старые условия не изменены.

## Изображения и промпты

## Проверки 2026-09-14

- ESLint для изменённых TS/TSX файлов: успешно. Production-сборка: успешно, 48 страниц.
- Главная и /promotions: ширины 360, 390, 768, 1280 px, колонки 1/1/2/4, горизонтального переполнения нет; описания наведения помещаются.
- Заголовки преимуществ и акций имеют одинаковые вычисленные размеры на всех четырёх ширинах. Старый ипотечный блок отсутствует.
- Все пять изображений и три оригинальных логотипа загружаются. У mortgage и metal-door подтверждены alpha и не полностью непрозрачные пиксели; WebP 1536×1024.
- Прямые ссылки всех пяти акций открывают соответствующее окно; Escape, подложка, крестик, Back/Forward проверены. Tab/Shift+Tab замыкаются внутри; после закрытия фокус возвращается на баннер.
- scripts/preview-promotions-mock.mjs на 3001 перехватил пять POST /api/lead: cash-discount, metal-door, family-mortgage, delivery — успех; planning — ожидаемая ошибка 503. Реальные заявки не отправлялись.
- Проверены ошибки пустого телефона и обязательного согласия, заблокированная кнопка «Отправляем…» и сообщение ошибки сервиса. Лог: reports/promotions-v5-mock.log.
- Системное уменьшение анимации поддержано CSS media query, отключающим transition; переключение системной настройки вручную не выполнялось.

### Исходные промпты

### mortgage

- Исходник: `C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-2013ebd3-9f90-4893-98c1-06c01b61c465.png`
- Файл сайта: `public/photos/promotion-mortgage-v5.webp`

```text
Create a premium REAL PHOTOGRAPHIC advertising banner, landscape 3:2, 1536x1024. TRANSPARENT BACKGROUND with actual alpha, not white, not checkerboard. A cutout of the corner of a genuine Scandinavian timber house occupies the right 46% and lower right, natural dark sage painted wooden siding with visible grain, real standing seam roof and window reflecting blue sky, believable architectural photography in bright soft daylight. House is cropped by right and bottom edge. Left side contains exact Russian typography in very dark forest green, bold clean sans serif: 'СЕМЕЙНАЯ' then 'ИПОТЕКА' then smaller 'НА СТРОИТЕЛЬСТВО'. Below massive '6%'. Position text within x=6% to 55%, y=10% to 70%. Keep bottom left 24% of height completely transparent for original bank logos to be inserted externally. Typography must be flawless, editorial layout, no other words, NO bank logos, no button, no decorative sparkles, no 3D render or illustration. The transparent image will sit on a warm off-white website background. Treat house as a photographic cutout, not miniature.
```

### delivery

- Исходник: `C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-9516e5a0-9c1d-4969-9a08-3e565172ba4e.png`
- Файл сайта: `public/photos/promotion-delivery-v5.webp`

```text
Premium editorial advertising banner for timber home construction, 3:2 landscape 1536x1024. Photorealistic documentary photograph, real textures, crisp natural daylight, restrained rich greens, beautiful calm composition. On right and lower half a real flatbed delivery truck carrying securely strapped timber wall panels at a rural construction site, a truck-mounted crane unloading one timber panel, realistic rigging and proportions, finished modern timber house in background right, birches. Left upper half is softly sunlit pale blue sky and uncluttered treeline giving space to enormous readable dark forest-green bold sans-serif Russian typography, exact four lines: 'ДОСТАВКА' 'ДОМОКОМПЛЕКТА' 'В ПОДАРОК'. Keep long word fully inside frame with generous 6% side margins. Premium print campaign art direction, not glossy CGI, not a model toy truck, no imaginary architecture, no other words, no logos, no buttons. Make the typography occupy top 45% with truck clearly visible below. Full bleed photo.
```

### planning

- Исходник: `C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-3e1a1aac-8563-4141-9b74-7f756755a436.png`
- Файл сайта: `public/photos/promotion-planning-v5.webp`

```text
Premium advertising banner, 3:2 landscape 1536x1024, REAL still-life architectural photography, overhead flat lay of real paper floor plans, a few real oak and sage-painted timber material swatches, graphite pencils and a small metal ruler on warm ivory desk. Composition: objects spread only in lower half and right side, paper plans partially cropped bottom right with authentic fine technical lines, beautiful natural sun from side giving gentle tangible shadows, materials look tactile and used by an architect, NO miniature house, NO people, NO CGI. Upper left large dark forest green bold editorial sans-serif typography in exact Russian: 'ПЛАНИРОВКА' / 'ПОД ВАШУ СЕМЬЮ'. Beneath a forest-green simple horizontal block containing white words 'В ПОДАРОК'. Safe margins 7%. Clean warm editorial product photograph, elegant magazine campaign, very readable text. No additional words, no logos, no buttons.
```

### cash-discount

- Исходник: `C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-4799bec2-65a8-46e0-af86-923ff155a5b6.png`
- Файл сайта: `public/photos/promotion-cash-discount-v5.webp`

```text
Premium understated editorial real estate advertising banner 3:2 landscape 1536x1024. Flat solid brand sage forest green background exact #4e6254. Extremely large beautiful ivory bold sans serif typography '−10%' occupies upper left and center, with exact Russian headline below on two lines: 'ЗА НАЛИЧНЫЙ' 'РАСЧЁТ'. Text takes left 72%, margins7%, deliberate sophisticated Swiss editorial spacing. In bottom right a photorealistic set of TWO real brushed-metal house keys on a simple ring with small warm oak rectangular key fob, natural believable metal reflections and subtle contact shadow on green surface. Keys are secondary, do not obscure lettering, no CGI plastic look, no gold, no money, no ribbons, no sparkles, no other text, no logo, no button. Premium commercial still-life photography combined with clean flat graphic design.
```

### metal-door

- Исходник: `C:\Users\kkkar\.codex\generated_images\01a07bf9-6f28-7533-9d96-2e1e57d2b17d\exec-d5252285-4cee-48cc-9ccf-6628c9696ba3.png`
- Файл сайта: `public/photos/promotion-metal-door-v5.webp`

```text
Create premium advertising banner 3:2 landscape 1536x1024 with ACTUAL TRANSPARENT ALPHA background, no white painted background and no checkerboard. Photographic cutout of ONE realistic closed graphite-grey metal entrance door in its matching frame on right 40% of canvas. Straight-on product photography, normal realistic door proportions, powder-coated steel subtle texture, restrained narrow vertical recessed detailing, believable handle and locks, no windows, no brand. Door top at8%, bottom92%, not cropped, natural soft studio lighting, slight natural shadow beneath. On left use very dark forest green clean bold sans-serif Russian typography exact: 'МЕТАЛЛИЧЕСКАЯ' / 'ДВЕРЬ' / 'В ПОДАРОК'. Long word fully readable, fit in left55%, 6% side margins. Two-line headline plus gift phrase below with generous breathing room. No extra claims, no extra text, no ribbons, no bows, no gold, no CGI illustration. The transparent banner will be placed on warm ivory by the website. Real product photograph with beautifully composed typography, no background.
```
