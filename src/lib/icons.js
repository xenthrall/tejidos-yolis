import { createElement } from 'lucide'

export function icon(node, { class: className = '', strokeWidth } = {}) {
  const attrs = { class: className }
  if (strokeWidth) attrs['stroke-width'] = strokeWidth
  return createElement(node, attrs).outerHTML
}
