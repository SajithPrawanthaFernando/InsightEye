import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigation } from "expo-router";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [heartRate, setHeartRate] = useState("");
  const [calories, setCalories] = useState("");
  const [weight, setWeight] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [image, setImage] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const navigation = useNavigation();

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setHeartRate(data.heartRate || "");
        setCalories(data.calories || "");
        setWeight(data.weight || "");
        setEditedData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          bmi: data.bmi || "",
          budget: data.budget || "",
          sleepHours: data.sleepHours || "",
        });
        setImage(data.profilePicture || null);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setImage(selectedImage);
      uploadImage(selectedImage);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "users", user.uid), {
          profilePicture: downloadURL,
        });
        Alert.alert("Success", "Profile picture updated successfully!");
        fetchUserData(); // Re-fetch data to update UI
      }
    } catch (error) {
      Alert.alert("Upload Error", error.message);
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          heartRate,
          calories,
          weight,
          ...editedData,
        });
        Alert.alert("Success", "Profile updated successfully!");
        fetchUserData(); // Re-fetch data to update UI
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert("Update Error", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("login");
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteDoc(doc(db, "users", user.uid));
        await signOut(auth);
        Alert.alert("Profile Deleted", "Your profile has been deleted.");
        navigation.navigate("login");
      }
    } catch (error) {
      Alert.alert("Delete Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleImagePicker}>
          <Image
            source={{
              uri:
                image ||
                "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.profileName}>{userData?.name || "User"}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <MaterialCommunityIcons
            name="heart-pulse"
            size={32}
            color="#007bff"
          />
          {isEditing ? (
            <TextInput
              style={[styles.input, { width: 70 }]}
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="numeric"
              placeholder="Heart rate"
            />
          ) : (
            <Text style={styles.statValue}>{heartRate || "N/A"}</Text>
          )}
          <Text style={styles.statLabel}>Heart rate</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="fire" size={32} color="#007bff" />
          {isEditing ? (
            <TextInput
              style={[styles.input, { width: 70 }]}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="Calories"
            />
          ) : (
            <Text style={styles.statValue}>{calories || "N/A"}</Text>
          )}
          <Text style={styles.statLabel}>Calories</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons
            name="scale-bathroom"
            size={32}
            color="#007bff"
          />
          {isEditing ? (
            <TextInput
              style={[styles.input, { width: 70 }]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="Weight"
            />
          ) : (
            <Text style={styles.statValue}>{weight || "N/A"}</Text>
          )}
          <Text style={styles.statLabel}>Weight</Text>
        </View>
      </View>

      {userData && (
        <View style={styles.detailsContainer}>
          {isEditing ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={editedData.name}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, name: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={editedData.phone}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, phone: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={editedData.email}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, email: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={editedData.address}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, address: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>BMI</Text>
                <TextInput
                  style={styles.input}
                  placeholder="BMI"
                  value={editedData.bmi}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, bmi: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Budget</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Budget"
                  value={editedData.budget}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, budget: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Sleeping Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Sleeping Hours"
                  value={editedData.sleepHours}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, sleepHours: text })
                  }
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Full Name</Text>
                <Text style={styles.detailText}>{userData.name}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailText}>{userData.phone}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailText}>{userData.email}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailText}>{userData.address}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>BMI</Text>
                <Text style={styles.detailText}>{userData.bmi}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Budget</Text>
                <Text style={styles.detailText}>{userData.budget}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Sleeping Hours</Text>
                <Text style={styles.detailText}>{userData.sleepHours}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    Alert.alert(
                      "Delete Profile",
                      "Are you sure you want to delete your profile?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          onPress: handleDelete,
                          style: "destructive",
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.buttonText}>Delete Profile</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  profileHeader: {
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  inputContainer: {
    marginVertical: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#e9ecef",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007bff",
  },
  statLabel: {
    fontSize: 14,
    color: "#6c757d",
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailBox: {
    backgroundColor: "#e9ecef",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6c757d",
  },
  detailText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    height: 50,
    width: "47%",
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    height: 50,
    width: "47%",
    backgroundColor: "#28a745",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    height: 50,
    width: "47%",
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    height: 50,
    width: "47%",
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    height: 50,
    backgroundColor: "#ffc107",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  logoutButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
