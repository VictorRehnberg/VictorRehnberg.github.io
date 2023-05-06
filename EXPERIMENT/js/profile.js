const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("jwt");
  window.location.href = "login.html";
});

document.addEventListener("DOMContentLoaded", async () => {
  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userId = await getUserId(jwt);
    const userInfo = await getUserInfo(jwt, userId);
    const userXP = await getUserXP(jwt, userId);
    const userAuditRatio = await getUserAuditRatio(jwt, userId);

    document.getElementById("user-id").textContent = userInfo.id;
    document.getElementById("user-xp").textContent = userXP;
    document.getElementById("user-audit-ratio").textContent = userAuditRatio;
  } catch (error) {
    console.error(error);
    localStorage.removeItem("jwt");
    window.location.href = "login.html";
  }
});

async function getUserId(jwt) {
  const query = `
    query {
      user {
        id
      }
    }
  `;

  const data = await fetchGraphQL(jwt, query);
  return data.user[0].id;
}

async function getUserInfo(jwt, userId) {
  const query = `
    query {
      user(where: { id: { _eq: ${userId} }}) {
        id
      }
    }
  `;

  const data = await fetchGraphQL(jwt, query);
  return data.user[0];
}

async function getUserXP(jwt, userId) {
  const startDate = "2021-01-01"; // Set the start date for the time period
  const endDate = "2021-12-31"; // Set the end date for the time period

  const query = `
    query {
      transaction_aggregate(
        where: { userId: { _eq: ${userId} }, type: { _eq: "xp" }, createdAt: { _gte: "${startDate}", _lte: "${endDate}" }}
      ) {
        aggregate {
          sum {
            amount
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(jwt, query);
  return data.transaction_aggregate.aggregate.sum.amount;
}
function drawXPBarChart(xp) {
  const container = document.getElementById("graph-1");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("width", `${(xp / 10000) * 100}%`); // Assuming 10,000 XP is the maximum value for the chart
  rect.setAttribute("height", "100%");
  rect.setAttribute("fill", "blue");

  svg.appendChild(rect);
  container.appendChild(svg);
}

async function getUserAuditRatio(jwt, userId) {
  // Implement a GraphQL query to fetch the audit ratio for the user
}

async function fetchGraphQL(jwt, query) {
  const response = await fetch(
    "https://((DOMAIN))/api/graphql-engine/v1/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    throw new Error("GraphQL request failed");
  }

  const data = await response.json();
  return data.data;
}
