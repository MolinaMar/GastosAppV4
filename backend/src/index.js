const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI = process.env.MONGODB_URI
const useMemory = !MONGODB_URI
let Expense
let User
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      const ExpenseSchema = new mongoose.Schema({
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      }, { timestamps: true })
      Expense = mongoose.model('Expense', ExpenseSchema)
      const UserSchema = new mongoose.Schema({
        nombre: { type: String, required: true },
        apellidoPaterno: { type: String, required: true },
        apellidoMaterno: { type: String, required: true },
        correo: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
      }, { timestamps: true, collection: 'usuarios' })
      UserSchema.index({ correo: 1 }, { unique: true })
      User = mongoose.model('User', UserSchema)
      console.log('mongo:connected')
    })
    .catch((err) => {
      console.error('mongo:error', err.message)
    })
}

const expenses = []
const users = []

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/expenses', async (req, res) => {
  if (!useMemory) {
    if (!Expense) return res.status(503).json({ error: 'db_not_ready' })
    const list = await Expense.find().lean()
    return res.json(list)
  }
  res.json(expenses)
})

app.post('/api/expenses', async (req, res) => {
  const { title, amount, date } = req.body
  if (!useMemory) {
    if (!Expense) return res.status(503).json({ error: 'db_not_ready' })
    const doc = await Expense.create({ title, amount, date })
    return res.status(201).json(doc)
  }
  const item = { id: String(Date.now()), title, amount, date }
  expenses.push(item)
  res.status(201).json(item)
})

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params
  if (!useMemory) {
    if (!Expense) return res.status(503).json({ error: 'db_not_ready' })
    const removed = await Expense.findByIdAndDelete(id)
    if (!removed) return res.status(404).json({ error: 'not_found' })
    return res.json(removed)
  }
  const index = expenses.findIndex((e) => e.id === id)
  if (index === -1) return res.status(404).json({ error: 'not_found' })
  const [removed] = expenses.splice(index, 1)
  res.json(removed)
})

app.post('/api/auth/register', async (req, res) => {
  const { nombre, apellidoPaterno, apellidoMaterno, correo, password } = req.body
  const passwordHash = await bcrypt.hash(String(password), 10)
  if (!useMemory) {
    if (!User) return res.status(503).json({ error: 'db_not_ready' })
    const exists = await User.findOne({ correo })
    if (exists) return res.status(409).json({ error: 'email_in_use' })
    const doc = await User.create({ nombre, apellidoPaterno, apellidoMaterno, correo, passwordHash })
    return res.status(201).json({ id: doc._id, nombre: doc.nombre })
  }
  const exists = users.find((u) => u.correo === correo)
  if (exists) return res.status(409).json({ error: 'email_in_use' })
  const user = { id: String(Date.now()), nombre, apellidoPaterno, apellidoMaterno, correo, passwordHash }
  users.push(user)
  res.status(201).json({ id: user.id, nombre: user.nombre })
})

app.post('/api/auth/login', async (req, res) => {
  const { correo, password } = req.body
  if (!useMemory) {
    if (!User) return res.status(503).json({ error: 'db_not_ready' })
    const doc = await User.findOne({ correo })
    if (!doc) return res.status(401).json({ error: 'invalid_credentials' })
    const ok = await bcrypt.compare(String(password), doc.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
    return res.json({ nombre: doc.nombre })
  }
  const user = users.find((u) => u.correo === correo)
  if (!user) return res.status(401).json({ error: 'invalid_credentials' })
  const ok = await bcrypt.compare(String(password), user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
  res.json({ nombre: user.nombre })
})

app.get('/api/users', async (req, res) => {
  if (!useMemory) {
    if (!User) return res.status(503).json({ error: 'db_not_ready' })
    const list = await User.find().lean()
    return res.json(list)
  }
  res.json(users)
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`listening:${port}`)
})
