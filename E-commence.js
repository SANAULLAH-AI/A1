import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';

const { width } = Dimensions.get('window');

// Theme Context
const ThemeContext = createContext();

// Theme Provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
const useTheme = () => useContext(ThemeContext);

// Categories
const categories = ['All', 'Electronics', 'Jewelery', "Men's Clothing", "Women's Clothing"];

// Home Screen
const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { theme } = useTheme();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://fakestoreapi.com/products');
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === 'All' || product.category === selectedCategory.toLowerCase())
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.productCard, themeStyles[theme].productCard]}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={[styles.productName, themeStyles[theme].text]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.productPrice, themeStyles[theme].text]}>${item.price.toFixed(2)}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={[styles.ratingText, themeStyles[theme].text]}>{item.rating.rate}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#ffffff' : '#007BFF'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, themeStyles[theme].container]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.searchBar, themeStyles[theme].searchBar]}>
        <TextInput
          style={[styles.searchInput, themeStyles[theme].text]}
          placeholder="Search products..."
          placeholderTextColor={theme === 'dark' ? '#888' : '#000'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={24} color={theme === 'dark' ? '#888' : '#000'} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
              themeStyles[theme].categoryButton,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
                themeStyles[theme].text,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, themeStyles[theme].text]}>Featured Products</Text>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
    </ScrollView>
  );
};

// Product Details Screen
const ProductDetailsScreen = ({ route }) => {
  const { product } = route.params;
  const { theme } = useTheme();

  const addToCart = () => {
    Alert.alert('Added to Cart', `${product.title} has been added to your cart.`);
  };

  return (
    <ScrollView style={[styles.container, themeStyles[theme].container]}>
      <Image source={{ uri: product.image }} style={styles.productDetailsImage} />
      <Text style={[styles.productDetailsName, themeStyles[theme].text]}>{product.title}</Text>
      <Text style={[styles.productDetailsPrice, themeStyles[theme].text]}>${product.price.toFixed(2)}</Text>
      <Text style={[styles.productDetailsDescription, themeStyles[theme].text]}>{product.description}</Text>
      <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
        <Text style={styles.addToCartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Cart Screen
const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const { theme } = useTheme();

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <View style={[styles.container, themeStyles[theme].container]}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.cartItem, themeStyles[theme].cartItem]}>
            <Text style={[styles.cartItemName, themeStyles[theme].text]}>{item.title}</Text>
            <Text style={[styles.cartItemPrice, themeStyles[theme].text]}>
              ${ (item.price * item.quantity).toFixed(2)}
            </Text>
            <Text style={[styles.cartItemQuantity, themeStyles[theme].text]}>Qty: {item.quantity}</Text>
          </View>
        )}
      />
      <View style={[styles.cartTotal, themeStyles[theme].cartTotal]}>
        <Text style={[styles.cartTotalText, themeStyles[theme].text]}>Total: ${totalPrice.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Orders Screen
const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const { theme } = useTheme();

  return (
    <View style={[styles.container, themeStyles[theme].container]}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.orderItem, themeStyles[theme].orderItem]}>
            <Text style={[styles.orderDate, themeStyles[theme].text]}>{item.date}</Text>
            <Text style={[styles.orderTotal, themeStyles[theme].text]}>${item.total.toFixed(2)}</Text>
            <Text style={[styles.orderStatus, themeStyles[theme].text]}>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

// Profile Screen
const ProfileScreen = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, themeStyles[theme].container]}>
      <Text style={[styles.screenTitle, themeStyles[theme].text]}>Profile & Settings</Text>
      <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
        <Text style={styles.themeButtonText}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Cart') {
                iconName = focused ? 'cart' : 'cart-outline';
              } else if (route.name === 'Orders') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007BFF',
            tabBarInactiveTintColor: '#888',
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Cart" component={CartScreen} />
          <Tab.Screen name="Orders" component={OrdersScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F2F2F2',
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
  },
  categories: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#007BFF',
    elevation: 3,
  },
  categoryButtonActive: {
    backgroundColor: '#005BB5',
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productCard: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#007BFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#FFD700',
  },
  productDetailsImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 16,
  },
  productDetailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  productDetailsPrice: {
    fontSize: 20,
    marginBottom: 16,
    color: '#007BFF',
  },
  productDetailsDescription: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 16,
  },
  cartItemQuantity: {
    fontSize: 16,
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cartTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 5,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: 16,
  },
  orderStatus: {
    fontSize: 16,
    color: '#007BFF',
  },
  themeButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 30,
    marginTop: 16,
    alignItems: 'center',
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

// Theme Styles for Dark and Light Modes
const themeStyles = {
  light: {
    container: {
      backgroundColor: '#ffffff',
    },
    text: {
      color: '#000000',
    },
    productCard: {
      backgroundColor: '#ffffff',
      shadowColor: '#000000',
    },
    searchBar: {
      backgroundColor: '#F2F2F2',
    },
    categoryButton: {
      backgroundColor: '#007BFF',
    },
    categoryText: {
      color: '#fff',
    },
    cartTotal: {
      backgroundColor: '#F2F2F2',
    },
    cartItem: {
      backgroundColor: '#F5F5F5',
    },
    orderItem: {
      backgroundColor: '#ffffff',
    },
  },
  dark: {
    container: {
      backgroundColor: '#2C2C2C',
    },
    text: {
      color: '#ffffff',
    },
    productCard: {
      backgroundColor: '#333333',
      shadowColor: '#000000',
    },
    searchBar: {
      backgroundColor: '#3A3A3A',
    },
    categoryButton: {
      backgroundColor: '#1E1E1E',
    },
    categoryText: {
      color: '#fff',
    },
    cartTotal: {
      backgroundColor: '#3A3A3A',
    },
    cartItem: {
      backgroundColor: '#444444',
    },
    orderItem: {
      backgroundColor: '#333333',
    },
  },
};

export default App;
