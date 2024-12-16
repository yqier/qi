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
import {useDispatch} from 'react-redux'; // 导入 dispatch
import {setUserId, setToken} from '../reducers/cartReducer'; // 导入 setUserId 和 setToken 动作
import {useUser} from '../context/UserContext'; // 导入 useUser
import {BASE_URL} from '../config/BASE_URLS'; // 导入 BASE_URL
import axios from 'axios'; // 导入 axios

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer'); // 默认角色为顾客
  const navigation = useNavigation();
  const {setUser} = useUser(); // 获取 setUser
  const dispatch = useDispatch(); // 获取 dispatch

  const handleLogin = async () => {
    try {
      // 清除旧的用户信息
      await AsyncStorage.removeItem('jwtToken').catch(err =>
        console.error('Failed to remove JWT Token:', err),
      );
      await AsyncStorage.removeItem('user').catch(err =>
        console.error('Failed to remove User:', err),
      );

      const loginRequest = {
        emailId: email,
        password: password,
        role: role,
      };

      console.log('Login Request:', loginRequest);

      console.log('Using BASE_URL:', BASE_URL);
      const response = await fetch(`${BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });

      const res = await response.json();
      console.log('API Response:', res);

      if (res.success) {
        const updatedUser = {...res.user, token: res.jwtToken};

        // 存储 token 和用户信息到 AsyncStorage
        await AsyncStorage.setItem('jwtToken', res.jwtToken);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

        setUser(updatedUser); // 更新用户状态

        // 将 userId 和 token 存入 Redux
        dispatch(setUserId(res.user.id));
        dispatch(setToken(res.jwtToken)); // 保存 token 到 Redux

        console.log('Updated User Context:', updatedUser);

        // 设置 Axios 请求头，添加 Authorization token
        axios.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${res.jwtToken}`;

        // 跳转到主页面
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'BottomTabNavigator'}],
          });
        }, 100);

        Alert.alert('Login Success', res.responseMessage);
      } else {
        Alert.alert('Login Failed', res.responseMessage);
      }
    } catch (error) {
      console.error('Login Error:', error);
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

      {/* 替换按钮为文字链接 */}
      <Text style={styles.registerText}>
        Don't have an account?{' '}
        <Text
          style={styles.registerLink}
          onPress={() => navigation.navigate('RegisterScreen')}>
          Register Now
        </Text>
      </Text>
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
  registerText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  registerLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
