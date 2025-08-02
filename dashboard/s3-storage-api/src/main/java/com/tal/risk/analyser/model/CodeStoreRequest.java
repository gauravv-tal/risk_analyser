package com.tal.risk.analyser.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeStoreRequest {
    private String prId;
    private Content content;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Content {
        private String fileName; //.java
        private String testCases; // File content
    }
}
