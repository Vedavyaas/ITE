package com.ieee.ite.document;

import com.ieee.ite.assets.Role;
import com.ieee.ite.assets.RoundProgression;
import com.ieee.ite.assets.SubRound;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
public class UserDocument {
    private String id;
    private String teamName;
    private String password;
    private RoundProgression roundProgression;
    private SubRound subRoundProgression;
    private Instant latestRoundCompleteTime;
    private Role role;
    private boolean loggedIn;

    public UserDocument () {

    }

    public UserDocument(String id, String teamName, String password, Role role) {
        this.id = id;
        this.teamName = teamName;
        this.password = password;
        this.roundProgression = RoundProgression.YET_TO_START;
        this.subRoundProgression = SubRound.YET_TO_START;
        this.latestRoundCompleteTime = Instant.now();
        this.role = role;
        this.loggedIn = false;
    }

    @Id
    public String getId() {
        return id;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public RoundProgression getRoundProgression() {
        return roundProgression;
    }

    public void setRoundProgression(RoundProgression roundProgression) {
        this.roundProgression = roundProgression;
    }

    public SubRound getSubRoundProgression() {
        return subRoundProgression;
    }

    public void setSubRoundProgression(SubRound subRoundProgression) {
        this.subRoundProgression = subRoundProgression;
    }

    public Instant getLatestRoundCompleteTime() {
        return latestRoundCompleteTime;
    }

    public void setLatestRoundCompleteTime(Instant latestRoundCompleteTime) {
        this.latestRoundCompleteTime = latestRoundCompleteTime;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isLoggedIn() {
        return loggedIn;
    }

    public void setLoggedIn(boolean loggedIn) {
        this.loggedIn = loggedIn;
    }
}
