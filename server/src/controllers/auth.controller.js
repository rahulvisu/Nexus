import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { signToken } from '../middlewares/auth.js'

export async function register(req, res) {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Missing fields' })

    const exists = await User.findOne({ $or: [{ email }, { username }] })
    if (exists) return res.status(409).json({ message: 'User already exists' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, email, password: hash })
    const token = signToken({ id: user._id })
    return res.status(201).json({ token, user: { id: user._id, username, email, rating: user.rating } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Registration failed' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = signToken({ id: user._id })
    return res.json({ token, user: { id: user._id, username: user.username, email, rating: user.rating } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Login failed' })
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select('username email rating createdAt')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to fetch user' })
  }
}
