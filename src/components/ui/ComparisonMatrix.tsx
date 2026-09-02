import { comparisonSections, complectations } from '@/content/complectations'
import { cn, formatNumber } from '@/lib/utils'

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    // role="img" делает aria-label допустимым на span (иначе axe: aria-prohibited-attr)
    return (
      <span role="img" aria-label="Входит" className="inline-flex size-6 items-center justify-center rounded-full bg-brand-tint text-brand-deep">
        <svg viewBox="0 0 12 12" aria-hidden className="size-3">
          <path d="M2.5 6.4 5 8.8l4.5-5.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (value === false) {
    return (
      <span role="img" aria-label="Не входит" className="inline-block h-px w-3.5 bg-ink-faint align-middle" />
    )
  }
  return <span className="text-[13.5px] leading-[1.45]">{value}</span>
}

/**
 * Подробное сравнение комплектаций. На узком экране таблица уезжает
 * в горизонтальную прокрутку целиком — колонки не ломаются и остаются
 * сравнимыми, это важнее, чем уместить всё без скролла.
 */
export function ComparisonMatrix() {
  return (
    <>
      <div className="relative">
        {/* На десктопе таблица помещается целиком, и контейнер не должен быть
            скролл-областью — иначе липкая шапка не сработает относительно страницы.
            На узких экранах — горизонтальная прокрутка с липкой первой колонкой. */}
        <div className="card overflow-x-auto rounded-xl lg:overflow-visible">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th
              scope="col"
              className="sticky left-0 z-[2] w-[34%] bg-surface p-5 align-bottom text-[14px] font-normal muted shadow-[1px_0_0_var(--color-line)] md:p-6 lg:left-auto lg:top-[76px] lg:rounded-tl-xl lg:shadow-[0_1px_0_var(--color-line)]"
            >
              Состав работ
            </th>
            {complectations.map((item) => (
              <th
                key={item.id}
                scope="col"
                className="w-[22%] bg-surface p-5 align-bottom md:p-6 lg:sticky lg:top-[76px] lg:z-[2] lg:shadow-[0_1px_0_var(--color-line)] lg:last:rounded-tr-xl"
              >
                <div className="flex items-center gap-2 font-heading text-[17px] font-medium">
                  {item.name}
                  {item.recommended ? (
                    <span className="chip chip--brand text-[11px]">чаще всего</span>
                  ) : null}
                </div>
                <div className="mt-1.5 text-[13px] font-normal muted">
                  от <span className="num text-[15px] text-ink">{formatNumber(item.pricePerM2)} ₽</span> за м²
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {comparisonSections.map((section) => (
          <tbody key={section.title}>
            <tr className="border-b border-line bg-panel/60">
              <th scope="colgroup" colSpan={4} className="px-5 py-3 md:px-6">
                {/* Ячейка на всю ширину таблицы, поэтому липким делаем сам текст —
                    при горизонтальной прокрутке название раздела остаётся у левого края */}
                <span className="sticky left-5 inline-block font-heading text-[13.5px] font-medium md:left-6">
                  {section.title}
                </span>
              </th>
            </tr>
            {section.rows.map((row, index) => (
              <tr
                key={row.name}
                className={cn('align-top', index !== section.rows.length - 1 && 'border-b border-line/60')}
              >
                <th
                  scope="row"
                  className="sticky left-0 z-[1] bg-surface p-5 pr-4 text-[14px] font-normal leading-[1.5] shadow-[1px_0_0_var(--color-line)] md:px-6 lg:static lg:shadow-none"
                >
                  {row.name}
                </th>
                {row.values.map((value, column) => (
                  <td key={column} className="p-5 text-[14px] muted md:px-6">
                    <CellValue value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
        </div>
        {/* Тень у правого края — намёк, что таблицу можно прокручивать вбок */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-xl bg-gradient-to-l from-black/[0.06] to-transparent lg:hidden"
        />
      </div>
      <p className="mt-2 text-[13px] muted lg:hidden">
        Таблица прокручивается вбок — названия строк остаются на месте
      </p>
    </>
  )
}
