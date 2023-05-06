const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const credential = document.getElementById("credential").value;
  const password = document.getElementById("password").value;

  try {
    const token = await authenticate(credential, password);
    localStorage.setItem("jwt", token);
    window.location.href = "profile.html";
  } catch (error) {
    errorMessage.textContent = "Invalid credentials. Please try again.";
  }
});

async function authenticate(credential, password) {
  const response = await fetch("https://((DOMAIN))/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(credential + ":" + password),
    },
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  const data = await response.json();
  return data.jwt;
}
