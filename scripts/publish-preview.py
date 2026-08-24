#!/usr/bin/env python3
"""
Самодостаточный HTML для КАЖДОЙ страницы статического экспорта — чтобы
опубликовать весь сайт как набор интерактивных превью со сквозной навигацией.

Обобщение inline-preview.py: стили, шрифты, скрипты и изображения инлайнятся
в каждую страницу (кеши общие, поэтому 34 страницы собираются быстро).
Дополнительно в каждую страницу кладутся:

1. Шим localStorage — в песочнице предпросмотра (iframe без allow-same-origin)
   обращение к нему бросает SecurityError.
2. Шим fetch — префетчи Next (RSC-пейлоады маршрутов) на хосте превью дают
   только 404 в консоли; отвечаем тихим 404 без похода в сеть.
3. Перехватчик кликов по внутренним ссылкам: маршрут → адрес опубликованной
   страницы из карты в <script id="preview-route-map">. Карта заполняется
   вторым проходом (--fill-map map.json), когда адреса публикаций известны.

Запуск: python3 scripts/publish-preview.py            # собрать все страницы
        python3 scripts/publish-preview.py --fill-map map.json  # подставить карту
"""
import base64
import io
import json
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out")
TARGET_DIR = os.path.join(ROOT, "preview-pages")

# Все страницы сайта: имя файла превью ← маршрут
ROUTES: list[tuple[str, str]] = [
    ("home", "/"),
    ("projects", "/projects"),
    ("project-sosnovka-96", "/projects/sosnovka-96"),
    ("project-ladoga-132", "/projects/ladoga-132"),
    ("project-vuoksa-118", "/projects/vuoksa-118"),
    ("project-toksovo-78", "/projects/toksovo-78"),
    ("project-priozersk-164", "/projects/priozersk-164"),
    ("project-kiviniemi-145", "/projects/kiviniemi-145"),
    ("complectations", "/complectations"),
    ("calculator", "/calculator"),
    ("prices", "/prices"),
    ("technology", "/technology"),
    ("objects", "/objects"),
    ("reviews", "/reviews"),
    ("about", "/about"),
    ("guarantee", "/guarantee"),
    ("mortgage", "/mortgage"),
    ("faq", "/faq"),
    ("blog", "/blog"),
    ("blog-kak-chitat-smetu", "/blog/kak-chitat-smetu"),
    ("blog-stroyka-zimoy", "/blog/stroyka-zimoy"),
    ("blog-kak-vybrat-fundament", "/blog/kak-vybrat-fundament"),
    ("contacts", "/contacts"),
    ("vacancies", "/vacancies"),
    ("city-vsevolozhsk", "/karkasnye-doma/vsevolozhsk"),
    ("city-toksovo", "/karkasnye-doma/toksovo"),
    ("city-sertolovo", "/karkasnye-doma/sertolovo"),
    ("city-gatchina", "/karkasnye-doma/gatchina"),
    ("city-priozersk", "/karkasnye-doma/priozersk"),
    ("city-vyborg", "/karkasnye-doma/vyborg"),
    ("lk", "/lk"),
    ("legal-privacy", "/legal/privacy"),
    ("legal-consent", "/legal/consent"),
    ("legal-cookie", "/legal/cookie"),
]

LS_SHIM = (
    "<script>try{window.localStorage.getItem('t')}catch(e){var __m={};"
    "Object.defineProperty(window,'localStorage',{value:{"
    "getItem:function(k){return k in __m?__m[k]:null},"
    "setItem:function(k,v){__m[k]=String(v)},"
    "removeItem:function(k){delete __m[k]},clear:function(){__m={}}}})}</script>"
)

# Префетчи Next бьют в хост превью и дают 404 — глушим не выходя в сеть
FETCH_SHIM = (
    "<script>(function(){var f=window.fetch;window.fetch=function(i,o){"
    "try{var u=new URL(typeof i==='string'?i:i.url,location.href);"
    "if(u.hostname===location.hostname){return Promise.resolve(new Response('',{status:404}))}}"
    "catch(e){}return f.apply(this,arguments)}})()</script>"
)

# Адрес публикации меняется с каждой версией страницы, а фреймить pub-страницы
# в оболочку тот же хост запрещает. Поэтому карта маршрутов путешествует
# С ПОЛЬЗОВАТЕЛЕМ: лаунчер открывает главную с картой в hash (#dmap=...),
# перехватчик сохраняет её в sessionStorage и прокидывает в каждый переход.
# Якоря на текущей странице скроллим вручную, чтобы не затирать hash с картой.
LINK_INTERCEPTOR = """<script>(function(){
var cur='__CURRENT_ROUTE__';
var PUB='https://pub.hyperagent.com/p/';
var map=null;
(function(){
  var m=(location.hash||'').match(/dmap=([^&]+)/);
  if(m){try{map=JSON.parse(decodeURIComponent(m[1]))}catch(e){}}
  if(map){try{sessionStorage.setItem('derevyaga-dmap',JSON.stringify(map))}catch(e){}}
  if(!map){try{map=JSON.parse(sessionStorage.getItem('derevyaga-dmap')||'null')}catch(e){}}
})();
var am=(location.hash||'').match(/[#&]a=([A-Za-z0-9_-]+)/);
if(am){window.addEventListener('load',function(){
  var el=document.getElementById(am[1]);
  if(el)setTimeout(function(){el.scrollIntoView()},80);
})}
document.addEventListener('click',function(e){
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  if(!a)return;
  var href=a.getAttribute('href')||'';
  if(/^(tel:|mailto:|https?:|\\/\\/)/.test(href))return; // внешние — как есть
  var hash=a.hash||'';
  var path=href.charAt(0)==='#'?cur:(a.pathname||'/');
  if(path.length>1&&path.charAt(path.length-1)==='/')path=path.slice(0,-1);
  if(path===cur){
    if(hash){
      e.preventDefault();e.stopPropagation();
      var el=document.getElementById(hash.slice(1));
      if(el)el.scrollIntoView({behavior:'smooth'});
    }
    return;
  }
  e.preventDefault();e.stopPropagation();
  if(!map)return; // страницу открыли без карты — переходы недоступны
  var token=map[path]||map['/'];
  if(!token)return;
  window.location.href=PUB+token+'#dmap='+encodeURIComponent(JSON.stringify(map))+(hash?'&a='+hash.slice(1):'');
},true);
})()</script>"""


def read(path_from_root: str) -> bytes:
    return open(os.path.join(OUT, path_from_root.lstrip("/")), "rb").read()


def data_uri(raw: bytes, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(raw).decode()}"


def shrink_image(path: str, max_width: int, quality: int) -> bytes:
    im = Image.open(io.BytesIO(read(path)))
    if im.mode != "RGBA":
        im = im.convert("RGB")
    if im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=quality, method=6)
    return buf.getvalue()


# Кеши общие на все страницы: шрифты, стили, скрипты и фото повторяются
css_cache: dict[str, str] = {}
js_cache: dict[str, str] = {}
img_cache: dict[str, str] = {}


def inline_css(match: re.Match) -> str:
    href = match.group(1)
    if href not in css_cache:
        css = read(href).decode("utf-8")
        css = re.sub(r"@font-face\s*\{[^}]*-(?:cyrillic|latin)-ext\.woff2[^}]*\}", "", css)
        css = re.sub(
            r"url\((/fonts/[^)]+\.woff2)\)",
            lambda m: f"url({data_uri(read(m.group(1)), 'font/woff2')})",
            css,
        )
        css_cache[href] = f"<style>{css}</style>"
    return css_cache[href]


def inline_js(match: re.Match) -> str:
    src = match.group(1)
    if src not in js_cache:
        try:
            code = read(src).decode("utf-8")
        except FileNotFoundError:
            js_cache[src] = ""
            return ""
        code = code.replace("</script", "<\\/script").replace("<script", "<\\script")
        shim = f"document.currentScript&&document.currentScript.setAttribute('src','{src}');"
        js_cache[src] = "<script>" + shim + code + "</script>"
    return js_cache[src]


def image_data_uri(path: str) -> str:
    if path not in img_cache:
        if "hero" in path or "karkas" in path:
            max_width, quality = 1300, 80
        elif "tech-" in path:
            max_width, quality = 480, 76
        else:
            max_width, quality = 720, 72
        img_cache[path] = data_uri(shrink_image(path, max_width, quality), "image/webp")
    return img_cache[path]


# Два шрифта из предзагрузки: после гидрации Next восстанавливает preload
# по данным пейлоада — путь должен резолвиться, иначе ERR_FAILED в консоли
font_cache: dict[str, str] = {}


def font_data_uri(path: str) -> str:
    if path not in font_cache:
        font_cache[path] = data_uri(read(path), "font/woff2")
    return font_cache[path]


def source_file(route: str) -> str:
    return "index.html" if route == "/" else route.lstrip("/") + ".html"


def build_page(name: str, route: str) -> float:
    html = read(source_file(route)).decode("utf-8")

    interceptor = LINK_INTERCEPTOR.replace("__CURRENT_ROUTE__", route if route == "/" else route.rstrip("/"))
    html = html.replace("<head>", "<head>" + LS_SHIM + FETCH_SHIM + interceptor, 1)

    html = re.sub(r'<link rel="stylesheet" href="([^"]+\.css)"[^>]*/?>', inline_css, html)
    html = re.sub(r'<link[^>]+rel="preload"[^>]+as="(?:script|image|font)"[^>]*>', "", html)
    html = re.sub(r'<link[^>]+as="(?:script|image|font)"[^>]+rel="preload"[^>]*>', "", html)
    html = re.sub(r'<script src="([^"]+\.js)"[^>]*></script>', inline_js, html)

    # Картинки и шрифты: заменяем ВСЕ вхождения путей, а не только атрибуты src.
    # Пути лежат и в RSC-пейлоаде — после гидрации React восстанавливает src
    # из пропсов, и относительный путь на хосте превью давал бы 404 и битые фото.
    for path in sorted(set(re.findall(r"/(?:photos|brand)/[A-Za-z0-9_.-]+\.(?:webp|png|jpe?g)", html))):
        html = html.replace(path, image_data_uri(path))
    for path in sorted(set(re.findall(r"/fonts/[A-Za-z0-9_.-]+\.woff2", html))):
        html = html.replace(path, font_data_uri(path))

    target = os.path.join(TARGET_DIR, f"{name}.html")
    open(target, "w", encoding="utf-8").write(html)
    return os.path.getsize(target) / 1024 / 1024



if __name__ == "__main__":
    os.makedirs(TARGET_DIR, exist_ok=True)
    total = 0.0
    for name, route in ROUTES:
        size = build_page(name, route)
        total += size
        flag = " ← великовата" if size > 9 else ""
        print(f"{name}.html: {size:.1f} MB{flag}")
    print(f"Итого {len(ROUTES)} страниц, {total:.0f} MB")
