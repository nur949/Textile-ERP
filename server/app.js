const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const db = require('./db')

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'textile-secret'
const ACCESS_TOKEN_EXPIRES_IN = '20m'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000' }))
app.use(express.json())

const memory = {
  users: [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      email: 'admin@bdtextile.com',
      first_name: 'Admin',
      last_name: 'User',
      phone: '01700000000',
      address: 'Kalabagan, Dhaka',
      city: 'Dhaka',
      state: 'Dhaka',
      pincode: '1205',
    },
    {
      id: 2,
      username: 'customer',
      password: 'customer123',
      role: 'customer',
      email: 'customer@bdtextile.com',
      first_name: 'Customer',
      last_name: 'User',
      phone: '01711111111',
      address: 'Uttara, Dhaka',
      city: 'Dhaka',
      state: 'Dhaka',
      pincode: '1230',
    },
  ],
  refreshTokens: new Map(),
  suppliers: [
    { id: 1, name: 'Dhaka Dye House', email: 'sales@dhakadye.com', phone: '01722222222', website: 'https://dhakadye.example', country: 'Bangladesh' },
    { id: 2, name: 'Sylhet Fibers', email: 'hello@sylhetfibers.com', phone: '01733333333', website: 'https://sylhetfibers.example', country: 'Bangladesh' },
  ],
  textiles: [
    { id: 1, name: 'Premium Cotton Fabric', type: 'cotton', price: 450.0, quantity: 120, supplier: 1, supplier_name: 'Dhaka Dye House', description: 'Soft and breathable cotton fabric for garments.', image_url: null },
    { id: 2, name: 'Silk Blend Textile', type: 'silk', price: 1380.0, quantity: 40, supplier: 2, supplier_name: 'Sylhet Fibers', description: 'Luxury silk blend fabric for premium collections.', image_url: null },
    { id: 3, name: 'Polyester Twill', type: 'polyester', price: 220.0, quantity: 260, supplier: 1, supplier_name: 'Dhaka Dye House', description: 'Durable polyester twill for uniforms and workwear.', image_url: null },
  ],
  dyes: [
    { id: 1, name: 'Indigo Blue', color: 'Blue', supplier: 1, supplier_name: 'Dhaka Dye House', stock: 75, price: 85.0 },
    { id: 2, name: 'Scarlet Red', color: 'Red', supplier: 2, supplier_name: 'Sylhet Fibers', stock: 60, price: 95.0 },
  ],
  customers: [
    { id: 1, username: 'customer', first_name: 'Customer', last_name: 'User', email: 'customer@bdtextile.com', phone: '01711111111', address: 'Uttara, Dhaka', city: 'Dhaka', state: 'Dhaka', pincode: '1230' },
  ],
  orders: [
    { id: 1, customer: 2, textile: 1, quantity: 10, status: 'pending', total: 4500.0, created_at: new Date().toISOString() },
  ],
  sales: [
    { id: 1, textile: 1, quantity: 5, customer: 2, status: 'completed', total: 2250.0, created_at: new Date().toISOString() },
  ],
  payments: [
    { id: 1, sale: 1, method: 'bKash', status: 'completed', amount: 2250.0, created_at: new Date().toISOString() },
  ],
}

const createAccessToken = (user) => jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN })

const createRefreshToken = async (userId) => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
  if (db.isEnabled) {
    await db.query('INSERT INTO refresh_tokens (token, user_id) VALUES ($1,$2) ON CONFLICT (token) DO NOTHING', [token, userId])
  } else {
    memory.refreshTokens.set(token, userId)
  }
  return token
}

const getRefreshOwner = async (token) => {
  if (db.isEnabled) {
    const { rows } = await db.query('SELECT user_id FROM refresh_tokens WHERE token = $1', [token])
    return rows[0]?.user_id
  }
  return memory.refreshTokens.get(token)
}

const getUserById = async (id) => {
  if (db.isEnabled) {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id])
    return rows[0]
  }
  return memory.users.find((user) => user.id === Number(id))
}

const getUserByUsername = async (username) => {
  if (db.isEnabled) {
    const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username])
    return rows[0]
  }
  return memory.users.find((user) => user.username === username)
}

const createUser = async (payload) => {
  if (db.isEnabled) {
    const { rows } = await db.query(
      `INSERT INTO users (username, password, role, email, first_name, last_name, phone, address, city, state, pincode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        payload.username,
        payload.password,
        payload.role || 'customer',
        payload.email,
        payload.first_name || '',
        payload.last_name || '',
        payload.phone || '',
        payload.address || '',
        payload.city || '',
        payload.state || '',
        payload.pincode || '',
      ]
    )
    return rows[0]
  }

  const id = memory.users.length ? Math.max(...memory.users.map((user) => user.id)) + 1 : 1
  const newUser = { id, ...payload, role: payload.role || 'customer' }
  memory.users.push(newUser)
  return newUser
}

const updateUser = async (id, payload) => {
  if (db.isEnabled) {
    const fields = Object.keys(payload)
      .filter((key) => ['email', 'first_name', 'last_name', 'phone', 'address', 'city', 'state', 'pincode', 'username', 'password'].includes(key))
    if (!fields.length) return null
    const assignments = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ')
    const values = fields.map((field) => payload[field])
    values.push(id)
    const { rows } = await db.query(`UPDATE users SET ${assignments} WHERE id = $${fields.length + 1} RETURNING *`, values)
    return rows[0]
  }

  const user = memory.users.find((entry) => entry.id === Number(id))
  if (!user) return null
  Object.assign(user, payload)
  return user
}

const sanitizeUser = (user) => {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ detail: 'Missing authorization token' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await getUserById(payload.id)
    if (!user) return res.status(401).json({ detail: 'User not found' })
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ detail: 'Invalid or expired token' })
  }
}

const resourceMeta = {
  customers: {
    table: 'customers',
    columns: ['username', 'first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'pincode'],
  },
  dyes: {
    table: 'dyes',
    columns: ['name', 'color', 'supplier_id', 'stock', 'price'],
    join: 'LEFT JOIN suppliers s ON d.supplier_id = s.id',
    select: 'd.*, s.name AS supplier_name',
  },
  suppliers: {
    table: 'suppliers',
    columns: ['name', 'email', 'phone', 'website', 'country'],
  },
  textiles: {
    table: 'textiles',
    columns: ['name', 'type', 'price', 'quantity', 'supplier_id', 'description', 'image_url'],
    join: 'LEFT JOIN suppliers s ON t.supplier_id = s.id',
    select: 't.*, s.name AS supplier_name',
  },
  orders: {
    table: 'orders',
    columns: ['customer_id', 'textile_id', 'quantity', 'status', 'total', 'created_at'],
  },
  sales: {
    table: 'sales',
    columns: ['textile_id', 'quantity', 'customer_id', 'status', 'total', 'created_at'],
  },
  payments: {
    table: 'payments',
    columns: ['sale_id', 'method', 'status', 'amount', 'created_at'],
  },
}

const mapResourcePayload = (resource, payload) => {
  const normalized = { ...payload }
  if (resource === 'textiles' || resource === 'dyes') {
    if (payload.supplier !== undefined) normalized.supplier_id = payload.supplier
  }
  if (resource === 'sales') {
    if (payload.textile !== undefined) normalized.textile_id = payload.textile
    if (payload.customer !== undefined) normalized.customer_id = payload.customer
  }
  if (resource === 'orders') {
    if (payload.textile !== undefined) normalized.textile_id = payload.textile
    if (payload.customer !== undefined) normalized.customer_id = payload.customer
  }
  if (resource === 'payments') {
    if (payload.sale !== undefined) normalized.sale_id = payload.sale
  }
  return normalized
}

const listResource = async (resource, query) => {
  if (db.isEnabled) {
    const meta = resourceMeta[resource]
    if (!meta) throw new Error('Resource not supported')

    let sql = `SELECT ${meta.select || '*'} FROM ${meta.table} ${meta.alias || ''}`
    if (meta.join) sql += ` ${meta.join}`

    const filters = []
    const params = []
    if (resource === 'textiles' && query.in_stock === 'true') {
      filters.push('t.quantity > 0')
    }
    if (filters.length) sql += ` WHERE ${filters.join(' AND ')}`

    const { rows } = await db.query(sql, params)
    return rows
  }

  if (resource === 'textiles' && query.in_stock === 'true') {
    return memory.textiles.filter((item) => item.quantity > 0)
  }
  return memory[resource] || []
}

const getResourceById = async (resource, id) => {
  if (db.isEnabled) {
    const meta = resourceMeta[resource]
    if (!meta) throw new Error('Resource not supported')
    const base = meta.select || '*'
    const alias = meta.alias || ''
    const tableName = meta.table
    const tableAlias = resource === 'textiles' ? 't' : resource === 'dyes' ? 'd' : null
    const select = meta.select || '*'
    const from = tableAlias ? `${tableName} ${tableAlias}` : tableName
    let sql = `SELECT ${select} FROM ${from}`
    if (meta.join) sql += ` ${meta.join}`
    sql += ` WHERE ${tableAlias ? `${tableAlias}.` : ''}id = $1`
    const { rows } = await db.query(sql, [id])
    return rows[0]
  }
  const list = memory[resource] || []
  return list.find((entry) => Number(entry.id) === Number(id))
}

const createResource = async (resource, payload, currentUser) => {
  const normalized = mapResourcePayload(resource, payload)

  if (db.isEnabled) {
    const meta = resourceMeta[resource]
    if (!meta) throw new Error('Resource not supported')

    const fields = []
    const values = []
    const placeholders = []
    const now = new Date().toISOString()

    if (resource === 'sales' || resource === 'orders') {
      if (resource === 'sales') normalized.status = 'pending'
      if (resource === 'orders') normalized.status = 'pending'
      normalized.customer_id = currentUser?.id || normalized.customer_id
      normalized.created_at = normalized.created_at || now

      if (normalized.textile_id) {
        const textile = await getResourceById('textiles', normalized.textile_id)
        normalized.total = textile ? Number(textile.price) * Number(normalized.quantity || 0) : 0
      }
    }

    if (resource === 'payments') {
      normalized.status = normalized.status || 'pending'
      if (normalized.sale_id) {
        const sale = await getResourceById('sales', normalized.sale_id)
        normalized.amount = Number(sale?.total || 0)
      }
      normalized.created_at = normalized.created_at || now
    }

    const writable = [...meta.columns, 'created_at']
    Object.keys(normalized).forEach((key) => {
      if (writable.includes(key) && normalized[key] !== undefined) {
        fields.push(key)
        values.push(normalized[key])
        placeholders.push(`$${values.length}`)
      }
    })

    if (!fields.length) throw new Error('No valid fields supplied')
    const sql = `INSERT INTO ${meta.table} (${fields.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`
    const { rows } = await db.query(sql, values)
    return rows[0]
  }

  const collection = memory[resource]
  if (!Array.isArray(collection)) throw new Error('Resource not found')
  const id = collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : 1
  const entry = { id, ...payload, created_at: new Date().toISOString() }
  if (resource === 'sales' || resource === 'orders') {
    entry.customer = currentUser?.id || entry.customer
    if (resource === 'sales' && entry.textile) {
      const textile = memory.textiles.find((item) => item.id === Number(entry.textile))
      entry.total = textile ? textile.price * Number(entry.quantity || 0) : 0
      entry.status = 'pending'
    }
    if (resource === 'orders' && entry.textile) {
      const textile = memory.textiles.find((item) => item.id === Number(entry.textile))
      entry.total = textile ? textile.price * Number(entry.quantity || 0) : 0
      entry.status = 'pending'
    }
  }
  collection.push(entry)
  return entry
}

const updateResource = async (resource, id, payload) => {
  if (db.isEnabled) {
    const meta = resourceMeta[resource]
    if (!meta) throw new Error('Resource not supported')
    const fields = Object.keys(payload).filter((key) => meta.columns.includes(key) || key === 'created_at')
    if (!fields.length) return null
    const values = fields.map((key) => payload[key])
    const assignments = fields.map((key, idx) => `${key} = $${idx + 1}`).join(', ')
    values.push(id)
    const sql = `UPDATE ${meta.table} SET ${assignments} WHERE id = $${values.length} RETURNING *`
    const { rows } = await db.query(sql, values)
    return rows[0]
  }
  const collection = memory[resource]
  const item = collection.find((entry) => Number(entry.id) === Number(id))
  if (!item) return null
  Object.assign(item, payload)
  return item
}

const deleteResource = async (resource, id) => {
  if (db.isEnabled) {
    const meta = resourceMeta[resource]
    if (!meta) throw new Error('Resource not supported')
    await db.query(`DELETE FROM ${meta.table} WHERE id = $1`, [id])
    return true
  }
  const collection = memory[resource]
  const index = collection.findIndex((entry) => Number(entry.id) === Number(id))
  if (index === -1) return false
  collection.splice(index, 1)
  return true
}

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Textile API is running', dbEnabled: db.isEnabled })
})

app.get('/api/db-test', async (req, res) => {
  if (!db.isEnabled) {
    return res.status(500).json({ detail: 'DATABASE_URL is not configured' })
  }

  try {
    const result = await db.query('SELECT version()')
    const version = result.rows?.[0]?.version || ''
    return res.json({ status: 'ok', version })
  } catch (error) {
    return res.status(500).json({ detail: error.message })
  }
})

app.post('/api/auth/login/', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await getUserByUsername(username)
    if (!user || user.password !== password) return res.status(400).json({ detail: 'Invalid username or password' })

    const access = createAccessToken(user)
    const refresh = await createRefreshToken(user.id)
    res.json({ access, refresh, user: sanitizeUser(user) })
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

app.post('/api/auth/register/', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body
    if (!username || !email || !password) return res.status(400).json({ detail: 'username, email and password are required' })
    if (await getUserByUsername(username)) return res.status(400).json({ detail: 'Username already exists' })
    const newUser = await createUser({ username, email, password, first_name, last_name, role: 'customer' })
    if (db.isEnabled) {
      await db.query(
        `INSERT INTO customers (username, first_name, last_name, email, phone, address, city, state, pincode)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [newUser.username, newUser.first_name, newUser.last_name, newUser.email, newUser.phone, newUser.address, newUser.city, newUser.state, newUser.pincode]
      )
    } else {
      memory.customers.push({ id: newUser.id, username: newUser.username, first_name: newUser.first_name, last_name: newUser.last_name, email: newUser.email, phone: newUser.phone, address: newUser.address, city: newUser.city, state: newUser.state, pincode: newUser.pincode })
    }
    res.status(201).json({ detail: 'Registered successfully' })
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

app.post('/api/auth/refresh/', async (req, res) => {
  try {
    const { refresh } = req.body
    if (!refresh) return res.status(401).json({ detail: 'Invalid refresh token' })
    const ownerId = await getRefreshOwner(refresh)
    if (!ownerId) return res.status(401).json({ detail: 'Invalid refresh token' })
    try {
      const payload = jwt.verify(refresh, JWT_SECRET)
      const user = await getUserById(payload.id)
      if (!user) return res.status(401).json({ detail: 'User not found' })
      const access = createAccessToken(user)
      res.json({ access })
    } catch (error) {
      res.status(401).json({ detail: 'Invalid or expired refresh token' })
    }
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

app.get('/api/auth/profile/', authMiddleware, async (req, res) => {
  res.json(sanitizeUser(req.user))
})

const updateProfileHandler = async (req, res) => {
  try {
    const payload = req.body
    const updated = await updateUser(req.user.id, payload)
    if (!updated) return res.status(404).json({ detail: 'User not found' })
    res.json({ detail: 'Profile updated' })
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
}

app.put('/api/auth/profile/', authMiddleware, updateProfileHandler)
app.patch('/api/auth/profile/', authMiddleware, updateProfileHandler)
app.post('/api/auth/profile/', authMiddleware, updateProfileHandler)
app.put('/api/auth/profile/update/', authMiddleware, updateProfileHandler)
app.patch('/api/auth/profile/update/', authMiddleware, updateProfileHandler)
app.post('/api/auth/profile/update/', authMiddleware, updateProfileHandler)

app.put('/api/auth/profile/:id/', authMiddleware, async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body)
    if (!updated) return res.status(404).json({ detail: 'User not found' })
    res.json({ detail: 'Profile updated' })
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})
app.patch('/api/auth/profile/:id/', authMiddleware, async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body)
    if (!updated) return res.status(404).json({ detail: 'User not found' })
    res.json({ detail: 'Profile updated' })
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})
app.post('/api/auth/profile/:id/', authMiddleware, async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body)
    if (!updated) return res.status(404).json({ detail: 'User not found' })
    res.json({ detail: 'Profile updated' })
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

app.post('/api/auth/password-reset-direct/', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await getUserByUsername(username)
    if (!user) return res.status(404).json({ detail: 'User not found' })
    await updateUser(user.id, { password })
    res.json({ detail: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

app.post('/api/auth/password-reset-confirm/', async (req, res) => {
  try {
    const { uid, token, password } = req.body
    const user = await getUserById(uid)
    if (!user) return res.status(404).json({ detail: 'Invalid reset link' })
    // ignore token for now in this mock flow
    await updateUser(user.id, { password })
    res.json({ detail: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

app.get('/api/dashboard/customer/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ detail: 'Forbidden' })
  const orders = db.isEnabled ? await db.query('SELECT * FROM sales WHERE customer_id = $1', [req.user.id]).then((r) => r.rows) : memory.sales.filter((sale) => sale.customer === req.user.id)
  res.json({
    activeOrders: db.isEnabled ? (await db.query('SELECT COUNT(*) AS count FROM orders WHERE customer_id = $1 AND status != $2', [req.user.id, 'completed'])).rows[0].count : memory.orders.filter((order) => order.customer === req.user.id && order.status !== 'completed').length,
    recentSales: orders.slice(-3),
    totalSpend: orders.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
  })
})

app.get('/api/dashboard/admin/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ detail: 'Forbidden' })
  const totalSales = db.isEnabled ? (await db.query('SELECT SUM(total) AS total FROM sales')).rows[0].total || 0 : memory.sales.reduce((sum, sale) => sum + sale.total, 0)
  const pendingOrders = db.isEnabled ? (await db.query("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'")).rows[0].count : memory.orders.filter((order) => order.status === 'pending').length
  const lowStockTextiles = db.isEnabled ? (await db.query('SELECT COUNT(*) AS count FROM textiles WHERE quantity < 20')).rows[0].count : memory.textiles.filter((item) => item.quantity < 20).length
  res.json({ totalSales: Number(totalSales), pendingOrders: Number(pendingOrders), lowStockTextiles: Number(lowStockTextiles) })
})

const resourceRouter = express.Router()

resourceRouter.use((req, res, next) => {
  const resource = req.params.resource
  if (!resourceMeta[resource]) return res.status(404).json({ detail: 'Resource not found' })
  req.resourceName = resource
  next()
})

resourceRouter.get('/:resource', async (req, res) => {
  try {
    const results = await listResource(req.resourceName, req.query)
    res.json({ count: results.length, results })
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

resourceRouter.post('/:resource', authMiddleware, async (req, res) => {
  try {
    const entry = await createResource(req.resourceName, req.body, req.user)
    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

resourceRouter.get('/:resource/:id', authMiddleware, async (req, res) => {
  try {
    const item = await getResourceById(req.resourceName, req.params.id)
    if (!item) return res.status(404).json({ detail: 'Not found' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

resourceRouter.put('/:resource/:id', authMiddleware, async (req, res) => {
  try {
    const item = await updateResource(req.resourceName, req.params.id, req.body)
    if (!item) return res.status(404).json({ detail: 'Not found' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

resourceRouter.patch('/:resource/:id', authMiddleware, async (req, res) => {
  try {
    const item = await updateResource(req.resourceName, req.params.id, req.body)
    if (!item) return res.status(404).json({ detail: 'Not found' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

resourceRouter.delete('/:resource/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await deleteResource(req.resourceName, req.params.id)
    if (!deleted) return res.status(404).json({ detail: 'Not found' })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

app.use('/api', resourceRouter)

if (db.isEnabled) {
  db.init().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize database:', error)
  })
}

module.exports = { app }
