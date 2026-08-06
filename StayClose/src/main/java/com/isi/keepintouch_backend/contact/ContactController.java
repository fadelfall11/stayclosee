package com.isi.keepintouch_backend.contact;

import com.isi.keepintouch_backend.security.CurrentUserProvider;
import com.isi.keepintouch_backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactRepository contactRepository;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public List<ContactResponse> getAllContacts() {
        User currentUser = currentUserProvider.getCurrentUser();
        return contactRepository.findByUtilisateur(currentUser)
                .stream()
                .map(ContactResponse::fromEntity)
                .toList();
    }

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(@Valid @RequestBody CreateContactRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();

        Contact contact = new Contact();
        contact.setUtilisateur(currentUser);
        contact.setNom(request.getName());
        contact.setEmail(request.getEmail());
        contact.setTelephone(request.getTelephone());
        contact.setCategorie(request.getCategorie() != null ? request.getCategorie() : "MANUEL");
        contact.setSource("MANUEL");

        if (request.getBirthday() != null && !request.getBirthday().isBlank()) {
            try {
                contact.setDateAnniversaire(LocalDate.parse(request.getBirthday()));
            } catch (Exception ignored) {}
        }

        Contact saved = contactRepository.save(contact);
        return ResponseEntity.status(HttpStatus.CREATED).body(ContactResponse.fromEntity(saved));
    }
}