-- Script para actualizar la base de datos para direcciones Stellar
-- Ejecutar este script después de actualizar la estructura

-- Actualizar el tamaño del campo smart_contract_address para direcciones Stellar (56 caracteres)
ALTER TABLE terrenos MODIFY COLUMN smart_contract_address VARCHAR(56);
ALTER TABLE propuestas MODIFY COLUMN smart_contract_address VARCHAR(56);

-- Agregar comentarios para clarificar el cambio
ALTER TABLE terrenos MODIFY COLUMN smart_contract_address VARCHAR(56) COMMENT 'Dirección del contrato Stellar (formato: C + 55 caracteres)';
ALTER TABLE propuestas MODIFY COLUMN smart_contract_address VARCHAR(56) COMMENT 'Dirección del contrato Stellar (formato: C + 55 caracteres)';
