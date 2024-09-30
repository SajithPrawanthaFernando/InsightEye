import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const ViewNoteScreen = ({ route, navigation }) => {
  const { note } = route.params;

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Note not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.content}>{note.content}</Text>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Add margin to separate from content
    alignSelf: 'flex-end', // Align to the right of the screen
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default ViewNoteScreen;
