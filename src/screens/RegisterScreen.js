import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {BASE_URL} from '../config/BASE_URLS';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // 初始用户状态
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    emailId: '',
    password: '',
    phoneNo: '',
    street: '',
    city: '',
    role: 'Customer', // 默认角色
  });

  // 根据路由参数或 URL 更新角色
  useEffect(() => {
    if (route?.params?.role === 'Delivery') {
      setUser(prevState => ({...prevState, role: 'Delivery'}));
    } else if (route?.params?.role === 'Customer') {
      setUser(prevState => ({...prevState, role: 'Customer'}));
    }
  }, [route]);

  // 更新用户输入
  const handleUserInput = (field, value) => {
    setUser({...user, [field]: value});
  };

  // 提交注册数据
  const saveUser = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const res = await response.json();
      if (res.success) {
        Alert.alert('Registration successful!', res.responseMessage);
      } else {
        Alert.alert('Error', res.responseMessage);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'It seems server is down');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* 输入框 */}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={user.firstName}
        onChangeText={value => handleUserInput('firstName', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={user.lastName}
        onChangeText={value => handleUserInput('lastName', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={user.emailId}
        onChangeText={value => handleUserInput('emailId', value)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={user.password}
        onChangeText={value => handleUserInput('password', value)}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={user.phoneNo}
        onChangeText={value => handleUserInput('phoneNo', value)}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={user.city}
        onChangeText={value => handleUserInput('city', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Street"
        value={user.street}
        onChangeText={value => handleUserInput('street', value)}
      />

      {/* 提交按钮 */}
      <TouchableOpacity style={styles.registerButton} onPress={saveUser}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
