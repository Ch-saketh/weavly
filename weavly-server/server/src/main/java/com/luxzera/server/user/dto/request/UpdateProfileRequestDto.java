package com.luxzera.server.user.dto.request;

import com.luxzera.server.user.enums.Gender;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

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

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public void setGender(String rawGender) {
        if (rawGender == null || rawGender.trim().isEmpty()) {
            this.gender = null;
            return;
        }
        String clean = rawGender.trim().toUpperCase();
        if (clean.equals("MEN") || clean.equals("MALE") || clean.equals("MAN")) {
            this.gender = Gender.MALE;
        } else if (clean.equals("WOMEN") || clean.equals("FEMALE") || clean.equals("WOMAN")) {
            this.gender = Gender.FEMALE;
        } else if (clean.equals("OTHER") || clean.equals("UNISEX")) {
            this.gender = Gender.OTHER;
        } else {
            try {
                this.gender = Gender.valueOf(clean);
            } catch (Exception e) {
                this.gender = Gender.OTHER;
            }
        }
    }

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateOfBirth;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;
}