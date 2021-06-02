const mongoose = require('mongoose');

const [, , password, name, number] = process.argv;

if (!password) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  );
  process.exit(1);
}

const url = `mongodb+srv://fullstack:${password}@cluster0.zk9h7.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (!name || !number) {
  Person.find({}).then((persons) => {
    console.log('phonebook:');
    persons.forEach((person) => console.log(`${person.name} ${person.number}`));
    mongoose.connection.close();
  });
} else {
  const person = new Person({
    name,
    number,
  });

  person.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
