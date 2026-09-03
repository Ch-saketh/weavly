package com.luxzera.server.admin.dto.request;

import com.luxzera.server.orders.enums.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderAdminStatusUpdateRequest {

    @NotNull(message = "New order status is mandatory")
    private OrderStatus status;

    @NotBlank(message = "Operational reason is mandatory for administrative status changes")
    private String reason;

    private Long version;
}
