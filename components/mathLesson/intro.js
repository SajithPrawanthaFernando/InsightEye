import React, { useState } from 'react';
import { View, Text, TextInput, StatusBar, StyleSheet, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import colors from '../misc/colors';
import RoundIconBtn from '../components/RoundIconBtn';

const Intro = ({ onSaveUser }) => {
    const [name, setName] = useState('');

    const handleOnChangeText = (text) => {
        setName(text);
    };

    const handleOnPress = async () => {
        if (name.trim()) {
            try {
                // Saving user's name to Firebase Firestore
                const userRef = firestore().collection('users').doc('userProfile');
                await userRef.set({ name });

                console.log('User Name saved:', name);
                if (onSaveUser) onSaveUser(name);
            } catch (error) {
                console.error('Error saving user name to Firebase:', error);
            }
        } else {
            console.log('Please enter a name.');
        }
    };

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <Text style={styles.inputTitle}>Enter Your Name to Continue</Text>
                <TextInput 
                    value={name}
                    onChangeText={handleOnChangeText}
                    placeholder="Enter Name"
                    style={styles.textInput}
                />
                <RoundIconBtn
                    icon="arrowright"
                    size={24}
                    color="#fff"
                    onPress={handleOnPress}
                    style={styles.iconBtn}
                />
            </View>
        </>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    inputTitle: {
        fontSize: 18,
        color: colors.primary,
        marginBottom: 10,
    },
    textInput: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        fontSize: 18,
        paddingVertical: 5,
        marginBottom: 20,
    },
    iconBtn: {
        alignSelf: 'flex-end',
    },
});

export default Intro;
