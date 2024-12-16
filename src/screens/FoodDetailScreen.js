import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import {useCart} from '../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FoodDetailScreen = ({route, navigation}) => {
  const {foodId} = route.params; // 接收传递的 foodId
  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const {addToCart} = useCart();

  // 从后端获取食品详细信息
  const fetchFoodDetails = async () => {
    try {
      const response = await fetch(
        `http://10.0.2.2:8080/api/food/fetch?foodId=${foodId}`,
      );
      const data = await response.json();

      if (data && Array.isArray(data.foods) && data.foods.length > 0) {
        // 你可以打印出 foods 数组中的第一个元素，查看其结构
        const foodData = data.foods[0];
        setFood({
          ...foodData,
          // 如果你需要对 restaurant 进一步处理，可以提取所需字段
          restaurantName: foodData.restaurant
            ? foodData.restaurant.firstName
            : 'Unknown',
          // 其他字段按需要设置
        });
      } else {
        throw new Error('Invalid food data returned');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to load food details: ${error.message}`);
      navigation.goBack(); // 如果加载失败，返回上一页
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!foodId || isNaN(foodId)) {
      Alert.alert('Error', 'Invalid food ID provided.');
      navigation.goBack();
    } else {
      fetchFoodDetails(); // 在有效的 foodId 下获取数据
    }
  }, [foodId]);

  const addToCartHandler = () => {
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    // 使用已加载的 food 数据直接添加到购物车
    addToCart(food, parsedQuantity);
    Alert.alert('Success', 'Added to cart');
    navigation.navigate('Cart'); // 跳转到购物车页面
  };

  const handleIncrease = () => {
    setQuantity(prevQuantity => (parseInt(prevQuantity, 10) + 1).toString());
  };

  const handleDecrease = () => {
    setQuantity(prevQuantity => {
      const parsedQuantity = parseInt(prevQuantity, 10);
      return parsedQuantity > 1 ? (parsedQuantity - 1).toString() : '1';
    });
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!food) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load food details.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{color: '#007BFF', marginTop: 10}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{uri: `http://10.0.2.2:8080/api/food/${food.image1}`}}
        style={styles.foodImage}
      />
      <Text style={styles.foodName}>{food.name}</Text>
      <Text style={styles.restaurantName}>
        Restaurant: {food.restaurantName}
      </Text>
      <Text style={styles.description}>Description: {food.description}</Text>
      <Text style={styles.foodPrice}>Price: {food.price}₽</Text>

      {/* 数量选择组件 */}
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={handleDecrease}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.quantityInput}
          value={quantity}
          keyboardType="numeric"
          onChangeText={setQuantity}
        />
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={handleIncrease}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addToCartHandler}>
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlign: 'center',
    width: 60,
    height: 40,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default FoodDetailScreen;
