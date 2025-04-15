const express = require('express');
const router = express.Router();

//Pour utiliser le middleware qui contient la fonction d'authentification pour sécuriser les routes de l'API
const auth = require('../middleware/auth')

//Pour utiliser le controller book comme fichier contenant toutes les actions de chaque requête
const bookCtrl = require('../controllers/book')

//Pour gérer le téléchargement des fichiers
const multer = require('../middleware/multer-config');

//Atributions des fonctionnalités spécifiques à chaque requête sos forme de route
router.post('/', auth, multer, bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/', bookCtrl.getAllBooks);
router.post('/:id/rating', auth, bookCtrl.rateBook)
router.get('/bestrating', bookCtrl.bestRating)



module.exports = router;