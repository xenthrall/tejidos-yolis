export function brandIcon(svgMarkup, className = '') {
  return svgMarkup.replace('<svg ', `<svg class="${className}" fill="currentColor" `)
}
