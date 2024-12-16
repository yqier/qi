import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useOrders} from '../context/OrderContext';

const OrdersScreen = () => {
  const {orders, loading, refreshOrders} = useOrders();

  // 页面聚焦时刷新订单
  useFocusEffect(
    useCallback(() => {
      refreshOrders();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.orderId.toString()}
      renderItem={({item}) => (
        <View style={styles.orderCard}>
          {/* 显示订单基本信息 */}
          <Text style={styles.orderId}>Order ID: {item.orderId}</Text>
          <Text style={styles.orderStatus}>Status: {item.status}</Text>

          {/* 显示食物信息 */}
          <View style={styles.foodContainer}>
            <Image
              source={{
                uri: `http://10.0.2.2:8080/api/food/${item.food.image1}`,
              }}
              style={styles.foodImage}
            />
            <View style={styles.foodDetails}>
              <Text style={styles.foodName}>{item.food.name}</Text>
              <Text style={styles.foodDescription}>
                {item.food.description}
              </Text>
            </View>
          </View>

          {/* 显示订单总价 */}
          <Text style={styles.orderTotal}>Total: {item.food.price}₽</Text>
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshOrders} />
      }
    />
  );
};

const styles = StyleSheet.create({
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
    color: '#666',
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 14,
    color: '#666',
  },
  foodContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  foodDetails: {
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
});

export default OrdersScreen;
