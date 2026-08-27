package com.luxzera.server.user.controller;

import com.luxzera.server.user.dto.request.CreateAddressRequestDto;
import com.luxzera.server.user.dto.request.UpdateAddressRequestDto;
import com.luxzera.server.user.dto.response.AddressResponseDto;
import com.luxzera.server.user.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping("/{userId}")
    public List<AddressResponseDto> getAddresses(
            @PathVariable UUID userId
    ) {

        return addressService.getAddresses(userId);
    }

    @PostMapping("/{userId}")
    public AddressResponseDto createAddress(
            @PathVariable UUID userId,
            @Valid @RequestBody CreateAddressRequestDto request
    ) {

        return addressService.createAddress(
                userId,
                request
        );
    }

    @PutMapping("/{userId}/{addressId}")
    public AddressResponseDto updateAddress(
            @PathVariable UUID userId,
            @PathVariable UUID addressId,
            @Valid @RequestBody UpdateAddressRequestDto request
    ) {

        return addressService.updateAddress(
                userId,
                addressId,
                request
        );
    }

    @DeleteMapping("/{userId}/{addressId}")
    public void deleteAddress(
            @PathVariable UUID userId,
            @PathVariable UUID addressId
    ) {

        addressService.deleteAddress(
                userId,
                addressId
        );
    }

    @PatchMapping("/{userId}/{addressId}/default")
    public void setDefaultAddress(
            @PathVariable UUID userId,
            @PathVariable UUID addressId
    ) {

        addressService.setDefaultAddress(
                userId,
                addressId
        );
    }
}