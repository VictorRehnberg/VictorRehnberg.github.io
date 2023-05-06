function logout() {
  localStorage.removeItem("jwt");
  window.location.href = "login.html";
}

function displayUserInfo(user) {
  document.getElementById("userId").textContent += ` ${user.id}`;
  document.getElementById("userLogin").textContent += ` ${user.login}`;
  document.getElementById("userXP").textContent += ` ${user.totalXP}`;
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
        totalXP
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
    generateGraphs(user);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchGraphQLData(jwt, query) {
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

  return await response.json();
}

function createBarChart(selector, title, data, xValue, yValue) {
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3.scaleBand().range([0, width]).padding(0.1);
  const y = d3.scaleLinear().range([height, 0]);

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set the scale domains
  x.domain(data.map((d) => d[xValue]));
  y.domain([0, d3.max(data, (d) => d[yValue])]);

  // Create the bars
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d[xValue]))
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d[yValue]))
    .attr("height", (d) => height - y(d[yValue]));

  // Add x-axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Add y-axis
  svg.append("g").call(d3.axisLeft(y));

  // Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(title);
}

function createPassFailRatioChart(selector, title, data, xValue, grade) {
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const passFailData = data.reduce((acc, d) => {
    const key = d[xValue];
    const pass = d[grade] >= 60 ? 1 : 0;
    const fail = d[grade] < 60 ? 1 : 0;

    if (!acc[key]) {
      acc[key] = { name: key, pass, fail };
    } else {
      acc[key].pass += pass;
      acc[key].fail += fail;
    }

    return acc;
  }, {});

  const passFailArray = Object.values(passFailData);

  const x = d3.scaleBand().range([0, width]).padding(0.1);
  const y = d3.scaleLinear().range([height, 0]);

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set the scale domains
  x.domain(passFailArray.map((d) => d.name));
  y.domain([0, d3.max(passFailArray, (d) => d.pass + d.fail)]);

  // Create the bars for pass
  svg
    .selectAll(".bar-pass")
    .data(passFailArray)
    .enter()
    .append("rect")
    .attr("class", "bar-pass")
    .attr("x", (d) => x(d.name))
    .attr("width", x.bandwidth() / 2)
    .attr("y", (d) => y(d.pass))
    .attr("height", (d) => height - y(d.pass))
    .attr("fill", "green");

  // Create the bars for fail
  svg
    .selectAll(".bar-fail")
    .data(passFailArray)
    .enter()
    .append("rect")
    .attr("class", "bar-fail")
    .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
    .attr("width", x.bandwidth() / 2)
    .attr("y", (d) => y(d.fail))
    .attr("height", (d) => height - y(d.fail))
    .attr("fill", "red");

  // Add x-axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Add y-axis
  svg.append("g").call(d3.axisLeft(y));

  // Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(title);

  // Add legend
  const legend = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(["Pass", "Fail"])
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend
    .append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", (d) => (d === "Pass" ? "green" : "red"));

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text((d) => d);
}

// Include the generateGraphs function here
async function generateGraphs(user) {
  const jwt = localStorage.getItem("jwt");

  // Fetch data for XP earned by project
  const xpByProjectQuery = `
    query {
      transaction(where: { type: { _eq: "xp" }, userId: { _eq: ${user.id} } }) {
        objectId
        amount
        object {
          name
        }
      }
    }
  `;

  const xpByProjectResponse = await fetchGraphQLData(jwt, xpByProjectQuery);
  const xpByProjectData = xpByProjectResponse.transaction;

  // Fetch data for projects pass/fail ratio
  const passFailRatioQuery = `
    query {
      progress(where: { userId: { _eq: ${user.id} }, object: { type: { _eq: "project" } } }) {
        objectId
        grade
        object {
          name
        }
      }
    }
  `;

  const passFailRatioResponse = await fetchGraphQLData(jwt, passFailRatioQuery);
  const passFailRatioData = passFailRatioResponse.progress;

  // Create the graphs
  createBarChart(
    "#graph1",
    "XP Earned by Project",
    xpByProjectData,
    "object.name",
    "amount"
  );
  createPassFailRatioChart(
    "#graph2",
    "Projects Pass/Fail Ratio",
    passFailRatioData,
    "object.name",
    "grade"
  );
}

// Call fetchData on page load
fetchData();
