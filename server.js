const express = require("express");
const validUrl = require("valid-url");
const jsSHA = require("jssha");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Urls = require("./models/Url");
const { ShortingFacade } = require("./patterns/FacadeClass");
const {HashFactory} = require("./patterns/factoryPattern");

mongoose
  .connect("mongodb://localhost/urlShorter")
  .then(() => console.log("database connected"))
  .catch((err) => console.log(err));

const app = express();
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { longUrl } = req.body;

  if (validUrl.isUri(longUrl)) {

    const hashFactory = new HashFactory();
    const shaObj = hashFactory.create("CSHAKE128");
    const hash = shaObj.generate(longUrl)
    console.log(hash);

    const queryFacade = new ShortingFacade();
    queryFacade.createUrl(longUrl, hash);
    res.send(hash);
  } else {
    console.log("Url degil!");
    res.send("Gecersiz Url!");
  }
});

app.get("/:hash", async (req, res) => {
  const { hash } = req.params;
  const shortingFacade = new ShortingFacade();
  const result = await shortingFacade.findHash(hash);
  res.send(result.orginalUrl);
});

app.listen(3000, () => {
  console.log("server stated on 3000");
});
