import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';

const DeliveryOrdersScreen = () => {
  const [orders, setOrders] = useState([
    {
      id: '1',
      customerName: 'Alice',
      address: '123 Main St, City A',
      status: 'Pending', // 订单状态: Pending, Processing, Delivered
    },
    {
      id: '2',
      customerName: 'Bob',
      address: '456 Elm St, City B',
      status: 'Processing',
    },
    {
      id: '3',
      customerName: 'Charlie',
      address: '789 Oak St, City C',
      status: 'Delivered',
    },
  ]);

  // 更新订单状态
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? {...order, status: newStatus} : order,
      ),
    );
  };

  // 分类订单
  const renderOrder = ({item}) => {
    return (
      <View style={styles.orderCard}>
        <Text style={styles.orderText}>客户: {item.customerName}</Text>
        <Text style={styles.orderText}>地址: {item.address}</Text>
        <Text style={styles.orderText}>状态: {item.status}</Text>

        {item.status === 'Pending' && (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => updateOrderStatus(item.id, 'Processing')}>
            <Text style={styles.buttonText}>接受订单</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Processing' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => updateOrderStatus(item.id, 'Delivered')}>
            <Text style={styles.buttonText}>完成订单</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>待接受订单</Text>
      <FlatList
        data={orders.filter(order => order.status === 'Pending')}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
      />

      <Text style={styles.sectionTitle}>进行中订单</Text>
      <FlatList
        data={orders.filter(order => order.status === 'Processing')}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
      />

      <Text style={styles.sectionTitle}>已完成订单</Text>
      <FlatList
        data={orders.filter(order => order.status === 'Delivered')}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  orderCard: {
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  acceptButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  completeButton: {
    marginTop: 10,
    backgroundColor: '#28A745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DeliveryOrdersScreen;
