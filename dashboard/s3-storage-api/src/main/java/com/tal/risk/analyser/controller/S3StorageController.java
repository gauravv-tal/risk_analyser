package com.tal.risk.analyser.controller;

import com.tal.risk.analyser.model.ApiResponse;
import com.tal.risk.analyser.model.CodeStoreRequest;
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
public class S3StorageController {

    @Autowired
    private S3StorageService s3StorageService;

    /**
     * Endpoint to store code data in S3 bucket
     * 
     * @param prId Pull Request ID (path variable)
     * @param request Request body containing file name and code content
     * @return Response with status and stored file information
     */
    @PostMapping("/store/{prId}")
    public ResponseEntity<ApiResponse> storeCodeData(
            @PathVariable String prId,
            @RequestBody CodeStoreRequest request) {
        
        // Set PR ID from path variable if not provided in request
        if (request.getPrId() == null || request.getPrId().trim().isEmpty()) {
            request.setPrId(prId);
        }
        
        log.info("Received request to store code data for PR: {}, file: {}", 
                request.getPrId(), request.getContent() != null ? request.getContent().getFileName() : "null");
        
        try {
            // Validate request
            if (request.getPrId() == null || request.getPrId().trim().isEmpty()) {
                return new ResponseEntity<>(
                        ApiResponse.error("PR ID cannot be empty"), 
                        HttpStatus.BAD_REQUEST);
            }
            
            if (request.getContent() == null || request.getContent().getFileName() == null || 
                request.getContent().getFileName().trim().isEmpty() ||
                request.getContent().getTestCases() == null) {
                return new ResponseEntity<>(
                        ApiResponse.error("File name and test cases are required"), 
                        HttpStatus.BAD_REQUEST);
            }
            
            // Store the code data in S3
            String s3Key = s3StorageService.storeCodeData(request);
            
            // Create response with stored file information
            Map<String, String> responseData = new HashMap<>();
            responseData.put("prId", request.getPrId());
            responseData.put("fileName", request.getContent().getFileName());
            responseData.put("s3Key", s3Key);
            
            return new ResponseEntity<>(
                    ApiResponse.success("Code data stored successfully", responseData), 
                    HttpStatus.CREATED);
            
        } catch (Exception e) {
            log.error("Error processing store code data request for PR: " + request.getPrId(), e);
            return new ResponseEntity<>(
                    ApiResponse.error("Failed to store code data: " + e.getMessage()), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Endpoint to store code data in S3 bucket (without path variable)
     * 
     * @param request Request body containing PR ID, file name and test cases
     * @return Response with status and stored file information
     */
    @PostMapping("/store")
    public ResponseEntity<ApiResponse> storeCodeData(@RequestBody CodeStoreRequest request) {
        return storeCodeData(request.getPrId(), request);
    }
    
    /**
     * Endpoint to store summary data in S3 bucket
     * 
     * @param prId Pull Request ID (path variable)
     * @param request Request body containing github URL and key-value data
     * @return Response with status and stored file information
     */
    @PostMapping("/store/summary/{prId}")
    public ResponseEntity<ApiResponse> storeSummaryData(
            @PathVariable String prId,
            @RequestBody SummaryStoreRequest request) {
        
        log.info("Received request to store summary data for PR: {}", prId);
        
        try {
            // Store the summary data in S3
            String s3Key = s3StorageService.storeSummaryData(prId, request);
            
            // Create response with stored file information
            Map<String, String> responseData = new HashMap<>();
            responseData.put("prId", prId);
            responseData.put("s3Key", s3Key);
            
            return new ResponseEntity<>(
                    ApiResponse.success("Summary data stored successfully", responseData), 
                    HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("Validation error: " + e.getMessage());
            return new ResponseEntity<>(
                    ApiResponse.error(e.getMessage()), 
                    HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Error processing store summary data request: " + e.getMessage(), e);
            return new ResponseEntity<>(
                    ApiResponse.error("Failed to store summary data: " + e.getMessage()), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Health check endpoint
     * 
     * @return Simple response to verify service is running
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse> healthCheck() {
        return new ResponseEntity<>(
                ApiResponse.success("S3 Storage API is running"), 
                HttpStatus.OK);
    }
    
    /**
     * Endpoint to retrieve all code files for a specific PR ID
     * 
     * @param prId Pull Request ID
     * @return Response with status and code files
     */
    @GetMapping("/retrieve/{prId}")
    public ResponseEntity<ApiResponse> retrieveCodeFiles(@PathVariable String prId) {
        log.info("Received request to retrieve code files for PR: {}", prId);
        
        try {
            // Get all code files for the specified PR ID
            java.util.List<com.tal.risk.analyser.model.CodeFileResponse> files = 
                s3StorageService.getAllCodeFilesForPR(prId);
            
            // Create response with files
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("prId", prId);
            responseData.put("files", files);
            responseData.put("count", files.size());
            
            return new ResponseEntity<>(
                    ApiResponse.success("Code files retrieved successfully", responseData), 
                    HttpStatus.OK);
        } catch (java.util.NoSuchElementException e) {
            log.error("No files found for PR: {}", prId);
            return new ResponseEntity<>(
                    ApiResponse.error("No files found for PR: " + prId), 
                    HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("Error retrieving code files for PR: {}", prId, e);
            return new ResponseEntity<>(
                    ApiResponse.error("Failed to retrieve code files: " + e.getMessage()), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Endpoint to retrieve all code files for a specific PR ID (POST method)
     * 
     * @param request Request body containing PR ID
     * @return Response with status and code files
     */
    @PostMapping("/retrieve")
    public ResponseEntity<ApiResponse> retrieveCodeFilesPost(@RequestBody Map<String, String> request) {
        String prId = request.get("prId");
        if (prId == null || prId.trim().isEmpty()) {
            return new ResponseEntity<>(
                    ApiResponse.error("PR ID cannot be empty"), 
                    HttpStatus.BAD_REQUEST);
        }
        
        return retrieveCodeFiles(prId);
    }
}
