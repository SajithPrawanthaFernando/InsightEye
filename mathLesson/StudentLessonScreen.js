import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { db } from '../components/config'; // Ensure this path is correct
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook for navigation
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for back button

const StudentLessonScreen = () => {
  const [notes, setNotes] = useState([]);
  const navigation = useNavigation(); // Initialize the navigation object

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notes'), (snapshot) => {
      console.log('Firestore snapshot received'); // Debugging statement
      const notesList = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
      }));
      console.log('Notes fetched:', notesList); // Debugging statement
      setNotes(notesList);
    }, (error) => {
      console.error('Firestore error:', error); // Debugging statement
      Alert.alert('Error', 'Could not fetch notes.');
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  const onSpeak = (textToSpeak) => {
    if (Speech.isSpeakingAsync()) {
      Speech.stop(); // Stop any ongoing speech before starting a new one
    }

    Speech.speak(textToSpeak, {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
      onDone: () => console.log('Speech has finished'),
      onError: (error) => console.error('Speech error:', error),
    });
  };

  const renderNote = ({ item }) => (
    <View style={styles.noteContainer}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteText}>{item.content || 'No description available'}</Text>
      <TouchableOpacity 
        style={styles.speakButton} 
        onPress={() => onSpeak(item.content || 'No description available')}
      >
        <Text style={styles.buttonText}>Speak</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
       
          <Ionicons name="arrow-back" size={24} color="#fff" />
     
        <Text style={styles.header}>Math Notes</Text>
      </View>
      {notes.length === 0 ? (
        <Text style={styles.noNotesText}>No notes available.</Text>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 45, // Top margin for header
  },
  backButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginRight: 10,
    // Added shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  header: {
    fontSize: 34, // Increased font size for the header
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007bff',
    marginLeft:70,
  },
  noteContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  noteTitle: {
    fontSize: 28, // Increased font size for note titles
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noteText: {
    fontSize: 24, // Increased font size for note text
    marginBottom: 15,
  },
  speakButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12, // Increased padding for the button
    paddingHorizontal: 25, // Increased padding for the button
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20, // Increased font size for the button text
  },
  noNotesText: {
    fontSize: 24, // Increased font size for no notes text
    color: '#888',
    textAlign: 'center',
  },
});

export default StudentLessonScreen;
