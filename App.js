import React, { useState, useEffect, createContext, useContext } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import * as SecureStore from "expo-secure-store";
import { onAuthStateChanged } from "firebase/auth";
import { validateToken, auth, getUser } from "./restApiServices";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";

const UserContext = createContext();

export const useUserContext = () => {
  return useContext(UserContext);
};

export default function App() {
  const { width, height } = useWindowDimensions();
  const [user, setUser] = useState(null);
  let isLoading = false

  useEffect(() => {
    validateToken()
      .then(async (tokenStatus) => {
        const { isValid, userEmail } = tokenStatus;
        console.log("Token is ", isValid, userEmail);

        if (isValid) {
          // Token is still valid
          console.log("Token is ", isValid, userEmail);
          await getUser(userEmail).then((user) => {
            setUser(user);
          });
        } else {
          // Token has expired or is invalid
          console.log("Token has expired or is invalid");
          setUser(null);
        }
        if (isLoading) {
          isLoading = false;
        }
      })
      .catch((error) => {
        console.error("Error checking token validity", error);
      });
  }, []);

  const refreshUserAuthState = async () => {
    console.log('Refreshing user');
    let token = await SecureStore.getItemAsync("authToken");
    console.log('token >>>>>', token);
    if (token === null) {
      setUser(null);
      return;
    }

    token = JSON.parse(token);
    await getUser(token.email).then((_user) => {
      setUser({..._user});
    });
  }

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (user) {
  //       await getUser(user.email)
  //         .then((userData) => {
  //           setUser(userData);
  //           console.log("User in", userData);
  //         })
  //         .catch((error) => {
  //           console.log(error);
  //         });
  //     } else {
  //       console.log("No user logged in ==================================");
  //       setUser(null);
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

  const Stack = createNativeStackNavigator();

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "transparent",
    },
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        width: width,
        height: height,
      }}
    >
      <StatusBar animated={true} style={"light"} />
      <UserContext.Provider value={{ user, refreshUserAuthState }}>
        <NavigationContainer theme={navTheme}>

          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: "slide_from_bottom", }} >
            <Stack.Screen name="Home" component={user === null ? LoginScreen : HomeScreen} />
            <Stack.Screen name="Login" component={user === null ? LoginScreen : HomeScreen} />
            <Stack.Screen name="Register" component={user === null ? RegisterScreen : HomeScreen} />
          </Stack.Navigator>

        </NavigationContainer>
      </UserContext.Provider>
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
