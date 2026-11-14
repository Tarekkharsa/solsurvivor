import type { Lang } from '../i18n'

/** The teachers page, in both languages. Kept apart from the game strings because it is long. */
export interface TeacherText {
  title: string
  back: string
  intro: string
  goalsTitle: string
  goals: string[]
  lessonTitle: string
  lesson: [string, string][]
  questionsTitle: string
  questions: string[]
  makerTitle: string
  makerHow: string
  world: string
  level: string
  newCode: string
  code: string
  keyTitle: string
  keyHow: string
  turn: string
  event: string
  warning: string
  warnYes: string
  warnNo: string
  calm: string
  printKey: string
  printLog: string
  logTitle: string
  logHow: string
  logCols: string[]
  dataTitle: string
  data: [string, string][]
  privacy: string
}

const en: TeacherText = {
  title: 'For teachers',
  back: '← Back to the game',
  intro:
    'SolSurvivor is a 20-minute mission for ages 7 to 12. Students share out a small amount of power every turn between air, food, a storm shelter, science and the radio to Earth. It runs in any browser, needs no accounts, and collects no data.',
  goalsTitle: 'What students practise',
  goals: [
    'Trade-offs: there is never enough power for everything, so every choice costs something.',
    'Planning ahead: plants take 2 turns to grow, and warnings come a turn before storms.',
    'Space weather: why solar storms are dangerous on Mars and the Moon, and how shielding helps.',
    'Reading data: meters, a live preview of the end of the turn, and a chart of the whole mission.',
    'Real science: every storm, site and photo comes from a real NASA mission, and the game says so.',
  ],
  lessonTitle: 'A 20-minute lesson',
  lesson: [
    ['2 min', 'Ask: what would you need to stay alive on Mars? Write the answers on the board.'],
    ['3 min', 'Give the class one mission code. Everyone plays the guided first turn together.'],
    ['10 min', 'Students play alone or in teams of 2 to 4 (team play on one computer).'],
    ['5 min', 'Discuss with the questions below and the teacher’s key: who heard the storm warning?'],
  ],
  questionsTitle: 'Questions for discussion',
  questions: [
    'What did you spend your power on first? Why?',
    'A storm came with a warning. What did you do differently that turn?',
    'Why do plants need to be planted before you run out of food?',
    'Was an expedition worth the power it took? What did you find?',
    'Real astronauts will face these choices. What would you tell them?',
  ],
  makerTitle: 'Make a class mission',
  makerHow: 'Every student who types this code meets the same storms on the same turns, so you can compare choices. Odd numbers are Cadet level, even numbers Commander.',
  world: 'World',
  level: 'Level',
  newCode: 'New code',
  code: 'Mission code',
  keyTitle: 'Teacher’s key',
  keyHow: 'What hits the base on each turn. Storm warnings arrive one turn early, but only if the radio was on.',
  turn: 'Turn',
  event: 'What happens',
  warning: 'Warning?',
  warnYes: 'Yes, if the radio was on',
  warnNo: 'No warning',
  calm: 'Calm',
  printKey: 'Print the key',
  printLog: 'Print student mission logs',
  logTitle: 'Mission log',
  logHow: 'Write what you planned each turn and what happened.',
  logCols: ['Turn', '🫧', '🌱', '🛡️', '🔬', '📡', 'What happened?'],
  dataTitle: 'NASA data in the game',
  data: [
    ['Solar storms (2024, 2017, 2003, 1972)', 'Radiation measured on Mars by Curiosity’s RAD and MAVEN; LRO’s CRaTER at the Moon.'],
    ['Space weather this week', 'NASA’s DONKI database of solar flares, checked live on the title screen when online.'],
    ['Oxygen maker', 'MOXIE, which made oxygen from Mars air on Perseverance (2021–2023).'],
    ['Greenhouse', 'Veggie on the space station, and plants grown in Apollo soil (2022).'],
    ['Dust storms and panels', 'Opportunity (2018), InSight (2022) and Spirit’s wind cleanings (2005).'],
    ['Expeditions', 'Perseverance’s route in Jezero Crater, Ingenuity’s flights, and the Artemis south pole sites.'],
    ['Ice', 'Phoenix found ice under Mars soil (2008); LCROSS found water ice in Cabeus crater (2009).'],
    ['Photos', 'NASA’s image library, with the NASA ID on every photo.'],
  ],
  privacy: 'No sign-in, no names, no tracking. Progress stays in this browser. A name typed on a certificate goes only into the picture.',
}

const ar: TeacherText = {
  title: 'للمعلّمين',
  back: '→ العودة إلى اللعبة',
  intro:
    'SolSurvivor مهمة مدتها 20 دقيقة للأعمار من 7 إلى 12 سنة. يوزّع الطلاب كمية صغيرة من الطاقة في كل دور بين الهواء والطعام وملجأ العاصفة والعلم والراديو إلى الأرض. تعمل في أي متصفح، ولا تحتاج حسابات، ولا تجمع أي بيانات.',
  goalsTitle: 'ما يتدرّب عليه الطلاب',
  goals: [
    'المفاضلة: الطاقة لا تكفي لكل شيء أبدًا، فلكل خيار ثمن.',
    'التخطيط المسبق: النباتات تحتاج دورين لتنمو، والتحذيرات تصل قبل العواصف بدور.',
    'الطقس الفضائي: لماذا العواصف الشمسية خطرة على المريخ والقمر، وكيف تساعد الحماية.',
    'قراءة البيانات: المقاييس، ومعاينة مباشرة لنهاية الدور، ورسم بياني للمهمة كلها.',
    'علم حقيقي: كل عاصفة وموقع وصورة من مهمة حقيقية لناسا، واللعبة تقول ذلك.',
  ],
  lessonTitle: 'درس في 20 دقيقة',
  lesson: [
    ['دقيقتان', 'اسأل: ماذا تحتاج لتبقى حيًّا على المريخ؟ اكتب الإجابات على السبورة.'],
    ['3 دقائق', 'أعطِ الصف رمز مهمة واحدًا. يلعب الجميع الدور الأول المرشَد معًا.'],
    ['10 دقائق', 'يلعب الطلاب فرادى أو في فرق من 2 إلى 4 (لعب الفريق على حاسوب واحد).'],
    ['5 دقائق', 'ناقشوا بالأسئلة أدناه ومفتاح المعلّم: من سمع تحذير العاصفة؟'],
  ],
  questionsTitle: 'أسئلة للنقاش',
  questions: [
    'على ماذا أنفقت طاقتك أولًا؟ ولماذا؟',
    'جاءت عاصفة مع تحذير. ماذا فعلت بشكل مختلف في ذلك الدور؟',
    'لماذا يجب أن تزرع قبل أن ينفد الطعام؟',
    'هل كانت الرحلة الاستكشافية تستحق الطاقة التي أخذتها؟ ماذا وجدت؟',
    'سيواجه رواد فضاء حقيقيون هذه الخيارات. ماذا تقول لهم؟',
  ],
  makerTitle: 'أنشئ مهمة للصف',
  makerHow: 'كل طالب يكتب هذا الرمز يواجه العواصف نفسها في الأدوار نفسها، فتستطيعون مقارنة الخيارات. الأرقام الفردية لمستوى المتدرّب، والزوجية لمستوى القائد.',
  world: 'العالم',
  level: 'المستوى',
  newCode: 'رمز جديد',
  code: 'رمز المهمة',
  keyTitle: 'مفتاح المعلّم',
  keyHow: 'ما يصيب القاعدة في كل دور. تحذيرات العواصف تصل قبلها بدور، لكن فقط إذا كان الراديو شغّالًا.',
  turn: 'الدور',
  event: 'ماذا يحدث',
  warning: 'تحذير؟',
  warnYes: 'نعم، إذا كان الراديو شغّالًا',
  warnNo: 'بلا تحذير',
  calm: 'هادئ',
  printKey: 'اطبع المفتاح',
  printLog: 'اطبع سجلات المهمة للطلاب',
  logTitle: 'سجل المهمة',
  logHow: 'اكتب ما خطّطت له في كل دور وما حدث.',
  logCols: ['الدور', '🫧', '🌱', '🛡️', '🔬', '📡', 'ماذا حدث؟'],
  dataTitle: 'بيانات ناسا في اللعبة',
  data: [
    ['العواصف الشمسية (2024، 2017، 2003، 1972)', 'إشعاع قاسه على المريخ جهاز RAD على كيوريوسيتي والمسبار مافن، وجهاز كريتر على LRO عند القمر.'],
    ['الطقس الفضائي هذا الأسبوع', 'قاعدة بيانات DONKI من ناسا للتوهجات الشمسية، تُفحص مباشرة في شاشة البداية عند الاتصال.'],
    ['صانع الأكسجين', 'جهاز موكسي الذي صنع الأكسجين من هواء المريخ على برسيفيرانس (2021–2023).'],
    ['الدفيئة', 'تجربة فيجي في محطة الفضاء، ونباتات زُرعت في تربة أبولو (2022).'],
    ['عواصف الغبار والألواح', 'أوبورتيونيتي (2018)، وإنسايت (2022)، وتنظيف الرياح لألواح سبيريت (2005).'],
    ['الرحلات', 'طريق برسيفيرانس في فوهة جيزيرو، وطيران إنجنيويتي، ومواقع أرتميس عند القطب الجنوبي.'],
    ['الجليد', 'وجد فينيكس جليدًا تحت تربة المريخ (2008)، ووجد LCROSS جليد ماء في فوهة كابيوس (2009).'],
    ['الصور', 'مكتبة صور ناسا، مع رقم ناسا على كل صورة.'],
  ],
  privacy: 'لا تسجيل دخول، ولا أسماء، ولا تتبّع. يبقى التقدّم في هذا المتصفح. الاسم المكتوب على الشهادة يذهب إلى الصورة فقط.',
}

export const teacherText: Record<Lang, TeacherText> = { en, ar }
