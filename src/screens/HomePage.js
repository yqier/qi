import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomePage = ({navigation}) => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // 当前选中的类别
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempSearchText, setTempSearchText] = useState('');

  useEffect(() => {
    // 获取类别数据
    fetchCategories();

    // 初始加载所有食物
    if (!selectedCategory && !searchText) {
      fetchFoods();
    }
  }, []);

  useEffect(() => {
    // 如果选择了类别，加载对应类别的食物
    if (selectedCategory) {
      fetchFoods(selectedCategory);
    }
  }, [selectedCategory]);

  // 获取类别数据
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'http://10.0.2.2:8080/api/category/fetch/all',
      );
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setLoading(false);
  };

  const fetchFoods = async (
    category = selectedCategory,
    searchQuery = searchText,
  ) => {
    setLoading(true);
    try {
      let response;
      const baseUrl = 'http://10.0.2.2:8080/api/food';

      if (searchQuery) {
        // 按搜索条件获取食物
        response = await fetch(`${baseUrl}/search?foodName=${searchQuery}`);
      } else if (category) {
        // 按类别获取食物
        response = await fetch(
          `http://10.0.2.2:8080/api/category/${category.id}/foods`,
        );
        console.log(
          'Fetching URL:',
          `http://10.0.2.2:8080/api/category/${category.id}/foods`,
        );
      } else {
        // 获取所有食物
        response = await fetch(`${baseUrl}/fetch/all`);
      }

      const data = await response.json();
      console.log('Fetched Foods:', data);
      if (Array.isArray(data)) {
        setFoods(data); // 如果直接返回数组
      } else if (data.foods) {
        setFoods(data.foods); // 如果 foods 在 data 中
      } else {
        console.error('Unexpected data format:', data);
        setFoods([]); // 返回空数组以避免出错
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      setFoods([]); // 确保在出错时不会保留旧数据
    }
    setLoading(false);
  };
  const handleCategorySelect = category => {
    setSelectedCategory(category); // 更新选中的类别
    console.log('Selected Category:', category);
    setSearchText(''); // 清空搜索文本
    fetchFoods(category); // 使用传递的参数category
  };

  const searchFoods = () => {
    setSelectedCategory(null); // 清空选中的类别
    setSearchText(tempSearchText); // 更新搜索状态（异步）
    fetchFoods(null, tempSearchText); // 立即使用最新的搜索条件
  };

  const descriptionToShow = (description, maxLength) => {
    if (description.length <= maxLength) {
      return description;
    } else {
      return description.substring(0, maxLength) + '...';
    }
  };

  // 食物卡片组件
  const FoodCard = ({food}) => {
    return (
      <TouchableOpacity
        style={styles.foodCard}
        onPress={() => navigation.navigate('FoodDetail', {foodId: food.id})}>
        <Image
          source={{uri: `http://10.0.2.2:8080/api/food/${food.image1}`}}
          style={styles.foodImage}
        />
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodPrice}>Price: {food.price}₽</Text>
          <Text style={styles.foodDescription}>
            {descriptionToShow(food.description, 50)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleReset = () => {
    // 清空搜索文本和选中类别
    setSearchText('');
    setTempSearchText('');
    setSelectedCategory(null);

    // 确保状态清空后重新加载所有食物
    fetchFoods(null, '');
  };

  return (
    <ScrollView style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={handleReset} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food..."
          value={tempSearchText}
          onChangeText={setTempSearchText}
          onSubmitEditing={searchFoods} // 提交搜索
        />
        <TouchableOpacity onPress={searchFoods} style={styles.searchIcon}>
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* 分类列表 */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory?.id === category.id &&
                styles.selectedCategoryCard, // 选中状态样式
            ]}
            onPress={() => handleCategorySelect(category)}>
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 食物卡片展示 */}
      <Text style={styles.sectionTitle}>
        {selectedCategory ? `${selectedCategory.name} Foods` : 'Popular Foods'}
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={item => item.id.toString()} // 确保ID唯一且为字符串
          renderItem={({item}) => <FoodCard food={item} />}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  backButton: {
    marginRight: 10,
  },
  searchIcon: {
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
  },
  categoryScroll: {
    paddingVertical: 10,
  },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedCategoryCard: {
    backgroundColor: '#007BFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  foodCard: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  foodInfo: {
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodPrice: {
    fontSize: 14,
    color: '#666',
  },
  foodDescription: {
    fontSize: 14,
    color: '#888',
  },
});

export default HomePage;
