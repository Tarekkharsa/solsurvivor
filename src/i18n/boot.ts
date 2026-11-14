import { setLang, setWorldWords, type Lang } from '.'
import { load } from '../lib/save'

// Language before anything renders: the URL wins, then the last choice, then the browser.
const fromUrl = new URLSearchParams(location.search).get('lang')
const saved = load<{ lang?: Lang }>('lang', {}).lang
const browser = navigator.language?.startsWith('ar') ? 'ar' : 'en'
setLang(fromUrl === 'ar' || fromUrl === 'en' ? fromUrl : (saved ?? browser))
setWorldWords(new URLSearchParams(location.search).get('world') === 'moon' ? 'moon' : 'mars')
