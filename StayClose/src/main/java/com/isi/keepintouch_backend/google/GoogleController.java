package com.isi.keepintouch_backend.google;

import com.isi.keepintouch_backend.security.CurrentUserProvider;
import com.isi.keepintouch_backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/google")
@RequiredArgsConstructor
public class GoogleController {

    private final GoogleContactsService googleContactsService;
    private final CurrentUserProvider currentUserProvider;

    // Endpoint de test qu'on avait créé - on le garde, pratique pour vérifier la connexion
    @GetMapping("/sync-status")
    public String syncStatus(OAuth2AuthenticationToken authentication) {
        return "Connecté à Google en tant que : " + authentication.getPrincipal().getAttribute("email");
    }

    // NOUVEAU : déclenche la synchronisation des contacts Google
    @PostMapping("/sync-contacts")
    public Map<String, Object> syncContacts(OAuth2AuthenticationToken authentication) {
        User utilisateurCourant = currentUserProvider.getCurrentUser();
        int nbSynchronises = googleContactsService.syncContacts(authentication, utilisateurCourant);

        return Map.of(
                "message", "Synchronisation terminée",
                "nombreContactsSynchronises", nbSynchronises
        );
    }
}