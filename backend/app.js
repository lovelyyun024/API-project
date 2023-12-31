const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { ValidationError } = require("sequelize");

// const { Spot } = require("./db/models");

const routes = require("./routes");

const { environment } = require("./config");
const isProduction = environment === "production";

const app = express();

app.use(morgan("dev"));

app.use(cookieParser());
app.use(express.json());

// Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
);

app.use(routes);

// app.get("/api/spots", async (req, res, next) => {
//     const spots = await Spot.findAll({
//       order: [["id"]],
//     });
//     return res.json(spots);
// });

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    // _res.status(500)
    // err.title = 'Validation error';
    err.errors = errors;
    if (err.message.includes("endDate")) {
      err.status = 400;
      err.message = "Bad Request";
    } else {
      err.status = 500;
      err.title = "Validation error";
    }
  }
  next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
  res.status(err.status || 400);
  console.error(err);
  if (!err.title) {
    res.json({
      // title: err.title || 'Server Error',
      message: err.message,
      errors: err.errors,
      // stack: isProduction ? null : err.stack
    });
  }
  res.json({
    title: err.title || "Server Error",
    message: err.message,
    errors: err.errors,
    // stack: isProduction ? null : err.stack
  });
});

module.exports = app;
