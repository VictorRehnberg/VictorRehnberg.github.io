// async function login() {
//   document.getElementById("login-form");

//   // prevent default action
//   event.preventDefault();

//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   // Base64 encode the credentials
//   const credentials = btoa(`${email}:${password}`);

//   try {
//     const response = await fetch("https://01.gritlab.ax/api/auth/signin", {
//       method: "POST",
//       headers: {
//         Authorization: `Basic ${credentials}`,
//       },
//     });

//     if (response.status === 200) {
//       const data = await response.json();
//       const jwt = data.token;
//       console.log(jwt);
//       localStorage.setItem("jwt", jwt);
//       // window.location.href = "/profile.html";
//     } else {
//       Toastify({
//         text: "Invalid credentials. Please try again.",
//         duration: 2000, // Display duration in ms
//         close: true, // Add a close button to the notification
//         gravity: "top", // Toast position (top or bottom)
//         backgroundColor: "red", // Toast background color
//       }).showToast();
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     Toastify({
//       text: "An error occured. Please try again.",
//       duration: 2000, // Display duration in ms
//       close: true, // Add a close button to the notification
//       gravity: "top", // Toast position (top or bottom)
//       backgroundColor: "red", // Toast background color
//     }).showToast();
//   }
//
// }

document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Base64 encode the credentials
    const credentials = btoa(`${email}:${password}`);

    try {
      const response = await fetch("https://01.gritlab.ax/api/auth/signin", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        const jwt = data;
        console.log("Acquired JWT: " + jwt);
        localStorage.setItem("jwt", jwt);
        window.location.href = "/profile.html";
      } else {
        Toastify({
          text: "Invalid credentials. Please try again.",
          duration: 2000, // Display duration in ms
          close: true, // Add a close button to the notification
          gravity: "top", // Toast position (top or bottom)
          style: { background: "red" }, // Toast background color
        }).showToast();
      }
    } catch (error) {
      console.error("Error:", error);
      Toastify({
        text: "An error occured. Please try again.",
        duration: 2000, // Display duration in ms
        close: true, // Add a close button to the notification
        gravity: "top", // Toast position (top or bottom)
        style: { background: "red" }, // Toast background color
      }).showToast();
    }
  });
