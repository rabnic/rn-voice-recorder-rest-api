// SplashScreen.js

import React from "react";
import { View, ActivityIndicator,Image } from "react-native";
import splashImage from '../assets/splash.png';

const SplashScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image source={splashImage} style={{height: 480, width: 480}}/>
      {/* <ActivityIndicator size="large" color="#0000ff" /> */}
    </View>
  );
};

export default SplashScreen;
