// query{
//   user {
//     timeline: transactions(
//       where: {type: {_eq: "xp"}, _or: [{attrs: {_eq: {}}}, {attrs: {_has_key: "group"}}], _and: [{path: {_nlike: "%/piscine-js/%"}}, {path: {_nlike: "%/piscine-go/%"}}]}
//     ) {
//       amount
//       createdAt
//       path
//     }
//   }
// }

const data = {
  data: {
    user: [
      {
        timeline: [
          {
            amount: 34375,
            createdAt: "2023-04-04T10:56:14.168751+00:00",
            path: "/gritlab/school-curriculum/lem-in",
          },
          {
            amount: 5000,
            createdAt: "2022-09-07T16:50:46.447947+00:00",
            path: "/gritlab/school-curriculum/go-reloaded",
          },
          {
            amount: 100,
            createdAt: "2022-09-22T10:01:58.595203+00:00",
            path: "/gritlab/school-curriculum/checkpoint/displayalrevm",
          },
          {
            amount: 200,
            createdAt: "2022-09-22T10:03:33.668528+00:00",
            path: "/gritlab/school-curriculum/checkpoint/countdown",
          },
          {
            amount: 6125,
            createdAt: "2022-09-29T16:26:55.142587+00:00",
            path: "/gritlab/school-curriculum/ascii-art",
          },
          {
            amount: 6125,
            createdAt: "2022-10-03T10:44:43.388201+00:00",
            path: "/gritlab/school-curriculum/output",
          },
          {
            amount: 6125,
            createdAt: "2022-10-03T11:24:23.928278+00:00",
            path: "/gritlab/school-curriculum/fs",
          },
          {
            amount: 70000,
            createdAt: "2023-01-30T08:32:17.268497+00:00",
            path: "/gritlab/school-curriculum/piscine-js",
          },
          {
            amount: 9200,
            createdAt: "2022-11-16T16:10:52.168946+00:00",
            path: "/gritlab/school-curriculum/ascii-art-web",
          },
          {
            amount: 6125,
            createdAt: "2022-10-17T17:39:25.724325+00:00",
            path: "/gritlab/school-curriculum/color",
          },
          {
            amount: 9200,
            createdAt: "2022-11-16T16:53:36.429254+00:00",
            path: "/gritlab/school-curriculum/stylize",
          },
          {
            amount: 9200,
            createdAt: "2022-11-25T13:27:32.573082+00:00",
            path: "/gritlab/school-curriculum/dockerize",
          },
          {
            amount: 24500,
            createdAt: "2022-12-09T12:38:34.268016+00:00",
            path: "/gritlab/school-curriculum/groupie-tracker",
          },
          {
            amount: 12250,
            createdAt: "2022-12-16T15:15:51.631782+00:00",
            path: "/gritlab/school-curriculum/visualizations",
          },
          {
            amount: 12250,
            createdAt: "2022-12-20T19:41:58.392034+00:00",
            path: "/gritlab/school-curriculum/net-cat",
          },
          {
            amount: 100,
            createdAt: "2022-09-08T10:03:41.537351+00:00",
            path: "/gritlab/school-curriculum/checkpoint/printdigits",
          },
          {
            amount: 200,
            createdAt: "2022-09-08T10:09:39.286782+00:00",
            path: "/gritlab/school-curriculum/checkpoint/max",
          },
          {
            amount: 300,
            createdAt: "2022-09-08T11:13:01.231732+00:00",
            path: "/gritlab/school-curriculum/checkpoint/rot13",
          },
          {
            amount: 400,
            createdAt: "2022-09-08T11:27:23.075198+00:00",
            path: "/gritlab/school-curriculum/checkpoint/alphamirror",
          },
          {
            amount: 300,
            createdAt: "2022-09-22T10:09:40.540012+00:00",
            path: "/gritlab/school-curriculum/checkpoint/rot13",
          },
          {
            amount: 400,
            createdAt: "2022-09-22T10:11:22.135932+00:00",
            path: "/gritlab/school-curriculum/checkpoint/compare",
          },
          {
            amount: 500,
            createdAt: "2022-09-22T11:58:16.813304+00:00",
            path: "/gritlab/school-curriculum/checkpoint/reversebits",
          },
          {
            amount: 600,
            createdAt: "2022-09-22T12:13:35.874935+00:00",
            path: "/gritlab/school-curriculum/checkpoint/printhex",
          },
        ],
      },
    ],
  },
};

const timeline = data.data.user[0].timeline;
timeline.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("width", "100%");
svg.setAttribute("height", "200px");

const colors = {
  default: "#ccc",
  hover: "#ffcc00",
};

const styles = {
  timelineHeight: 20,
  timelineMargin: 10,
  labelMargin: 5,
  xpLabelWidth: 50,
};

let xPos = 0;

timeline.forEach((item) => {
  const timelineRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  const xpLabel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );

  const xPosEnd = xPos + styles.xpLabelWidth;

  timelineRect.setAttribute("x", xPos);
  timelineRect.setAttribute("y", styles.timelineMargin);
  timelineRect.setAttribute("width", styles.xpLabelWidth);
  timelineRect.setAttribute("height", styles.timelineHeight);
  timelineRect.setAttribute("fill", colors.default);

  xpLabel.setAttribute("x", xPosEnd + styles.labelMargin);
  xpLabel.setAttribute("y", styles.timelineMargin + styles.timelineHeight / 2);
  xpLabel.setAttribute("alignment-baseline", "middle");
  xpLabel.textContent = item.amount.toString();

  xPos = xPosEnd + styles.xpLabelWidth;

  // Add event listener for hover effect
  timelineRect.addEventListener("mouseover", () => {
    timelineRect.setAttribute("fill", colors.hover);
    // Show tooltip or other details about the timeline item
    // You can use a tooltip library or create a custom one
    console.log(`XP: ${item.amount}, Path: ${item.path}`);
  });

  timelineRect.addEventListener("mouseout", () => {
    timelineRect.setAttribute("fill", colors.default);
    // Hide the tooltip or reset the details display
  });

  svg.appendChild(timelineRect);
  svg.appendChild(xpLabel);
});

const container = document.getElementById("timeline-container");
container.appendChild(svg);
