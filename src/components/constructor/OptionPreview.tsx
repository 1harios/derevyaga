import Image from 'next/image'

type PreviewProps = { kind: 'foundation' | 'roof' | 'facade' | 'terrace' | 'insulation'; value: string }

/** Generated material photography; exact prompts are stored with the local assets. */
export function OptionPreview({ kind, value }: PreviewProps) {
  return <Image src={`/constructor/material-cutouts-v1/${kind}-${value}.webp`} alt="" width={512} height={512} sizes="76px" />
}
