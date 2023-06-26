const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const xpath = require("xpath");
const { DOMParser } = require("xmldom");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/scrape", (req, res) => {
  const { body } = req;
  const { url } = body;

  return parseUrl(url).then(result => res.json(result));
});

app.listen(5000, () => console.log("OG Scraper Listening..."));

const xpaths = {
  title: 'string(//meta[@property="og:title"]/@content)',
  description: 'string(//meta[@property="og:description"]/@content)',
  image: 'string(//meta[@property="og:image"]/@content)',
  keywords: 'string(//meta[@property="keywords"]/@content)',
};

const retrievePage = url => axios.request({ url });
const convertBodyToDocument = body => new DOMParser().parseFromString(body);
const nodesFromDocument = (document, xpathselector) =>
  xpath.select(xpathselector, document);
const mapProperties = (paths, document) =>
  Object.keys(paths).reduce(
    (acc, key) => ({ ...acc, [key]: nodesFromDocument(document, paths[key]) }),
    {},
  );

const parseUrl = url =>
  retrievePage(url).then(response => {
    const document = convertBodyToDocument(response.data);
    const mappedProperties = mapProperties(xpaths, document);
    return mappedProperties;
  });
