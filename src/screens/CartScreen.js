import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  loadCartItems,
  updateQuantityAsync,
  removeCartItemAsync,
} from '../reducers/cartActions'; // 更新导入路径
import {BASE_URL} from '../config/BASE_URLS';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = ({navigation}) => {
  const {cartItems, loading, userId, token} = useSelector(state => state.cart);
  const dispatch = useDispatch();

  // 从 AsyncStorage 获取 token 和 userId，并存入 Redux
  useEffect(() => {
    const loadUserData = async () => {
      const storedToken = await AsyncStorage.getItem('jwtToken');
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (storedToken) {
        dispatch(setToken(storedToken)); // 将 token 存入 Redux store
      }
      if (parsedUser) {
        dispatch(setUserId(parsedUser.id)); // 将 userId 存入 Redux store
      }
    };

    loadUserData();
  }, [dispatch]);

  // 更新 axios 请求头
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // 加载购物车数据
  useEffect(() => {
    if (userId && cartItems.length === 0) {
      dispatch(loadCartItems(userId));
    }
  }, [userId, cartItems.length, dispatch]);

  // 计算总价格
  const calculateTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.food.price * item.quantity,
      0,
    );
  };

  // 渲染加载状态
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  // 如果购物车为空
  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.continueText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 更新商品数量
  const handleUpdateQuantity = (cartId, newQuantity) => {
    dispatch(updateQuantityAsync(cartId, newQuantity, userId)); // 使用提取到的异步 action
  };

  // 删除购物车项
  const handleRemoveItem = cartId => {
    dispatch(removeCartItemAsync(cartId, userId)); // 使用提取到的异步 action
  };

  // 渲染购物车项
  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.cartId.toString()}
        renderItem={({item}) => (
          <View style={styles.cartCard}>
            <Image
              source={{uri: `${BASE_URL}/api/food/${item.food.image1}`}}
              style={styles.foodImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.foodName}>{item.food.name}</Text>
              <Text style={styles.foodPrice}>Price: {item.food.price}₽</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() =>
                    handleUpdateQuantity(item.cartId, item.quantity - 1)
                  }>
                  <Text>-</Text>
                </TouchableOpacity>
                <Text>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() =>
                    handleUpdateQuantity(item.cartId, item.quantity + 1)
                  }>
                  <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleRemoveItem(item.cartId)}>
              <Text>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('CheckoutScreen', {
            priceToPay: calculateTotalPrice(),
          })
        }>
        <Text>Checkout: {calculateTotalPrice()}₽</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  continueText: {
    fontSize: 16,
    color: '#007BFF',
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  foodPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CartScreen;
