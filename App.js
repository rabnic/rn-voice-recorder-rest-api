import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, useWindowDimensions, } from "react-native";
import { validateToken, getUser, refreshToken } from "./restApiServices";
import { AuthProvider } from "./context/userAuthContext";
import SplashScreen from "./screens/SplashScreen";
import { useAuth } from "./context/userAuthContext";

import Routes from "./routes";

export default function App() {
  const { width, height } = useWindowDimensions();
  const [userFromValidToken, setUserFromValidToken] = useState();
  // const {setUser} = useAuth();

  useEffect(() => {
    validateToken()
      .then(async (tokenStatus) => {
        const { isValid, userEmail } = tokenStatus;
        console.log("Token is ", isValid, userEmail);

        if (isValid) {
          // Token is still valid
          console.log("Token is ", isValid, userEmail);
          await getUser(userEmail).then((user) => {
            console.log('user is ', user);
            // setUser(user)
            setUserFromValidToken(user);
          });
        } else if (!isValid && userEmail) {
          // Token has expired but user has logged out manually
          console.log("Token has expired or is invalid");
          refreshToken().then(async (token) => {
            await getUser(userEmail).then((user) => {
              console.log('user is ', user);
              // setUser(user);
              setUserFromValidToken(user);
            });
          })
        } else {
          // User has logged out manually and no token stored
          setUserFromValidToken(null);
        }
      })
      .catch((error) => {
        console.error("Error checking token validity", error);
      });
  }, []);

  if (userFromValidToken === undefined) return <SplashScreen />

  return (
    <View
      style={styles.container}
      contentContainerStyle={{
        width: width,
        height: height,
      }}
    >
      <StatusBar animated={true} style={"light"} />
      <AuthProvider value>
        <Routes userFromValidToken={userFromValidToken} />
      </AuthProvider>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(31,30,31)",
    paddingTop: 50,
  },
});
