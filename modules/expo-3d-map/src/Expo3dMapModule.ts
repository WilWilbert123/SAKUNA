import { NativeModule, requireNativeModule } from 'expo';

declare class Expo3dMapModule extends NativeModule<{}> {}

export default requireNativeModule<Expo3dMapModule>('Expo3dMap');
