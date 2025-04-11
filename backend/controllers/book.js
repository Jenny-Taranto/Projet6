const Book = require('../models/book')
const sharp = require('sharp');

exports.createBook = (req, res, next) => {
  try {
    // Récupérer les données envoyées sous forme de string JSON
    const bookObject = JSON.parse(req.body.book);

    // Supprimer l'ID généré automatiquement par MongoDB pour éviter de créer des conflits, s'il existe
    delete bookObject._id;

    // Créer le nom de fichier pour l'image optimisée
    const filename = `${Date.now()}-${req.file.originalname.split(' ').join('_')}.jpg`;
    const outputPath = path.join('pictures', filename);

    // Compression et redimensionnement de l'image avec sharp
    sharp(req.file.buffer)
      .resize({ width: 536 }) // Redimensionner si l'image est trop grande
      .jpeg({ quality: 70 })  // Compresser l'image avec une qualité de 70%
      .toFile(outputPath);    // Sauvegarder l'image sur le disque

    // Construire l'URL de base du serveur (http://localhost:3000 ou https://monsite.com par ex)
    const url = `${req.protocol}://${req.get('host')}`;

    // Créer un nouvel objet Book à partir des données de bookObject et on ajoute une propriété imageUrl
    const book = new Book({
      ...bookObject,
      imageUrl: `${url}/pictures/${req.file.filename}`, //l'url qui renverra vers le fichier dans le dossier Pictures, req.file.filename contient le nom du fichier image fourni par multer
    });

    book.save() //Sauvegarde du livre dans la base de données MongoDB
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => res.status(400).json({ error }));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du livre.' });
  }
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
}

exports.modifyBook = (req, res, next) => {
  const userId = req.auth.userId; //On récupère le userId du token

  Book.findOne({ _id: req.params.id }) //On récupère le livre dans la base de données
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      if (book.userId !== userId) {
        return res.status(403).json({ message: 'Accès non autorisé' }); //On compare les userId
      }

      const updatedBook = req.file
        ? {
          ...JSON.parse(req.body.book), //On décode les données JSON
          imageUrl: `${req.protocol}://${req.get('host')}/pictures/${req.file.filename}` //On met à jour le champ imageUrl avec le nouveau nom de fichier
        }
        : { ...req.body }; //Si pas de nouvelle image, on prend juste le corps de la requête comme nouvelles données

      return Book.updateOne({ _id: req.params.id }, { ...updatedBook, _id: req.params.id }).then(() =>
        res.status(200).json({ message: 'Livre modifié avec succès' })
      );
    })
    .catch(error => res.status(500).json({ error }));
}

exports.deleteBook = (req, res, next) => {
  const userId = req.auth.userId; //On récupère le userId du token

  Book.findOne({ _id: req.params.id }) //On récupère le livre dans la base de données
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      if (book.userId !== userId) {
        return res.status(403).json({ message: 'Accès non autorisé' }); //On compare les userId
      }

      return Book.deleteOne({ _id: req.params.id }).then(() =>
        res.status(200).json({ message: 'Livre supprimé avec succès' })
      );
    })
    .catch(error => res.status(500).json({ error }));
}

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

exports.rateBook = (req, res, next) => {
  const userId = req.auth.userId; //On récupère le userId grâce au token...
  const grade = parseInt(req.body.rating, 10); //... et la note que l'utilisateur a attribuée

  Book.findOne({ _id: req.params.id }) //On cherche le livre correspondant
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      if (!Array.isArray(book.ratings)) {
        book.ratings = []; //On s'assure que book.ratings est bien un tableau au cas où ce champ serait vide ou mal formé
      }

      const alreadyRated = book.ratings.find(r => r.userId === userId); //On vérifie que l'utilisateur n'a pas déjà noté ce livre
      if (alreadyRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      book.ratings.push({ userId, grade }); //On ajoute la nouvelle note au tableau des notations du livre

      // recalcul de la moyenne
      const total = book.ratings.reduce((acc, curr) => acc + curr.grade, 0); //Somme de toutes les notes en partant de 0
      book.averageRating = total / book.ratings.length; //On divise par le nombre de notes

      return book.save().then(() => res.status(200).json(book)); //On sauvegarde le livre mis à jour dans la base de données
    })

    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la notation du livre' });
    })
}