// Get a reference to the Firebase Authentication service
const auth = firebase.auth();

function login() {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
    });

  return false;
}

auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    const uid = user.uid;
    console.log(uid);
  } else {
    // User is signed out
  }
});
