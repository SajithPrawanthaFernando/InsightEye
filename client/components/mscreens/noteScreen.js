import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Button } from 'react-native';
import { db } from "../../hooks/firebase"; // Ensure this path is correct for your Firebase config
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Print from 'expo-print';

const NoteScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notes'), (snapshot) => {
      const notesList = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesList);
    }, (error) => {
      Alert.alert('Error', 'Could not fetch notes.');
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  const handleAddButtonPress = () => {
    navigation.navigate('NoteInput', { isEditing: false });
  };

  const handleEditNote = (note) => {
    navigation.navigate('EditNoteScreen', { note });
  };

  const handleViewNote = (note) => {
    navigation.navigate('ViewNoteScreen', { note });
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'notes', noteId));
            } catch (error) {
              Alert.alert('Error', 'Could not delete the note.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const generatePDF = async () => {
    const htmlContent = `
      <h1>Math Report</h1>
      <h2>Lessons</h2>
      <ul>
        ${notes.map(note => `
          <li><strong>${note.title}</strong>: ${note.description || 'No description'}</li>
        `).join('')}
      </ul>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      Alert.alert('PDF Generated', `File saved to ${uri}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Could not generate PDF.');
    }
  };

  const handleViewLessons = () => {
    navigation.navigate('StudentLessonScreen', { lessons: notes });
  };

  const renderNote = ({ item }) => (
    <View style={styles.noteContainer}>
      <View style={styles.noteTextContainer}>
        <Text style={styles.noteTitle}>{item.title}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleViewNote(item)} style={styles.iconButton}>
          <Icon name="eye" size={20} color="#000080" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditNote(item)} style={styles.iconButton}>
          <Icon name="edit" size={20} color="#000080" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteNote(item._id)} style={styles.iconButton}>
          <Icon name="trash" size={20} color="#ff4d4d" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Math Lesson</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddButtonPress}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item._id}
      />
      <View style={styles.buttonWrapper}>
        <Button title="Generate Report" onPress={generatePDF} color="#000080" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 0,
    textAlign: 'center',
    color: '#000080',
  },
  addButton: {
    backgroundColor: '#000080',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  noteContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTextContainer: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginHorizontal: 5,
  },
  buttonWrapper: {
    marginVertical: 20,
  },
});

export default NoteScreen;
