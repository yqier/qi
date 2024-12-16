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
import {useCart} from '../context/CartContext';

const CartScreen = ({navigation}) => {
  const {cartItems, loading, removeCartItem, updateQuantity, loadCartItems} =
    useCart();

  useEffect(() => {
    console.log('Calling loadCartItems:', loadCartItems); // 确认 loadCartItems 是否定义
    loadCartItems;
  }, []);

  // 计算总价
  const calculateTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.food.price * item.quantity,
      0,
    );
  };

  console.log(cartItems); // 查看 cartItems 是否有更新

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.cartId}
        renderItem={({item}) => (
          <View style={styles.cartCard}>
            <Image
              source={{
                uri: `http://10.0.2.2:8080/api/food/${item.food.image1}`,
              }}
              style={styles.foodImage}
            />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.foodName}>{item.food.name}</Text>
                <TouchableOpacity onPress={() => removeCartItem(item.cartId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.foodPrice}>Price: {item.food.price}₽</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    updateQuantity(item.cartId, item.quantity - 1)
                  }>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    updateQuantity(item.cartId, item.quantity + 1)
                  }>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() =>
          navigation.navigate('CheckoutScreen', {
            priceToPay: calculateTotalPrice(),
          })
        }>
        <Text style={styles.checkoutText}>
          Checkout : {calculateTotalPrice()}₽
        </Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeText: {
    fontSize: 14,
    color: '#FF0000',
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
  quantityButton: {
    backgroundColor: '#007BFF',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen;
