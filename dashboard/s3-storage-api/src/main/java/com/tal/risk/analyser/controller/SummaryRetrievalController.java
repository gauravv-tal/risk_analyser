package com.tal.risk.analyser.controller;

import com.tal.risk.analyser.model.ApiResponse;
import com.tal.risk.analyser.model.SummaryRetrieveRequest;
import com.tal.risk.analyser.model.SummaryStoreRequest;
import com.tal.risk.analyser.service.S3StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Slf4j
public class SummaryRetrievalController {

    @Autowired
    private S3StorageService s3StorageService;

    /**
     * Endpoint to retrieve summary data for a specific PR ID
     *
     * @param request The request object containing the PR ID
     * @return ResponseEntity with summary data
     */
    @PostMapping("/summary/store")
    public ResponseEntity<ApiResponse> storeSummary(@RequestBody SummaryStoreRequest request) {
        try {
            log.info("Received request to store summary data for PR: {}", request.getPrId());
            
            // Validate the request
            if (request.getPrId() == null || request.getPrId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("PR ID cannot be empty"));
            }
            
            // Store summary data in S3
            String s3Key = s3StorageService.storeSummaryData(request.getPrId(), request);
            
            // Create response
            Map<String, String> responseData = new HashMap<>();
            responseData.put("prId", request.getPrId());
            responseData.put("s3Key", s3Key);
            
            return ResponseEntity.ok(
                ApiResponse.success("Summary data stored successfully", responseData));
                
        } catch (IllegalArgumentException e) {
            log.error("Validation error storing summary data: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Validation error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error storing summary data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to store summary data: " + e.getMessage()));
        }
    }
    
    @PostMapping("/summary/retrieve")
    public ResponseEntity<ApiResponse> retrieveSummary(@RequestBody SummaryRetrieveRequest request) {
        try {
            log.info("Received request to retrieve summary data for PR: {}", request.getPrId());
            
            // Validate the request
            if (request.getPrId() == null || request.getPrId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("PR ID cannot be empty"));
            }
            
            // Retrieve summary data from S3
            Map<String, Object> summaryData = s3StorageService.getSummaryData(request.getPrId());
            
            // Create response
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("summaryData", summaryData);
            responseData.put("prId", request.getPrId());
            
            return ResponseEntity.ok(
                ApiResponse.success("Summary data retrieved successfully", responseData));
                
        } catch (IllegalArgumentException e) {
            log.error("Validation error retrieving summary data: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Validation error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error retrieving summary data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve summary data: " + e.getMessage()));
        }
    }
    
    /**
     * Alternative endpoint using GET method and path variable
     *
     * @param prId The PR ID path variable
     * @return ResponseEntity with summary data
     */
    @GetMapping("/summary/retrieve/{prId}")
    public ResponseEntity<ApiResponse> retrieveSummaryGet(@PathVariable String prId) {
        SummaryRetrieveRequest request = new SummaryRetrieveRequest();
        request.setPrId(prId);
        return retrieveSummary(request);
    }
}
