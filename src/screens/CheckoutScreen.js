import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useUser} from '../context/UserContext';
import {useCart} from '../context/CartContext'; // 确保这个 Hook 是在函数组件顶层调用的
import {useOrders} from '../context/OrderContext';
import {BASE_URL} from '../config/BASE_URLS';

const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {priceToPay} = route.params; // 从路由参数获取总价
  const [card, setCard] = useState({
    cardName: '',
    cardNumber: '',
    validThrough: '',
    cvv: '',
  });

  // 确保在函数组件的顶层调用
  const {cartItems} = useCart(); // 获取购物车项

  const {loadCartItems} = useCart(); // 用于刷新购物车
  const {refreshOrders} = useOrders(); // 用于刷新订单列表
  const {user} = useUser(); // 从 UserContext 获取当前用户信息

  const handleCardInput = (field, value) => {
    setCard({...card, [field]: value});
  };

  const payForOrder = async () => {
    try {
      if (!user || !user.token) {
        Alert.alert(
          'Error',
          'User authentication failed. Please log in again.',
        );
        navigation.navigate('Profile'); // 跳转到登录页面
        return;
      }

      const userId = user.id; // 使用从 UserContext 获取的 userId
      const jwtToken = user.token; // 使用从 UserContext 获取的 jwtToken
      console.log('JWT Token:', jwtToken);
      console.log('User ID:', userId);

      // 确保 cartItems 数据存在
      console.log('Cart Items:', cartItems);

      const url = `${BASE_URL}/api/order/add?userId=${userId}`;
      console.log('Request URL:', url);

      const requestBody = {
        cardDetails: card,
        amount: priceToPay,
        cartItems: cartItems, // 将购物车数据添加到请求体
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('Response Result:', result);

      if (result.success) {
        Alert.alert('Success', result.responseMessage, [
          {
            text: 'OK',
            onPress: async () => {
              await refreshOrders(); // 刷新订单数据
              await loadCartItems(); // 清空购物车数据
              navigation.navigate('Orders'); // 跳转到订单页面
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.responseMessage || 'Payment failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
      console.error('Payment Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Name on Card"
        value={card.cardName}
        onChangeText={text => handleCardInput('cardName', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Card Number"
        keyboardType="numeric"
        value={card.cardNumber}
        onChangeText={text => handleCardInput('cardNumber', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Valid Through (MM/YY)"
        value={card.validThrough}
        onChangeText={text => handleCardInput('validThrough', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="CVV"
        keyboardType="numeric"
        secureTextEntry
        value={card.cvv}
        onChangeText={text => handleCardInput('cvv', text)}
      />
      <TouchableOpacity style={styles.payButton} onPress={payForOrder}>
        <Text style={styles.payButtonText}>Pay {priceToPay}₽</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
  },
  payButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
