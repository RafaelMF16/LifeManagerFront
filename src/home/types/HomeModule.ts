import type { IconName } from '../../shared/components/Icon/Icon'

// `id` doubles as an i18next key lookup (`home:modules.${id}.name`/`.description` in
// ModuleCard) — renaming it means updating src/home/locales/{en-US,pt-BR}.ts too.
export interface HomeModule {
  id: string
  icon: IconName
  ready: boolean
}
