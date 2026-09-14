import type { IconName } from '../../shared/components/Icon/Icon'

export interface HomeModule {
  id: string
  name: string
  icon: IconName
  description: string
  ready: boolean
}
