function logout() {
  localStorage.removeItem("jwt");
  window.location.href = "login.html";
}

async function fetchData() {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    window.location.href = "/login.html";
    return;
  }

  const query = `
  query {
    user {
      id
      login
      attrs
      campus
    }
  }
`;

  try {
    const response = await fetch(
      "https://01.gritlab.ax/api/graphql-engine/v1/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();
    const user = data.data.user[0];
    displayUserInfo(user);
    // generateGraphs(user);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function displayUserInfo(user) {
  // Set the user image

  // if (user.attrs.image) {
  document.querySelector(".user-image").src = user.attrs.image;
  // }

  document.getElementById(
    "name-profile"
  ).textContent = ` ${user.login}s Profile`;

  document.getElementById("phone").textContent = ` ${user.attrs.phonenumber}`;

  document.getElementById("email").textContent = ` ${user.attrs.email}`;

  document.getElementById(
    "first-name-last-name"
  ).textContent = ` ${user.attrs.firstName} ${user.attrs.lastName}`;

  document.getElementById("campus").textContent = ` Student at ${user.campus}`;

  document.getElementById("from").textContent = `${calculateAge(
    user.attrs.dateOfBirth
  )} Years old from ${user.attrs.country}`;
}
function generateGraphs(user) {
  // Use the user data to generate the SVG graphs
}

function calculateAge(dateOfBirthStr) {
  const dob = new Date(dateOfBirthStr);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs); // milliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970); // subtract 1970 to get the age in years
}

function logout() {
  localStorage.removeItem("jwt");
  window.location.href = "/login.html";
}

// Call fetchData on page load
fetchData();

function convertToByteUnits(num) {
  const units = ["bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = 0;
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }
  return num.toFixed(2) + " " + units[i];
}
