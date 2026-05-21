import sqlite3

conexion = sqlite3.connect("prestamos.db")
cursor = conexion.cursor()

cursor.executescript("""
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    cedula TEXT UNIQUE NOT NULL,
    telefono TEXT,
    direccion TEXT,
    correo TEXT
);

CREATE TABLE IF NOT EXISTS prestamos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    monto REAL NOT NULL,
    interes REAL NOT NULL,
    cuotas INTEGER NOT NULL,
    valor_cuota REAL NOT NULL,
    saldo REAL NOT NULL,
    estado TEXT DEFAULT 'Activo',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prestamo_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    valor REAL NOT NULL,
    FOREIGN KEY (prestamo_id) REFERENCES prestamos(id)
);
""")

conexion.commit()
conexion.close()

print("Base de datos creada correctamente")