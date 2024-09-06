import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { db } from '../../hooks/firebase'; // Import Firestore DB connection
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const TasksManagement = () => {
  const [tasks, setTasks] = useState([]);
  const navigation = useNavigation();

  // Function to fetch tasks from Firestore
  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const tasksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksList);
      console.log('Tasks fetched successfully: ', tasksList);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  // Fetch tasks when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  // Function to handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(tasks.filter(task => task.id !== taskId));
      Alert.alert('Success', 'Task deleted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task. Please try again.');
      console.error('Error deleting task: ', error);
    }
  };

  // Function to handle task editing
  const handleEditTask = (taskId) => {
    navigation.navigate('EditTask', { taskId }); // Replace 'EditTask' with your edit screen name
  };

  // Render each task item
  const renderItem = ({ item }) => (
    console.log(item),
    <View style={styles.taskItem}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDes}>{item.description}</Text>
      <View style={styles.dueInfoContainer}>
        <Text style={styles.dueText}>{item.dueDate} at {item.dueTime}</Text>
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => handleEditTask(item.id)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTasks')}
      >
        <Text style={styles.addButtonText}>Add New Task</Text>
      </TouchableOpacity>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    padding: 20,
    backgroundColor: '#000080',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskItem: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  taskTitle: {
    color: '#000080',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskDes: {
    fontSize: 20,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 30,
  },
  editButton: {
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#000080',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    borderRadius: 8,
  },
  deleteButton: {
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#ff0000',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    borderRadius: 8,
  },
  dueInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dueText: {
    fontSize: 16,
  },
});

export default TasksManagement;
