package com.isi.keepintouch_backend.contact;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateContactRequest {

    @NotBlank(message = "Le nom du contact est obligatoire")
    private String name;

    private String freq;

    private String birthday;

    private String telephone;

    private String email;

    private String categorie;
}
