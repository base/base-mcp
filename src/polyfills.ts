import { randomUUID } from 'expo-crypto';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';
import { setupURLPolyfill } from 'react-native-url-polyfill';

setupURLPolyfill();
polyfillWebCrypto();
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
crypto.randomUUID = randomUUID;
