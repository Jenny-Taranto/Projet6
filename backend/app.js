const express = require('express'); //Pour créer un serveur web
const mongoose = require('mongoose'); //Pour intéragir avec la base de données MongoDB
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const path = require('path');  //Pour gérer les chemins de fichiers

const app = express(); //Contient l'ensemble de nos fonctionnalités

app.use(express.json()); //Pour lire les données JSON dans les requêtes HTTP

// connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://jennytaranto:Sterek2608@cluster0.allh25i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Middleware CORS pour rendre l'API accessible depuis n'importe quel site web
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//Accès aux fichiers statiques (images)
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));

//Déclarations des routes principales
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes)

module.exports = app;
