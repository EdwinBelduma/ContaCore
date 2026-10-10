package io.github.edwinbelduma.contacore.obligation.repository;

import io.github.edwinbelduma.contacore.obligation.domain.ObligationPayment;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationPaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ObligationPaymentRepository
        extends JpaRepository<ObligationPayment, UUID> {

    List<ObligationPayment> findByObligation_IdOrderByPaymentDateAscCreatedAtAsc(
            UUID obligationId
    );

    List<ObligationPayment> findByObligation_IdAndStatusOrderByPaymentDateAscCreatedAtAsc(
            UUID obligationId,
            ObligationPaymentStatus status
    );

    Optional<ObligationPayment> findByIdAndObligation_Id(
            UUID id,
            UUID obligationId
    );
}