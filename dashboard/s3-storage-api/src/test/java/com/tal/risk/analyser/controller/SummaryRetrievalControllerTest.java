package com.tal.risk.analyser.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tal.risk.analyser.model.SummaryRetrieveRequest;
import com.tal.risk.analyser.service.S3StorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SummaryRetrievalController.class)
public class SummaryRetrievalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private S3StorageService s3StorageService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testRetrieveSummary() throws Exception {
        // Prepare test data
        String prId = "TEST-PR-123";
        SummaryRetrieveRequest request = new SummaryRetrieveRequest();
        request.setPrId(prId);

        // Mock S3StorageService response
        Map<String, Object> mockSummaryData = new HashMap<>();
        mockSummaryData.put("githubUrl", "https://github.com/example/repo/pull/123");
        mockSummaryData.put("data", "This is test summary data");
        
        when(s3StorageService.getSummaryData(prId)).thenReturn(mockSummaryData);

        // Test POST endpoint
        mockMvc.perform(post("/api/v1/summary/retrieve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Summary data retrieved successfully"))
                .andExpect(jsonPath("$.data.prId").value(prId))
                .andExpect(jsonPath("$.data.summaryData.githubUrl").value("https://github.com/example/repo/pull/123"))
                .andExpect(jsonPath("$.data.summaryData.data").value("This is test summary data"));

        // Test GET endpoint
        mockMvc.perform(get("/api/v1/summary/retrieve/{prId}", prId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Summary data retrieved successfully"))
                .andExpect(jsonPath("$.data.prId").value(prId))
                .andExpect(jsonPath("$.data.summaryData.githubUrl").value("https://github.com/example/repo/pull/123"))
                .andExpect(jsonPath("$.data.summaryData.data").value("This is test summary data"));
    }

    @Test
    public void testRetrieveSummary_EmptyPrId() throws Exception {
        // Prepare test data with empty PR ID
        SummaryRetrieveRequest request = new SummaryRetrieveRequest();
        request.setPrId("");

        // Test POST endpoint with empty PR ID
        mockMvc.perform(post("/api/v1/summary/retrieve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("PR ID cannot be empty"));
    }

    @Test
    public void testRetrieveSummary_SummaryNotFound() throws Exception {
        // Prepare test data
        String prId = "NON-EXISTENT-PR";
        SummaryRetrieveRequest request = new SummaryRetrieveRequest();
        request.setPrId(prId);

        // Mock service to throw exception
        when(s3StorageService.getSummaryData(anyString())).thenThrow(new RuntimeException("Summary data not found for PR ID: " + prId));

        // Test POST endpoint with non-existent PR ID
        mockMvc.perform(post("/api/v1/summary/retrieve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Failed to retrieve summary data: Summary data not found for PR ID: " + prId));
    }
}
