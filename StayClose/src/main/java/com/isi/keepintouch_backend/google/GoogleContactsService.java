package com.isi.keepintouch_backend.google;

import com.isi.keepintouch_backend.contact.Contact;
import com.isi.keepintouch_backend.contact.ContactRepository;
import com.isi.keepintouch_backend.interaction.Interaction;
import com.isi.keepintouch_backend.interaction.InteractionRepository;
import com.isi.keepintouch_backend.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleContactsService {

    private final OAuth2AuthorizedClientService authorizedClientService;
    private final ContactRepository contactRepository;
    private final InteractionRepository interactionRepository;   // NOUVEAU
    private final GmailService gmailService;

    private static final String PEOPLE_API_URL =
            "https://people.googleapis.com/v1/people/me/connections" +
                    "?personFields=names,emailAddresses,phoneNumbers,birthdays" +
                    "&pageSize=100";

    public int syncContacts(OAuth2AuthenticationToken authentication, User utilisateur) {
        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                authentication.getAuthorizedClientRegistrationId(),
                authentication.getName()
        );

        String accessToken = authorizedClient.getAccessToken().getTokenValue();

        RestClient restClient = RestClient.create();

        Map<String, Object> response = restClient.get()
                .uri(PEOPLE_API_URL)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("connections")) {
            return 0;
        }

        List<Map<String, Object>> connections = (List<Map<String, Object>>) response.get("connections");
        int nbSynchronises = 0;

        for (Map<String, Object> connection : connections) {
            Contact contact = mapToContact(connection, utilisateur);
            if (contact != null) {
                if (contact.getEmail() != null) {
                    // Récupère jusqu'à 5 échanges récents
                    List<GmailService.EchangeGmail> echanges =
                            gmailService.findRecentExchanges(accessToken, contact.getEmail(), 5);

                    if (!echanges.isEmpty()) {
                        // Le premier de la liste est le plus récent (Gmail trie par défaut du plus récent)
                        contact.setDateDernierEchange(echanges.get(0).date());
                    }

                    contactRepository.save(contact); // sauvegarde le contact avant les interactions (besoin de son ID)

                    for (GmailService.EchangeGmail echange : echanges) {
                        enregistrerInteraction(contact, echange);
                    }
                } else {
                    contactRepository.save(contact);
                }

                nbSynchronises++;
            }
        }

        return nbSynchronises;
    }

    private void enregistrerInteraction(Contact contact, GmailService.EchangeGmail echange) {
        if (interactionRepository.existsByGoogleMessageId(echange.messageId())) {
            return; // déjà enregistrée, on évite le doublon
        }

        Interaction interaction = new Interaction();
        interaction.setContact(contact);
        interaction.setDate(echange.date());
        interaction.setType("EMAIL");
        interaction.setNote(echange.sujet());
        interaction.setSource("GOOGLE");
        interaction.setGoogleMessageId(echange.messageId());

        interactionRepository.save(interaction);
    }

    @SuppressWarnings("unchecked")
    private Contact mapToContact(Map<String, Object> connection, User utilisateur) {
        String resourceName = (String) connection.get("resourceName");

        List<Map<String, Object>> names = (List<Map<String, Object>>) connection.get("names");
        String nom = (names != null && !names.isEmpty())
                ? (String) names.get(0).get("displayName")
                : null;

        if (nom == null) {
            return null;
        }

        Contact contact = contactRepository.findByGoogleContactId(resourceName)
                .orElse(new Contact());

        contact.setGoogleContactId(resourceName);
        contact.setUtilisateur(utilisateur);
        contact.setNom(nom);
        contact.setSource("GOOGLE");

        if (contact.getCategorie() == null) {
            contact.setCategorie("NON_CLASSE");
        }

        if (contact.getFrequenceContactJours() == null) {
            contact.setFrequenceContactJours(frequenceParDefaut(contact.getCategorie()));
        }

        List<Map<String, Object>> emails = (List<Map<String, Object>>) connection.get("emailAddresses");
        if (emails != null && !emails.isEmpty()) {
            contact.setEmail((String) emails.get(0).get("value"));
        }

        List<Map<String, Object>> phones = (List<Map<String, Object>>) connection.get("phoneNumbers");
        if (phones != null && !phones.isEmpty()) {
            contact.setTelephone((String) phones.get(0).get("value"));
        }

        return contact;
    }

    private Integer frequenceParDefaut(String categorie) {
        return switch (categorie) {
            case "FAMILLE" -> 14;
            case "AMI_PROCHE" -> 30;
            case "COLLEGUE" -> 60;
            default -> 90;
        };
    }
}