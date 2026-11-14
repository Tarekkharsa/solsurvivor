import type { Content, TurnRecord } from '../sim/types'

/** A real piece of NASA science about one of the jobs the crew did, with where it comes from. */
export interface Fact {
  text: string
  source: string
  url: string
}

type Lang = 'en' | 'ar'
type Facts = Record<string, Record<Lang, Fact>>

const orion = (lang: Lang): Fact =>
  lang === 'en'
    ? {
        text: 'If a solar storm hits NASA’s Orion spacecraft, the crew builds a shelter out of the storage bags on board within an hour, and may stay inside for up to a day.',
        source: 'NASA: Orion radiation protection plan',
        url: 'https://www.nasa.gov/missions/artemis/orion/scientists-and-engineers-evaluate-orion-radiation-protection-plan/',
      }
    : {
        text: 'إذا ضربت عاصفة شمسية مركبة «أوريون» التابعة لناسا، يبني الطاقم خلال ساعة ملجأً من حقائب التخزين الموجودة على متنها، وقد يبقى داخله حتى يوم كامل.',
        source: 'ناسا: خطة حماية أوريون من الإشعاع',
        url: 'https://www.nasa.gov/missions/artemis/orion/scientists-and-engineers-evaluate-orion-radiation-protection-plan/',
      }

const mars: Facts = {
  oxygen: {
    en: {
      text: 'NASA’s MOXIE on the Perseverance rover made 122 grams of oxygen from Mars air, about what a small dog breathes in 10 hours. At its best it made 12 grams an hour.',
      source: 'NASA JPL: MOXIE completes its Mars mission (2023)',
      url: 'https://www.jpl.nasa.gov/news/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/',
    },
    ar: {
      text: 'صنع جهاز «موكسي» على المركبة «برسيفيرانس» 122 غرامًا من الأكسجين من هواء المريخ، أي ما يتنفسه كلب صغير في 10 ساعات تقريبًا. وفي أفضل حالاته صنع 12 غرامًا في الساعة.',
      source: 'مختبر الدفع النفاث في ناسا: موكسي يُنهي مهمته على المريخ (2023)',
      url: 'https://www.jpl.nasa.gov/news/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/',
    },
  },
  greenhouse: {
    en: {
      text: 'NASA’s Veggie garden on the International Space Station has grown lettuce, Chinese cabbage, kale and even zinnia flowers. Astronauts have eaten some of the crops.',
      source: 'NASA: Growing plants in space',
      url: 'https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/',
    },
    ar: {
      text: 'زرعت حديقة «فيجي» التابعة لناسا في محطة الفضاء الدولية الخسّ والملفوف الصيني والكرنب وحتى أزهار الزينيا. وقد أكل الرواد بعض هذه المحاصيل.',
      source: 'ناسا: زراعة النباتات في الفضاء',
      url: 'https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/',
    },
  },
  shelter: { en: orion('en'), ar: orion('ar') },
  lab: {
    en: {
      text: 'Perseverance drills out rock cores and seals them in tubes, so a future mission could bring them to labs on Earth.',
      source: 'NASA Science: Mars rock samples',
      url: 'https://science.nasa.gov/mission/mars-2020-perseverance/mars-rock-samples/',
    },
    ar: {
      text: 'تحفر «برسيفيرانس» عينات من الصخور وتغلقها في أنابيب، لكي تعيدها مهمة قادمة إلى المختبرات على الأرض.',
      source: 'ناسا للعلوم: عينات صخور المريخ',
      url: 'https://science.nasa.gov/mission/mars-2020-perseverance/mars-rock-samples/',
    },
  },
  comms: {
    en: {
      text: 'Radio travels at the speed of light, yet a message between Earth and Mars takes about 3 to 22 minutes, depending on where the two planets are.',
      source: 'Worked out from NASA JPL planet positions',
      url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
    },
    ar: {
      text: 'ينتقل الراديو بسرعة الضوء، ومع ذلك تستغرق الرسالة بين الأرض والمريخ من 3 إلى 22 دقيقة تقريبًا، بحسب موقع الكوكبين.',
      source: 'محسوب من مواقع الكواكب لدى مختبر الدفع النفاث في ناسا',
      url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
    },
  },
}

const moon: Facts = {
  oxygen: {
    en: {
      text: 'Moon rock is made of minerals such as olivine and pyroxene, which hold oxygen atoms. Explorers hope to pull that oxygen out to breathe.',
      source: 'NASA Science: Moon facts',
      url: 'https://science.nasa.gov/moon/facts/',
    },
    ar: {
      text: 'تتكوّن صخور القمر من معادن مثل الأوليفين والبيروكسين، وفيها ذرات أكسجين. يأمل المستكشفون أن يستخرجوا هذا الأكسجين ليتنفسوه.',
      source: 'ناسا للعلوم: حقائق عن القمر',
      url: 'https://science.nasa.gov/moon/facts/',
    },
  },
  greenhouse: {
    en: {
      text: 'In 2022, scientists grew plants in real Moon soil brought back by Apollo astronauts. It was the first time anyone had done it.',
      source: 'NASA: Scientists grow plants in soil from the Moon (2022)',
      url: 'https://www.nasa.gov/feature/biological-physical/scientists-grow-plants-in-soil-from-the-moon',
    },
    ar: {
      text: 'في عام 2022 زرع العلماء نباتات في تربة قمرية حقيقية أحضرها رواد «أبولو». كانت تلك أول مرة يحدث فيها ذلك.',
      source: 'ناسا: علماء يزرعون نباتات في تربة من القمر (2022)',
      url: 'https://www.nasa.gov/feature/biological-physical/scientists-grow-plants-in-soil-from-the-moon',
    },
  },
  shelter: { en: orion('en'), ar: orion('ar') },
  lab: {
    en: {
      text: 'Between 1969 and 1972, six Apollo missions brought back 382 kilograms of Moon rocks, soil and dust. Scientists still study them today.',
      source: 'NASA Astromaterials: Lunar rocks and soils',
      url: 'https://curator.jsc.nasa.gov/lunar/',
    },
    ar: {
      text: 'بين عامي 1969 و1972 أعادت ست بعثات «أبولو» 382 كيلوغرامًا من صخور القمر وتربته وغباره. وما زال العلماء يدرسونها حتى اليوم.',
      source: 'ناسا للمواد الفضائية: صخور القمر وتربته',
      url: 'https://curator.jsc.nasa.gov/lunar/',
    },
  },
  comms: {
    en: {
      text: 'The Moon is about 384,000 km away, so a radio message takes only about 1.3 seconds to reach Earth.',
      source: 'Worked out from the Earth–Moon distance (NASA Science)',
      url: 'https://science.nasa.gov/moon/facts/',
    },
    ar: {
      text: 'يبعد القمر نحو 384 ألف كيلومتر، لذلك تصل رسالة الراديو إلى الأرض في نحو 1.3 ثانية فقط.',
      source: 'محسوب من المسافة بين الأرض والقمر (ناسا للعلوم)',
      url: 'https://science.nasa.gov/moon/facts/',
    },
  },
}

/** One fact for this sol: about a job the crew did, taking turns between jobs so it changes each sol. */
export function factFor(content: Content, record: TurnRecord, lang: Lang): Fact | undefined {
  const facts = content.id === 'moon' ? moon : mars
  const done = Object.entries(record.plan.units)
    .filter(([id, n]) => n && facts[id])
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([id]) => id)
  if (!done.length) return undefined
  return facts[done[(record.turn - 1) % done.length]][lang]
}
