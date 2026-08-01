import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';
import { ViewProps } from 'react-native';

export type Expo3dMapViewProps = ViewProps;

const NativeView: React.ComponentType<Expo3dMapViewProps> =
  requireNativeViewManager('Expo3dMap');

export default function Expo3dMapView(props: Expo3dMapViewProps) {
  return <NativeView {...props} />;
}
