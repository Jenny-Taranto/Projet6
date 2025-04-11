const jwt = require('jsonwebtoken'); //Vérifie et décode les tokens JWT
 

//Fonction middleware
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1]; //Récupère le token envoyé dans les headers, on découpe la chaîne en 2 parties et on garde le vrai token
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); //Vérifie que le token est bien signé avec notre clé secrète et le décode
       const userId = decodedToken.userId; //Récupère le userID du token
       req.auth = {
           userId: userId
       }; //On ajoute le userID à la req pour l'enregistrer et l'utiliser plus tard dans les routes protégées (pour modifier un livre par ex)
    next();
   } catch(error) {
       res.status(401).json({ error });
   }
};