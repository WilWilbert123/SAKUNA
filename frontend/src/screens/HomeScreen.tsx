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

type WeatherOption = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  layer: string | null;
};

const WEATHER_OPTIONS: WeatherOption[] = [
  { label: 'Clear Overlays', icon: 'close-circle', layer: null },
  { label: 'Rain / Radar', icon: 'rainy', layer: 'precipitation_new' },
  { label: 'Clouds', icon: 'cloud', layer: 'clouds_new' },
  { label: 'Wind', icon: 'navigate', layer: 'wind_new' },
  { label: 'Heat / Temperature', icon: 'thermometer', layer: 'temp_new' },
];

export default function HomeScreen() {
  const { setCurrentRegion } = useAppContext();
  const [activeFeed, setActiveFeed] = useState<FeedOption>(FEED_OPTIONS[0]);
  const [isEarthquakeModalVisible, setIsEarthquakeModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeFeature[]>([]);

  const [activeWeather, setActiveWeather] = useState<WeatherOption>(WEATHER_OPTIONS[0]);
  const [isWeatherModalVisible, setIsWeatherModalVisible] = useState(false);

  useEffect(() => {
    // Mock setting the current region to San Francisco for the AI context
    setCurrentRegion({ latitude: 37.7749, longitude: -122.4194, altitude: 10000 });
  }, []);

  const selectFeed = async (feed: FeedOption) => {
    setIsEarthquakeModalVisible(false);
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

  const selectWeather = (weather: WeatherOption) => {
    setActiveWeather(weather);
    setIsWeatherModalVisible(false);
  };

  const isEarthquakeMode = activeFeed.url !== null;
  const isWeatherMode = activeWeather.layer !== null;

  return (
    <View style={styles.container}>
      <Expo3dMapView 
        style={styles.map} 
        earthquakeData={earthquakeData} 
        weatherLayer={activeWeather.layer}
      />

      {/* Action Buttons - Top Left */}
      <View style={styles.topLeftContainer}>
        {/* Earthquake Button */}
        <TouchableOpacity 
          onPress={() => setIsEarthquakeModalVisible(true)}
          disabled={isLoading}
          activeOpacity={0.7}
          style={styles.actionButtonContainer}
        >
          <BlurView intensity={100} tint="dark" style={styles.glassButton}>
            {isLoading ? (
              <ActivityIndicator color="#ff3b30" size="small" />
            ) : (
              <Ionicons name="pulse" size={20} color={isEarthquakeMode ? "#ff3b30" : "#fff"} />
            )}
          </BlurView>
        </TouchableOpacity>

        {/* Weather Button */}
        <TouchableOpacity 
          onPress={() => setIsWeatherModalVisible(true)}
          activeOpacity={0.7}
          style={styles.actionButtonContainer}
        >
          <BlurView intensity={100} tint="dark" style={styles.glassButton}>
            <Ionicons name="partly-sunny" size={20} color={isWeatherMode ? "#0A84FF" : "#fff"} />
          </BlurView>
        </TouchableOpacity>
      </View>

      <AgenticAIAssistant />

      {/* Earthquake Feed Selection Modal */}
      <Modal
        visible={isEarthquakeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEarthquakeModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsEarthquakeModalVisible(false)}>
          <BlurView intensity={100} tint="dark" style={styles.glassModal}>
            <Text style={styles.modalTitle}>Earthquake Feed</Text>
            <FlatList
              data={FEED_OPTIONS}
              keyExtractor={(item) => item.label}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    activeFeed.label === item.label && styles.optionItemActive
                  ]}
                  onPress={() => selectFeed(item)}
                >
                  <Text style={[
                    styles.optionText,
                    activeFeed.label === item.label && styles.optionTextActive
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

      {/* Weather Layer Selection Modal */}
      <Modal
        visible={isWeatherModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsWeatherModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsWeatherModalVisible(false)}>
          <BlurView intensity={100} tint="dark" style={styles.glassModalWeather}>
            <Text style={styles.modalTitle}>Weather Layer</Text>
            <FlatList
              data={WEATHER_OPTIONS}
              keyExtractor={(item) => item.label}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    activeWeather.label === item.label && styles.optionItemWeatherActive
                  ]}
                  onPress={() => selectWeather(item)}
                >
                  <View style={styles.weatherOptionLeft}>
                    <Ionicons name={item.icon} size={16} color={activeWeather.label === item.label ? "#fff" : "rgba(255,255,255,0.7)"} style={styles.weatherIcon} />
                    <Text style={[
                      styles.optionText,
                      activeWeather.label === item.label && styles.optionTextActive
                    ]}>
                      {item.label}
                    </Text>
                  </View>
                  {activeWeather.label === item.label && (
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
  actionButtonContainer: {
    marginBottom: 12,
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
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  glassModal: {
    position: 'absolute',
    top: 90, 
    left: 70, 
    width: 240,
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
  glassModalWeather: {
    position: 'absolute',
    top: 148, // Aligned with the second button (90 + 46 + 12 gap)
    left: 70, 
    width: 240,
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
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  optionItemActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)', // Red for earthquake
  },
  optionItemWeatherActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.9)', // Blue for weather
  },
  weatherOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '700',
  }
});
