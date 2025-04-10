const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth')

const bookCtrl = require('../controllers/book')
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/', bookCtrl.getAllBooks);
router.post('/:id/rating', auth, bookCtrl.rateBook)



module.exports = router;