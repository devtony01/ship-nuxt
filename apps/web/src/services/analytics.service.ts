import config from 'config';
import mixpanel from 'mixpanel-browser'

import type { User } from 'types'

export const init = () => {
  mixpanel.init(config.MIXPANEL_API_KEY ?? '',
    { debug: config.IS_DEV }
  )
}

export const setUser = (user: User | undefined) => {
  if (user) {
    mixpanel.identify(user.id!.toString())

    mixpanel.people.set({
      firstName: user.firstName,
      lastName: user.lastName,
    })
  }
}

export const track = (event: string, data = {}) => {
  try {
    mixpanel.track(event, data)
  } catch (e) {
    console.error(e)
  }
}