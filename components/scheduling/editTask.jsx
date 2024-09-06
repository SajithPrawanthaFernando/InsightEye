import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../../hooks/firebase'; // Ensure this path is correct
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const EditTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskDoc = doc(db, 'tasks', taskId);
        const taskSnap = await getDoc(taskDoc);
        if (taskSnap.exists()) {
          const taskData = taskSnap.data();
          setTitle(taskData.title);
          setDescription(taskData.description);

          // Convert dueDate string to Date object
          const [month, day, year] = taskData.dueDate.split('/').map(num => parseInt(num, 10));
          setDate(new Date(year, month - 1, day)); // Note: month is 0-based

          // Convert time string to Date object
          const [hours, minutes, seconds] = taskData.dueTime.split(':');
          const ampm = taskData.dueTime.split(' ')[1];
          const hours24 = ampm === 'PM' ? parseInt(hours, 10) + 12 : parseInt(hours, 10);
          const timeString = `${hours24}:${minutes}:${seconds}`;
          const timeDate = new Date();
          const [hh, mm, ss] = timeString.split(':').map(num => parseInt(num, 10));
          timeDate.setHours(hh, mm, ss);
          setTime(timeDate); // Use a Date object for time
        } else {
          Alert.alert('Error', 'Task not found.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch task. Please try again.');
        console.error('Error fetching task: ', error);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleUpdateTask = async () => {
    if (!title || !description || !date || !time) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const taskDoc = doc(db, 'tasks', taskId);
      await updateDoc(taskDoc, {
        title,
        description,
        dueDate: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`, // Format date as string
        dueTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }), // Format time as string
        updatedAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Task updated successfully!');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
      console.error('Error updating task: ', error);
    }
  };

  const showDatePickerDialog = () => {
    setShowDatePicker(true);
  };

  const showTimePickerDialog = () => {
    setShowTimePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Task</Text>

      {/* Task Input Form */}
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
      />

      {/* Date Input */}
      <TextInput
        style={styles.input}
        placeholder="Select Due Date"
        value={date.toLocaleDateString()} // Display date as mm/dd/yyyy
        onFocus={showDatePickerDialog}
      />

      {/* Time Input */}
      <TextInput
        style={styles.input}
        placeholder="Select Due Time"
        value={time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} // Display time as hh:mm:ss AM/PM
        onFocus={showTimePickerDialog}
      />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleUpdateTask}>
        <Text style={styles.submitButtonText}>Update Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 80,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000080',
    marginBottom: 40,
  },
  input: {
    width: '90%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 20,
  },
  submitButton: {
    width: '90%',
    padding: 15,
    backgroundColor: '#000080',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditTask;
