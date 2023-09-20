import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyDGEwwRCLdRXYLhMYgrCkh-67beRw31i-U",
  authDomain: "voice-recorder-84355.firebaseapp.com",
  projectId: "voice-recorder-84355",
  storageBucket: "voice-recorder-84355.appspot.com",
  messagingSenderId: "823767307506",
  appId: "1:823767307506:web:5f2b93939e7b1b296dec6b",
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const RECORDINGS = "recordings";
const USERS = "users";

export const getRandomPassword = async () => {
  const url = `https://www.psswrd.net/api/v1/password/`
  return await fetch(url)
  .then((response) => response.json())
}

export const refreshToken = async (refreshToken) => {
  const url = `https://securetoken.googleapis.com/v1/token?key=${firebaseConfig.apiKey}`
  await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: `grant_type=refresh_token&refresh_token=${refreshToken}`
})
  .then(response => response.json())
  .then(data => {
    // console.log('Refresh token==',data);
  })
  .catch(error => {
    console.error('Refresh token Error==',error);
  });

}

export const validateToken = async () => {
  console.log("Trying to validate");
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
  let token = await SecureStore.getItemAsync("authToken");
  token = JSON.parse(token);
  console.log("Token ===", typeof token);
  const tokenStatus = {
    isValid: false,
    userEmail: null,
  };

  if (token === null) return tokenStatus;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken: token.idToken,
    }),
  });
  console.log(response.statusText);
  if (response.ok) {
    const data = await response.json();
    const user = data.users[0];
    console.log("===", user, data);
    if (user) {
      const expirationTimeSeconds = user.validSince + token.expiresIn;
      const now = new Date().getTime();

      if (expirationTimeSeconds > now) {
        // Token is still valid
        return { isValid: true, userEmail: user.email, refreshToken: token.refreshToken };
      }
    }
  }

  return tokenStatus;
};

export const signUpWithEmailAndPassword = async (email, password) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;

  const headers = {
    "Content-Type": "application/json",
  };

  const payload = {
    email,
    password,
    returnSecureToken: true,
  };

  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then(async (token) => {
      console.log(token);
      await SecureStore.setItemAsync("authToken", JSON.stringify(token));
      console.log("signup successful");
    })
    .catch((error) => {
      console.error("Error signing up", error);
    });
};

export const signInUserWithEmailAndPassword = async (email, password) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;

  const headers = {
    "Content-Type": "application/json",
  };

  const payload = {
    email,
    password,
    returnSecureToken: true,
  };

  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then(async (token) => {
      console.log(token);
      await SecureStore.setItemAsync("authToken", JSON.stringify(token));
      console.log("after securestore", email);
      // return email;
      // throw new Error('Stop here');
    })
    .catch((error) => {
      console.error("Error signing in :", error);
    });

  // signInWithEmailAndPassword(auth, email, password)
  //   .then(async (userCredential) => {
  //     const { user } = userCredential;
  //     console.log('User signed in:', user.email);
  //     await getUser(user.email).then((userData) => {
  //       console.log('User data:', userData);
  //     })
  //   }).catch((error) => {
  //     console.log('Could not sign in', error);
  //   })
};

export const signOutUser = async () => {
  await SecureStore.deleteItemAsync("authToken")
    .then(() => {
      console.log("Sign-out successful.");
    })
    .catch((error) => {
      console.log("Sign-out error:", error);
    });
};
// dribble, awwwards, mobbing, framer, ux toast ================================
export const registerUser = async (user) => {
  console.log("user", user);
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/?documentId=${user.email}`;
  const firebaseDocumentStructure = {
    fields: {
      fullName: { stringValue: user.fullName },
      email: { stringValue: user.email },
    },
  };
  fetch(url, {
    method: "POST",
    body: JSON.stringify(firebaseDocumentStructure),
  })
    .then((response) => response.json())
    .then(async (user) => {
      await AsyncStorage.setItem("user", JSON.stringify({ email: user.email }));
      console.log(user);
    })
    .catch((err) => console.log("Failed to add user", err));
  // try {
  //   // Add a new document in collection "users"
  //   console.log('trying to register', user.email)
  //   await setDoc(doc(db, 'users', user.email), user)
  //     .then(async () => {
  //       console.log("User registered");
  //       await AsyncStorage.setItem('user', JSON.stringify({ email: user.email }));
  //     }).catch((error) => {
  //       console.log(error);
  //     });
  // } catch (e) {
  //   console.error("Error adding user document: ", e);
  // }
};

export const getUser = async (userEmail) => {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/${userEmail}`;

  return await fetch(url)
    .then((response) => response.json())
    .then((user) => {
      const normalObjectStructure = {
        email: user.fields.email.stringValue,
        fullName: user.fields.fullName.stringValue,
      };
      console.log(normalObjectStructure);
      return normalObjectStructure;
    })
    .catch((error) => console.log("Error getting user document: ", error));
};

export const getUserRecordings = async (userEmail) => {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/${userEmail}/${RECORDINGS}`;
  let recordingsData = [];

  await fetch(url, {
    // headers: {
    //   authorization: `Bearer ${getIdToken()}`,
    // },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('raw data', data);
      // If there is no recordings collection return empty array
      if (Object.keys(data).length < 1) return recordingsData;

      recordingsData = data.documents.map((recordingData) => {
        const normalObjectStructure = {
          date: recordingData.fields.date.stringValue,
          duration: recordingData.fields.duration.stringValue,
          title: recordingData.fields.title.stringValue,
          file: recordingData.fields.file.stringValue,
          id: recordingData.name.substring(
            recordingData.name.lastIndexOf("/") + 1
          ),
        };

        return normalObjectStructure;
      });
    })
    .catch((error) => {
      console.error("Error fetching recordings", error);
    });
  return recordingsData;
};

export const deleteRecording = async (userEmail, id) => {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/${userEmail}/${RECORDINGS}/${id}`;

  fetch(url, {
    method: "DELETE",
    headers: {
      // authorization: `Bearer ${getIdToken()}`,
    },
  })
    .then((response) => {
      // Check if the request was successful (status code 200-299)
      if (response.ok) console.log("Recording deleted successfully");
    })
    .catch((error) => {
      console.error("Failed to delete recording", error);
    });
};

export const updateRecording = async (id, userEmail, newTitle) => {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/${userEmail}/${RECORDINGS}/${id}?currentDocument.exists=true&updateMask.fieldPaths=title&alt=json`;

  fetch(url, {
    headers: {
      // authorization: `Bearer ${getIdToken()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ fields: { title: { stringValue: newTitle } } }),
    method: "PATCH",
  })
    .then((response) => {
      // Check if the request was successful (status code 200-299)
      if (response.ok) console.log("Recording title updated successfully");
    })
    .catch((error) => {
      console.error("Failed to update recording title", error);
    });
};

export const uploadToFirestore = async (userEmail, recording) => {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/${userEmail}/${RECORDINGS}`;

  let documentID = "";
  const firebaseDocumentStructure = {
    fields: {
      title: { stringValue: recording.title },
      date: { stringValue: recording.date },
      duration: { stringValue: recording.duration },
      file: { stringValue: recording.file },
    },
  };
  console.log("inside uploadToFirestore");
  fetch(url, {
    method: "POST",
    body: JSON.stringify(firebaseDocumentStructure),
    headers: {
      // authorization: `Bearer ${getIdToken()}`,
      "content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Get the document id
      documentID = data.name.substring(data.name.lastIndexOf("/") + 1);
    })
    .catch((error) => {
      console.error("Failed to upload recording", error);
    });
  return documentID;
};
// TODO: Need to implement code
export const uploadToFirebaseStorage = async (userEmail, recording) => {
  // try {
  let fileType = "";
  console.log("uploadToFirebaseStorage before fetchAudio");
  const blob = await fetchAudioFile(recording.file)
    .then((audioFile) => {
      console.log("i have audio", audioFile);
      const uriParts = recording.file.split(".");
      fileType = uriParts[uriParts.length - 1];

      return audioFile;
    })
    .catch((error) => {
      console.log("error", error);
    });
  console.log("before if blob");

  if (blob) {
    // Set the Firebase Storage upload URL
    // const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${userEmail}/${recording.title}.${recording.file.includes('blob') ? 'webm' : fileType}:addFirebase`;
    // const storageUrl = `https://firebasestorage.googleapis.com/v1beta/${
    //   firebaseConfig.storageBucket
    // }/${userEmail}/o?uploadType=media&name=${recording.title}.${
    //   recording.file.includes("blob") ? "webm" : fileType
    // }`;
    // console.log("before uploadBlobToFirebase");
    // await uploadBlobToFirebase(userEmail, blob, recording, fileType).then(
    //   (res) => console.log("res", res)
    // );
    // throw new Error("Stopppppp");
    //====
    const storageRef = ref(
      storage,
      `${userEmail}/${recording.title}.${
        recording.file.includes("blob") ? "webm" : fileType
      }`
    );
    await uploadBytes(storageRef, blob, {
      contentType: `audio/${
        recording.file.includes("blob") ? "webm" : fileType
      }`,
    });
    const downloadUrl = await getDownloadURL(storageRef);
    console.log("Recording uploaded to Firebase Storage.", downloadUrl);
    return downloadUrl;
  }
  // } catch (error) {
  //   console.error("Error uploading recording to Firebase:", error);
  // }
};

// Function causes network request error //
const uploadBlobToFirebase = async (userEmail, blob, recording, fileType) => {
  const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${
    firebaseConfig.storageBucket
  }.appspot.com/o/${encodeURIComponent(userEmail)}`;
  const fileName = `${recording.title}.${
    recording.file.includes("blob") ? "webm" : fileType
  }`;

  const formData = new FormData();
  formData.append("file", blob, fileName);

  return fetch(`${storageUrl}%2F${encodeURIComponent(fileName)}`, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error uploading file");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Metadata: ", data);
      return data; // Returns metadata about the uploaded file
    });
};

const fetchAudioFile = (uri) => {
  console.log("inside fetchAudioFile");
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.responseType = "blob";

    xhr.onload = () => {
      console.log("status =", xhr.status);
      if (xhr.status == 0 || xhr.status == 200) {
        console.log("xhr.response==", xhr.response);
        resolve(xhr.response);
      } else {
        reject(new Error("Rejected--", xhr.statusText));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    xhr.send(null);
  });
};

const getIdToken = () => {
  SecureStore.getItemAsync("authToken").then((token) => {
    if (!token) return null;
    token = JSON.parse(token);
    console.log(token);
    return token?.idToken;
  });
};


