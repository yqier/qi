import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../context/UserContext'; // 导入 useUser

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer'); // 默认角色为顾客
  const navigation = useNavigation();
  const {setUser} = useUser(); // 获取 setUser

  const handleLogin = async () => {
    const loginRequest = {
      emailId: email,
      password: password,
      role: role,
    };

    try {
      const response = await fetch('http://10.0.2.2:8080/api/user/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });

      const res = await response.json();
      console.log('Login Response:', res);

      if (res.success) {
        await AsyncStorage.setItem('jwtToken', res.jwtToken);
        await AsyncStorage.setItem('user', JSON.stringify(res.user));
        console.log('New JWT Token Stored:', res.jwtToken);
        // 合并用户信息和 JWT token
        const updatedUser = {...res.user, token: res.jwtToken};

        // 保存完整的用户数据到 AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

        const storedUser = await AsyncStorage.getItem('user');
        console.log('Stored User in AsyncStorage:', JSON.parse(storedUser));

        // 更新全局用户状态
        setUser(updatedUser);

        console.log('User Info with Token:', updatedUser);

        // 跳转到主页面
        navigation.reset({
          index: 0,
          routes: [{name: 'BottomTabNavigator'}],
        });

        Alert.alert('Login Success', res.responseMessage);
      } else {
        Alert.alert('Login Failed', res.responseMessage);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Server is down or network error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'Customer' && styles.roleButtonActive,
          ]}
          onPress={() => setRole('Customer')}>
          <Text style={styles.roleButtonText}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'Delivery' && styles.roleButtonActive,
          ]}
          onPress={() => setRole('Delivery')}>
          <Text style={styles.roleButtonText}>Delivery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#007BFF',
  },
  roleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginButton: {
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
