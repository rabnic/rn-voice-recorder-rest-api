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

  // useEffect(() => {
  //   const checkLoggedInStatus = async () => {
  //     const value = await SecureStore.getItemAsync('authToken');

  //   };

  //   checkLoggedInStatus();
  // }, []);
  const checkTokenExpiration = async (idToken) => {
    const apiKey = 'YOUR_API_KEY'; // Replace with your Firebase Web API Key
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDGEwwRCLdRXYLhMYgrCkh-67beRw31i-U`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken
      })
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.users[0];
      console.log('===',user, data);
      if (user) {
        const expirationTimeSeconds = user.validSince + user.expiresIn;
        const now = Math.floor(Date.now() / 1000);

        if (expirationTimeSeconds > now) {
          // Token is still valid
          return true;
        }
      }
    }

    return false;
  };
  useEffect(() => {


    const token = {
      "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MGFkMTE4YTk0MGFkYzlmMmY1Mzc2YjM1MjkyZmVkZThjMmQwZWUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdm9pY2UtcmVjb3JkZXItODQzNTUiLCJhdWQiOiJ2b2ljZS1yZWNvcmRlci04NDM1NSIsImF1dGhfdGltZSI6MTY5NDYxMDU4NSwidXNlcl9pZCI6IkRhYXV0WjBha3labmJoWnhLMjN6bGZWRllJbjIiLCJzdWIiOiJEYWF1dFowYWt5Wm5iaFp4SzIzemxmVkZZSW4yIiwiaWF0IjoxNjk0NjEwNTg1LCJleHAiOjE2OTQ2MTQxODUsImVtYWlsIjoicmFiYWxhb25kQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJyYWJhbGFvbmRAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.aWJuu9Vws1n1KTfd4MkSML7IDvikncr8bhI9yrFYrQb2ZplGhlylKEgPvTMkUEbPtKuspKNQYv113DsdPyZIT3yX795AJCNAS3yV4Q58VLK04zvGjPwcxDoCi7zWEz4top_9WLO1xXwuKQ4-TXkc4GtGRxnmQxynk4VYkZZTWOEX76k4Pw2K0gAhEFOeptsbbqDyhB0U5Y0ph0TEik1xYebFospz90OIxOUBz8WSy7e86Pu1X8XnKUzURchc4HsQhrdQ2sLehsaTHLPPNDUP1YEbF7TSbUbN_Lw83ucL16vtLBAqh0m1yHSL-BlqRzj_fNG0OBZqbWMZfXQCVX0wIQ"
    }

    checkTokenExpiration(token.idToken)
      .then(isValid => {
        if (isValid) {
          // Token is still valid
          console.log('Token is valid');
        } else {
          // Token has expired or is invalid
          console.log('Token has expired or is invalid');
        }
      })
      .catch(error => {
        console.error('Error checking token validity', error);
      });


  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await AsyncStorage.getItem('user')
        .then((localUser) => {
          // user = user || JSON.parse(localUser);
          console.log('App.js Async', JSON.parse(localUser));
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
      <NavigationContainer theme={navTheme} screenProps={{ user: user }}>
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
