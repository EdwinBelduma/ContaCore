CREATE TABLE accounting_entities (
                                     id UUID PRIMARY KEY,

                                     entity_type VARCHAR(40) NOT NULL,

                                     display_name VARCHAR(150) NOT NULL,

                                     legal_name VARCHAR(200),

                                     tax_identifier VARCHAR(30),

                                     country_code VARCHAR(2) NOT NULL DEFAULT 'EC',

                                     active BOOLEAN NOT NULL DEFAULT TRUE,

                                     owner_user_id UUID NOT NULL,

                                     created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                     updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                     CONSTRAINT uk_accounting_entities_tax_identifier
                                         UNIQUE (tax_identifier),

                                     CONSTRAINT fk_accounting_entities_owner
                                         FOREIGN KEY (owner_user_id)
                                             REFERENCES users(id)
);