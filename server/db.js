require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL || ''
const useSsl = connectionString && (process.env.NODE_ENV === 'production' || connectionString.includes('sslmode=require'))
const pool = connectionString
  ? new Pool({ connectionString, ssl: useSsl ? { rejectUnauthorized: false } : false })
  : null

const isEnabled = Boolean(pool)

const query = async (text, params = []) => {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured. Set DATABASE_URL to enable Postgres.')
  }
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

const runMigrations = async () => {
  if (!pool) return

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      website TEXT,
      country TEXT
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS textiles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 0,
      supplier_id INTEGER REFERENCES suppliers(id),
      description TEXT,
      image_url TEXT
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS dyes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      supplier_id INTEGER REFERENCES suppliers(id),
      stock INTEGER NOT NULL DEFAULT 0,
      price NUMERIC(12,2) NOT NULL DEFAULT 0
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id),
      textile_id INTEGER REFERENCES textiles(id),
      quantity INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      textile_id INTEGER REFERENCES textiles(id),
      quantity INTEGER NOT NULL DEFAULT 0,
      customer_id INTEGER REFERENCES customers(id),
      status TEXT NOT NULL DEFAULT 'pending',
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER REFERENCES sales(id),
      method TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

const seedData = async () => {
  if (!pool) return

  const { rows: users } = await query('SELECT id FROM users LIMIT 1')
  if (users.length === 0) {
    await query(
      `INSERT INTO users (username, password, role, email, first_name, last_name, phone, address, city, state, pincode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11), ($12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
      [
        'admin', 'admin123', 'admin', 'admin@bdtextile.com', 'Admin', 'User', '01700000000', 'Kalabagan, Dhaka', 'Dhaka', 'Dhaka', '1205',
        'customer', 'customer123', 'customer', 'customer@bdtextile.com', 'Customer', 'User', '01711111111', 'Uttara, Dhaka', 'Dhaka', '1230',
      ]
    )
  }

  const { rows: suppliers } = await query('SELECT id FROM suppliers LIMIT 1')
  if (suppliers.length === 0) {
    await query(
      `INSERT INTO suppliers (name, email, phone, website, country)
       VALUES ($1,$2,$3,$4,$5), ($6,$7,$8,$9,$10)`,
      [
        'Dhaka Dye House', 'sales@dhakadye.com', '01722222222', 'https://dhakadye.example', 'Bangladesh',
        'Sylhet Fibers', 'hello@sylhetfibers.com', '01733333333', 'https://sylhetfibers.example', 'Bangladesh',
      ]
    )
  }

  const { rows: textiles } = await query('SELECT id FROM textiles LIMIT 1')
  if (textiles.length === 0) {
    await query(
      `INSERT INTO textiles (name, type, price, quantity, supplier_id, description)
       VALUES ($1,$2,$3,$4,$5,$6), ($7,$8,$9,$10,$11,$12), ($13,$14,$15,$16,$17,$18)`,
      [
        'Premium Cotton Fabric', 'cotton', 450.0, 120, 1, 'Soft and breathable cotton fabric for garments.',
        'Silk Blend Textile', 'silk', 1380.0, 40, 2, 'Luxury silk blend fabric for premium collections.',
        'Polyester Twill', 'polyester', 220.0, 260, 1, 'Durable polyester twill for uniforms and workwear.',
      ]
    )
  }

  const { rows: dyes } = await query('SELECT id FROM dyes LIMIT 1')
  if (dyes.length === 0) {
    await query(
      `INSERT INTO dyes (name, color, supplier_id, stock, price)
       VALUES ($1,$2,$3,$4,$5), ($6,$7,$8,$9,$10)`,
      [
        'Indigo Blue', 'Blue', 1, 75, 85.0,
        'Scarlet Red', 'Red', 2, 60, 95.0,
      ]
    )
  }

  const { rows: customers } = await query('SELECT id FROM customers LIMIT 1')
  if (customers.length === 0) {
    await query(
      `INSERT INTO customers (username, first_name, last_name, email, phone, address, city, state, pincode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      ['customer', 'Customer', 'User', 'customer@bdtextile.com', '01711111111', 'Uttara, Dhaka', 'Dhaka', 'Dhaka', '1230']
    )
  }
}

const init = async () => {
  if (!pool) return
  await runMigrations()
  await seedData()
}

module.exports = {
  pool,
  isEnabled,
  query,
  init,
}
