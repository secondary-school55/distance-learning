const fs = require("fs");
const path = require("path");
const glob = require("glob");
const _ = require("lodash");

const items = glob
  .sync("public/**/*.*")
  .filter((item) => path.parse(item).ext !== ".json")
  .map((item) => ({
    components: toLesson(item.split("/").slice(1)),
    route: item.replace("public", ""),
  }));

const itemsGroup = {};

for (const item of items) {
  const { year, className, classSub, lesson, date, title } = item.components;

  if (itemsGroup[year] === undefined) itemsGroup[year] = {};

  if (itemsGroup[year][className] === undefined)
    itemsGroup[year][className] = {};

  if (itemsGroup[year][className][classSub] === undefined)
    itemsGroup[year][className][classSub] = {};

  if (itemsGroup[year][className][classSub][lesson] === undefined)
    itemsGroup[year][className][classSub][lesson] = [];

  itemsGroup[year][className][classSub][lesson].push({
    date,
    title,
    route: item.route,
  });
}

const root =
  process.env.GITHUB_WORKSPACE === undefined
    ? ""
    : process.env.GITHUB_WORKSPACE;

for (const key in itemsGroup) {
  fs.writeFileSync(
    path.join(root, "public", `${key}.json`),
    JSON.stringify(itemsGroup[key], null, 2),
    "utf8"
  );
}

function toLesson(components) {
  let classSub = false;
  let minusOne = -1;

  if (/^[0-9]$/.test(components[2][0])) {
    classSub = components[2];
    minusOne = 0;
  }

  const titleBase = components[4 + minusOne].replace(
    path.parse(components[4 + minusOne]).ext,
    ""
  );

  const date = titleBase.slice(0, 5).trim();
  const title = titleBase.slice(6).trim();

  return {
    year: components[0],
    className: components[1],
    classSub,
    lesson: components[3 + minusOne],
    date,
    title,
  };
}
