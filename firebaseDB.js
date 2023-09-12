import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc, deleteDoc, addDoc, getDocs, collection, initializeFirestore, getDoc } from "firebase/firestore";
import { getAuth, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, initializeAuth, getReactNativePersistence, signOut } from "firebase/auth";
// import { getReactNativePersistence } from "firebase/auth/react-native"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGEwwRCLdRXYLhMYgrCkh-67beRw31i-U",
  authDomain: "voice-recorder-84355.firebaseapp.com",
  projectId: "voice-recorder-84355",
  storageBucket: "voice-recorder-84355.appspot.com",
  messagingSenderId: "823767307506",
  appId: "1:823767307506:web:5f2b93939e7b1b296dec6b",
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
// const auth = getAuth(app);
export const auth = getAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})

const RECORDINGS = 'recordings';
const USERS = 'users';

export const signUpWithEmailAndPassword = async (email, password) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      console.log('User signed in successfully');
    })
    .catch((error) => {
      console.log('SignIn Error =', error);
    });
}

export const signInUserWithEmailAndPassword = async (email, password) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;

  const headers = {
    'Content-Type': 'application/json'
  };

  const payload = {
    email,
    password,
    returnSecureToken: true
  };

  fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      // Handle the response data here
      console.log(data);
    })
    .catch(error => {
      // Handle any errors here
      console.error(error);
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
}

export const signOutUser = async () => {
  signOut(auth)
    .then(async () => {
      await AsyncStorage.removeItem('user');
      console.log("Sign-out successful.");
    })
    .catch((error) => {
      console.log(error);
    });
}
// dribble, awwwards, mobbing, framer, ux toast ================================
export const registerUser = async (user) => {
  try {
    // Add a new document in collection "users"
    console.log('trying to register', user.email)
    await setDoc(doc(db, 'users', user.email), user)
      .then(async () => {
        console.log("User registered");
        await AsyncStorage.setItem('user', JSON.stringify({ email: user.email }));
      }).catch((error) => {
        console.log(error);
      });
  } catch (e) {
    console.error("Error adding user document: ", e);
  }
}

export const getUser = async (email) => {
  const userDocRef = doc(db, 'users', email);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    // console.log("Document data:", docSnap.data());
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
};

export const getUserRecordings = async (userEmail) => {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/${userEmail}/${RECORDINGS}`;
  let recordingsData = []

  await fetch(url)
    .then(response => response.json())
    .then(data => {
      recordingsData = data.documents.map((recordingData) => {

        const normalObjectStructure = {
          date: recordingData.fields.date.stringValue,
          duration: recordingData.fields.duration.stringValue,
          title: recordingData.fields.title.stringValue,
          file: recordingData.fields.file.stringValue,
          id: recordingData.name.substring(recordingData.name.lastIndexOf('/') + 1),
        }

        return normalObjectStructure;
      })
    })
    .catch(error => {
      console.error('Error fetching recordings', error);
    });
  return recordingsData;
};

export const deleteRecording = async (userEmail, id) => {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/${userEmail}/${RECORDINGS}/${id}`;

  fetch(url, {
    method: 'DELETE',
  })
    .then(response => {
      // Check if the request was successful (status code 200-299)
      if (response.ok)
        console.log('Recording deleted successfully');
    })
    .catch(error => {
      console.error('Failed to delete recording', error);

    });
};

export const updateRecording = async (id, userEmail, newTitle) => {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/${userEmail}/${RECORDINGS}/${id}?currentDocument.exists=true&updateMask.fieldPaths=title&alt=json`;

  fetch(url, {
    // headers: {
    //   authorization: "Bearer [ACCESS_TOKEN]",
    //   "content-type": "application/json",
    // },
    body: JSON.stringify({ fields: { title: { stringValue: newTitle } } }),
    method: "PATCH"
  })
    .then(response => {
      // Check if the request was successful (status code 200-299)
      if (response.ok)
        console.log('Recording title updated successfully');
    })
    .catch(error => {
      console.error('Failed to update recording title', error);

    });
}

export const uploadToFirestore = async (userEmail, recording) => {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS}/${userEmail}/${RECORDINGS}`;

  let documentID = ''
  const firebaseDocumentStructure = {
    fields: {
      title: { stringValue: recording.title },
      date: { stringValue: recording.date },
      duration: { stringValue: recording.duration },
      file: { stringValue: recording.file },
    },
  }

  fetch(url, {
    method: 'POST',
    body: JSON.stringify(firebaseDocumentStructure),
  })
    .then(response => response.json())
    .then(data => {
      // Get the document id
      documentID = data.name.substring(data.name.lastIndexOf('/') + 1);
    })
    .catch(error => {
      console.error('Failed to upload recording', error);

    });
  return documentID;
};
// TODO: Need to implement code
export const uploadToFirebaseStorage = async (userEmail, recording) => {
  try {
    let fileType = "";
    const blob = await fetchAudioFile(recording.file)
      .then((audioFile) => {
        // console.log("i have audio", audioFile);
        const uriParts = recording.file.split(".");
        fileType = uriParts[uriParts.length - 1];

        return audioFile;
      })
      .catch((error) => {
        console.log("error", error);
      });

    if (blob) {

      // Set the Firebase Storage upload URL
      const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${userEmail}/${recording.title}.${recording.file.includes('blob') ? 'webm' : fileType}`;

      // Set the filename and path for the audio file in Firebase Storage
      const filename = 'audio.wav'; // Change this to your desired filename
      const path = `audio/${filename}`; // Change the 'audio/' prefix to your desired directory path

      // Set the request body
      const body = {
        name: path,
        contentType: 'audio/wav',
      };

      // Make the API request with the Fetch API
      fetch(`${storageUrl}?uploadType=media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer {YOUR_FIREBASE_AUTH_TOKEN}', // Replace with your Firebase authentication token
        },
        body: JSON.stringify(body),
      })
        .then(response => {
          if (response.ok) {
            console.log('Audio file uploaded successfully!');
          } else {
            console.error('Error uploading audio file:', response.statusText);
          }
        })
        .catch(error => {
          console.error('Error uploading audio file:', error);
        });

      //====
      const storageRef = ref(storage, `${userEmail}/${recording.title}.${recording.file.includes('blob') ? 'webm' : fileType}`);
      await uploadBytes(storageRef, blob, { contentType: `audio/${recording.file.includes('blob') ? 'webm' : fileType}` });
      const downloadUrl = await getDownloadURL(storageRef);
      // console.log("Recording uploaded to Firebase Storage.");
      return downloadUrl;
    }
  } catch (error) {
    console.error("Error uploading recording to Firebase:", error);
  }
};

const fetchAudioFile = (uri) => {
  console.log("inside fetchAudioFile");
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.responseType = "blob";

    xhr.onload = () => {
      // console.log('status =', xhr.status);
      if (xhr.status === 0 || xhr.status === 200) {
        console.log(xhr.response);
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.statusText));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    xhr.send(null);
  });
};