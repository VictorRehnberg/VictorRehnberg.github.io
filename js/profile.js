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
    {
  user {
    login
    attrs
    campus
    level: transactions(
      where: {type: {_eq: "level"}, path: {_ilike: "%/school-curriculum/%"}}
      order_by: {amount: desc}
      limit: 1
    ) {
      amount
    }
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
      where: {type: {_eq: "xp"}, _or: [{attrs: {_eq: {}}}, {attrs: {_has_key: "group"}}], _and: [{path: {_nlike: "%/piscine-js/%"}}, {path: {_nlike: "%/piscine-go/%"}}]}
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
    timeline: transactions(
      where: {type: {_eq: "xp"}, _or: [{attrs: {_eq: {}}}, {attrs: {_has_key: "group"}}], _and: [{path: {_nlike: "%/piscine-js/%"}}, {path: {_nlike: "%/piscine-go/%"}}]}
    ) {
      amount
      createdAt
      path
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

    // get the size of the timeline-container
    const timelineContainer = document.getElementById("timeline-container");

    // create the timeline
    createTimeline(
      timelineContainer.offsetWidth,
      timelineContainer.offsetHeight,
      data
    );
    //  if the window is resized, re-create the timeline
    const firstHeight = timelineContainer.offsetHeight;
    window.addEventListener("resize", () => {
      createTimeline(timelineContainer.offsetWidth, firstHeight, data);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function createTimeline(thicc, smoll, data) {
  // remove the previous timeline
  d3.select("#timeline").selectAll("*").remove();
  d3.select(".tooltip").remove();

  // sort the timeline data by date
  data.data.user[0].timeline.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
  // get the start and end date of the timeline
  const startDate = new Date(data.data.user[0].timeline[0].createdAt);
  const endDate = new Date(
    data.data.user[0].timeline[data.data.user[0].timeline.length - 1].createdAt
  );

  // set the start and end date to the first and last day of the month in order to get the correct width of the timeline
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  endDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setHours(0, 0, 0, 0);

  // set the margins and width and height of the timeline
  const margin = { top: 10, right: 40, bottom: 30, left: 40 },
    width = thicc - margin.left - margin.right - 100,
    height = smoll - margin.top - margin.bottom - 40;

  // create a new svg element with the width and height of the timeline-container
  const svg = d3
    .select("#timeline")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().domain([startDate, endDate]).range([0, width]);
  if (thicc < 800 && thicc > 600) {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(1))
          .tickFormat(d3.timeFormat("%b %Y"))
      );
  } else if (thicc < 600 && thicc >= 500) {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(1))
          .tickFormat(d3.timeFormat("%b %y"))
      );
  } else if (thicc < 500 && thicc > 0) {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(1))
          .tickFormat(d3.timeFormat("%b"))
      );
  } else {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(1))
          .tickFormat(d3.timeFormat("%B %Y"))
      );
  }

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("left", "50%") // Set initial left position
    .style("top", "0"); // Set initial top position

  const mergeOverlappingDots = (data) => {
    let mergedData = [];
    let tempData = [];

    data.forEach((item, i) => {
      if (i === 0) {
        tempData.push(item);
      } else if (
        Math.abs(
          x(new Date(data[i - 1].createdAt)) - x(new Date(item.createdAt))
        ) < 6
      ) {
        tempData.push(item);
      } else {
        mergedData.push(tempData);
        tempData = [item];
      }
    });

    mergedData.push(tempData);
    return mergedData;
  };

  const mergedData = mergeOverlappingDots(data.data.user[0].timeline);

  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.data.user[0].timeline, (d) => d.amount)])
    .range(["#3366cc", "#cc3366"]);

  svg
    .selectAll(".dot")
    .data(mergedData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", (d) => 5)
    .attr("cx", (d) => x(new Date(d[0].createdAt)))
    .attr("cy", height)
    .attr("fill", (d) => colorScale(d[0].amount)) // Fill dots with color based on amount
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);

      let tooltipHtml = "";

      // Group projects by date
      let dateGroupedProjects = d.reduce((group, project) => {
        let date = d3.timeFormat("%B %d, %Y")(new Date(project.createdAt));
        if (!group[date]) group[date] = [];
        group[date].push(project);
        return group;
      }, {});

      // Generate tooltip HTML

      for (let date in dateGroupedProjects) {
        tooltipHtml += `${date}<br/>`;
        tooltipHtml += dateGroupedProjects[date]
          .map(
            (project) =>
              `${project.path.split("/").pop()}<br/>${convertToByteUnits(
                project.amount
              )}` // Display project name and XP
          )
          .join("<br/>");
        tooltipHtml += "<br/>";
      }

      tooltip
        .html(tooltipHtml)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })

    .on("mouseout", function (d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

function displayUserLevel(level) {
  // if the user is between level 0 -10 return a string containing the level followed by "Aspiring Developer"
  if (level >= 0 && level < 10) {
    return `Level ${level} Aspiring Developer`;
  }
  if (level >= 10 && level < 20) {
    return `Level ${level} Beginner Developer`;
  }
  if (level >= 20 && level < 30) {
    return `Level ${level} Apprentice Developer`;
  }
  if (level >= 30 && level < 40) {
    return `Level ${level} Assistant Developer`;
  }
  if (level >= 40 && level < 50) {
    return `Level ${level} Basic Developer`;
  }
  if (level >= 50 && level < 60) {
    return `Level ${level} Junior Developer`;
  } else {
    return `Level ${level}`;
  }
}

// Display the user XP and XP ratio in the DOM and generate the XP graph
function displayUserXp(xpAmount, upAmount, downAmount) {
  // Display the user XP
  document.getElementById(
    "total-xp"
  ).textContent = `Total XP: ${convertToByteUnits(xpAmount)}`;
  // Display the user XP ratio
  document.getElementById("xpRatio").textContent =
    "Audit Ratio: " + (upAmount / downAmount).toFixed(2);
  // Display the user given XP
  document.getElementById("upXpValue").textContent =
    "Up XP: " + convertToByteUnits(upAmount);
  // Display the user received XP
  document.getElementById("downXpValue").textContent =
    "Down XP: " + convertToByteUnits(downAmount);

  const totalXP = upAmount + downAmount;
  const upXp = document.getElementById("upXp");
  const downXp = document.getElementById("downXp");
  const upXpWidth = (upAmount / totalXP) * 100;
  const downXpWidth = (downAmount / totalXP) * 100;
  upXp.setAttribute("width", upXpWidth);
  upXp.setAttribute("x", 0);
  downXp.setAttribute("width", downXpWidth);
  downXp.setAttribute("x", upXpWidth);
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
  document.getElementById("campus").textContent = ` ${displayUserLevel(
    user.level[0].amount
  )} at ${user.campus}`;
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
  if (units[i] != "kB") {
    num = num.toFixed(2)
  } else {
    num = Math.round(num);
  }
  return `${num} ${units[i]}`;
}