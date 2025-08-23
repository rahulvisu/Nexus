import jwt from 'jsonwebtoken'

export function auth(required = true) {
  return (req, res, next) => {
    try {
      const bearer = req.headers.authorization?.split(' ')
      const token = bearer?.[0] === 'Bearer' ? bearer[1] : req.cookies?.token
      if (!token) {
        if (required) return res.status(401).json({ message: 'Unauthorized' })
        return next()
      }
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      req.user = { id: payload.id }
      next()
    } catch (e) {
      if (required) return res.status(401).json({ message: 'Invalid token' })
      next()
    }
  }
}

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}
