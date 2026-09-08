package com.ieee.ite.assets;

import java.time.Instant;
import java.util.List;

public record Statistics(String teamName, RoundProgression roundProgression, SubRound subRound, Long timeTaken, List<String> teamMembers) {
}
