import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { deleteRecording, updateRecording } from "../restApiServices";

const Recording = ({ recording, setRecordings, userEmail }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [audioUri, setAudioUri] = useState(recording.file);
  const [sound, setSound] = React.useState();
  const [titleChangeText, setTitleChangeText] = useState("");
  const [recordingId, setRecordingId] = useState();
  // console.log(recording);

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");

          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const play = async () => {
    setIsPlaying(true);
    console.log("Loading Sound", audioUri);
    // if(!sound) {
    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    setSound(sound);
    // }

    console.log("Playing Sound");
    await sound.playAsync();
  };
  const pause = async () => {
    console.log("Pausing Sound");

    sound && (await sound.pauseAsync());
    // sound && await sound.unloadAsync();
    console.log(sound);
    setIsPlaying(false);
    // setSound(null);
  };
  const handleDelete = (recordingId) => {
    setRecordings((prevRecordings) => {
      return prevRecordings.filter((record) => record.id !== recordingId);
    });
    deleteRecording(userEmail, recordingId);
    setIsModalVisible(!isModalVisible);
  };

  const handleUpdate = () => {
    console.log(titleChangeText);
    setRecordings((prevRecordings) => {
      return prevRecordings.map((record) => {
        return record.id === recordingId
          ? { ...record, title: titleChangeText }
          : record;
      });
    });
    updateRecording(recordingId, userEmail, titleChangeText);
    setIsModalVisible(!isModalVisible);
  };
  return (
    <View style={styles.recordingContainer}>
      <View style={styles.playButtonContainer}>
        <TouchableOpacity onPress={isPlaying ? pause : play}>
          {isPlaying ? (
            <Ionicons name="pause-circle-outline" size={44} color="#b2b1b1" />
          ) : (
            <Ionicons name="play-circle-outline" size={44} color="#b2b1b1" />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.recordingDetailsContainer}>
        <Text style={styles.recordTitle}>{recording.title}</Text>
        <Text
          style={styles.durationAndDate}
        >{`${recording.duration}   ${recording.date}`}</Text>
      </View>
      <View style={styles.recordingActionsContainer}>
        <Pressable
          onPress={() => {
            setTitleChangeText(recording.title);
            setRecordingId(recording.id);
            setIsModalVisible(true);
          }}
        >
          <Entypo name="dots-three-vertical" size={24} color="#b2b1b1" />
        </Pressable>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setIsModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* <Text style={styles.modalText}>Hello World!</Text> */}
            <Pressable onPress={() => setIsModalVisible(!isModalVisible)}>
              <Ionicons
                name="ios-close-outline"
                size={34}
                color="#cccccc"
                style={styles.buttonClose}
              />
            </Pressable>
            <TextInput
              style={styles.inputTitleText}
              onChangeText={(text) => setTitleChangeText(text)}
              value={titleChangeText}
            />
            <View style={styles.modalButtonsContainer}>
              <Pressable onPress={() => handleDelete(recording.id)}>
                <View style={[styles.button, styles.buttonDelete]}>
                  <Text style={styles.textStyle}>
                    <AntDesign
                      name="delete"
                      size={18}
                      color="#555555"
                      style={{ marginRight: 5 }}
                    />
                    Delete
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={() => handleUpdate()}>
                <View style={[styles.button, styles.buttonUpdate]}>
                  <Text style={styles.textStyle}>
                    <AntDesign
                      name="edit"
                      size={18}
                      color="#555555"
                      style={{ marginRight: 5 }}
                    />
                    Update
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Recording;

const styles = StyleSheet.create({
  recordingContainer: {
    padding: 15,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    // borderTopWidth: 2,
    // borderColor: '#333333',
  },

  recordingDetailsContainer: {
    flex: 2,
  },
  recordTitle: {
    color: "#eeeeee",
    fontWeight: "500",
  },
  durationAndDate: {
    color: "#aaaaaa",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    height: 180,
    width: 250,
    backgroundColor: "rgb(51,50,51)",
    borderRadius: 5,
    padding: 10,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 5,
    elevation: 2,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDelete: {
    backgroundColor: "#ce2029",
  },
  buttonUpdate: {
    backgroundColor: "#187bcd",
    width: "100%",
  },
  buttonClose: {
    alignSelf: "flex-end",
  },
  textStyle: {
    color: "white",
    fontWeight: "400",
    textAlign: "center",
    fontSize: 16,
  },
  inputTitleText: {
    height: 40,
    width: "100%",
    paddingLeft: 10,
    marginHorizontal: "auto",
    borderWidth: 1,
    borderColor: "#555555",
    color: "#eeeeee",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    color: "white",
  },
});
