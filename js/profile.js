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
        login
        attrs
        campus
        upAmount: transactions_aggregate(where: {type: {_eq: "up"}}) {
          aggregate {
            sum {
              amount
            }
          }
        }
        downAmount: transactions_aggregate(where: {type: {_eq: "down"}}) {
          aggregate {
            sum {
              amount
            }
          }
        }
        xpAmount: transactions_aggregate(
          where: {
            type: { _eq: "xp" }
            _or: [
              { attrs: { _eq: {} } }
              { attrs: { _has_key: "group" } }
            ]
            _and: [
              { path: { _nlike: "%/piscine-js/%" } }
              { path: { _nlike: "%/piscine-go/%" } }
            ]
          }
        ) {
          aggregate {
            sum {
              amount
            }
          }
        }
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
    displayUserXp(
      user.xpAmount.aggregate.sum.amount,
      user.upAmount.aggregate.sum.amount,
      user.downAmount.aggregate.sum.amount
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function displayUserXp(xpAmount, upAmount, downAmount) {
  document.querySelector(".xp-ratio .xp-value").textContent =
    // remove decimals and round to nearest integer
    Math.round((upAmount / downAmount) * 10) / 10;

  document.getElementById(
    "total-xp"
  ).textContent = `Total XP: ${convertToByteUnits(xpAmount)}`;

  document.querySelector(".xp-up .xp-value").textContent =
    convertToByteUnits(upAmount);

  document.querySelector(".xp-down .xp-value").textContent =
    convertToByteUnits(downAmount);
}

function displayUserInfo(user) {
  // Set the title of the page to the username of the user
  document.title = `${user.login}s Profile`;
  // Set the user image
  document.querySelector(".user-image").src = user.attrs.image;
  // set the user name
  document.getElementById(
    "name-profile"
  ).textContent = ` ${user.login}s Profile`;
  // Set the user phone number
  document.getElementById("phone").textContent = ` ${user.attrs.phonenumber}`;
  //  set the user email
  document.getElementById("email").textContent = ` ${user.attrs.email}`;
  // set the user first name and last name
  document.getElementById(
    "first-name-last-name"
  ).textContent = ` ${user.attrs.firstName} ${user.attrs.lastName}`;
  // set the user campus
  document.getElementById("campus").textContent = ` Student at ${user.campus}`;
  // set the user age and country
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

// Call fetchData on page load
fetchData();

function convertToByteUnits(num) {
  const units = ["bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = 0;
  while (num >= 1000 && i < units.length - 1) {
    num /= 1000;
    i++;
  }
  // remove decimals and round up to nearest integer
  num = Math.round(num);
  return `${num} ${units[i]}`;
}
