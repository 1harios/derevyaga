import { wallLayers } from '@/content/technology'

/**
 * Разрез стены. Своя SVG-схема вместо картинки: весит меньше килобайта,
 * масштабируется без потерь и правится вместе с текстом.
 *
 * На главной блок технологии собран по референсу — там стоит фотография
 * конструкции. Эта схема идёт на страницу /technology во второй итерации.
 */
export function WallDiagram() {
  const widths = [10, 16, 4, 46, 4, 12, 8]
  const total = widths.reduce((sum, value) => sum + value, 0)

  // Схема монохромная: цвет в макете отдан фотографиям, а не диаграммам
  const fills = ['#1e2521', '#c9c7c2', '#8d938c', '#e4e2de', '#8d938c', '#d5d3ce', '#f7f6f4']

  let offset = 0
  const bands = wallLayers.map((layer, index) => {
    const width = (widths[index] / total) * 100
    const band = { ...layer, x: offset, width, index, fill: fills[index] }
    offset += width
    return band
  })

  return (
    <figure className="rounded-lg bg-panel p-5">
      <figcaption className="mb-4 text-[14px] muted">Разрез стены снаружи внутрь</figcaption>

      <svg viewBox="0 0 100 30" role="img" aria-label="Схема слоёв стены каркасного дома" className="w-full">
        {bands.map((band) => (
          <g key={band.name}>
            <rect x={band.x} y={0} width={band.width} height={24} fill={band.fill} rx={0.6} />
            <text
              x={band.x + band.width / 2}
              y={28.5}
              textAnchor="middle"
              fontSize={3.2}
              fill="#6c736d"
              fontFamily="Onest, sans-serif"
            >
              {band.index + 1}
            </text>
          </g>
        ))}
        {Array.from({ length: 9 }).map((_, index) => {
          const insulation = bands[3]
          const x = insulation.x + (insulation.width / 9) * (index + 0.5)
          return <line key={index} x1={x} y1={2} x2={x} y2={22} stroke="#b8b6b1" strokeWidth={0.35} />
        })}
      </svg>

      <ol className="mt-5 space-y-2 text-[14px] leading-[1.5]">
        {wallLayers.map((layer, index) => (
          <li key={layer.name} className="flex items-baseline gap-3">
            <span className="num w-4 shrink-0 text-[13px] muted">{index + 1}</span>
            <span className="flex-1">{layer.name}</span>
            <span className="shrink-0 tabular-nums muted">{layer.thickness}</span>
          </li>
        ))}
      </ol>
    </figure>
  )
}
