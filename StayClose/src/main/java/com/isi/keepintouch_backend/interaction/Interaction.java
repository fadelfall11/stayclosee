package com.isi.keepintouch_backend.interaction;

import com.isi.keepintouch_backend.contact.Contact;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Interaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    @Column(nullable = false)
    private LocalDate date;

    // EMAIL, APPEL, SMS, AUTRE
    @Column(nullable = false)
    private String type;

    private String note;

    // GOOGLE (détecté auto) ou MANUEL (saisi par l'utilisateur en secours)
    @Column(nullable = false)
    private String source;

    // Identifiant du message Gmail, pour éviter les doublons à la resynchronisation
    @Column(name = "google_message_id", unique = true)
    private String googleMessageId;
}