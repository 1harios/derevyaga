#!/usr/bin/env bash
# Статическая копия сайта для показа вёрстки без сервера.
# API-маршруты в статический экспорт не попадают, поэтому на время сборки
# уводим их в сторону, а формы переводим в демонстрационный режим.
set -e

cd "$(dirname "$0")/.."

if [ -d src/app/api ]; then
  mv src/app/api .api-tmp
fi

restore() {
  if [ -d .api-tmp ]; then
    mv .api-tmp src/app/api
  fi
}
trap restore EXIT

BUILD_TARGET=export NEXT_PUBLIC_DEMO_MODE=1 npx next build

echo "Готово: ./out"
