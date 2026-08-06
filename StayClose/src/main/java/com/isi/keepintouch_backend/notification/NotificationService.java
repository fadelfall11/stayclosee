package com.isi.keepintouch_backend.notification;

import com.isi.keepintouch_backend.contact.Contact;
import com.isi.keepintouch_backend.contact.ContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final ContactRepository contactRepository;
    private final NotificationRepository notificationRepository;

    // S'exécute automatiquement tous les jours à 8h du matin
    @Scheduled(cron = "0 0 8 * * *")
    public void genererRappelsQuotidiens() {
        log.info("Démarrage de la vérification quotidienne des contacts en retard...");

        List<Contact> contacts = contactRepository.findAll();
        int nbNotificationsCreees = 0;

        for (Contact contact : contacts) {
            if (estEnRetard(contact) && !notificationRepository.existsByContactAndStatut(contact, "NON_LUE")) {
                creerNotification(contact);
                nbNotificationsCreees++;
            }
        }

        log.info("{} nouvelle(s) notification(s) créée(s)", nbNotificationsCreees);
    }

    private boolean estEnRetard(Contact contact) {
        if (contact.getFrequenceContactJours() == null || contact.getDateDernierEchange() == null) {
            return false; // pas assez d'info pour juger - on ignore ce contact
        }

        long joursDepuisDernierEchange = ChronoUnit.DAYS.between(
                contact.getDateDernierEchange(), LocalDate.now()
        );

        return joursDepuisDernierEchange > contact.getFrequenceContactJours();
    }

    private void creerNotification(Contact contact) {
        Notification notification = new Notification();
        notification.setUtilisateur(contact.getUtilisateur());
        notification.setContact(contact);
        notification.setMessage(
                "Vous n'avez pas contacté " + contact.getNom() + " depuis plus de "
                        + contact.getFrequenceContactJours() + " jours."
        );
        notificationRepository.save(notification);
    }

    // Permet de déclencher manuellement la vérification (utile pour tester sans attendre 8h)
    public int declencherManuellement() {
        List<Contact> contacts = contactRepository.findAll();
        int nbNotificationsCreees = 0;

        for (Contact contact : contacts) {
            if (estEnRetard(contact) && !notificationRepository.existsByContactAndStatut(contact, "NON_LUE")) {
                creerNotification(contact);
                nbNotificationsCreees++;
            }
        }

        return nbNotificationsCreees;
    }
}