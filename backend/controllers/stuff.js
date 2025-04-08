const Book = require('../models/book')

exports.createBook = (req, res, next) => {
    try {
      // Récupérer les données envoyées sous forme de string JSON
      const bookObject = JSON.parse(req.body.book);
  
      // Supprimer l'ID si jamais il est présent (généré par MongoDB)
      delete bookObject._id;
  
      // Créer l'URL de l'image (sauvegardée via multer)
      const url = `${req.protocol}://${req.get('host')}`;
  
      // Créer une nouvelle instance de Book
      const book = new Book({
        ...bookObject,
        imageUrl: `${url}/pictures/${req.file.filename}`,
      });
  
      book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création du livre.' });
    }
  };

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
}

exports.modifyBook = (req, res, next) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
}

exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
        .catch(error => res.status(400).json({ error }));
}

exports.getAllStuff = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
}

exports.rateBook = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const grade = parseInt(req.body.rating, 10);

    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    if (!Array.isArray(book.ratings)) {
      book.ratings = [];
    }

    const alreadyRated = book.ratings.find(r => r.userId === userId);
    if (alreadyRated) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
    }

    book.ratings.push({ userId, grade });

    // recalcul de la moyenne
    const total = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
    book.averageRating = total / book.ratings.length;

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la notation du livre' });
  }
};