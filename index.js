require("dotenv").config();

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const db = require("./db");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("./build"));
app.use(express.static("./static"));

app.set("json spaces", 2);

app.get("/devices", (req, res) => {
  const all = db.devices.find();
  res.json(all);
});

app.post("/devices", (req, res) => {
  const result = db.devices.insert(req.body);
  res.json(result);
});

app.use(
  "/ric/*",
  createProxyMiddleware({
    target: "https://dev.rightech.io/",
    pathRewrite: (path) => path.replace("/ric", ""),
    headers: {
      authorization: `Bearer ${process.env["RIC_API_TOKEN"]}`,
    },
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.listen(PORT, () => {
  console.log(`start http server at http://127.0.0.1:${PORT}/`);
});

if (process.env.NODE_ENV !== "production") {
  const webpack = require("webpack");
  const config = require("./webpack.config");

  webpack(config).watch({}, (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("[webpack:watch]", stats.toString({ colors: true }));
  });
}
