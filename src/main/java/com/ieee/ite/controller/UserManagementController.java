package com.ieee.ite.controller;

import com.ieee.ite.assets.*;
import com.ieee.ite.service.UserControllerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.parameters.P;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserManagementController {
    private final UserControllerService userControllerService;

    public UserManagementController(UserControllerService userControllerService) {
        this.userControllerService = userControllerService;
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @PostMapping("/user/create/account")
    public ResponseEntity<String> createTeam(@RequestBody TeamCredentials teamCredentials) {
        return ResponseEntity.ok(userControllerService.createUserTeam(teamCredentials));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @DeleteMapping("/user/delete/account")
    public ResponseEntity<String> destroyTeam(@RequestParam String id) {
        return ResponseEntity.ok(userControllerService.destroyUserTeam(id));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @GetMapping("/get/statistics")
    public ResponseEntity<List<Statistics>> getStats() {
        return ResponseEntity.ok(userControllerService.getStats());
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @PutMapping("/update/round/stats")
    public ResponseEntity<String> updateRoundDetails(@RequestParam RoundProgression roundProgression, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userControllerService.updateRound(jwt.getSubject(), roundProgression));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @PutMapping("/update/subround/stats")
    public ResponseEntity<String> updateSubRoundDetails(@RequestParam SubRound subRound, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userControllerService.updateSubRound(jwt.getSubject(), subRound));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @GetMapping("/get/ack/nextRound")
    public ResponseEntity<Boolean> getRoundPermission(@RequestParam RoundProgression roundProgression, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userControllerService.getAckRound(jwt.getSubject(), roundProgression));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @GetMapping("/get/ack/nextSubRound")
    public ResponseEntity<Boolean> getSubRoundPermission(@RequestParam SubRound subRound, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userControllerService.getAckSubRound(jwt.getSubject(), subRound));
    }

    @PutMapping("/api/user/login")
    public ResponseEntity<JWTToken> authenticate(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userControllerService.authenticate(loginRequest));
    }

    @ExceptionHandler(DuplicateCredentialsException.class)
    public ResponseEntity<String> handle(DuplicateCredentialsException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
