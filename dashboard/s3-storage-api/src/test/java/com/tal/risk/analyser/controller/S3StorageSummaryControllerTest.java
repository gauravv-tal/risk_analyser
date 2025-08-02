package com.tal.risk.analyser.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tal.risk.analyser.model.SummaryStoreRequest;
import com.tal.risk.analyser.service.S3StorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(S3StorageController.class)
public class S3StorageSummaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private S3StorageService s3StorageService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void storeSummaryDataSuccess() throws Exception {
        // Arrange
        String prId = "TEST-PR-123";
        SummaryStoreRequest request = new SummaryStoreRequest();
        SummaryStoreRequest.Content content = new SummaryStoreRequest.Content();
        content.setGithubUrl("https://github.com/test/repo");
        
        Map<String, Object> data = new HashMap<>();
        data.put("summary", "This is a test summary");
        data.put("riskScore", 0.75);
        data.put("complexityScore", 0.5);
        content.setData(data);
        
        request.setContent(content);
        
        String s3Key = prId + "/Summary/summary.json";
        when(s3StorageService.storeSummaryData(eq(prId), any(SummaryStoreRequest.class))).thenReturn(s3Key);

        // Act & Assert
        mockMvc.perform(post("/api/v1/store/summary/{prId}", prId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Summary data stored successfully"))
                .andExpect(jsonPath("$.data.prId").value(prId))
                .andExpect(jsonPath("$.data.s3Key").value(s3Key));
    }

    @Test
    public void storeSummaryDataBadRequest() throws Exception {
        // Arrange
        String prId = "TEST-PR-123";
        SummaryStoreRequest request = new SummaryStoreRequest();
        SummaryStoreRequest.Content content = new SummaryStoreRequest.Content();
        // Missing Github URL
        content.setData(new HashMap<>());
        request.setContent(content);

        when(s3StorageService.storeSummaryData(eq(prId), any(SummaryStoreRequest.class)))
                .thenThrow(new IllegalArgumentException("Github URL and summary data are required"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/store/summary/{prId}", prId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Github URL and summary data are required"));
    }
}
