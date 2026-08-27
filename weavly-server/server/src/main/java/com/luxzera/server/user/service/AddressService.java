package com.luxzera.server.user.service;

import com.luxzera.server.user.dto.request.CreateAddressRequestDto;
import com.luxzera.server.user.dto.request.UpdateAddressRequestDto;
import com.luxzera.server.user.dto.response.AddressResponseDto;

import java.util.List;
import java.util.UUID;

public interface AddressService {

    List<AddressResponseDto> getAddresses(UUID userId);

    AddressResponseDto createAddress(
            UUID userId,
            CreateAddressRequestDto request
    );

    AddressResponseDto updateAddress(
            UUID userId,
            UUID addressId,
            UpdateAddressRequestDto request
    );

    void deleteAddress(
            UUID userId,
            UUID addressId
    );

    void setDefaultAddress(
            UUID userId,
            UUID addressId
    );
}