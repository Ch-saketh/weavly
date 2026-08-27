package com.luxzera.server.user.mapper;

import com.luxzera.server.user.dto.response.AddressResponseDto;
import com.luxzera.server.user.entity.Address;

public final class AddressMapper {

    private AddressMapper() {
    }

    public static AddressResponseDto toResponseDto(
            Address address
    ) {

        return AddressResponseDto.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .isDefault(address.getIsDefault())
                .build();
    }
}