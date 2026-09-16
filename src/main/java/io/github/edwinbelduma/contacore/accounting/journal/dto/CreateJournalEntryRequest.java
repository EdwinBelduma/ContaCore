package io.github.edwinbelduma.contacore.accounting.journal.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateJournalEntryRequest(

        @NotNull(message = "La fecha del asiento es obligatoria")
        LocalDate entryDate,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 255)
        String description,

        @Size(max = 100)
        String reference,

        @NotEmpty(
                message = "El asiento debe contener movimientos"
        )
        List<@Valid CreateJournalEntryLineRequest> lines

) {
}