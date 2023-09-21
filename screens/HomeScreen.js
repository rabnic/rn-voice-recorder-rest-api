import React, { useState, useRef, useEffect, useContext } from "react";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Recording from "../components/Recording";
import NoRecordings from "../components/NoRecordings";
import {
  getUserRecordings,
  signOutUser,
  uploadToFirebaseStorage,
  uploadToFirestore,
} from "../restApiServices";
import { useAuth } from "../context/userAuthContext";

export default function HomeScreen({ navigation }) {

  const { user, setUser } = useAuth();

  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);



  useEffect(() => {
    console.log("Home user ====", user);
    const unsubscribe = navigation.addListener('focus', () => {
      // Access Firestore collection and fetch data
      if (user) {
        getUserRecordings(user.email)
          .then((data) => {
            // console.log("data", data);
            setRecordings(data);
          })
          .catch((error) => {
            console.log("Error getting recordings", error);
          });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const recordingSettings = {
    android: {
      extension: ".m4a",
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".m4a",
      outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
      audioQuality: Audio.IOSAudioQuality.MIN,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: "audio/webm",
      bitsPerSecond: 128000,
    },
  };
  
  async function saveRecordingToAsyncStorage(recordingObject) {
    try {
      const recordings = await AsyncStorage.getItem("recordings");
      const parsedRecordings = recordings ? JSON.parse(recordings) : [];
      parsedRecordings.push(recordingObject);
      await AsyncStorage.setItem(
        "recordings",
        JSON.stringify(parsedRecordings)
      );
      //   console.log("Recording saved to AsyncStorage successfully");
    } catch (error) {
      console.error("Failed to save recording to AsyncStorage:", error);
    }
  }

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      // await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.prepareToRecordAsync(recordingSettings);

      setRecording(recording);
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);

      await recording.startAsync();
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }

  async function stopRecording() {
    clearInterval(intervalRef.current);
    try {
      await recording.stopAndUnloadAsync();
      const today = new Date();

      const recordingObject = {
        title: `Recording ${formattedDateTitle(today)}`,
        date: `${today.getDate().toString().padStart(2, "0")}-${(
          today.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${today.getFullYear()}`,
        duration: convertSecondsToMinutes(timer),
        file: recording.getURI(),
      };
      //   console.log("uri", recording.getURI());
      await saveRecordingToAsyncStorage(recordingObject);

      await uploadToFirebaseStorage(user.email, recordingObject)
        .then(async (response) => {
          console.log("response", response);
          console.log("user.email", user.email);
          recordingObject.file = response;
          await uploadToFirestore(user.email, {
            ...recordingObject,
            file: response,
          })
            .then((docId) => {
              setRecordings((prevRecordings) => {
                return [{ ...recordingObject, id: docId }, ...prevRecordings];
              });
            })
            .catch((err) => {
              console.log("error adding doc", err);
            });
        })
        .catch((error) => {
          console.log(error);
        });
      // console.log('----',recordingObject);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }

    setRecording(undefined);
    setIsRecording(false);
    setTimer(0);
  }

  function convertSecondsToMinutes(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    return (
      minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds
    );
  }

  function formattedDateTitle(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    let seconds = date.getSeconds().toString().padStart(2, "0");

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  const handleSignOut = () => {
    console.log(">>>  SignOut");
    signOutUser().then(() => {
      setRecordings(null);
      setUser(null);
    });
  };

  return (
    <View style={styles.innerContainer}>
      <View style={styles.headerContainer}>
        <Text
          style={[styles.timer, { color: isRecording ? "#ffffff" : "#b2b1b1" }]}
        >
          {convertSecondsToMinutes(timer)}
        </Text>
        <TouchableOpacity onPress={handleSignOut}>
          <AntDesign
            name="logout"
            size={26}
            color="#E94A47"
            style={{ position: "relative", top: -5, right: 10 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.recordContainer}>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
        >
          <View style={styles.recordButtonContainer}>
            <View style={styles.recordButton}>
              <Text style={styles.recordButtonText}>
                {isRecording ? (
                  <>
                    <FontAwesome
                      name="microphone-slash"
                      size={52}
                      color="white"
                    />
                    {/* <ActivityIndicator
                      color="#50CAB2"
                      size="large"
                      style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }}
                    /> */}
                  </>
                ) : (
                  <>
                    <FontAwesome name="microphone" size={52} color="white" />
                  </>
                )}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.recordingsContainer}>
        {recordings && recordings.length > 0 ? (
          <FlatList
            data={recordings}
            style={{ flex: 1 }}
            keyExtractor={(item, index) => `key-${index}`}
            renderItem={({ item }) => (
              <Recording
                recording={item}
                setRecordings={setRecordings}
                userEmail={user.email}
              />
            )}
          />
        ) : (
          <NoRecordings />
        )}
      </View>

      {/* <ScrollView contentContainerStyle={styles.recordingsContainer}>
        {recordings && recordings.length > 0 ? (
          // <FlatList
          //   data={recordings}
          //   keyExtractor={(item, index) => `key-${index}`}

          //   renderItem={({ item }) => <Recording recording={item} setRecordings={setRecordings} userEmail={user.email}/>}
          // />

          recordings?.map((item) => {
            return (
              <Recording
                recording={item}
                key={item.id}
                setRecordings={setRecordings}
                userEmail={user.email}
              />
            );
          })
        ) : (
          <NoRecordings />
        )}
      </ScrollView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,

    // marginHorizontal: 20,
  },
  headerContainer: {
    marginHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timer: {
    fontSize: 48,
    fontWeight: "700",
    marginTop: 10,
  },
  recordContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#515151",
    borderBottomWidth: 1,
  },
  recordButtonContainer: {
    width: 250,
    height: 250,
    borderRadius: 250 / 2,
    borderWidth: 1,
    borderColor: "#b2b1b1",
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: '#b2b1b1',
    // shadowOffset: {
    //   width: 1,
    //   height: 1,
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 5.00,

    // elevation: 12,
  },
  recordButton: {
    width: 150,
    height: 150,
    borderRadius: 150 / 2,

    backgroundColor: "rgb(246,32,69)",
    shadowColor: "rgb(246,32,69)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgb(246,32,69)",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 16.0,

    elevation: 12,
  },
  recordButtonText: {
    fontSize: 28,
    letterSpacing: 3,
  },
  recordingsContainer: {
    flex: 1,
    flexDirection: "column",
  },
});
