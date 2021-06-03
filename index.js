require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const Person = require('./models/person');

morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

// Displays info about Phonebook
app.get('/info', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.send(`
        <div>
          <p>Phonebook has info for ${persons.length} people</p>
          <p>${new Date()}</p>
        </div>
      `);
    })
    .catch((error) => next(error));
});

// Fetches all persons in phonebook from DB
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

// Fetches individual person from DB
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).send({ error: 'Person not found' });
      }
    })
    .catch((error) => next(error));
});

// Creates a new person and saves it to DB
app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;

  const person = new Person({
    name,
    number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

// Updates a person in phonebook
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  const person = { name, number };
  const opts = { new: true, runValidators: true, context: 'query' };

  Person.findByIdAndUpdate(request.params.id, person, opts)
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// Deletes a person in phonebook from DB
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// Middleware for handling unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

// Middleware for handling errors
const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
