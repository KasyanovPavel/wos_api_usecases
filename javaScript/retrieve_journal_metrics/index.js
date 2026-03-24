import express from "express";
import bodyParser from "body-parser";
import { run, runMostRecentJcr } from "./data_processing.js";
import { validationApiCall } from "./api_operations.js";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", {
    last_year: false,
    searchQuery: "",
    errorMessage: null,
    message: null,
    filename: null,
    publicationData: null
  });
});

app.post("/", async (req, res) => {
  let searchQuery = req.body.searchQuery;
  let mostRecent = req.body.check === "on";

  if (req.body.button === "validate") {

    let validation = await validationApiCall(searchQuery);

    console.log(`Validation code: ${validation.status}`);
    console.log(JSON.stringify(validation.data));

    if (validation.status === 200) {
      res.render("index.ejs", {
        message: `Web of Science documents found: ${validation.data.QueryResult.RecordsFound}`,
        errorMessage: null,
        searchQuery,
        last_year: mostRecent,
        filename: null,
        publicationData: null
      });

    } else {
      res.render("index.ejs", {
        message: null,
        errorMessage: `Web of Science request status: ${validation.status}, message: ${validation.text}`,
        searchQuery,
        last_year: mostRecent,
        filename: null,
        publicationData: null
      });
    }

  } else if (req.body.button === "run") {

    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let result;

    if (mostRecent) {
      result = await runMostRecentJcr(searchQuery, (progress) => {
        res.write(JSON.stringify({
          type: "progress",
          percent: progress.percent,
          label: progress.label
        }) + "\n");
      });

    } else {
      result = await run(searchQuery, (progress) => {
        res.write(JSON.stringify({
          type: "progress",
          percent: progress.percent,
          label: progress.label
        }) + "\n");
      });
    }

    res.write(JSON.stringify({
      type: "result",
      publicationData: result.parsedJson,
      filename: result.filename
    }) + "\n");

    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});