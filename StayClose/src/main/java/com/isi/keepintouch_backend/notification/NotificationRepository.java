package com.isi.keepintouch_backend.notification;

import com.isi.keepintouch_backend.contact.Contact;
import com.isi.keepintouch_backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUtilisateurOrderByDateCreationDesc(User utilisateur);

    boolean existsByContactAndStatut(Contact contact, String statut);
}