CREATE TABLE suppliers (

                           id UUID PRIMARY KEY,

                           accounting_entity_id UUID NOT NULL,

                           supplier_type VARCHAR(30) NOT NULL,

                           display_name VARCHAR(180) NOT NULL,

                           tax_identifier VARCHAR(30),

                           email VARCHAR(180),

                           phone VARCHAR(30),

                           address VARCHAR(255),

                           active BOOLEAN NOT NULL DEFAULT TRUE,

                           created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                           updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                           CONSTRAINT fk_suppliers_accounting_entity
                               FOREIGN KEY (accounting_entity_id)
                                   REFERENCES accounting_entities(id),

                           CONSTRAINT uk_suppliers_entity_tax_identifier
                               UNIQUE (
                                       accounting_entity_id,
                                       tax_identifier
                                   ),

                           CONSTRAINT chk_suppliers_type
                               CHECK (
                                   supplier_type IN (
                                                     'NATURAL_PERSON',
                                                     'COMPANY'
                                       )
                                   )
);