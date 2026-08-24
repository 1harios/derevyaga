#!/usr/bin/env python3
"""
Загружает Roboto и Inter в проект и пересобирает блок @font-face.

Зачем скрипт: бриф запрещает подключать шрифты со стороннего CDN, поэтому файлы
woff2 лежат в public/fonts, а правила @font-face вписаны прямо в globals.css —
так они попадают в критический CSS без лишнего запроса.

Запуск:
    python3 scripts/fonts.py

Что делает:
1. Берёт с fonts.googleapis.com описание нужных начертаний.
2. Скачивает подмножества cyrillic, cyrillic-ext, latin, latin-ext в public/fonts.
3. Пишет public/fonts/fonts.css (справочная копия правил).
4. Заменяет блок @font-face в src/app/globals.css на свежий.

Добавляете начертание — правьте FAMILIES и перезапускайте скрипт.
"""
import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS_DIR = os.path.join(ROOT, "public", "fonts")
GLOBALS_CSS = os.path.join(ROOT, "src", "app", "globals.css")

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}

# Подмножества, которые оставляем. Остальные (греческий, вьетнамский) не нужны.
KEEP_SUBSETS = {"cyrillic", "cyrillic-ext", "latin", "latin-ext"}

# Onest — заголовки и интерфейс обычным регистром, Inter — основной текст.
# Начертания Inter 300, 400 и 500 из брифа сохранены. Оба с кириллицей.
FAMILIES = [
    ("Onest", "Onest:wght@400;500;600", "onest"),
    ("Inter", "Inter:wght@300;400;500", "inter"),
]

HEADER = (
    "/* ФИРМЕННЫЕ ШРИФТЫ — локальные файлы из /public/fonts, сторонний CDN не используется.\n"
    "   Блок сгенерирован скриптом scripts/fonts.py, править вручную не нужно. */"
)


def fetch(url: str) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()


def build_rules() -> list[str]:
    rules: list[str] = []

    for family, spec, slug in FAMILIES:
        css = fetch(f"https://fonts.googleapis.com/css2?family={spec}&display=swap").decode()
        blocks = re.findall(r"/\*\s*([a-z\-]+)\s*\*/\s*@font-face\s*\{(.*?)\}", css, re.S)

        for subset, body in blocks:
            if subset not in KEEP_SUBSETS:
                continue

            weight = re.search(r"font-weight:\s*(\d+)", body).group(1)
            source = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)", body).group(1)
            unicode_range = re.search(r"unicode-range:\s*([^;]+);", body).group(1).strip()

            filename = f"{slug}-{weight}-{subset}.woff2"
            path = os.path.join(FONTS_DIR, filename)
            if not os.path.exists(path):
                with open(path, "wb") as handle:
                    handle.write(fetch(source))
                print(f"скачан {filename}")

            rules.append(
                "@font-face {\n"
                f"  font-family: '{family}';\n"
                "  font-style: normal;\n"
                f"  font-weight: {weight};\n"
                "  font-display: swap;\n"
                f"  src: url('/fonts/{filename}') format('woff2');\n"
                f"  unicode-range: {unicode_range};\n"
                "}"
            )

    return rules


def main() -> None:
    os.makedirs(FONTS_DIR, exist_ok=True)
    rules = build_rules()

    with open(os.path.join(FONTS_DIR, "fonts.css"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(rules) + "\n")

    css = open(GLOBALS_CSS, encoding="utf-8").read()
    block = HEADER + "\n" + "\n".join(rules) + "\n"

    # Заменяем всё от заголовка блока до @theme — там и только там живут шрифты
    pattern = re.compile(r"/\* ФИРМЕННЫЕ ШРИФТЫ.*?(?=@theme\s*\{)", re.S)
    if not pattern.search(css):
        raise SystemExit(
            "В globals.css не найден блок шрифтов. Проверьте, что заголовок "
            "«/* ФИРМЕННЫЕ ШРИФТЫ» на месте, и запустите скрипт снова."
        )

    open(GLOBALS_CSS, "w", encoding="utf-8").write(pattern.sub(block + "\n", css))
    print(f"правил @font-face: {len(rules)}, файлов в public/fonts: {len(os.listdir(FONTS_DIR)) - 1}")


if __name__ == "__main__":
    main()
