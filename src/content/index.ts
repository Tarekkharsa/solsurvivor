import type { Content } from '../sim/types'
import { mars } from './mars'

export const worlds: Record<Content['id'], Content> = { mars, moon: mars }
