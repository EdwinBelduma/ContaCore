CREATE TABLE journal_entries (

                                 id UUID PRIMARY KEY,

                                 accounting_entity_id UUID NOT NULL,

                                 entry_date DATE NOT NULL,

                                 description VARCHAR(255) NOT NULL,

                                 reference VARCHAR(100),

                                 status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

                                 created_by_user_id UUID NOT NULL,

                                 created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                 updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                 CONSTRAINT fk_journal_entries_entity
                                     FOREIGN KEY (accounting_entity_id)
                                         REFERENCES accounting_entities(id),

                                 CONSTRAINT fk_journal_entries_created_by
                                     FOREIGN KEY (created_by_user_id)
                                         REFERENCES users(id),

                                 CONSTRAINT chk_journal_entries_status
                                     CHECK (
                                         status IN ('DRAFT', 'POSTED', 'VOIDED')
                                         )
);


CREATE TABLE journal_entry_lines (

                                     id UUID PRIMARY KEY,

                                     journal_entry_id UUID NOT NULL,

                                     account_id UUID NOT NULL,

                                     line_number INTEGER NOT NULL,

                                     description VARCHAR(255),

                                     debit NUMERIC(19, 2) NOT NULL DEFAULT 0,

                                     credit NUMERIC(19, 2) NOT NULL DEFAULT 0,

                                     created_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                     updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                     CONSTRAINT fk_journal_entry_lines_entry
                                         FOREIGN KEY (journal_entry_id)
                                             REFERENCES journal_entries(id)
                                             ON DELETE CASCADE,

                                     CONSTRAINT fk_journal_entry_lines_account
                                         FOREIGN KEY (account_id)
                                             REFERENCES accounts(id),

                                     CONSTRAINT uk_journal_entry_line_number
                                         UNIQUE (journal_entry_id, line_number),

                                     CONSTRAINT chk_journal_entry_lines_amounts
                                         CHECK (
                                             (debit > 0 AND credit = 0)
                                                 OR
                                             (credit > 0 AND debit = 0)
                                             )
);