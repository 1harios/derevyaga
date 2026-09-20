# Форма обратного звонка — предметная композиция

Новая цельная светлая панель: заголовок и предметный макет слева, компактная белая форма справа, социальные ссылки снизу. Чекбокс рекламной подписки удалён из общего ConsentFields; LeadForm явно передаёт marketingConsent: false. Согласие на обработку данных остаётся обязательным и не предустановлено.

Источники исследования:
- https://good-wooden.ru/form — заявка и альтернативные способы связи.
- https://education.gwd.ru/consultationarchitect — объяснение пользы консультации.

Изображение создано встроенным imagegen. Путь: public/photos/callback-house-cutout-v1.webp. Размер 1536 × 1024 px, настоящая прозрачность (alpha min 0), WebP quality 92. Оригинал: C:/Users/kkkar/.codex/generated_images/01a07bf9-6f28-7533-9d96-2e1e57d2b17d/exec-7ef5dcde-096c-4675-afec-27e7786decfc.png.

## Prompt
Create a premium photographic still-life cutout for a modern Russian timber home builder website consultation form. TRUE TRANSPARENT BACKGROUND alpha, no solid backdrop, no checkerboard. Landscape 3:2 composition. A meticulously crafted physical architectural model of a contemporary Scandinavian single-storey timber house, warm natural oak vertical cladding, realistic graphite standing seam gable roof, large clean glazing and a small timber entrance terrace. The model is on a thin warm white presentation board, with just two tactile natural oak material swatches and a subtly rolled architectural drawing beside it, no readable text. Three quarter front view, camera slightly above, house fills 80% canvas centered, fully contained no cropping. Soft natural studio daylight from upper left, refined realistic timber grain and metal, believable physical miniature photography, not cartoon, not glossy CGI, no floating pieces, no trees, no humans, no logos, no typography, no visual clutter. Gentle contact shadow with transparent outer edges. Elegant editorial architecture magazine art direction. This is an illustrative consultation graphic not a specific real project.

## Проверка
360, 390, 768, 1280 px без горизонтального переполнения. Один чекбокс согласия; текста рассылки нет. Валидация пустого телефона и отсутствующего согласия работает. Реальные заявки не отправлялись. ESLint и production-сборка прошли.

## Иконки и карта
В поле телефона и телефонной ссылке добавлены LuPhone, в шапке формы — предоставленный знак public/brand/derevyaga-mark-moss.png. Удалена надпись над основным заголовком. Авито переведён в currentColor (белый). В общий список ссылок добавлены Яндекс Карты. На /contacts заглушка заменена виджетом организации 134077346014, найденной по редиректу предоставленной ссылки https://yandex.by/maps/-/CTtWeQPD. Адресные данные компании не изменялись. Проверены мобильная ширина 390 px, отступ поля под иконку, логотип и отсутствие переполнения. ESLint и сборка прошли.
