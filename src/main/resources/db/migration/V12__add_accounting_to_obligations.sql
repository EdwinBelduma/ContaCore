ALTER TABLE obligations
    ADD COLUMN obligation_account_id UUID,
    ADD COLUMN counterpart_account_id UUID,
    ADD COLUMN journal_entry_id UUID;

ALTER TABLE obligations
    ADD CONSTRAINT fk_obligations_obligation_account
        FOREIGN KEY (obligation_account_id)
            REFERENCES accounts(id);

ALTER TABLE obligations
    ADD CONSTRAINT fk_obligations_counterpart_account
        FOREIGN KEY (counterpart_account_id)
            REFERENCES accounts(id);

ALTER TABLE obligations
    ADD CONSTRAINT fk_obligations_journal_entry
        FOREIGN KEY (journal_entry_id)
            REFERENCES journal_entries(id);

ALTER TABLE obligations
    ADD CONSTRAINT uk_obligations_journal_entry
        UNIQUE (journal_entry_id);