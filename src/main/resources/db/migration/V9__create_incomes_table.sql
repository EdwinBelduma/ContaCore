CREATE TABLE incomes (

                         id UUID PRIMARY KEY,

                         accounting_entity_id UUID NOT NULL,

                         customer_id UUID,

                         income_date DATE NOT NULL,

                         description VARCHAR(255) NOT NULL,

                         reference VARCHAR(100),

                         amount NUMERIC(19, 2) NOT NULL,

                         income_account_id UUID NOT NULL,

                         receipt_account_id UUID NOT NULL,

                         status VARCHAR(20) NOT NULL,

                         journal_entry_id UUID UNIQUE,

                         created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                         updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                         CONSTRAINT fk_incomes_accounting_entity
                             FOREIGN KEY (accounting_entity_id)
                                 REFERENCES accounting_entities(id),

                         CONSTRAINT fk_incomes_customer
                             FOREIGN KEY (customer_id)
                                 REFERENCES customers(id),

                         CONSTRAINT fk_incomes_income_account
                             FOREIGN KEY (income_account_id)
                                 REFERENCES accounts(id),

                         CONSTRAINT fk_incomes_receipt_account
                             FOREIGN KEY (receipt_account_id)
                                 REFERENCES accounts(id),

                         CONSTRAINT fk_incomes_journal_entry
                             FOREIGN KEY (journal_entry_id)
                                 REFERENCES journal_entries(id),

                         CONSTRAINT chk_incomes_amount
                             CHECK (amount > 0),

                         CONSTRAINT chk_incomes_status
                             CHECK (
                                 status IN (
                                            'DRAFT',
                                            'POSTED',
                                            'VOIDED'
                                     )
                                 )
);