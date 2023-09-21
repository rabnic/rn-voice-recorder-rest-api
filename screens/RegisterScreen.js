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
  Alert,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { registerUser, signUpWithEmailAndPassword, getRandomPassword } from "../restApiServices";
import { useAuth } from "../context/userAuthContext";

const { height } = Dimensions.get("screen");

export default function RegisterScreen({ navigation }) {
  const { setUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRandomPassword, setShowRandomPassword] = useState(false);

  const alertMessages = {
    'MISSING_PASSWORD': 'No password entered! \nPlease enter valid password',
    'WEAK_PASSWORD': 'Weak password entered! \nPassword should be at least 6 characters',
    'INVALID_EMAIL': 'Invalid email entered! \nPlease enter valid email',
    'EMPTY_INPUTS': 'Empty inputs received! \nAll input fields are required'
  }

  const handleSignUp = () => {
    console.log(">>>  Register");

    if(fullName.trim().length < 1 || email.trim().length < 1 || password.trim().length < 1) {
      Alert.alert('Sign Up Error:', alertMessages['EMPTY_INPUTS'], [
        { text: 'Ok', onPress: () => console.log('Sign In error Ok pressed') },
      ]);
      return;
    }

    signUpWithEmailAndPassword(email.toLowerCase().trim(), password).then(
      async ( response) => {
        if (response.status === "success") {
          await registerUser({
            fullName,
            email: email.toLowerCase().trim(),
          }).then(() => {
            console.log("Registered yahaaaaaa");
            setUser({ email, fullName });
          });
          setIsLoading(false);
        } else {
          Alert.alert('Sign Up Error:', alertMessages[response.message], [
            { text: 'Ok', onPress: () => console.log('Sign In error Ok pressed') },
          ]);
        }
      }
    );
  };

  const handleRandomPassword = () => {
    getRandomPassword()
    .then(res => {
      setPassword(res.password)
    })
  }

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
            <Text style={styles.headerText}>Register</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.innerFormContainer, {flex: showRandomPassword ? 2 : 1 }]}>
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
                onFocus={() => setShowRandomPassword(true)}
              />
            </View>
            {
              showRandomPassword &&
              <TouchableOpacity style={styles.randomPassword} onPress={handleRandomPassword}>
                <FontAwesome5 name="random" size={26} color="rgba(255,255,255,.6)" />
                <Text style={styles.randomPasswordText}>Random Password?</Text>
              </TouchableOpacity>
            }

            <TouchableOpacity style={styles.registerButton} onPress={handleSignUp}>
              <Text style={styles.registerButtonText}>Sign Up</Text>
            </TouchableOpacity>
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
              <TouchableOpacity style={styles.thirdpartyButton} onPress={() => { }}>
                <Image source={FacebookLogo} style={styles.thirdPartyLogo} />
                <Text style={styles.thirdpartyButtonText}>Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.thirdpartyButton} onPress={() => { }}>
                <Image source={GoogleLogo} style={styles.thirdPartyLogo} />
                <Text style={styles.thirdpartyButtonText}>Google</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.textAlreadyUserContainer}>
              <Text style={styles.textAlreadyUser}>Already a user?</Text>

              <TouchableOpacity
                style={styles.textAlreadyUserLink}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.textAlreadyUserLinkText}>Sign In</Text>
              </TouchableOpacity>
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
    padding: 30,
    paddingVertical: 10,
    height: height * 0.3,
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
    flex: 1,
    flexDirection: "column",
    backgroundColor: "rgb(246,32,69)",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 30,
    paddingTop: 50,
    height: height * 0.65,
  },
  innerFormContainer: {
    width: "100%",
    flex: 1,
    gap: 15,
    justifyContent: "space-around",
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
  randomPassword: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingLeft: 20
  },
  randomPasswordText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '100',
    color: 'white'
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
