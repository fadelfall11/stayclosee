package com.isi.keepintouch_backend.contact;

import com.isi.keepintouch_backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findByUtilisateur(User utilisateur);

    Optional<Contact> findByGoogleContactId(String googleContactId);
}