import React, { useState, useEffect } from "react";
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getAllData, uploadToFirebaseStorage, uploadToFirestore, auth, getUser, signOutUser } from "./firebaseDB";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";

export default function App() {
  const { width, height } = useWindowDimensions();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await AsyncStorage.getItem('user')
      .then((localUser) => {
        // user = user || JSON.parse(localUser);
        console.log('App.js Async',JSON.parse(localUser));
        // signOutUser(); 
      });
      
      if (user) {
        await getUser(user.email)
          .then((userData) => {
            setUser(userData);
            console.log('User in', userData);
          })
          .catch((error) => {
            console.log(error);
          })
      } else {
        console.log('No user logged in ==================================');
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [])

  const Stack = createNativeStackNavigator();

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={{
      width: width,
      height: height
    }}>
      <StatusBar
        animated={true}
        style={'light'}
      />
      <NavigationContainer theme={navTheme} screenProps={{user: user}}>
        <Stack.Navigator initialRouteName="Home" screenOptions={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}>
          <Stack.Screen name="Home">
            {(props) => user !== null ? <HomeScreen {...props} extraData={user} /> : <LoginScreen {...props} />}
          </Stack.Screen>

          
          <Stack.Screen name="Login" >
            {(props) => user === null ? <LoginScreen {...props} /> : <HomeScreen {...props} extraData={user} />}

          </Stack.Screen>
          <Stack.Screen name="Register"  >
            {(props) => user === null ? <RegisterScreen {...props} /> : <HomeScreen {...props} extraData={user} />}

          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(31,30,31)",
    paddingTop: 50,
  },
});
