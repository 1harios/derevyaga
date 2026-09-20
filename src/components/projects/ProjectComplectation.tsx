'use client'

import Image from 'next/image'
import { useState } from 'react'
import styles from './ProjectMedia.module.css'
import { Button } from '@/components/ui/Button'
import { materialCategories, getCategoryIncludes } from '@/content/complectations'

export function ProjectComplectation({ singleFloor }: { singleFloor: boolean }) {
  const [categoryId, setCategoryId] = useState<typeof materialCategories[number]['id']>('foundation')
  const category = materialCategories.find((item) => item.id === categoryId)!
  const includes = getCategoryIncludes('turnkey', categoryId, singleFloor)
  return <div className="panel">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><h2>Что входит в стоимость</h2><Button href="#final-form" arrow>Получить подробную смету</Button></div>
    <div className="mt-9 grid grid-cols-2 gap-2 lg:mt-10 lg:grid-cols-6" role="group" aria-label="Категория комплектации">{materialCategories.map((item) => <button key={item.id} type="button" aria-pressed={item.id === categoryId} onClick={() => setCategoryId(item.id)} className={`group relative flex min-w-0 flex-col items-center rounded-xl border p-4 text-center text-sm transition-all duration-200 motion-reduce:transition-none hover:-translate-y-1 motion-reduce:hover:translate-y-0 ${item.id === categoryId ? 'border-brand bg-white text-brand ring-1 ring-brand' : 'border-transparent bg-white/50 text-ink hover:bg-white'}`}><Image src={`/images/complectation/${item.id}.webp`} alt="" width={200} height={200} className="mb-4 aspect-square w-full max-w-32 object-contain transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none" />{item.name}</button>)}</div>
    <div key={categoryId} className={`mt-6 rounded-2xl bg-white p-5 sm:p-7 ${styles.reveal}`} aria-live="polite"><h3 className="sr-only">{category.name}</h3><p className="mb-4 text-sm text-ink-soft">{category.note}</p><ul className="grid gap-x-10 md:grid-cols-2">{includes.map((item) => <li key={item} className="flex items-start justify-between gap-5 border-b border-line py-5 text-sm leading-relaxed"><span>{item}</span><span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">✓</span></li>)}</ul></div>
    <p className="mt-4 text-xs leading-relaxed text-ink-soft">Состав готового дома. Объёмы, материалы и окончательную стоимость закрепляем в смете к договору.</p>
  </div>
}
