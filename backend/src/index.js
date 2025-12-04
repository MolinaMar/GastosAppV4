const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const expenses = []

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/expenses', (req, res) => {
  res.json(expenses)
})

app.post('/api/expenses', (req, res) => {
  const { title, amount, date } = req.body
  const item = { id: String(Date.now()), title, amount, date }
  expenses.push(item)
  res.status(201).json(item)
})

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params
  const index = expenses.findIndex(e => e.id === id)
  if (index === -1) return res.status(404).json({ error: 'not_found' })
  const [removed] = expenses.splice(index, 1)
  res.json(removed)
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`listening:${port}`)
})

