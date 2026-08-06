package com.isi.keepintouch_backend.contact;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class ContactResponse {

    private Long id;
    private String nom;
    private String telephone;
    private String email;
    private String categorie;
    private LocalDate dateAnniversaire;
    private Integer frequenceContactJours;
    private LocalDate dateDernierEchange;
    private String source;

    public static ContactResponse fromEntity(Contact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getNom(),
                contact.getTelephone(),
                contact.getEmail(),
                contact.getCategorie(),
                contact.getDateAnniversaire(),
                contact.getFrequenceContactJours(),
                contact.getDateDernierEchange(),
                contact.getSource()
        );
    }
}