'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ConstructorInput } from '@/lib/constructor/engine'
import type { HouseViewer } from './house-renderer'
import { houseDimensions, stageForStep } from './house-model'
import type { StepId } from './visuals'

function ViewButton({ label, onClick, children, disabled = false }: {
  label: string; onClick: () => void; children: ReactNode; disabled?: boolean
}) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} disabled={disabled} className="house-view-button">
      {children}
    </button>
  )
}

/** An explicit schematic fallback keeps the calculator usable when WebGL is unavailable. */
function HouseSketch({ input, step }: { input: ConstructorInput; step: StepId }) {
  const stage = stageForStep(step)
  const { width, depth } = houseDimensions(input.size)
  const long = 108 * depth / 10
  const front = 112 * width / 8
  const ox = 154
  const oy = 175
  const a = `${ox},${oy}`
  const b = `${ox + front},${oy - front * 0.4}`
  const c = `${ox + front - long},${oy - front * 0.4 - long * 0.42}`
  const d = `${ox - long},${oy - long * 0.42}`
  return (
    <svg viewBox="0 0 350 240" className="h-full w-full" aria-hidden>
      <ellipse cx="170" cy="178" rx="130" ry="35" fill="#d3d8c6" />
      <g fill="none" stroke="#7b8874" strokeWidth="2" strokeLinejoin="round">
        <polygon points={`${a} ${b} ${c} ${d}`} fill="#e8ebdf" />
        {stage >= 1 ? [0, 0.33, 0.66, 1].map((t) => (
          <path key={t} d={`M${ox + front * t},${oy - front * t * 0.4}v13 M${ox - long + front * t},${oy - long * 0.42 - front * t * 0.4}v13`} strokeWidth="4" />
        )) : null}
        {stage >= 2 ? (
          <g stroke="#b98c59">
            <polygon points={`${a} ${b} ${ox + front},${oy - front * 0.4 - 65} ${ox},${oy - 65}`} fill={stage >= 4 ? input.facade === 'painted' ? '#687e67' : '#ceac80' : 'none'} />
            <polygon points={`${a} ${d} ${ox - long},${oy - long * 0.42 - 65} ${ox},${oy - 65}`} fill={stage >= 4 ? '#b69d7a' : 'none'} />
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => <path key={t} d={`M${ox + front * t},${oy - front * t * 0.4}v-65 M${ox - long * t},${oy - long * t * 0.42}v-65`} />)}
            <polygon points={`${ox},${oy - 65} ${ox + front / 2},${oy - front * 0.2 - 104} ${ox + front / 2 - long},${oy - front * 0.2 - long * 0.42 - 104} ${ox - long},${oy - long * 0.42 - 65}`} fill={stage >= 3 ? input.roof === 'ondulin' ? '#795246' : '#586263' : 'none'} />
            <path d={`M${ox + front / 2},${oy - front * 0.2 - 104}L${ox + front},${oy - front * 0.4 - 65}`} />
          </g>
        ) : null}
      </g>
    </svg>
  )
}

export function HouseVisual({ input, step, alt, className }: {
  input: ConstructorInput; step: StepId; alt: string; className?: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<HouseViewer | null>(null)
  const latest = useRef({ input, step })
  const [status, setStatus] = useState<'loading' | 'ready' | 'unsupported'>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    latest.current = { input, step }
    viewerRef.current?.update(input, step)
  }, [input, step])

  useEffect(() => {
    let cancelled = false
    let viewer: HouseViewer | undefined
    const fail = () => {
      if (cancelled) return
      viewer?.dispose()
      viewerRef.current = null
      setStatus('unsupported')
    }
    import('./house-renderer').then(({ createHouseViewer }) => {
      if (cancelled || !hostRef.current) return
      try {
        viewer = createHouseViewer(hostRef.current, fail)
        viewer.update(latest.current.input, latest.current.step)
        viewerRef.current = viewer
        setStatus('ready')
      } catch { fail() }
    }).catch(fail)
    return () => { cancelled = true; viewer?.dispose(); viewerRef.current = null }
  }, [attempt])

  const isReady = status === 'ready'
  const dimensions = houseDimensions(input.size)

  return (
    <figure className={cn('house-visual', className)} aria-label="Визуализация вашего дома">
      <div className="house-visual-stage">
        <div ref={hostRef} className="house-visual-canvas" role="img" aria-label={alt} />
        {status !== 'ready' ? (
          <div className="house-visual-fallback">
            {status === 'unsupported' ? <HouseSketch input={input} step={step} /> : null}
            <div className="house-visual-load" role="status">
              {status === 'loading' ? <div className="house-brand-loader" aria-label="Загрузка модели"><Image src="/brand/logo-full-moss.png" alt="Деревяга" width={220} height={90} priority /><span className="house-brand-loader-track"><span /></span></div> : (
                <>
                  <span>3D недоступно в этом браузере. Расчёт работает.</span>
                  <button type="button" className="link-underline" onClick={() => { setStatus('loading'); setAttempt((n) => n + 1) }}>Попробовать снова</button>
                </>
              )}
            </div>
          </div>
        ) : null}
        <div className="house-visual-topline">
          <span className="house-visual-title">Дом {dimensions.width}×{dimensions.depth}{input.size === 'custom' ? ' · пример' : ''}</span>
        </div>
        <div className="house-visual-controls">
          <div className="house-visual-tools">
            <ViewButton label="Повторить сборку" onClick={() => viewerRef.current?.replay()} disabled={!isReady || stageForStep(step) === 0}>↻</ViewButton>
            <ViewButton label="Отдалить дом" onClick={() => viewerRef.current?.zoom(-1)} disabled={!isReady}>−</ViewButton>
            <ViewButton label="Приблизить дом" onClick={() => viewerRef.current?.zoom(1)} disabled={!isReady}>+</ViewButton>
            <ViewButton label="Вернуть исходный ракурс" onClick={() => viewerRef.current?.reset()} disabled={!isReady}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M4 8a6 6 0 1 1 0 5M4 3v5h5" /></svg>
            </ViewButton>
          </div>
        </div>
      </div>
    </figure>
  )
}
