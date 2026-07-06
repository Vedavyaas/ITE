package com.ieee.ite.service;

import com.ieee.ite.assets.*;
import com.ieee.ite.document.UserDocument;
import com.ieee.ite.document.UserDocumentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class UserControllerService {
    private final UserDocumentRepository userDocumentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public UserControllerService(UserDocumentRepository userDocumentRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtEncoder jwtEncoder) {
        this.userDocumentRepository = userDocumentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    public String createUserTeam(TeamCredentials teamCredentials) {
        if (userDocumentRepository.existsByTeamName(teamCredentials.teamName())) {
            throw new DuplicateCredentialsException("Team name already exists!");
        }

        UserDocument userDocument = new UserDocument(
                teamCredentials.teamName(),
                teamCredentials.teamName(),
                passwordEncoder.encode(teamCredentials.password()),
                Role.USER
        );
        userDocumentRepository.save(userDocument);

        return "User created successfully!";
    }

    public String destroyUserTeam(String id) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Invalid team name!");
        }

        userDocumentRepository.deleteUserDocumentsById(id);
        return "User account deleted!";
    }

    public List<Statistics> getStats() {
        return userDocumentRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.USER)
                .map(user -> new Statistics(
                        user.getTeamName(),
                        user.getRoundProgression(),
                        user.getSubRoundProgression(),
                        user.getLatestRoundCompleteTime()
                ))
                .sorted(getLeaderboardComparator())
                .toList();
    }

    private Comparator<Statistics> getLeaderboardComparator() {
        return (s1, s2) -> {
            int r1 = getRoundRank(s1.roundProgression());
            int r2 = getRoundRank(s2.roundProgression());
            if (r1 != r2) {
                return Integer.compare(r2, r1);
            }

            int sr1 = getSubRoundRank(s1.subRound());
            int sr2 = getSubRoundRank(s2.subRound());
            if (sr1 != sr2) {
                return Integer.compare(sr2, sr1);
            }

            if (s1.timeTaken() == null && s2.timeTaken() == null) return 0;
            if (s1.timeTaken() == null) return 1;
            if (s2.timeTaken() == null) return -1;
            return s1.timeTaken().compareTo(s2.timeTaken());
        };
    }

    private int getRoundRank(RoundProgression round) {
        if (round == null) return 0;
        return switch (round) {
            case YET_TO_START -> 0;
            case FIRST -> 1;
            case SECOND -> 2;
            case THIRD -> 3;
        };
    }

    private int getSubRoundRank(SubRound subRound) {
        if (subRound == null) return 0;
        return switch (subRound) {
            case YET_TO_START -> 0;
            case ONE -> 1;
            case TWO -> 2;
            case THREE -> 3;
            case FOUR -> 4;
            case FIVE -> 5;
            case SIX -> 6;
            case SEVEN -> 7;
            case EIGHT -> 8;
        };
    }

    public String updateRound(String id, RoundProgression roundProgression) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        userDocument.setLatestRoundCompleteTime(Instant.now());
        userDocument.setRoundProgression(roundProgression);

        userDocumentRepository.save(userDocument);
        return "Saved!";
    }

    public String updateSubRound(String id, SubRound subRound) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        userDocument.setLatestRoundCompleteTime(Instant.now());
        userDocument.setSubRoundProgression(subRound);

        userDocumentRepository.save(userDocument);
        return "Saved!";
    }

    public Boolean getAckRound(String id, RoundProgression roundProgression) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        RoundProgression completed = userDocument.getRoundProgression();

        return completed.ordinal() == roundProgression.ordinal() - 1;
    }

    public Boolean getAckSubRound(String id, SubRound subRound) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        SubRound completed = userDocument.getSubRoundProgression();

        return completed.ordinal() == subRound.ordinal() - 1;
    }

    public JWTToken authenticate(LoginRequest loginRequest) {
        UserDocument user = userDocumentRepository.findById(loginRequest.teamName());

        if (user == null || !passwordEncoder.matches(loginRequest.password(), user.getPassword())) {
            throw new DuplicateCredentialsException("Invalid credentials!");
        }

        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isAdmin && user.isLoggedIn()) {
            throw new DuplicateCredentialsException("Already logged in! Each team can only log in once.");
        }

        Instant now = Instant.now();
        String scope = isAdmin ? "ROLE_ADMIN" : "ROLE_USER";

        JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder()
                .subject(user.getTeamName())
                .issuedAt(now)
                .claim("scope", scope);

        if (!isAdmin) {
            claimsBuilder.expiresAt(now.plus(60, ChronoUnit.MINUTES));
        }

        JwtClaimsSet claims = claimsBuilder.build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(() -> "RS256").build(), claims)
        ).getTokenValue();

        if (!isAdmin) {
            user.setLoggedIn(true);
            userDocumentRepository.save(user);
        }

        return new JWTToken(token);
    }
}
