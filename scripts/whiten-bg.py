#!/usr/bin/env python3
"""
Приводит студийный фон предметных снимков к чистому белому.

Зачем: в блоке технологии конструкция и миниатюры лежат прямо на белой панели.
Если оставить исходный фон с виньеткой, вокруг снимка виден серый прямоугольник.

Простое отсечение по яркости не годится: тёмные углы виньетки по яркости
совпадают с металлическим крепежом, и крепёж выцветает. Поэтому фон ищем
заливкой от краёв кадра по несатурированным пикселям — она обходит виньетку,
но не заходит внутрь конструкции, потому что крепёж окружён деревом.

Запуск:
    python3 scripts/whiten-bg.py public/photos/detal-uzel.webp [ещё файлы...]
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

# Порог насыщенности: дерево цветное, фон и крепёж — серые
MAX_BG_SATURATION = 26
# Ниже этой яркости пиксель считаем деталью, а не фоном
MIN_BG_LUMA = 130
# Просветы внутри конструкции: тот же фон, но не связан с краем кадра
HOLE_SATURATION = 22
HOLE_LUMA = 226


def whiten(path: str) -> None:
    image = Image.open(path).convert('RGB')
    pixels = np.asarray(image).astype(np.float32)

    saturation = pixels.max(axis=2) - pixels.min(axis=2)
    luma = pixels.mean(axis=2)
    candidate = (saturation < MAX_BG_SATURATION) & (luma > MIN_BG_LUMA)

    height, width = candidate.shape
    background = np.zeros((height, width), bool)
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        for y in (0, height - 1):
            if candidate[y, x] and not background[y, x]:
                background[y, x] = True
                queue.append((y, x))
    for y in range(height):
        for x in (0, width - 1):
            if candidate[y, x] and not background[y, x]:
                background[y, x] = True
                queue.append((y, x))

    while queue:
        y, x = queue.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < height and 0 <= nx < width and candidate[ny, nx] and not background[ny, nx]:
                background[ny, nx] = True
                queue.append((ny, nx))

    background |= (saturation < HOLE_SATURATION) & (luma > HOLE_LUMA)

    # Мягкий край, иначе у тонких стоек появляется ореол
    mask = Image.fromarray((background * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    alpha = (np.asarray(mask).astype(np.float32) / 255)[..., None]

    result = pixels * (1 - alpha) + np.full_like(pixels, 255.0) * alpha
    Image.fromarray(np.clip(result, 0, 255).astype(np.uint8)).save(
        path, 'WEBP', quality=84, method=6
    )
    print(f'{path}: фон обелён, {round(background.mean() * 100)}% кадра')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit('Укажите файлы: python3 scripts/whiten-bg.py public/photos/*.webp')
    for argument in sys.argv[1:]:
        whiten(argument)
