CREATE TABLE obligation_payments (
                                     id UUID PRIMARY KEY,

                                     obligation_id UUID NOT NULL,

                                     payment_date DATE NOT NULL,

                                     amount NUMERIC(19, 2) NOT NULL,

                                     cash_account_id UUID NOT NULL,

                                     status VARCHAR(20) NOT NULL,

                                     journal_entry_id UUID UNIQUE,

                                     created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                                     updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                     CONSTRAINT fk_obligation_payments_obligation
                                         FOREIGN KEY (obligation_id)
                                             REFERENCES obligations(id),

                                     CONSTRAINT fk_obligation_payments_cash_account
                                         FOREIGN KEY (cash_account_id)
                                             REFERENCES accounts(id),

                                     CONSTRAINT fk_obligation_payments_journal_entry
                                         FOREIGN KEY (journal_entry_id)
                                             REFERENCES journal_entries(id),

                                     CONSTRAINT chk_obligation_payments_amount
                                         CHECK (amount > 0),

                                     CONSTRAINT chk_obligation_payments_status
                                         CHECK (status IN ('POSTED', 'VOIDED'))
);