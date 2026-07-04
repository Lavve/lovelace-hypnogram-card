export function logCardBanner(name: string, version: string): void {
  console.info(
    `%c ${name} %c ${version} `,
    'color: lime; background: darkgreen; font-weight: bold; border-radius: 4px 0 0 4px; padding: 4px 6px;',
    'color: darkgreen; background: lime; font-weight: bold; border-radius: 0 4px 4px 0; padding: 4px 6px;',
  )
}
