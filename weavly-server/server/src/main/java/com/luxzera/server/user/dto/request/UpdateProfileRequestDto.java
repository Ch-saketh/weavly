package com.luxzera.server.user.dto.request;

import com.luxzera.server.user.enums.Gender;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequestDto {

    @Pattern(
            regexp = "^$|^[0-9]{10}$",
            message = "Phone number must contain 10 digits"
    )
    private String phoneNumber;

    private Gender gender;

    private LocalDate dateOfBirth;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;
}