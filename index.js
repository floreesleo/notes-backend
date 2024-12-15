const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();

const Note = require("./models/note");

const app = express();

let notes = [];

const requestLogger = (request, response, next) => {
  console.log("---");
  console.log("Method: ", request.method);
  console.log("Path: ", request.path);
  console.log("Body: ", request.boyd);
  console.log("---");
  next();
};

const unknownEndpoind = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
// app.use(requestLogger);
app.use(express.static("dist"));

app.get("/", (request, response) => {
  response.send("<h1>Home Page</h1>");
});

app.get("/api/notes", (request, response) => {
  Note.find({})
    .then((notes) => {
      response.json(notes);
    })
    .catch((error) => response.json({ error: error }));
});

app.get("/api/notes/:id", (request, response) => {
  Note.findById(request.params.id)
    .then((note) => response.json(note))
    .catch((error) => response.status(404).json({ error: "Not Found" }));
});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);

  const newNotes = notes.filter((note) => note.id !== id);

  response.json(newNotes).status(204).end();
});

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note
    .save()
    .then((savedNote) => response.json(savedNote))
    .catch((error) => response.json({ error: error }));
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

app.use(unknownEndpoind);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Express server is running on PORT: ", PORT);
});
