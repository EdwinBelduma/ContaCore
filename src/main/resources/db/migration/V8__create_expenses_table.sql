CREATE TABLE expenses (

                          id UUID PRIMARY KEY,

                          accounting_entity_id UUID NOT NULL,

                          supplier_id UUID,

                          expense_date DATE NOT NULL,

                          description VARCHAR(255) NOT NULL,

                          reference VARCHAR(100),

                          amount NUMERIC(19, 2) NOT NULL,

                          expense_account_id UUID NOT NULL,

                          payment_account_id UUID NOT NULL,

                          status VARCHAR(20) NOT NULL,

                          journal_entry_id UUID UNIQUE,

                          created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                          updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                          CONSTRAINT fk_expenses_accounting_entity
                              FOREIGN KEY (accounting_entity_id)
                                  REFERENCES accounting_entities(id),

                          CONSTRAINT fk_expenses_supplier
                              FOREIGN KEY (supplier_id)
                                  REFERENCES suppliers(id),

                          CONSTRAINT fk_expenses_expense_account
                              FOREIGN KEY (expense_account_id)
                                  REFERENCES accounts(id),

                          CONSTRAINT fk_expenses_payment_account
                              FOREIGN KEY (payment_account_id)
                                  REFERENCES accounts(id),

                          CONSTRAINT fk_expenses_journal_entry
                              FOREIGN KEY (journal_entry_id)
                                  REFERENCES journal_entries(id),

                          CONSTRAINT chk_expenses_amount
                              CHECK (amount > 0),

                          CONSTRAINT chk_expenses_status
                              CHECK (
                                  status IN (
                                             'DRAFT',
                                             'POSTED',
                                             'VOIDED'
                                      )
                                  )
);