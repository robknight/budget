import { configureObservablePersistence } from '@legendapp/state/persist'
// Web
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'

configureObservablePersistence({
  // Use Local Storage on web
  persistLocal: ObservablePersistLocalStorage
})