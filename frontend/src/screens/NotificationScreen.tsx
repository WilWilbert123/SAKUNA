import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useAppContext } from '../context/AppContext';
import AgenticAIAssistant from '../components/AgenticAIAssistant';

export default function NotificationScreen() {
  const { state } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={state.notifications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item}</Text>
          </View>
        )}
      />
      <AgenticAIAssistant />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    backgroundColor: '#ffc2c2',
    marginBottom: 10,
    borderRadius: 8,
  },
});
