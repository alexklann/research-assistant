import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = new Storage({
  size: 1000,

  // Use AsyncStorage for RN apps, or window.localStorage for web apps.
  storageBackend: window.localStorage || AsyncStorage,

  defaultExpires: null,
  enableCache: true,

  // if data was not found in storage or expired data was found,
  // the corresponding sync method will be invoked returning
  // the latest data.
  sync: {
    papers: () => {
        return [];
    }
  }
});

export default storage;