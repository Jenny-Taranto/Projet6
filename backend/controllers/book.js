const Book = require('../models/book')
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  try {
    // Récupérer les données envoyées sous forme de string JSON
    const bookObject = JSON.parse(req.body.book);

    // Supprimer l'ID généré automatiquement par MongoDB pour éviter de créer des conflits
    delete bookObject._id;

        // Construire l'URL de l'image après traitement
        const url = `${req.protocol}://${req.get('host')}`;
        // Créer un nouvel objet Book avec l'URL de l'image
        const book = new Book({
          ...bookObject,
          imageUrl: `${url}/pictures/${req.file.filename}`, // L'URL vers l'image stockée sur le disque
        });

        // Sauvegarder le livre dans la base de données
        book.save()
          .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
          .catch(error => res.status(400).json({ error }));
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erreur lors de la création du livre.' });
  }
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
}

exports.modifyBook = (req, res, next) => {
  const userId = req.auth.userId;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      if (book.userId !== userId) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      let updatedBook;

      if (req.file) {
        // ✅ Supprimer l’ancienne image
        const oldFilename = book.imageUrl.split('/pictures/')[1];
        const oldImagePath = path.join(__dirname, '..', 'pictures', oldFilename);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Erreur lors de la suppression de l’ancienne image :', err);
        });

        updatedBook = {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/pictures/${req.file.filename}`,
        };
      } else if (req.body.book) {
        updatedBook = JSON.parse(req.body.book);
      } else {
        updatedBook = req.body;
      }

      return Book.updateOne({ _id: req.params.id }, { ...updatedBook, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié avec succès' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  const userId = req.auth.userId;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      if (book.userId !== userId) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const filename = book.imageUrl.split('/pictures/')[1];
      const imagePath = path.join(__dirname, '..', 'pictures', filename);

      // ✅ Supprimer l’image physique
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Erreur lors de la suppression de l’image :', err);
      });

      return Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre supprimé avec succès' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

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

exports.bestRating = (req, res, next) => {
  Book.find().sort({averageRating: -1}).limit(3)
  .then((books)=>res.status(200).json(books))
  .catch((error)=>res.status(500).json({ error: 'Erreur lors de la récupération des livres' }));
}