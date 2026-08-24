#!/usr/bin/env python3
"""
Собирает один самодостаточный HTML из статического экспорта: стили, шрифты,
скрипты и изображения уходят внутрь файла. Нужно только для показа вёрстки
в чате — к рабочему сайту отношения не имеет.
"""
import base64
import io
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out")
TARGET = os.path.join(ROOT, "preview-index.html")

html = open(os.path.join(OUT, "index.html"), encoding="utf-8").read()

# В песочнице предпросмотра (iframe без allow-same-origin) доступ к localStorage
# бросает SecurityError и роняет баннер cookie. Подменяем на хранилище в памяти.
LS_SHIM = (
    "<script>try{window.localStorage.getItem('t')}catch(e){var __m={};"
    "Object.defineProperty(window,'localStorage',{value:{"
    "getItem:function(k){return k in __m?__m[k]:null},"
    "setItem:function(k,v){__m[k]=String(v)},"
    "removeItem:function(k){delete __m[k]},clear:function(){__m={}}}})}</script>"
)
html = html.replace("<head>", "<head>" + LS_SHIM, 1)


def read(path_from_root: str) -> bytes:
    return open(os.path.join(OUT, path_from_root.lstrip("/")), "rb").read()


def data_uri(raw: bytes, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(raw).decode()}"


def shrink_image(path: str, max_width: int, quality: int) -> bytes:
    im = Image.open(io.BytesIO(read(path)))
    if im.mode == "RGBA":
        buf = io.BytesIO()
        if im.width > max_width:
            im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
        im.save(buf, "WEBP", quality=quality, method=6)
        return buf.getvalue()
    im = im.convert("RGB")
    if im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=quality, method=6)
    return buf.getvalue()


# 1. Стили + шрифты
def inline_css(match: re.Match) -> str:
    href = match.group(1)
    css = read(href).decode("utf-8")
    # Латиницу и кириллицу оставляем, расширенные наборы выкидываем ради веса
    css = re.sub(r"@font-face\s*\{[^}]*-(?:cyrillic|latin)-ext\.woff2[^}]*\}", "", css)

    def font_to_data(font_match: re.Match) -> str:
        url = font_match.group(1)
        return f"url({data_uri(read(url), 'font/woff2')})"

    css = re.sub(r"url\((/fonts/[^)]+\.woff2)\)", font_to_data, css)
    return f"<style>{css}</style>"


html = re.sub(r'<link rel="stylesheet" href="([^"]+\.css)"[^>]*/?>', inline_css, html)

# 2. Скрипты внутрь, предзагрузки убираем. Preload шрифтов и приоритетных
# картинок тоже вырезаем: их содержимое инлайнится, а внешние ссылки в
# самодостаточном файле дают только 404 в консоли.
html = re.sub(r'<link[^>]+rel="preload"[^>]+as="(?:script|image|font)"[^>]*>', "", html)
html = re.sub(r'<link[^>]+as="(?:script|image|font)"[^>]+rel="preload"[^>]*>', "", html)


def inline_js(match: re.Match) -> str:
    src = match.group(1)
    try:
        code = read(src).decode("utf-8")
    except FileNotFoundError:
        return ""
    # В коде React встречаются литералы "<script>" и "</script>". При инлайне
    # парсер HTML принимает их за настоящие теги и рвёт документ, поэтому
    # экранируем обратным слэшем: в строке JavaScript значение не меняется.
    code = code.replace("</script", "<\\/script").replace("<script", "<\\script")
    # Turbopack определяет имя чанка по атрибуту src текущего скрипта. У инлайнового
    # скрипта src нет — getAttribute возвращает null, и гидрация падает. Возвращаем
    # скрипту его исходный путь: на выполнение это не влияет, скрипт уже запущен.
    shim = f"document.currentScript&&document.currentScript.setAttribute('src','{src}');"
    return "<script>" + shim + code + "</script>"


html = re.sub(r'<script src="([^"]+\.js)"[^>]*></script>', inline_js, html)

# 3. Картинки
seen: dict[str, str] = {}


def inline_img(match: re.Match) -> str:
    path = match.group(1)
    if path not in seen:
        # Крупные кадры жмём мягче: hero и каркас видны на превью почти
        # в полную ширину, сильное сжатие делало их мыльными
        if "hero" in path or "karkas" in path:
            max_width, quality = 1300, 80
        elif "tech-" in path:
            max_width, quality = 480, 76
        else:
            max_width, quality = 720, 72
        raw = shrink_image(path, max_width, quality)
        seen[path] = data_uri(raw, "image/webp")
    return f'src="{seen[path]}"'


html = re.sub(r'src="(/(?:photos|brand)/[^"]+)"', inline_img, html)

open(TARGET, "w", encoding="utf-8").write(html)
size = os.path.getsize(TARGET) / 1024 / 1024
print(f"{TARGET}: {size:.1f} MB, изображений {len(seen)}")
if size > 9:
    print("ВНИМАНИЕ: файл великоват для предпросмотра", file=sys.stderr)
