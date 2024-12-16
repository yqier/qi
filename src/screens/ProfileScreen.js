import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useUser} from '../context/UserContext';
import {useNavigation} from '@react-navigation/native';

const ProfileScreen = () => {
  const {user, logout} = useUser();
  const navigation = useNavigation();

  if (!user) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Sign in now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome{user.email}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loginButton: {
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 20,
  },
  logoutButton: {
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
