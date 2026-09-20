'use client'
import { STEPS } from './visuals'
export function StepProgress({ current, onChange }: { current: number; onChange: (index: number) => void }) {
  return <nav className="constructor-steps" aria-label="Шаги конструктора"><ol>{STEPS.map((step, index) => <li key={step.id}><button type="button" onClick={() => onChange(index)} aria-current={index === current ? 'step' : undefined} data-done={index < current}><span className="constructor-step-number">{index < current ? '✓' : String(index + 1).padStart(2, '0')}</span><span>{step.short}</span></button></li>)}</ol></nav>
}
