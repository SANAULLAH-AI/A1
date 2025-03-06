import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, FlatList, Switch, StyleSheet, Animated, Easing, Alert, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Card, Button, Appbar, FAB, ProgressBar, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Stack Navigator
const Stack = createStackNavigator();

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
        <Stack.Screen name="Transactions" component={TransactionsListScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="BudgetSettings" component={BudgetSettingsScreen} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Home Screen
const HomeScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState(0);
  const [income, setIncome] = useState(0);
  const [budget, setBudget] = useState(1000);

  // Fetch data from AsyncStorage
  const fetchData = useCallback(async () => {
    try {
      const exp = await AsyncStorage.getItem('expenses');
      const inc = await AsyncStorage.getItem('income');
      const bud = await AsyncStorage.getItem('budget');

      const totalExpenses = exp
        ? JSON.parse(exp).reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0)
        : 0;
      const totalIncome = inc
        ? JSON.parse(inc).reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0)
        : 0;
      const savedBudget = bud ? parseFloat(bud) : 1000;

      setExpenses(totalExpenses);
      setIncome(totalIncome);
      setBudget(savedBudget);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, fetchData]);

  return (
    <ScrollView style={styles.container}>
      {/* Dashboard View */}
      <View style={styles.dashboardContainer}>
        <Text style={styles.dashboardTitle}>Expense Tracker</Text>
        <Card style={styles.dashboardCard}>
          <Card.Content>
            <View style={styles.dashboardItem}>
              <Icon name="money-off" size={24} color="#FF6B6B" />
              <Text style={styles.dashboardText}>Total Expenses: ${expenses.toFixed(2)}</Text>
            </View>
            <View style={styles.dashboardItem}>
              <Icon name="attach-money" size={24} color="#4CAF50" />
              <Text style={styles.dashboardText}>Total Income: ${income.toFixed(2)}</Text>
            </View>
            <View style={styles.dashboardItem}>
              <Icon name="account-balance-wallet" size={24} color="#2196F3" />
              <Text style={styles.dashboardText}>Budget: ${budget.toFixed(2)}</Text>
            </View>
            <ProgressBar progress={expenses / budget} color={useTheme().colors.primary} style={styles.progressBar} />
          </Card.Content>
        </Card>
      </View>

      {/* Icon Cards */}
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconCard} onPress={() => navigation.navigate('AddExpense')}>
          <Icon name="add-circle" size={40} color="#FF6B6B" />
          <Text style={styles.iconText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCard} onPress={() => navigation.navigate('AddIncome')}>
          <Icon name="add-circle" size={40} color="#4CAF50" />
          <Text style={styles.iconText}>Add Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCard} onPress={() => navigation.navigate('Transactions')}>
          <Icon name="list" size={40} color="#2196F3" />
          <Text style={styles.iconText}>Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCard} onPress={() => navigation.navigate('Reports')}>
          <Icon name="bar-chart" size={40} color="#FFC107" />
          <Text style={styles.iconText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCard} onPress={() => navigation.navigate('BudgetSettings')}>
          <Icon name="settings" size={40} color="#9C27B0" />
          <Text style={styles.iconText}>Budget</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCard} onPress={() => navigation.navigate('ProfileSettings')}>
          <Icon name="person" size={40} color="#607D8B" />
          <Text style={styles.iconText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Add Expense Screen
const AddExpenseScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(amount)) {
      Alert.alert('Invalid Input', 'Please enter a valid amount.');
      return;
    }

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(amount).toFixed(2),
      category,
      date: date.toISOString(),
      type: 'expense',
    };

    try {
      const expenses = JSON.parse(await AsyncStorage.getItem('expenses')) || [];
      expenses.push(newExpense);
      await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />
      <Button onPress={() => setShowDatePicker(true)} style={styles.button}>
        {date.toLocaleDateString()}
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Save
      </Button>
    </View>
  );
};

// Add Income Screen
const AddIncomeScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(amount)) {
      Alert.alert('Invalid Input', 'Please enter a valid amount.');
      return;
    }

    const newIncome = {
      id: Date.now(),
      amount: parseFloat(amount).toFixed(2),
      category,
      date: date.toISOString(),
      type: 'income',
    };

    try {
      const income = JSON.parse(await AsyncStorage.getItem('income')) || [];
      income.push(newIncome);
      await AsyncStorage.setItem('income', JSON.stringify(income));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />
      <Button onPress={() => setShowDatePicker(true)} style={styles.button}>
        {date.toLocaleDateString()}
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Save
      </Button>
    </View>
  );
};

// Transactions List Screen
const TransactionsListScreen = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenses = JSON.parse(await AsyncStorage.getItem('expenses')) || [];
        const income = JSON.parse(await AsyncStorage.getItem('income')) || [];
        const allTransactions = [...expenses, ...income].sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Content>
            <Text>Amount: ${item.amount}</Text>
            <Text>Category: {item.category}</Text>
            <Text>Type: {item.type}</Text>
            <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
          </Card.Content>
        </Card>
      )}
    />
  );
};

// Reports & Analytics Screen
const ReportsScreen = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenses = JSON.parse(await AsyncStorage.getItem('expenses')) || [];
        const income = JSON.parse(await AsyncStorage.getItem('income')) || [];
        const allTransactions = [...expenses, ...income];
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchData();
  }, []);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        data: transactions.map((t) => parseFloat(t.amount)),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending Trends</Text>
      <LineChart
        data={data}
        width={300}
        height={200}
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
      />
    </View>
  );
};

// Budget Settings Screen
const BudgetSettingsScreen = () => {
  const [budget, setBudget] = useState('');

  const handleSave = async () => {
    if (!budget || isNaN(budget)) {
      Alert.alert('Invalid Input', 'Please enter a valid budget.');
      return;
    }

    try {
      await AsyncStorage.setItem('budget', budget);
      Alert.alert('Success', 'Budget saved successfully.');
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Monthly Budget"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Save
      </Button>
    </View>
  );
};

// Profile & Theme Settings Screen
const ProfileSettingsScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      <View style={styles.switchContainer}>
        <Text>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  dashboardContainer: {
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  dashboardCard: {
    borderRadius: 10,
    elevation: 3,
  },
  dashboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dashboardText: {
    marginLeft: 10,
    fontSize: 16,
  },
  progressBar: {
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  iconText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});