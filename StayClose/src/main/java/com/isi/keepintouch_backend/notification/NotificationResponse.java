package com.isi.keepintouch_backend.notification;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private String message;
    private LocalDateTime dateCreation;
    private String statut;
    private Long contactId;
    private String contactNom;

    public static NotificationResponse fromEntity(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.getDateCreation(),
                notification.getStatut(),
                notification.getContact().getId(),
                notification.getContact().getNom()
        );
    }
}