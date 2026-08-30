package com.luxzera.server.products.search.service;

import com.luxzera.server.products.enums.Audience;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SearchQueryPreprocessorTest {

    private SearchQueryPreprocessor preprocessor;

    @BeforeEach
    void setUp() {
        preprocessor = new SearchQueryPreprocessor();
    }

    @Test
    void testProcess_BlackTshirt() {
        SearchQueryPreprocessor.ProcessedSearchQuery result = preprocessor.process("black tshirt");
        assertEquals("black tshirt", result.getNormalizedQuery());
        assertTrue(result.getTokens().contains("black"));
        assertTrue(result.getTokens().contains("tshirt"));
        assertTrue(result.getExpandedTokens().contains("t-shirt"));
    }

    @Test
    void testProcess_TypoCorrection() {
        SearchQueryPreprocessor.ProcessedSearchQuery result = preprocessor.process("blak tshrt");
        assertEquals("black tshirt", result.getNormalizedQuery());
        assertTrue(result.isHasTypoCorrection());
        assertTrue(result.getTokens().contains("black"));
        assertTrue(result.getTokens().contains("tshirt"));
    }

    @Test
    void testProcess_OversizedHoodieTypo() {
        SearchQueryPreprocessor.ProcessedSearchQuery result = preprocessor.process("oversizd hoodie");
        assertEquals("oversized hoodie", result.getNormalizedQuery());
        assertTrue(result.getTokens().contains("oversized"));
        assertTrue(result.getTokens().contains("hoodie"));
    }

    @Test
    void testProcess_ShoesTypo() {
        SearchQueryPreprocessor.ProcessedSearchQuery result = preprocessor.process("white snikers");
        assertEquals("white sneakers", result.getNormalizedQuery());
        assertTrue(result.getTokens().contains("white"));
        assertTrue(result.getTokens().contains("sneakers"));
    }

    @Test
    void testProcess_AudienceDetection() {
        SearchQueryPreprocessor.ProcessedSearchQuery result = preprocessor.process("men formal shrt");
        assertEquals(Audience.MEN, result.getDetectedAudience());
        assertTrue(result.getTokens().contains("shirt"));
        assertTrue(result.getTokens().contains("formal"));
    }

    @Test
    void testProcess_EmptyQuery() {
        SearchQueryPreprocessor.ProcessedSearchQuery result = preprocessor.process("   ");
        assertEquals("", result.getNormalizedQuery());
        assertTrue(result.getTokens().isEmpty());
    }
}
