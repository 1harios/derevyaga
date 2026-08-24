import { cn } from '@/lib/utils'

/**
 * Заглушка под материал, которого пока нет: показывает, что снять или
 * прислать, в каком размере и пропорции.
 */
export function AssetPlaceholder({
  what,
  size,
  ratio = '3 / 2',
  className,
}: {
  what: string
  size: string
  ratio?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start justify-end rounded-lg border border-dashed border-line bg-panel p-4',
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      <span className="text-[13px] muted">Нужен материал</span>
      <span className="mt-1 text-[14px] leading-[1.4]">{what}</span>
      <span className="mt-1 text-[13px] tabular-nums muted">{size}</span>
    </div>
  )
}
