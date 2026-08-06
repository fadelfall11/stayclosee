package com.isi.keepintouch_backend.google;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class GmailService {

    private static final String GMAIL_LIST_URL =
            "https://gmail.googleapis.com/gmail/v1/users/me/messages" +
                    "?q=%s&maxResults=%d";

    private static final String GMAIL_GET_URL =
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/%s" +
                    "?format=metadata&metadataHeaders=Subject";

    // Représente un échange trouvé, prêt à devenir une Interaction
    public record EchangeGmail(String messageId, LocalDate date, String sujet) {}

    // Récupère les derniers échanges (par défaut 5) avec ce contact
    public List<EchangeGmail> findRecentExchanges(String accessToken, String contactEmail, int maxResults) {
        List<EchangeGmail> resultats = new ArrayList<>();

        if (contactEmail == null || contactEmail.isBlank()) {
            return resultats;
        }

        RestClient restClient = RestClient.create();

        try {
            String query = "from:" + contactEmail + " OR to:" + contactEmail;
            String listUrl = String.format(GMAIL_LIST_URL, query, maxResults);

            Map<String, Object> listResponse = restClient.get()
                    .uri(listUrl)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(Map.class);

            if (listResponse == null || !listResponse.containsKey("messages")) {
                return resultats;
            }

            List<Map<String, Object>> messages = (List<Map<String, Object>>) listResponse.get("messages");

            for (Map<String, Object> messageRef : messages) {
                String messageId = (String) messageRef.get("id");
                EchangeGmail echange = getDetailMessage(restClient, accessToken, messageId);
                if (echange != null) {
                    resultats.add(echange);
                }
            }

        } catch (Exception e) {
            log.warn("Impossible de récupérer les échanges Gmail pour {} : {}", contactEmail, e.getMessage());
        }

        return resultats;
    }

    // Garde l'ancienne méthode simple, utilisée pour Contact.dateDernierEchange
    public Optional<LocalDate> findLastExchangeDate(String accessToken, String contactEmail) {
        List<EchangeGmail> echanges = findRecentExchanges(accessToken, contactEmail, 1);
        return echanges.isEmpty() ? Optional.empty() : Optional.of(echanges.get(0).date());
    }

    @SuppressWarnings("unchecked")
    private EchangeGmail getDetailMessage(RestClient restClient, String accessToken, String messageId) {
        try {
            String getUrl = String.format(GMAIL_GET_URL, messageId);

            Map<String, Object> messageDetail = restClient.get()
                    .uri(getUrl)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(Map.class);

            String internalDateMillis = (String) messageDetail.get("internalDate");
            if (internalDateMillis == null) {
                return null;
            }

            LocalDate date = Instant.ofEpochMilli(Long.parseLong(internalDateMillis))
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();

            String sujet = extraireSujet(messageDetail);

            return new EchangeGmail(messageId, date, sujet);

        } catch (Exception e) {
            log.warn("Impossible de récupérer le détail du message {} : {}", messageId, e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String extraireSujet(Map<String, Object> messageDetail) {
        Map<String, Object> payload = (Map<String, Object>) messageDetail.get("payload");
        if (payload == null) return null;

        List<Map<String, Object>> headers = (List<Map<String, Object>>) payload.get("headers");
        if (headers == null) return null;

        return headers.stream()
                .filter(h -> "Subject".equals(h.get("name")))
                .map(h -> (String) h.get("value"))
                .findFirst()
                .orElse(null);
    }
}