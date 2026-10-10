package com.ieee.ite.controller;

import com.ieee.ite.assets.RoundProgression;
import com.ieee.ite.assets.Statistics;
import com.ieee.ite.assets.SubRound;
import com.ieee.ite.assets.TeamCredentials;
import com.ieee.ite.config.JWTAuthenticationConfig;
import com.ieee.ite.service.UserControllerService;
import org.junit.jupiter.api.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserManagementController.class)
@Import(JWTAuthenticationConfig.class)
@TestMethodOrder(MethodOrderer.DisplayName.class)
public class UserManagementControllerStressTest {

    private static final Logger log = LoggerFactory.getLogger(UserManagementControllerStressTest.class);
    private static final int CONCURRENT_REQUESTS = 100;
    private static final long PID = ProcessHandle.current().pid();
    private static String JSTAT_BIN;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserControllerService userControllerService;

    @BeforeAll
    static void initJstat() {
        String javaHome = System.getProperty("java.home");
        Path path = Paths.get(javaHome, "bin", "jstat");
        if (Files.exists(path)) {
            JSTAT_BIN = path.toAbsolutePath().toString();
        } else {
            JSTAT_BIN = "jstat";
        }
        System.out.println("================================================================================");
        System.out.println(" JVM STRESS TESTING SUITE (100 SIMULTANEOUS REQUESTS PER ENDPOINT)");
        System.out.println(" Target PID: " + PID + " | jstat executable: " + JSTAT_BIN);
        System.out.println("================================================================================");
    }

    @BeforeEach
    void setupMockStubs() {
        // Stub all service methods with Mockito stubs
        when(userControllerService.createUserTeam(any(TeamCredentials.class)))
                .thenReturn("User created successfully!");
        when(userControllerService.destroyUserTeam(anyString()))
                .thenReturn("User account deleted!");
        when(userControllerService.getStats())
                .thenReturn(List.of(
                        new Statistics("AlphaTeam", RoundProgression.FIRST, SubRound.ONE, 1200L, List.of("Alice", "Bob"), Instant.now()),
                        new Statistics("BetaTeam", RoundProgression.SECOND, SubRound.TWO, 2500L, List.of("Charlie", "David"), Instant.now())
                ));
        when(userControllerService.changeAccess(anyString()))
                .thenReturn("Changed!");
        when(userControllerService.startMission(anyString()))
                .thenReturn("Mission started!");
        when(userControllerService.updateRound(anyString(), any(RoundProgression.class)))
                .thenReturn("Saved!");
        when(userControllerService.updateSubRound(anyString(), any(SubRound.class)))
                .thenReturn("Saved!");
        when(userControllerService.getAckRound(anyString(), any(RoundProgression.class)))
                .thenReturn(true);
        when(userControllerService.getAckSubRound(anyString(), any(SubRound.class)))
                .thenReturn(true);
        when(userControllerService.getRoundStatus(anyString()))
                .thenReturn(RoundProgression.FIRST);
        when(userControllerService.hasMissionStarted(anyString()))
                .thenReturn(true);
        when(userControllerService.getTeamMember(anyString()))
                .thenReturn(List.of("Alice", "Bob"));
    }

    // Helper method to build ADMIN JWT post-processor
    private org.springframework.test.web.servlet.request.RequestPostProcessor adminAuth() {
        return jwt().authorities(new SimpleGrantedAuthority("SCOPE_ROLE_ADMIN"))
                .jwt(b -> b.subject("adminUser"));
    }

    // Helper method to build USER JWT post-processor
    private org.springframework.test.web.servlet.request.RequestPostProcessor userAuth() {
        return jwt().authorities(new SimpleGrantedAuthority("SCOPE_ROLE_USER"))
                .jwt(b -> b.subject("team1"));
    }

    // Capture jstat sample
    private static JstatSnapshot takeJstatSample(String label) {
        try {
            Process process = new ProcessBuilder(JSTAT_BIN, "-gcutil", String.valueOf(PID)).start();
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append(System.lineSeparator());
                }
            }
            process.waitFor(2, TimeUnit.SECONDS);
            return new JstatSnapshot(label, sb.toString().trim());
        } catch (Exception e) {
            return new JstatSnapshot(label, "Unable to capture jstat: " + e.getMessage());
        }
    }

    // Functional interface for producing a request builder per concurrent thread
    @FunctionalInterface
    interface RequestSupplier {
        MockHttpServletRequestBuilder getRequest(int index) throws Exception;
    }

    // Execute 100 simultaneous requests and sample jstat metrics
    private void executeStressTest(String endpointName, RequestSupplier requestSupplier) throws Exception {
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println(">>> STRESS TESTING ENDPOINT: " + endpointName);
        System.out.println(">>> Firing " + CONCURRENT_REQUESTS + " simultaneous requests...");

        JstatSnapshot beforeSnapshot = takeJstatSample("PRE-STRESS (" + endpointName + ")");

        ExecutorService executor = Executors.newFixedThreadPool(CONCURRENT_REQUESTS);
        CountDownLatch startGun = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(CONCURRENT_REQUESTS);

        AtomicInteger successCounter = new AtomicInteger(0);
        AtomicInteger failureCounter = new AtomicInteger(0);
        List<Long> latenciesMillis = Collections.synchronizedList(new ArrayList<>(CONCURRENT_REQUESTS));

        for (int i = 0; i < CONCURRENT_REQUESTS; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    MockHttpServletRequestBuilder requestBuilder = requestSupplier.getRequest(index);
                    // Wait at the starting gate for all 100 threads to align
                    startGun.await();

                    long startNs = System.nanoTime();
                    ResultActions result = mockMvc.perform(requestBuilder);
                    long durationNs = System.nanoTime() - startNs;

                    int statusCode = result.andReturn().getResponse().getStatus();
                    if (statusCode >= 200 && statusCode < 300) {
                        successCounter.incrementAndGet();
                        latenciesMillis.add(TimeUnit.NANOSECONDS.toMillis(durationNs));
                    } else {
                        failureCounter.incrementAndGet();
                        log.error("Request #{} failed with status: {}", index, statusCode);
                    }
                } catch (Exception e) {
                    failureCounter.incrementAndGet();
                    log.error("Request #{} threw exception: {}", index, e.getMessage());
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        long overallStartNs = System.nanoTime();
        // Fire all 100 requests simultaneously
        startGun.countDown();

        boolean completedInTime = finishLatch.await(30, TimeUnit.SECONDS);
        long totalElapsedMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - overallStartNs);
        executor.shutdown();

        JstatSnapshot afterSnapshot = takeJstatSample("POST-STRESS (" + endpointName + ")");

        // Calculate latency percentiles
        List<Long> sortedLatencies = new ArrayList<>(latenciesMillis);
        Collections.sort(sortedLatencies);
        long minMs = sortedLatencies.isEmpty() ? 0 : sortedLatencies.get(0);
        long maxMs = sortedLatencies.isEmpty() ? 0 : sortedLatencies.get(sortedLatencies.size() - 1);
        double avgMs = sortedLatencies.isEmpty() ? 0 : sortedLatencies.stream().mapToLong(Long::longValue).average().orElse(0.0);
        long p50Ms = getPercentile(sortedLatencies, 50);
        long p95Ms = getPercentile(sortedLatencies, 95);
        long p99Ms = getPercentile(sortedLatencies, 99);
        double throughput = totalElapsedMs > 0 ? (successCounter.get() * 1000.0) / totalElapsedMs : 0;

        // Print Stress Metrics
        System.out.printf("  Completed in Time : %s (Total wall-clock: %d ms)%n", completedInTime, totalElapsedMs);
        System.out.printf("  Successful (2xx)  : %d / %d%n", successCounter.get(), CONCURRENT_REQUESTS);
        System.out.printf("  Failed Requests   : %d%n", failureCounter.get());
        System.out.printf("  Throughput        : %.2f req/sec%n", throughput);
        System.out.printf("  Latency (ms)      : Min: %d | Avg: %.2f | P50: %d | P95: %d | P99: %d | Max: %d%n",
                minMs, avgMs, p50Ms, p95Ms, p99Ms, maxMs);

        // Print jstat sampling
        System.out.println("\n  [jstat -gcutil Metric Sampling]");
        System.out.println("  -- Before Stress (PID " + PID + "):");
        System.out.println("     " + beforeSnapshot.rawOutput.replace("\n", "\n     "));
        System.out.println("  -- After Stress (PID " + PID + "):");
        System.out.println("     " + afterSnapshot.rawOutput.replace("\n", "\n     "));
        System.out.println("--------------------------------------------------------------------------------");

        assertEquals(CONCURRENT_REQUESTS, successCounter.get(), "Expected all 100 requests to succeed!");
        assertEquals(0, failureCounter.get(), "Expected 0 failures during stress test!");
    }

    private static long getPercentile(List<Long> sortedList, double percentile) {
        if (sortedList.isEmpty()) return 0;
        int index = (int) Math.ceil((percentile / 100.0) * sortedList.size()) - 1;
        return sortedList.get(Math.max(0, Math.min(index, sortedList.size() - 1)));
    }

    // -------------------------------------------------------------------------
    // 1. POST /user/create/account (ADMIN)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("01. POST /user/create/account - 100 simultaneous requests")
    void stressTestCreateTeam() throws Exception {
        executeStressTest("POST /user/create/account", index -> {
            String json = String.format("{\"teamName\":\"team_%d\",\"password\":\"pass123\",\"teamMembers\":[\"memA_%d\",\"memB_%d\"]}",
                    index, index, index);
            return post("/user/create/account")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .with(adminAuth());
        });
    }

    // -------------------------------------------------------------------------
    // 2. DELETE /user/delete/account (ADMIN)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("02. DELETE /user/delete/account - 100 simultaneous requests")
    void stressTestDeleteTeam() throws Exception {
        executeStressTest("DELETE /user/delete/account", index ->
                delete("/user/delete/account")
                        .param("id", "team_" + index)
                        .with(adminAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 3. GET /get/statistics (ADMIN)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("03. GET /get/statistics - 100 simultaneous requests")
    void stressTestGetStats() throws Exception {
        executeStressTest("GET /get/statistics", index ->
                get("/get/statistics")
                        .with(adminAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 4. PUT /update/startMission (USER)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("04. PUT /update/startMission - 100 simultaneous requests")
    void stressTestStartMission() throws Exception {
        executeStressTest("PUT /update/startMission", index ->
                put("/update/startMission")
                        .with(userAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 5. PUT /update/round/stats (USER)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("05. PUT /update/round/stats - 100 simultaneous requests")
    void stressTestUpdateRoundStats() throws Exception {
        executeStressTest("PUT /update/round/stats", index ->
                put("/update/round/stats")
                        .param("roundProgression", "FIRST")
                        .with(userAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 6. PUT /update/subround/stats (USER)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("06. PUT /update/subround/stats - 100 simultaneous requests")
    void stressTestUpdateSubRoundStats() throws Exception {
        executeStressTest("PUT /update/subround/stats", index ->
                put("/update/subround/stats")
                        .param("subRound", "ONE")
                        .with(userAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 7. GET /get/ack/nextRound (USER)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("07. GET /get/ack/nextRound - 100 simultaneous requests")
    void stressTestGetAckRound() throws Exception {
        executeStressTest("GET /get/ack/nextRound", index ->
                get("/get/ack/nextRound")
                        .param("roundProgression", "FIRST")
                        .with(userAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 8. GET /get/ack/nextSubRound (USER)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("08. GET /get/ack/nextSubRound - 100 simultaneous requests")
    void stressTestGetAckSubRound() throws Exception {
        executeStressTest("GET /get/ack/nextSubRound", index ->
                get("/get/ack/nextSubRound")
                        .param("subRound", "ONE")
                        .with(userAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 9. GET /get/round/detail (USER)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("09. GET /get/round/detail - 100 simultaneous requests")
    void stressTestGetRoundDetail() throws Exception {
        executeStressTest("GET /get/round/detail", index ->
                get("/get/round/detail")
                        .with(userAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 10. GET /get/mission/started (USER)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("10. GET /get/mission/started - 100 simultaneous requests")
    void stressTestGetMissionStarted() throws Exception {
        executeStressTest("GET /get/mission/started", index ->
                get("/get/mission/started")
                        .with(userAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 11. GET /get/team/members (USER)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("11. GET /get/team/members - 100 simultaneous requests")
    void stressTestGetTeamMembers() throws Exception {
        executeStressTest("GET /get/team/members", index ->
                get("/get/team/members")
                        .with(userAuth())
        );
    }

    // -------------------------------------------------------------------------
    // 12. PUT /team/isLogged/change (ADMIN)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("12. PUT /team/isLogged/change - 100 simultaneous requests")
    void stressTestChangeAccess() throws Exception {
        executeStressTest("PUT /team/isLogged/change", index ->
                put("/team/isLogged/change")
                        .param("teamId", "team_" + index)
                        .with(adminAuth())
        );
    }

    // Record class for jstat snapshot
    private static class JstatSnapshot {
        final String label;
        final String rawOutput;

        JstatSnapshot(String label, String rawOutput) {
            this.label = label;
            this.rawOutput = rawOutput;
        }
    }
}
