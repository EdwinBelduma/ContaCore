CREATE TABLE obligations (
                             id UUID PRIMARY KEY,

                             accounting_entity_id UUID NOT NULL,

                             type VARCHAR(20) NOT NULL,

                             customer_id UUID,
                             supplier_id UUID,

                             issue_date DATE NOT NULL,
                             due_date DATE NOT NULL,

                             description VARCHAR(255) NOT NULL,
                             reference VARCHAR(100),

                             total_amount NUMERIC(19, 2) NOT NULL,
                             paid_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,

                             status VARCHAR(30) NOT NULL,

                             created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                             updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                             CONSTRAINT fk_obligations_accounting_entity
                                 FOREIGN KEY (accounting_entity_id)
                                     REFERENCES accounting_entities(id),

                             CONSTRAINT fk_obligations_customer
                                 FOREIGN KEY (customer_id)
                                     REFERENCES customers(id),

                             CONSTRAINT fk_obligations_supplier
                                 FOREIGN KEY (supplier_id)
                                     REFERENCES suppliers(id),

                             CONSTRAINT chk_obligations_type
                                 CHECK (type IN ('RECEIVABLE', 'PAYABLE')),

                             CONSTRAINT chk_obligations_status
                                 CHECK (
                                     status IN (
                                                'PENDING',
                                                'PARTIALLY_PAID',
                                                'PAID',
                                                'OVERDUE',
                                                'VOIDED'
                                         )
                                     ),

                             CONSTRAINT chk_obligations_total_amount
                                 CHECK (total_amount > 0),

                             CONSTRAINT chk_obligations_paid_amount
                                 CHECK (
                                     paid_amount >= 0
                                         AND paid_amount <= total_amount
                                     ),

                             CONSTRAINT chk_obligations_due_date
                                 CHECK (due_date >= issue_date),

                             CONSTRAINT chk_obligations_party
                                 CHECK (
                                     (
                                         type = 'RECEIVABLE'
                                             AND customer_id IS NOT NULL
                                             AND supplier_id IS NULL
                                         )
                                         OR
                                     (
                                         type = 'PAYABLE'
                                             AND supplier_id IS NOT NULL
                                             AND customer_id IS NULL
                                         )
                                     )
);