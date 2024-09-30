import { createStackNavigator } from '@react-navigation/stack';
import NoteScreen from './noteScreen';
import ViewNoteScreen from './ViewNoteScreen'; // Make sure this import is correct
import EditNoteScreen from './EditNoteScreen'; // Ensure all screens are imported

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="NoteScreen">
      <Stack.Screen name="NoteScreen" component={NoteScreen} />
      <Stack.Screen name="ViewNoteScreen" component={ViewNoteScreen} />
      <Stack.Screen name="EditNoteScreen" component={EditNoteScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
