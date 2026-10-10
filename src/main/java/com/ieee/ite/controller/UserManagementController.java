package com.ieee.ite.controller;

import com.ieee.ite.assets.*;
import com.ieee.ite.service.UserControllerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserManagementController {
    private static final Logger logger = LoggerFactory.getLogger(UserManagementController.class);
    private final UserControllerService userControllerService;

    public UserManagementController(UserControllerService userControllerService) {
        this.userControllerService = userControllerService;
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @PostMapping("/user/create/account")
    public ResponseEntity<String> createTeam(@RequestBody TeamCredentials teamCredentials) {
        logger.info("Admin - Create Team, {}", teamCredentials.teamName());
        return ResponseEntity.ok(userControllerService.createUserTeam(teamCredentials));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @DeleteMapping("/user/delete/account")
    public ResponseEntity<String> destroyTeam(@RequestParam String id) {
        logger.info("Admin - Delete Team, {}", id);
        return ResponseEntity.ok(userControllerService.destroyUserTeam(id));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @GetMapping("/get/statistics")
    public ResponseEntity<List<Statistics>> getStats() {
        logger.info("Admin - Get Statistics");
        return ResponseEntity.ok(userControllerService.getStats());
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @PutMapping("/update/startMission")
    public ResponseEntity<String> startMission(@AuthenticationPrincipal Jwt jwt) {
        logger.info("User - started mission, {}", jwt.getSubject());
        return ResponseEntity.ok(userControllerService.startMission(jwt.getSubject()));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @PutMapping("/update/round/stats")
    public ResponseEntity<String> updateRoundDetails(@RequestParam RoundProgression roundProgression, @AuthenticationPrincipal Jwt jwt) {
        logger.info("User - Update Round: {}, team: {}", roundProgression, jwt.getSubject());
        return ResponseEntity.ok(userControllerService.updateRound(jwt.getSubject(), roundProgression));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @PutMapping("/update/subround/stats")
    public ResponseEntity<String> updateSubRoundDetails(@RequestParam SubRound subRound, @AuthenticationPrincipal Jwt jwt) {
        logger.info("User - Update SubRound: {}, team: {}", subRound, jwt.getSubject());
        return ResponseEntity.ok(userControllerService.updateSubRound(jwt.getSubject(), subRound));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @GetMapping("/get/ack/nextRound")
    public ResponseEntity<Boolean> getRoundPermission(@RequestParam RoundProgression roundProgression, @AuthenticationPrincipal Jwt jwt) {
        logger.info("User - Get Ack Next Round: {}, team: {}", roundProgression, jwt.getSubject());
        return ResponseEntity.ok(userControllerService.getAckRound(jwt.getSubject(), roundProgression));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @GetMapping("/get/ack/nextSubRound")
    public ResponseEntity<Boolean> getSubRoundPermission(@RequestParam SubRound subRound, @AuthenticationPrincipal Jwt jwt) {
        logger.info("User - Get Ack Next SubRound: {}, team: {}", subRound, jwt.getSubject());
        return ResponseEntity.ok(userControllerService.getAckSubRound(jwt.getSubject(), subRound));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @GetMapping("/get/round/detail")
    public ResponseEntity<RoundProgression> getRoundProgression(@AuthenticationPrincipal Jwt jwt) {
        logger.info("User - Get Round Detail, team: {}", jwt.getSubject());
        return ResponseEntity.ok(userControllerService.getRoundStatus(jwt.getSubject()));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @GetMapping("/get/mission/started")
    public ResponseEntity<Boolean> getMissionStarted(@AuthenticationPrincipal Jwt jwt) {
        logger.info("User - Get Mission Started, team: {}", jwt.getSubject());
        return ResponseEntity.ok(userControllerService.hasMissionStarted(jwt.getSubject()));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_USER')")
    @GetMapping("/get/team/members")
    public ResponseEntity<List<String>> getMembers(@AuthenticationPrincipal Jwt jwt) {
        logger.info("User - Get Team Members, team: {}", jwt.getSubject());
        return ResponseEntity.ok(userControllerService.getTeamMember(jwt.getSubject()));
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @PutMapping("/team/isLogged/change")
    public ResponseEntity<String> changeLoginRequest(@RequestParam String teamId) {
        logger.info("Admin - Change Login Access, teamId: {}", teamId);
        return ResponseEntity.ok(userControllerService.changeAccess(teamId));
    }

    @PutMapping("/api/user/login")
    public ResponseEntity<JWTToken> authenticate(@RequestBody LoginRequest loginRequest) {
        logger.info("User - Login Attempt, team: {}", loginRequest.teamName());
        return ResponseEntity.ok(userControllerService.authenticate(loginRequest));
    }

    @ExceptionHandler(DuplicateCredentialsException.class)
    public ResponseEntity<String> handle(DuplicateCredentialsException ex) {
        logger.warn("DuplicateCredentialsException: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
