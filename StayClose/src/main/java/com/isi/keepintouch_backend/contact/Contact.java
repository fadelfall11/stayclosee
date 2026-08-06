package com.isi.keepintouch_backend.contact;

import com.isi.keepintouch_backend.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // NOUVEAU : chaque contact appartient à un utilisateur précis
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User utilisateur;

    @Column(nullable = false)
    private String nom;

    private String telephone;

    private String email;

    @Column(nullable = false)
    private String categorie;

    private LocalDate dateAnniversaire;

    @Column(name = "frequence_contact_jours")
    private Integer frequenceContactJours;

    @Column(name = "date_dernier_echange")
    private LocalDate dateDernierEchange;

    @Column(name = "google_contact_id", unique = true)
    private String googleContactId;

    @Column(nullable = false)
    private String source;
}