import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from "../../hooks/firebase";
import { updateDoc, doc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/AntDesign';

const EditNoteScreen = ({ route, navigation }) => {
  const { note } = route.params; // Note object passed from NoteScreen
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Both title and content are required.');
      return;
    }

    try {
      const noteRef = doc(db, 'notes', note._id);
      await updateDoc(noteRef, { title, content });
      Alert.alert('Success', 'Note updated successfully.');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      Alert.alert('Error', 'Could not update the note.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Note</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter note title"
      />
      <TextInput
        style={[styles.input, styles.multilineInput]} // Apply both styles
        value={content}
        onChangeText={setContent}
        placeholder="Enter note content"
        multiline
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
       
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'#000080',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  multilineInput: {
    height: 500, // Adjust height as needed
    textAlignVertical: 'top', // Ensures text starts from the top
  },
  saveButton: {
    backgroundColor: '#000080',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default EditNoteScreen;
