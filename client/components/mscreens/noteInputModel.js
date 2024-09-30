import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { db } from "../../hooks/firebase";
import { collection, addDoc } from 'firebase/firestore';

const NoteInputScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Both title and content are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'notes'), { title, content });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not save the note.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Note Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      <Text style={styles.label}>Enter Note Content:</Text>
      <TextInput
        style={[styles.input, styles.contentInput]}
        value={content}
        onChangeText={setContent}
        placeholder="Content"
        multiline
        textAlignVertical="top" // Ensures text starts at the top of the TextInput
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Note</Text>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  contentInput: {
    height: 500, // Adjust height for a larger content input box
    textAlignVertical: 'top', // Align text to the top
    paddingVertical: 10, // Add vertical padding for better spacing
  },
  saveButton: {
    backgroundColor: '#000080',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default NoteInputScreen;
