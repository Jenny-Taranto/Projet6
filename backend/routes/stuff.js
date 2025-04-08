const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth')

const stuffCtrl = require('../controllers/stuff')
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, stuffCtrl.createBook);
router.get('/:id', stuffCtrl.getOneBook);
router.put('/:id', auth, stuffCtrl.modifyBook);
router.delete('/:id', auth, stuffCtrl.deleteBook);
router.get('/', stuffCtrl.getAllStuff);
router.post('/:id/rating', auth, stuffCtrl.rateBook)



module.exports = router;