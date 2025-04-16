const multer = require('multer');
const path = require('path');

// Types MIME autorisés pour les images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration du stockage pour le téléchargement sur disque
const storage = multer.diskStorage({
  // Destination des fichiers téléchargés
  destination: (req, file, callback) => {
    callback(null, 'pictures'); // Assurez-vous que ce dossier existe
  },
  // Définition du nom du fichier
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');  // Remplacer les espaces par des underscores
    const extension = MIME_TYPES[file.mimetype] || 'jpg';  // Extension basée sur le type MIME
    callback(null, name + Date.now() + '.' + extension);  // Utilisation du timestamp pour éviter les collisions de noms
  }
});

module.exports = multer({ storage }).single('image'); 