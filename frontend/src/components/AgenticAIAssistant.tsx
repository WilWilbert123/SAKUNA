import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useAppContext } from '../context/AppContext';

export default function AgenticAIAssistant() {
  const { state } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [response, setResponse] = useState('');

  const analyzeState = () => {
    // This mocks the Agentic AI reading the global state.
    const aiResponse = `I have analyzed the app state.
Current Region: ${state.currentRegion ? JSON.stringify(state.currentRegion) : 'Unknown'}
Total News: ${state.news.length}
Total Reports: ${state.reports.length}
Total Notifications: ${state.notifications.length}

I am ready to assist you further.`;
    setResponse(aiResponse);
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={analyzeState}>
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Agentic AI Analysis</Text>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.modalText}>{response}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.buttonClose}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 1000,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    maxHeight: '70%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  scrollView: {
    width: '100%',
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
    lineHeight: 22,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 100,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
