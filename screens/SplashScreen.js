import React from "react";
import {
  View,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native";
import splashImage from "../assets/splash.png";

const SplashScreen = () => {
  const { width, height } = useWindowDimensions();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        position: "absolute",
        top: 0,
        left: 0,
        width: width,
        height: height + 50,
      }}
    >
      {/* <Image source={splashImage} style={{ height: 470, width: 470 }} /> */}
      <ActivityIndicator size="large" color="rgb(31,30,31)" style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}/>
    </View>
  );
};

export default SplashScreen;
