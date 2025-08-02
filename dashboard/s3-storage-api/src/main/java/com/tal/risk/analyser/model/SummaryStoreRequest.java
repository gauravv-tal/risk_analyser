package com.tal.risk.analyser.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryStoreRequest {
    private String prId;
    private Content content;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Content {
        private String githubUrl;
        private Map<String, Object> data; // Key-value pairs in JSON format
    }
}
