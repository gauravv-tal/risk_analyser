package com.tal.risk.analyser.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tal.risk.analyser.model.SummaryRetrieveRequest;
import com.tal.risk.analyser.model.SummaryStoreRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("s3-integration")
public class SummaryApiE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    private final String TEST_PR_ID = "E2E-TEST-" + UUID.randomUUID().toString().substring(0, 8);
    private final String TEST_GITHUB_URL = "https://github.com/gauravv-tal/risk_analyser/pull/" + UUID.randomUUID().toString().substring(0, 4);
    
    // Complex test data that resembles real summary data
    private final Map<String, Object> TEST_SUMMARY_DATA = new HashMap<>();

    @BeforeEach
    public void setup() throws Exception {
        // Load AWS credentials from run.sh
        String runShContent = java.nio.file.Files.readString(
            java.nio.file.Paths.get(System.getProperty("user.dir") + "/run.sh"));
        
        java.util.regex.Pattern accessKeyPattern = 
            java.util.regex.Pattern.compile("AWS_ACCESS_KEY_ID=([A-Za-z0-9]+)");
        java.util.regex.Pattern secretKeyPattern = 
            java.util.regex.Pattern.compile("AWS_SECRET_ACCESS_KEY=([A-Za-z0-9/+]+)");
        java.util.regex.Pattern regionPattern = 
            java.util.regex.Pattern.compile("AWS_REGION=([a-z0-9-]+)");
            
        java.util.regex.Matcher accessKeyMatcher = accessKeyPattern.matcher(runShContent);
        java.util.regex.Matcher secretKeyMatcher = secretKeyPattern.matcher(runShContent);
        java.util.regex.Matcher regionMatcher = regionPattern.matcher(runShContent);
        
        if (accessKeyMatcher.find() && secretKeyMatcher.find()) {
            String accessKey = accessKeyMatcher.group(1);
            String secretKey = secretKeyMatcher.group(1);
            String region = regionMatcher.find() ? regionMatcher.group(1) : "ap-south-1";
            
            // Set AWS credentials as system properties
            System.setProperty("aws.accessKeyId", accessKey);
            System.setProperty("aws.secretKey", secretKey);
            System.setProperty("aws.region", region);
            
            System.out.println("AWS credentials loaded from run.sh for tests");
        } else {
            System.out.println("Could not find AWS credentials in run.sh");
        }
        
        System.out.println("Setting up E2E test with PR ID: " + TEST_PR_ID);
        System.out.println("Using S3 bucket: " + bucketName);
        
        // Create complex test data
        Map<String, Object> codeMetrics = new HashMap<>();
        codeMetrics.put("linesOfCode", 1250);
        codeMetrics.put("complexity", 42);
        codeMetrics.put("coverage", 87.5);
        
        Map<String, Object> securityIssues = new HashMap<>();
        securityIssues.put("critical", 2);
        securityIssues.put("high", 5);
        securityIssues.put("medium", 12);
        securityIssues.put("low", 8);
        
        Map<String, String> authorInfo = new HashMap<>();
        authorInfo.put("name", "John Doe");
        authorInfo.put("email", "john.doe@example.com");
        authorInfo.put("timestamp", "2025-08-02T10:15:30Z");
        
        TEST_SUMMARY_DATA.put("codeMetrics", codeMetrics);
        TEST_SUMMARY_DATA.put("securityIssues", securityIssues);
        TEST_SUMMARY_DATA.put("author", authorInfo);
        TEST_SUMMARY_DATA.put("analysisTimestamp", "2025-08-02T10:20:45Z");
        TEST_SUMMARY_DATA.put("description", "This is a comprehensive E2E test for the summary APIs");
    }

    @Test
    public void testStoreThenRetrieveSummaryE2E() throws Exception {
        // STEP 1: Store summary data to S3 via the API
        SummaryStoreRequest storeRequest = new SummaryStoreRequest();
        SummaryStoreRequest.Content content = new SummaryStoreRequest.Content();
        content.setGithubUrl(TEST_GITHUB_URL);
        content.setData(TEST_SUMMARY_DATA);
        
        storeRequest.setPrId(TEST_PR_ID);
        storeRequest.setContent(content);

        // Execute store request
        System.out.println("E2E Test - Storing summary data for PR: " + TEST_PR_ID);
        MvcResult storeResult = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/summary/store")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Summary data stored successfully"))
                .andExpect(jsonPath("$.data.prId").value(TEST_PR_ID))
                .andExpect(jsonPath("$.data.s3Key").value(TEST_PR_ID + "/Summary/summary.json"))
                .andReturn();

        String storeResponseString = storeResult.getResponse().getContentAsString();
        System.out.println("Store Response: " + storeResponseString);

        // STEP 2: Retrieve the summary data using POST endpoint
        SummaryRetrieveRequest retrieveRequest = new SummaryRetrieveRequest();
        retrieveRequest.setPrId(TEST_PR_ID);

        System.out.println("E2E Test - Retrieving summary data with POST for PR: " + TEST_PR_ID);
        MvcResult retrievePostResult = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/summary/retrieve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(retrieveRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Summary data retrieved successfully"))
                .andExpect(jsonPath("$.data.prId").value(TEST_PR_ID))
                .andReturn();

        String retrievePostResponseString = retrievePostResult.getResponse().getContentAsString();
        System.out.println("Retrieve POST Response: " + retrievePostResponseString);

        // Parse POST response and validate content
        Map<String, Object> retrievePostResponseMap = objectMapper.readValue(retrievePostResponseString, HashMap.class);
        Map<String, Object> postDataMap = (Map<String, Object>) retrievePostResponseMap.get("data");
        Map<String, Object> postSummaryData = (Map<String, Object>) postDataMap.get("summaryData");
        
        // Validate the retrieved data matches what we stored
        assertEquals(TEST_GITHUB_URL, postSummaryData.get("githubUrl"), "GitHub URL should match in POST response");
        validateSummaryData((Map<String, Object>) postSummaryData.get("data"));

        // STEP 3: Retrieve the summary data using GET endpoint
        System.out.println("E2E Test - Retrieving summary data with GET for PR: " + TEST_PR_ID);
        MvcResult retrieveGetResult = mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/summary/retrieve/{prId}", TEST_PR_ID)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Summary data retrieved successfully"))
                .andExpect(jsonPath("$.data.prId").value(TEST_PR_ID))
                .andReturn();

        String retrieveGetResponseString = retrieveGetResult.getResponse().getContentAsString();
        System.out.println("Retrieve GET Response: " + retrieveGetResponseString);

        // Parse GET response and validate content
        Map<String, Object> retrieveGetResponseMap = objectMapper.readValue(retrieveGetResponseString, HashMap.class);
        Map<String, Object> getDataMap = (Map<String, Object>) retrieveGetResponseMap.get("data");
        Map<String, Object> getSummaryData = (Map<String, Object>) getDataMap.get("summaryData");
        
        // Validate the retrieved data matches what we stored
        assertEquals(TEST_GITHUB_URL, getSummaryData.get("githubUrl"), "GitHub URL should match in GET response");
        validateSummaryData((Map<String, Object>) getSummaryData.get("data"));
        
        // STEP 4: Verify both GET and POST responses match
        assertEquals(retrievePostResponseString, retrieveGetResponseString, "POST and GET responses should be identical");
    }
    
    @Test
    public void testSummaryNonExistentPrId() throws Exception {
        // Test retrieving non-existent PR ID
        String nonExistentPrId = "NON-EXISTENT-" + UUID.randomUUID().toString();
        
        SummaryRetrieveRequest request = new SummaryRetrieveRequest();
        request.setPrId(nonExistentPrId);
        
        System.out.println("E2E Test - Testing error handling with non-existent PR ID: " + nonExistentPrId);
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/summary/retrieve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Failed to retrieve summary data: Summary data not found for PR ID: " + nonExistentPrId));
    }
    
    /**
     * Helper method to validate the retrieved summary data against the test data
     */
    private void validateSummaryData(Map<String, Object> retrievedData) {
        // Validate top-level properties
        assertEquals(TEST_SUMMARY_DATA.get("description"), retrievedData.get("description"), "Description should match");
        assertEquals(TEST_SUMMARY_DATA.get("analysisTimestamp"), retrievedData.get("analysisTimestamp"), "Analysis timestamp should match");
        
        // Validate nested code metrics
        Map<String, Object> expectedCodeMetrics = (Map<String, Object>) TEST_SUMMARY_DATA.get("codeMetrics");
        Map<String, Object> actualCodeMetrics = (Map<String, Object>) retrievedData.get("codeMetrics");
        assertEquals(expectedCodeMetrics.get("linesOfCode"), actualCodeMetrics.get("linesOfCode"), "Lines of code should match");
        assertEquals(expectedCodeMetrics.get("complexity"), actualCodeMetrics.get("complexity"), "Complexity should match");
        assertEquals(expectedCodeMetrics.get("coverage"), actualCodeMetrics.get("coverage"), "Coverage should match");
        
        // Validate nested security issues
        Map<String, Object> expectedSecurityIssues = (Map<String, Object>) TEST_SUMMARY_DATA.get("securityIssues");
        Map<String, Object> actualSecurityIssues = (Map<String, Object>) retrievedData.get("securityIssues");
        assertEquals(expectedSecurityIssues.get("critical"), actualSecurityIssues.get("critical"), "Critical issues should match");
        assertEquals(expectedSecurityIssues.get("high"), actualSecurityIssues.get("high"), "High issues should match");
        assertEquals(expectedSecurityIssues.get("medium"), actualSecurityIssues.get("medium"), "Medium issues should match");
        assertEquals(expectedSecurityIssues.get("low"), actualSecurityIssues.get("low"), "Low issues should match");
        
        // Validate author information
        Map<String, Object> expectedAuthor = (Map<String, Object>) TEST_SUMMARY_DATA.get("author");
        Map<String, Object> actualAuthor = (Map<String, Object>) retrievedData.get("author");
        assertEquals(expectedAuthor.get("name"), actualAuthor.get("name"), "Author name should match");
        assertEquals(expectedAuthor.get("email"), actualAuthor.get("email"), "Author email should match");
        assertEquals(expectedAuthor.get("timestamp"), actualAuthor.get("timestamp"), "Author timestamp should match");
    }

    @AfterEach
    public void cleanup() {
        System.out.println("E2E test completed for PR ID: " + TEST_PR_ID);
        // Note: We're not deleting the test data from S3 to allow for manual inspection if needed
        // In a real production system, you might want to clean up test data or use a dedicated test bucket
    }
}
