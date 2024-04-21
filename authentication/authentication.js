require('dotenv').config();
const authenticate = (req, res, next) => {
    console.log(process.env.TOKEN)
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Access Denied: No Token Provided!');
    }
    if (token !== process.env.TOKEN) {
        return res.status(403).send('Invalid Token');
    }
    next();
};

module.exports = authenticate;
