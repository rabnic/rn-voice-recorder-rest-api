import React, { useState, useRef, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5 } from "@expo/vector-icons";
// import facebookLogo from '../assets/facebook.png';
import FacebookLogo from "../assets/facebook.png";
import GoogleLogo from "../assets/google.png";
import { AntDesign } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
} from "react-native";
import { registerUser, signUpWithEmailAndPassword } from "../restApiServices";
import { useUserContext } from "../App";


export default function RegisterScreen({ navigation }) {
  const { refreshUserAuthState } = useUserContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
    signUpWithEmailAndPassword(email.toLowerCase().trim(), password).then(
      async () => {
        await registerUser({
          fullName,
          email: email.toLowerCase().trim(),
        }).then(() => {
          console.log("Registered yahaaaaaa");
          refreshUserAuthState().then(() => {
            navigation.navigate("Home");
          });
        });
      }
    );
  };

  return (
    <View style={styles.innerContainer}>
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
          <Text style={styles.headerText}>Register</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.innerFormContainer}>
          <View style={styles.textInputContainer}>
            <AntDesign name="user" size={24} color="black" />
            <TextInput
              style={styles.textInput}
              placeholder="Full Name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
              }}
              inputMode="text"
            />
          </View>
          <View style={styles.textInputContainer}>
            <AntDesign name="mail" size={24} color="black" />
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
              }}
              inputMode="email"
            />
          </View>
          <View style={styles.textInputContainer}>
            <AntDesign name="lock1" size={24} color="black" />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
              }}
              inputMode="text"
            />
          </View>
          <Pressable style={styles.registerButton} onPress={handleSignUp}>
            <Text style={styles.registerButtonText}>Sign Up</Text>
          </Pressable>
        </View>
        <View style={styles.thirdpartyContainer}>
          <View style={styles.orSignUpWithContainer}>
            <View style={styles.hr}></View>
            <TextInput style={styles.orSignUpWithText}>
              {" "}
              Or Sign Up With
            </TextInput>
            <View style={styles.hr}></View>
          </View>
          <View style={styles.thirdpartyButtons}>
            <Pressable style={styles.thirdpartyButton} onPress={() => {}}>
              <Image source={FacebookLogo} style={styles.thirdPartyLogo} />
              <Text style={styles.thirdpartyButtonText}>Facebook</Text>
            </Pressable>
            <Pressable style={styles.thirdpartyButton} onPress={() => {}}>
              <Image source={GoogleLogo} style={styles.thirdPartyLogo} />
              <Text style={styles.thirdpartyButtonText}>Google</Text>
            </Pressable>
          </View>
          <View style={styles.textAlreadyUserContainer}>
            <Text style={styles.textAlreadyUser}>Already a user?</Text>

            <Pressable
              style={styles.textAlreadyUserLink}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.textAlreadyUserLinkText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    // marginHorizontal: 20,
  },
  headerContainer: {
    marginHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "column",
    flex: 1,
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
    flex: 2,
    flexDirection: "column",
    backgroundColor: "rgb(246,32,69)",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 30,
    paddingTop: 50,
  },
  innerFormContainer: {
    width: "100%",
    flex: 1,
    gap: 10,
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
    fontSize: 22,
  },
  registerButton: {
    height: 55,
    borderRadius: 50,
  },
  registerButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 50,
    height: 55,
    marginTop: 10,
    elevation: 3,
    backgroundColor: "#222222",
  },
  registerButtonText: {
    fontSize: 20,
    lineHeight: 21,
    fontWeight: "700",
    letterSpacing: 0.25,
    color: "white",
  },
  thirdpartyContainer: {
    flex: 1,
    width: "100%",
    flex: 1,
    gap: 10,
    alignItems: "center",
    justifyContent: "space-around",
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
