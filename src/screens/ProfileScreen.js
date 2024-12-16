import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useUser} from '../context/UserContext';
import {useNavigation} from '@react-navigation/native';
import {BASE_URL} from '../config/BASE_URLS';

const ProfileScreen = () => {
  const {user, logout} = useUser();
  const [userDetails, setUserDetails] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      // 调用 API 获取用户详细信息
      fetch(`${BASE_URL}/api/user/${user.id}/details`)
        .then(response => response.json())
        .then(data => setUserDetails(data))
        .catch(error => console.error('Error fetching user details:', error));
    }
  }, [user]);

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

  if (!userDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.welcomeText}>
          Welcome, {userDetails.firstName} {userDetails.lastName}
        </Text>
        <Text style={styles.infoText}>Email: {userDetails.emailId}</Text>
        <Text style={styles.infoText}>Phone: {userDetails.phoneNo}</Text>
        <Text style={styles.infoText}>Role: {userDetails.role}</Text>
        <Text style={styles.infoText}>
          Address:{' '}
          {userDetails.address
            ? `${userDetails.address.street}, ${userDetails.address.city}`
            : 'No address available'}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
    width: '100%',
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  loginButton: {
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 15,
    backgroundColor: '#FF6347',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
