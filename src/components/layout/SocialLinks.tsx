import Image from 'next/image'
import { SiTelegram, SiWhatsapp, SiVk } from 'react-icons/si'
import { LuMapPin } from 'react-icons/lu'
import { company } from '@/content/company'

function AvitoIcon() {
  return <svg viewBox="0 0 32 32" className="size-6" fill="currentColor" aria-hidden><circle cx="9" cy="22" r="7"/><circle cx="23" cy="23" r="5"/><circle cx="23" cy="9" r="7"/><circle cx="8" cy="8" r="5"/></svg>
}

const links = [
  { name: 'Telegram', href: company.telegram, icon: <SiTelegram className="size-5" aria-hidden /> },
  { name: 'WhatsApp', href: company.whatsapp, icon: <SiWhatsapp className="size-5" aria-hidden /> },
  { name: 'MAX', href: company.max, icon: <Image src="/brand/max-white.svg" alt="" width={24} height={24} className="size-6 object-contain" /> },
  { name: 'ВКонтакте', href: company.vk, icon: <SiVk className="size-5" aria-hidden /> },
  { name: 'Авито', href: company.avito, icon: <AvitoIcon /> },
  { name: 'Яндекс Карты', href: company.mapUrl, icon: <LuMapPin className="size-5" aria-hidden /> },
]

export function SocialLinks() {
  return (
    <nav aria-label="Мы в соцсетях и мессенджерах" className="mt-6">
      <ul className="flex flex-wrap gap-2">
        {links.map(({ name, href, icon }) => (
          <li key={name}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={name} title={name} className="flex size-12 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {icon}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
