import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Expo3dMapView from '../../../modules/expo-3d-map/src/Expo3dMapView';
import AgenticAIAssistant from '../components/AgenticAIAssistant';
import { useAppContext } from '../context/AppContext';

export default function HomeScreen() {
  const { setCurrentRegion } = useAppContext();

  useEffect(() => {
    // Mock setting the current region to San Francisco for the AI context
    setCurrentRegion({ latitude: 37.7749, longitude: -122.4194, altitude: 10000 });
  }, []);

  return (
    <View style={styles.container}>
      <Expo3dMapView style={styles.map} />
      <AgenticAIAssistant />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
});
