package com.tal.risk.analyser.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tal.risk.analyser.model.SummaryRetrieveRequest;
import com.tal.risk.analyser.model.SummaryStoreRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("s3-integration")
public class SummaryRetrievalIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private final String TEST_PR_ID = "TEST-SUMMARY-" + UUID.randomUUID().toString().substring(0, 8);
    private final String TEST_GITHUB_URL = "https://github.com/example/repo/pull/123";
    private final String TEST_SUMMARY_DATA = "This is test summary data for integration test";

    @BeforeEach
    public void setup() throws Exception {
        // Store summary data before test
        SummaryStoreRequest storeRequest = new SummaryStoreRequest();
        SummaryStoreRequest.Content content = new SummaryStoreRequest.Content();
        content.setGithubUrl(TEST_GITHUB_URL);
        
        // Create a Map for the data field
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("summary", TEST_SUMMARY_DATA);
        content.setData(dataMap);
        
        storeRequest.setPrId(TEST_PR_ID);
        storeRequest.setContent(content);

        // Store the summary data via API
        mockMvc.perform(post("/api/v1/summary/store")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));

        System.out.println("Setup complete. Test PR_ID: " + TEST_PR_ID);
    }

    @Test
    public void testRetrieveSummary() throws Exception {
        // Create retrieve request
        SummaryRetrieveRequest request = new SummaryRetrieveRequest();
        request.setPrId(TEST_PR_ID);

        // Retrieve summary data and verify response
        MvcResult retrieveResult = mockMvc.perform(post("/api/v1/summary/retrieve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Summary data retrieved successfully"))
                .andReturn();

        // Parse response and verify content
        String responseContent = retrieveResult.getResponse().getContentAsString();
        Map<String, Object> responseMap = objectMapper.readValue(responseContent, HashMap.class);
        Map<String, Object> dataMap = (Map<String, Object>) responseMap.get("data");
        Map<String, Object> summaryData = (Map<String, Object>) dataMap.get("summaryData");

        assertEquals(TEST_PR_ID, dataMap.get("prId"), "PR ID should match");
        assertEquals(TEST_GITHUB_URL, summaryData.get("githubUrl"), "GitHub URL should match");
        
        // Verify the data field, which is a Map
        Map<String, Object> dataSummaryMap = (Map<String, Object>) summaryData.get("data");
        assertEquals(TEST_SUMMARY_DATA, dataSummaryMap.get("summary"), "Summary data should match");

        System.out.println("Successfully retrieved summary data for PR_ID: " + TEST_PR_ID);
    }

    @AfterEach
    public void cleanup() {
        System.out.println("Test completed for PR_ID: " + TEST_PR_ID);
        // Cleanup code could be added here if needed
    }
}
