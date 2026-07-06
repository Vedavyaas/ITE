package com.ieee.ite.assets;

import java.time.Instant;

public record Statistics(String teamName, RoundProgression roundProgression, SubRound subRound, Instant timeTaken) {
}
