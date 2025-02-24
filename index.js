require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require("mongoose");

console.log('MONGODB_URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const cors = require("cors");
app.use(cors({
  domains: '*',
  methods: "*"
}));

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { userPost } = require("./controllers/userController.js");
const { userPost, confirmEmail } = require("./controllers/userController.js");

app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

app.post("/api/users", userPost);
app.get("/api/users/confirm", confirmEmail);

app.listen(3000, () => console.log(`App listening on port 3000!`));