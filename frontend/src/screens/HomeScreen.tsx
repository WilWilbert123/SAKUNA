import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Modal, FlatList } from 'react-native';
import Expo3dMapView from '../../../modules/expo-3d-map/src/Expo3dMapView';
import AgenticAIAssistant from '../components/AgenticAIAssistant';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

type EarthquakeFeature = {
  id: string;
  lat: number;
  lng: number;
  mag: number;
};

type FeedOption = {
  label: string;
  url: string | null;
};

const FEED_OPTIONS: FeedOption[] = [
  { label: 'Off', url: null },
  { label: 'Live (Past Hour)', url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson' },
  { label: 'Magnitude 4.5+ (Past Day)', url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson' },
  { label: 'Significant (Past 7 Days)', url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson' },
];

export default function HomeScreen() {
  const { setCurrentRegion } = useAppContext();
  const [activeFeed, setActiveFeed] = useState<FeedOption>(FEED_OPTIONS[0]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeFeature[]>([]);

  useEffect(() => {
    // Mock setting the current region to San Francisco for the AI context
    setCurrentRegion({ latitude: 37.7749, longitude: -122.4194, altitude: 10000 });
  }, []);

  const selectFeed = async (feed: FeedOption) => {
    setIsModalVisible(false);
    setActiveFeed(feed);

    if (!feed.url) {
      setEarthquakeData([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(feed.url);
      const json = await response.json();

      const parsedData: EarthquakeFeature[] = json.features.map((feature: any) => ({
        id: feature.id,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        mag: feature.properties.mag,
      }));

      setEarthquakeData(parsedData);
    } catch (error) {
      console.error("Failed to fetch earthquakes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isEarthquakeMode = activeFeed.url !== null;

  return (
    <View style={styles.container}>
      <Expo3dMapView style={styles.map} earthquakeData={earthquakeData} />

      {/* Realtime Earthquake Toggle - Top Left */}
      <View style={styles.topLeftContainer}>
        <TouchableOpacity 
          onPress={() => setIsModalVisible(true)}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <BlurView intensity={100} tint="dark" style={styles.glassButton}>
            {isLoading ? (
              <ActivityIndicator color="#ff3b30" size="small" />
            ) : (
              <Ionicons name="pulse" size={20} color={isEarthquakeMode ? "#ff3b30" : "#fff"} />
            )}
          </BlurView>
        </TouchableOpacity>
      </View>

      <AgenticAIAssistant />

      {/* Feed Selection Modal - Small Liquid Glass */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsModalVisible(false)}>
          <BlurView intensity={100} tint="dark" style={styles.glassModal}>
            <Text style={styles.modalTitle}>Earthquake Feed</Text>
            <FlatList
              data={FEED_OPTIONS}
              keyExtractor={(item) => item.label}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.feedOption,
                    activeFeed.label === item.label && styles.feedOptionActive
                  ]}
                  onPress={() => selectFeed(item)}
                >
                  <Text style={[
                    styles.feedOptionText,
                    activeFeed.label === item.label && styles.feedOptionTextActive
                  ]}>
                    {item.label}
                  </Text>
                  {activeFeed.label === item.label && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              )}
            />
          </BlurView>
        </TouchableOpacity>
      </Modal>
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
  topLeftContainer: {
    position: 'absolute',
    top: 60, // Clear iOS status bar / safe area
    left: 20,
    zIndex: 1000,
  },
  glassButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)', // Lighter background
  },
  glassModal: {
    position: 'absolute',
    top: 90, // 60 (top of button) + 44 (height) + 8 (gap)
    left: 70, // Align with button
    width: 240, // Small modal
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#ffffffff',
  },
  feedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  feedOptionActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
  },
  feedOptionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  feedOptionTextActive: {
    color: '#fff',
    fontWeight: '700',
  }
});
