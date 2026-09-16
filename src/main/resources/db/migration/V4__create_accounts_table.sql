CREATE TABLE accounts (

                          id UUID PRIMARY KEY,

                          accounting_entity_id UUID NOT NULL,

                          code VARCHAR(30) NOT NULL,

                          name VARCHAR(150) NOT NULL,

                          account_type VARCHAR(30) NOT NULL,

                          nature VARCHAR(10) NOT NULL,

                          parent_account_id UUID,

                          allows_entries BOOLEAN NOT NULL DEFAULT TRUE,

                          active BOOLEAN NOT NULL DEFAULT TRUE,

                          created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                          updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                          CONSTRAINT uk_accounts_entity_code
                              UNIQUE (
                                      accounting_entity_id,
                                      code
                                  ),

                          CONSTRAINT fk_accounts_entity
                              FOREIGN KEY (accounting_entity_id)
                                  REFERENCES accounting_entities(id),

                          CONSTRAINT fk_accounts_parent
                              FOREIGN KEY (parent_account_id)
                                  REFERENCES accounts(id)
);