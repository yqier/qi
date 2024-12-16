import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';

const OrderDetailScreen = ({route}) => {
  const {order} = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order ID: {order.id}</Text>
      <Text style={styles.status}>Status: {order.status}</Text>
      <FlatList
        data={order.items}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
            <Text style={styles.itemPrice}>
              Price: ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        )}
      />
      <Text style={styles.total}>Total: ${order.total.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  item: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default OrderDetailScreen;
