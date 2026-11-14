import type { Content } from '../sim/types'

/** Translated text for a world, by id. Anything missing stays in English. */
export interface ContentText {
  resources?: Record<string, { label?: string; explain?: string }>
  actions?: Record<string, { label?: string; explain?: string }>
  events?: Record<string, { title?: string; text?: string; source?: string }>
  projects?: Record<string, { label?: string; text?: string }>
  photos?: Record<string, string>
}

export function localize(content: Content, text?: ContentText): Content {
  if (!text) return content
  return {
    ...content,
    resources: content.resources.map((r) => ({ ...r, ...text.resources?.[r.id] })),
    actions: content.actions.map((a) => ({ ...a, ...text.actions?.[a.id] })),
    events: content.events.map((e) => ({ ...e, ...text.events?.[e.id] })),
    projects: content.projects.map((p) => ({ ...p, ...text.projects?.[p.id] })),
  }
}
