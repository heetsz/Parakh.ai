import jwt from "jsonwebtoken"

export const protect = async (req, res, next) => {
      try {
            let token = null;

            if (req.cookies && req.cookies.token) {
                  token = req.cookies.token;
            } else if (
                  req.headers.authorization &&
                  req.headers.authorization.startsWith('Bearer')
            ) {
                  token = req.headers.authorization.split(' ')[1];
            }
            if (!token) {
                  return res.status(401).json({
                        message: 'Token not found, login first'
                  });
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
            req.user = decoded;
            next();
      } catch (error) {
            res.status(401).json({ message: 'Access Denied, Invalid Token' });
      }
};
