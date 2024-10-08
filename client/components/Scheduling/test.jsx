// useEffect(() => {
    
  //   const fetchTask = async () => {
  //     try {
  //       const taskDoc = doc(db, 'tasks', taskId);
  //       const taskSnap = await getDoc(taskDoc);
  //       if (taskSnap.exists()) {
  //         const taskData = taskSnap.data();
  //         setTitle(taskData.title);
  //         setDescription(taskData.description);

  //         // Convert dueDate string to Date object
  //         const [month, day, year] = taskData.dueDate.split('/').map(num => parseInt(num, 10));
  //         setDate(new Date(year, month - 1, day)); // Note: month is 0-based

  //         // Convert time string to Date object
  //         const [hours, minutes, seconds] = taskData.dueTime.split(':');
  //         const ampm = taskData.dueTime.split(' ')[1];
  //         const hours24 = ampm === 'PM' ? parseInt(hours, 10) + 12 : parseInt(hours, 10);
  //         const timeString = `${hours24}:${minutes}:${seconds}`;
  //         const timeDate = new Date();
  //         const [hh, mm, ss] = timeString.split(':').map(num => parseInt(num, 10));
  //         timeDate.setHours(hh, mm, ss);
  //         setTime(timeDate); // Use a Date object for time
  //       } else {
  //         Alert.alert('Error', 'Task not found.');
  //       }
  //     } catch (error) {
  //       Alert.alert('Error', 'Failed to fetch task. Please try again.');
  //       console.error('Error fetching task: ', error);
  //     }
  //   };

  //   fetchTask();
  // }, [taskId]);