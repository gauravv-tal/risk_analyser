package com.tal.risk.analyser.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request model for retrieving summary data for a PR
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryRetrieveRequest {
    
    /**
     * The PR ID for which to retrieve summary data
     */
    private String prId;
}
