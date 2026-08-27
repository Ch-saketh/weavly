package com.luxzera.server.user.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.dto.request.CreateAddressRequestDto;
import com.luxzera.server.user.dto.request.UpdateAddressRequestDto;
import com.luxzera.server.user.dto.response.AddressResponseDto;
import com.luxzera.server.user.entity.Address;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.AddressRepository;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;

    private final UserRepository userRepository;

    @Override
    public AddressResponseDto createAddress(
            UUID userId,
            CreateAddressRequestDto request
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        Address address = new Address();

        address.setUser(user);
        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setCountry(request.getCountry());
        address.setPostalCode(request.getPostalCode());
        address.setIsDefault(false);

        return getAddressResponseDto(address);
    }

    @Override
    public AddressResponseDto updateAddress(
            UUID userId,
            UUID addressId,
            UpdateAddressRequestDto request
    ) {

        Address address = addressRepository
                .findById(addressId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "BRO!Address not found"
                        )
                );

        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setCountry(request.getCountry());
        address.setPostalCode(request.getPostalCode());

        return getAddressResponseDto(address);
    }

    private AddressResponseDto getAddressResponseDto(Address address) {
        Address updatedAddress =
                addressRepository.save(address);

        return AddressResponseDto.builder()
                .id(updatedAddress.getId())
                .fullName(updatedAddress.getFullName())
                .phoneNumber(updatedAddress.getPhoneNumber())
                .addressLine1(updatedAddress.getAddressLine1())
                .addressLine2(updatedAddress.getAddressLine2())
                .city(updatedAddress.getCity())
                .state(updatedAddress.getState())
                .country(updatedAddress.getCountry())
                .postalCode(updatedAddress.getPostalCode())
                .isDefault(updatedAddress.getIsDefault())
                .build();
    }

    @Override
    public void deleteAddress(
            UUID userId,
            UUID addressId
    ) {

        Address address = addressRepository
                .findById(addressId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Address not found"
                        )
                );

        addressRepository.delete(address);
    }

    @Override
    public void setDefaultAddress(
            UUID userId,
            UUID addressId
    ) {

        Address address = addressRepository
                .findById(addressId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Address not found"
                        )
                );

        addressRepository
                .findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(defaultAddress -> {

                    defaultAddress.setIsDefault(false);

                    addressRepository.save(defaultAddress);
                });

        address.setIsDefault(true);

        addressRepository.save(address);
    }
    @Override
    public List<AddressResponseDto> getAddresses(UUID userId) {

        List<Address> addresses =
                addressRepository.findAllByUserId(userId);

        return addresses.stream()
                .map(address ->
                        AddressResponseDto.builder()
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
                                .build()
                )
                .toList();
    }



}
