package com.isi.keepintouch_backend.interaction;

import com.isi.keepintouch_backend.contact.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    List<Interaction> findByContactOrderByDateDesc(Contact contact);

    boolean existsByGoogleMessageId(String googleMessageId);
}