const express = require("express");
const cors = require("cors");
// const morgan = require("morgan");

require("dotenv").config();

const Note = require("./models/note");

const app = express();

app.use(express.json());

app.use(express.static("dist"));
app.use(cors());
// app.use(morgan("tiny"));

const requestLogger = (request, response, next) => {
  console.log("---");
  console.log("Method: ", request.method);
  console.log("Path: ", request.path);
  console.log("Body: ", request.body);
  console.log("---");
  next();
};

app.use(requestLogger);

// RUTAS
app.get("/", (request, response) => {
  response.send("<h1>Home Page</h1>");
});

// GET ALL
app.get("/api/notes", (request, response) => {
  Note.find({})
    .then((notes) => {
      response.json(notes);
    })
    .catch((error) => {
      console.error(error);
      response.status(500).end();
    });
});

// GET ONE
app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// DELETE
app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// POST
app.post("/api/notes", (request, response, next) => {
  const body = request.body;

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note
    .save()
    .then((savedNote) => response.json(savedNote))
    .catch((error) => next(error));
});

//  UPDATE
app.put("/api/notes/:id", (request, response, next) => {
  const { content, important } = request.body;

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedNote) => response.json(updatedNote))
    .catch((error) => next(error));
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

// Middleware para manejar endpoints desconocidos
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// Middleware de manejo de errores
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Express server is running on PORT: ", PORT);
});
