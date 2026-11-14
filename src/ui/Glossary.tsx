import { useId, useState } from 'react'
import { getLang } from '../i18n'

/** Words kids may not know, with a short explanation. Tap or focus a word to see it. */
const terms: Record<'en' | 'ar', Record<string, string>> = {
  en: {
    sol: 'A day on Mars. It is 24 hours and 39 minutes long.',
    sols: 'Days on Mars. Each one is 24 hours and 39 minutes long.',
    radiation: 'Invisible energy from the Sun and space. Too much is bad for the body.',
    'solar panels': 'Panels that turn sunlight into electric power.',
    oxygen: 'The gas in air that we need to breathe.',
    rover: 'A robot car that drives on another world.',
    'solar storm': 'A burst of fast particles from the Sun. It raises radiation.',
    crater: 'A round hole made when a space rock hit the ground.',
  },
  ar: {
    سول: 'يوم على المريخ، طوله 24 ساعة و39 دقيقة.',
    الإشعاع: 'طاقة غير مرئية من الشمس والفضاء. الكثير منها يضرّ الجسم.',
    'الألواح الشمسية': 'ألواح تحوّل ضوء الشمس إلى طاقة كهربائية.',
    الأكسجين: 'الغاز الذي في الهواء ونحتاجه لنتنفس.',
    المركبة: 'سيارة آلية تسير على عالم آخر.',
    فوهة: 'حفرة مستديرة صنعتها صخرة فضائية حين اصطدمت بالأرض.',
  },
}

function Term({ word, meaning }: { word: string; meaning: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span className="term-wrap">
      <button
        type="button"
        className="term"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {word}
      </button>
      {open && (
        <span role="tooltip" id={id} className="term-tip">
          {meaning}
        </span>
      )}
    </span>
  )
}

/** Text with its glossary words marked. In Arabic they are highlighted, not underlined, since dots change letters. */
export function GlossaryText({ text }: { text: string }) {
  const dict = terms[getLang()]
  const words = Object.keys(dict).sort((a, b) => b.length - a.length)
  if (!words.length) return <>{text}</>
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const seen = new Set<string>()
  return (
    <>
      {text.split(re).map((part, i) => {
        const key = Object.keys(dict).find((k) => k.toLowerCase() === part.toLowerCase())
        if (!key || seen.has(key)) return <span key={i}>{part}</span>
        seen.add(key)
        return <Term key={i} word={part} meaning={dict[key]} />
      })}
    </>
  )
}
