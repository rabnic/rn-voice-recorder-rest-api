import React, { useState, useRef, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

import {
  StyleSheet,
  Alert,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import FacebookLogo from "../assets/facebook.png";
import GoogleLogo from "../assets/google.png";
import { signInUserWithEmailAndPassword } from "../restApiServices";
import { useAuth } from "../context/userAuthContext";

const { height } = Dimensions.get("screen");

export default function LoginScreen({ navigation }) {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const alertMessages = {
    'INVALID_PASSWORD': 'Invalid password entered! \nPlease enter correct password',
    'INVALID_EMAIL': 'Invalid email entered! \nPlease enter correct email' ,
    'EMPTY_INPUTS': 'Empty inputs received! \nAll input fields are required'
  }

  const handleSignIn = async () => {
    console.log(">>>  Login");
    // setIsLoading(true);
 
    if(email.trim().length < 1 || password.trim().length < 1) {
      Alert.alert('Sign Up Error:', alertMessages['EMPTY_INPUTS'], [
        { text: 'Ok', onPress: () => console.log('Sign In error Ok pressed') },
      ]);
      return;
    }

    await signInUserWithEmailAndPassword(email.toLowerCase().trim(), password)
      .then((response) => {
        console.log("signed in---", response);
        if (response.status === "success") {
          setUser({ email: response.email, fullName: "" });
          setIsLoading(false);
        } else {
          Alert.alert('Sign In Error:', alertMessages[response.message], [
            { text: 'Ok', onPress: () => console.log('Sign In error Ok pressed') },
          ]);
        }
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.innerContainer}
        contentContainerStyle={{
          flexDirection: "column",
        }}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <FontAwesome5
              name="microphone-alt"
              style={styles.logo}
              size={130}
              color="rgb(246,32,69)"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Login</Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.innerFormContainer}>
            <View style={styles.textInputContainer}>
              <AntDesign name="mail" size={24} color="black" />
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                inputMode="email"
              />
            </View>
            <View style={styles.textInputContainer}>
              <AntDesign name="lock1" size={24} color="black" />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
              />
            </View>
            <Pressable
              style={styles.registerButton}
              onPress={() => {
                setIsLoading(true), handleSignIn();
              }}
            >
              <Text style={styles.registerButtonText}>Sign In </Text>
              {isLoading && <ActivityIndicator style={styles.loader} />}
            </Pressable>
          </View>
          <View style={styles.thirdpartyContainer}>
            <View style={styles.orSignUpWithContainer}>
              <View style={styles.hr}></View>
              <TextInput style={styles.orSignUpWithText}>
                {" "}
                Or Sign In With
              </TextInput>
              <View style={styles.hr}></View>
            </View>
            <View style={styles.thirdpartyButtons}>
              <Pressable style={styles.thirdpartyButton} onPress={() => { }}>
                <Image source={FacebookLogo} style={styles.thirdPartyLogo} />
                <Text style={styles.thirdpartyButtonText}>Facebook</Text>
              </Pressable>
              <Pressable style={styles.thirdpartyButton} onPress={() => { }}>
                <Image source={GoogleLogo} style={styles.thirdPartyLogo} />
                <Text style={styles.thirdpartyButtonText}>Google</Text>
              </Pressable>
            </View>
            <View style={styles.textAlreadyUserContainer}>
              <Text style={styles.textAlreadyUser}>New user?</Text>
              <Pressable
                style={styles.textAlreadyUserLink}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.textAlreadyUserLinkText}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  headerContainer: {
    flex: 1,
    padding: 30,
    height: height * 0.4,
    paddingVertical: 10,
    flexDirection: "column",
  },
  logoContainer: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  headerText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#cccccc",
  },
  formContainer: {
    flexDirection: "column",
    backgroundColor: "rgb(246,32,69)",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 30,
    paddingVertical: 50,
    height: height * 0.55,
  },
  innerFormContainer: {
    width: "100%",
    flex: 1,
    gap: 25,
    justifyContent: "space-around",

    // backgroundColor: "gray",
  },
  textInputContainer: {
    width: "100%",
    borderColor: "#333333",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    height: 55,
    gap: 10,
    borderRadius: 50,
    paddingHorizontal: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 24,
  },
  registerButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 50,
    height: 55,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    backgroundColor: "#222222",
  },
  loader: {
    position: "absolute",
    right: 30,
  },
  registerButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
    letterSpacing: 0.25,
    color: "white",
  },
  thirdpartyContainer: {
    flex: 1,
    gap: 10,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  orSignUpWithContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orSignUpWithText: {
    flex: 2,
    fontSize: 18,
    color: "#eeeeee",
    textAlign: "center",
  },
  hr: {
    flex: 1,
    borderWidth: 0.6,
    borderColor: "#222222",
    opacity: 0.4,
    height: 0,
    marginVertical: 40,
  },
  thirdpartyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  thirdpartyButton: {
    backgroundColor: "#ffffff",
    elevation: 3,
    height: 50,
    width: "45%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    gap: 10,
    flexDirection: "row",
  },
  thirdPartyLogo: {
    width: 18,
    height: 18,
  },
  thirdpartyButtonText: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#000000",
  },
  textAlreadyUserContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  textAlreadyUser: {
    fontSize: 22,
    fontWeight: "500",
    color: "#333333",
  },
  textAlreadyUserLink: {
    marginLeft: 5,
  },
  textAlreadyUserLinkText: {
    fontWeight: "700",
    fontSize: 22,
    color: "#dddddd",
  },
});
