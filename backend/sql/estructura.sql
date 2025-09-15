-- backend/sql/estructura.sql

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE terrenos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(255),
    precio DECIMAL(18,2),
    status ENUM('disponible','tokenizado','vendido') DEFAULT 'disponible',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    tokens_totales INT DEFAULT 100,
    tokens_disponibles INT DEFAULT 100,
    tipo_token VARCHAR(50) DEFAULT 'Fraccional',
    categoria VARCHAR(50) DEFAULT 'General',
    superficie VARCHAR(100),
    coordenadas VARCHAR(100),
    altitud VARCHAR(50),
    clima VARCHAR(50),
    materiales JSON,
    infraestructura JSON,
    documentacion JSON,
    imagenes JSON,
    smart_contract_address VARCHAR(56),
    propuesta_id INT,
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id)
);

CREATE TABLE propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    terreno_id INT,
    name VARCHAR(100),
    title VARCHAR(100),
    descripcion_corta TEXT,
    descripcion_larga TEXT,
    price DECIMAL(18,2),
    supply INT,
    location VARCHAR(255),
    superficie VARCHAR(100),
    coordenadas VARCHAR(100),
    altitud VARCHAR(50),
    clima VARCHAR(50),
    tokenType VARCHAR(50),
    category VARCHAR(50),
    ownerName VARCHAR(100),
    ownerEmail VARCHAR(100),
    ownerIdNumber VARCHAR(50),
    ownerDocNumber VARCHAR(50),
    submittedBy VARCHAR(100),
    submittedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    materiales JSON,
    infraestructura JSON,
    documentacion JSON,
    imagenes JSON,
    smart_contract_address VARCHAR(56),
    motivo_rechazo TEXT,
    status ENUM('pendiente','aceptada','rechazada') DEFAULT 'pendiente',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (terreno_id) REFERENCES terrenos(id)
);

CREATE TABLE transacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    terreno_id INT,
    monto DECIMAL(18,2),
    tipo ENUM('compra','venta','tokenizacion'),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (terreno_id) REFERENCES terrenos(id)
);

CREATE TABLE disputas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    admin_id INT,
    mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    mensaje TEXT,
    leida TINYINT(1) DEFAULT 0,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
); 