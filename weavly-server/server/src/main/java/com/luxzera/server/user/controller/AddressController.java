package com.luxzera.server.user.controller;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.dto.request.CreateAddressRequestDto;
import com.luxzera.server.user.dto.request.UpdateAddressRequestDto;
import com.luxzera.server.user.dto.response.AddressResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import com.luxzera.server.user.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new ResourceNotFoundException("Authenticated session not found");
        }
        return userRepository.findByEmailIgnoreCase(principal.getName())
                .or(() -> userRepository.findByEmail(principal.getName()))
                .orElseThrow(() -> new ResourceNotFoundException("User account not found"));
    }

    @GetMapping("/me")
    public List<AddressResponseDto> getMyAddresses(Principal principal) {
        User user = getAuthenticatedUser(principal);
        return addressService.getAddresses(user.getId());
    }

    @PostMapping("/me")
    public AddressResponseDto createMyAddress(
            Principal principal,
            @Valid @RequestBody CreateAddressRequestDto request
    ) {
        User user = getAuthenticatedUser(principal);
        return addressService.createAddress(user.getId(), request);
    }

    @PutMapping("/me/{addressId}")
    public AddressResponseDto updateMyAddress(
            Principal principal,
            @PathVariable UUID addressId,
            @Valid @RequestBody UpdateAddressRequestDto request
    ) {
        User user = getAuthenticatedUser(principal);
        return addressService.updateAddress(user.getId(), addressId, request);
    }

    @DeleteMapping("/me/{addressId}")
    public void deleteMyAddress(
            Principal principal,
            @PathVariable UUID addressId
    ) {
        User user = getAuthenticatedUser(principal);
        addressService.deleteAddress(user.getId(), addressId);
    }

    @PatchMapping("/me/{addressId}/default")
    public void setMyDefaultAddress(
            Principal principal,
            @PathVariable UUID addressId
    ) {
        User user = getAuthenticatedUser(principal);
        addressService.setDefaultAddress(user.getId(), addressId);
    }

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