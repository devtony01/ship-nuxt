import config from 'config'
import { accountApi } from 'resources/account'
import { analyticsService } from 'services'

export default defineNuxtPlugin(() => {
  if (!config.MIXPANEL_API_KEY) return

  const { data: account, dataUpdatedAt } = accountApi.useGet()

  watch(dataUpdatedAt, () => {
    if (dataUpdatedAt.value) {
      analyticsService.init()
      analyticsService.setUser(account.value)
    }
  }, { immediate: true })
})