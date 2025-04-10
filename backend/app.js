const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const path = require('path');

const app = express();

app.use(express.json());

// connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://jennytaranto:Sterek2608@cluster0.allh25i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// ces headers permettent dd'accéder à notre API depuis n'importe quelle origine, d'ajouter les headers mentionnés aux requêtes envoyés vers notre API, et d'envoyer des requêtes avec les méthodes mentionnées (GET etc)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/pictures', express.static(path.join(__dirname, 'pictures')));

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes)

module.exports = app;
