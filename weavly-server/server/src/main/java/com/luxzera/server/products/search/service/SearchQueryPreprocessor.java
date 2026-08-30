package com.luxzera.server.products.search.service;

import com.luxzera.server.products.enums.Audience;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;

@Component
public class SearchQueryPreprocessor {

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-zA-Z0-9\\s]");
    private static final Pattern MULTIPLE_SPACES = Pattern.compile("\\s+");

    // Common fashion stop words that don't help keyword matching
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "in", "on", "at", "for", "with", "and", "or", "of", "to", "by", "from", "is", "it"
    );

    // Fashion typo corrections & spelling normalizations
    private static final Map<String, String> TYPO_DICTIONARY = new HashMap<>();

    // Fashion synonyms & expansion dictionary (e.g. tee -> tshirt, sneakers -> shoes)
    private static final Map<String, List<String>> SYNONYM_DICTIONARY = new HashMap<>();

    static {
        // Typo mappings
        TYPO_DICTIONARY.put("blak", "black");
        TYPO_DICTIONARY.put("wite", "white");
        TYPO_DICTIONARY.put("wht", "white");
        TYPO_DICTIONARY.put("gry", "grey");
        TYPO_DICTIONARY.put("grn", "green");
        TYPO_DICTIONARY.put("tshrt", "tshirt");
        TYPO_DICTIONARY.put("tshirts", "tshirt");
        TYPO_DICTIONARY.put("t-shirt", "tshirt");
        TYPO_DICTIONARY.put("t-shirts", "tshirt");
        TYPO_DICTIONARY.put("shrt", "shirt");
        TYPO_DICTIONARY.put("shrts", "shirt");
        TYPO_DICTIONARY.put("shirts", "shirt");
        TYPO_DICTIONARY.put("oversizd", "oversized");
        TYPO_DICTIONARY.put("ovrsized", "oversized");
        TYPO_DICTIONARY.put("snikers", "sneakers");
        TYPO_DICTIONARY.put("sneaker", "sneakers");
        TYPO_DICTIONARY.put("shooes", "shoes");
        TYPO_DICTIONARY.put("shooe", "shoes");
        TYPO_DICTIONARY.put("shoe", "shoes");
        TYPO_DICTIONARY.put("swetshirt", "sweatshirt");
        TYPO_DICTIONARY.put("sweatshrt", "sweatshirt");
        TYPO_DICTIONARY.put("hoddie", "hoodie");
        TYPO_DICTIONARY.put("hoodies", "hoodie");
        TYPO_DICTIONARY.put("jacket", "jacket");
        TYPO_DICTIONARY.put("jackets", "jacket");
        TYPO_DICTIONARY.put("jcket", "jacket");
        TYPO_DICTIONARY.put("trouser", "trousers");
        TYPO_DICTIONARY.put("trousrs", "trousers");
        TYPO_DICTIONARY.put("pant", "pants");
        TYPO_DICTIONARY.put("pnts", "pants");
        TYPO_DICTIONARY.put("jean", "jeans");
        TYPO_DICTIONARY.put("jens", "jeans");
        TYPO_DICTIONARY.put("dres", "dress");
        TYPO_DICTIONARY.put("dresses", "dress");
        TYPO_DICTIONARY.put("kurti", "kurta");
        TYPO_DICTIONARY.put("kurtas", "kurta");
        TYPO_DICTIONARY.put("loafers", "loafer");
        TYPO_DICTIONARY.put("loafr", "loafer");
        TYPO_DICTIONARY.put("casuals", "casual");
        TYPO_DICTIONARY.put("formals", "formal");

        // Synonyms
        SYNONYM_DICTIONARY.put("tshirt", List.of("t-shirt", "tshirt", "tee", "shirt", "polo"));
        SYNONYM_DICTIONARY.put("tee", List.of("t-shirt", "tshirt", "tee"));
        SYNONYM_DICTIONARY.put("shirt", List.of("shirt", "t-shirt", "tshirt"));
        SYNONYM_DICTIONARY.put("sneakers", List.of("sneakers", "shoes", "shoe", "footwear", "trainers"));
        SYNONYM_DICTIONARY.put("shoes", List.of("shoes", "sneakers", "footwear", "boots", "loafers"));
        SYNONYM_DICTIONARY.put("pants", List.of("pants", "trousers", "trousers", "jeans", "chinos", "joggers"));
        SYNONYM_DICTIONARY.put("trousers", List.of("trousers", "pants", "chinos"));
        SYNONYM_DICTIONARY.put("hoodie", List.of("hoodie", "sweatshirt", "jacket", "fleece"));
        SYNONYM_DICTIONARY.put("jacket", List.of("jacket", "blazer", "coat", "outerwear", "suit"));
        SYNONYM_DICTIONARY.put("blazer", List.of("blazer", "suit", "jacket"));
        SYNONYM_DICTIONARY.put("dress", List.of("dress", "gown", "frock", "kurta"));
        SYNONYM_DICTIONARY.put("kurta", List.of("kurta", "anarkali", "suit", "kurti"));
    }

    public ProcessedSearchQuery process(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return ProcessedSearchQuery.builder()
                    .rawQuery("")
                    .normalizedQuery("")
                    .tokens(List.of())
                    .expandedTokens(List.of())
                    .build();
        }

        // 1. Sanitize & Lowercase
        String cleaned = NON_ALPHANUMERIC.matcher(rawQuery.toLowerCase().trim()).replaceAll(" ");
        cleaned = MULTIPLE_SPACES.matcher(cleaned).replaceAll(" ").trim();

        if (cleaned.isBlank()) {
            return ProcessedSearchQuery.builder()
                    .rawQuery(rawQuery)
                    .normalizedQuery("")
                    .tokens(List.of())
                    .expandedTokens(List.of())
                    .build();
        }

        // 2. Tokenize & Typo Correct
        String[] rawTokens = cleaned.split(" ");
        List<String> normalizedTokens = new ArrayList<>();
        List<String> expandedTokens = new ArrayList<>();
        Audience detectedAudience = null;

        for (String t : rawTokens) {
            if (STOP_WORDS.contains(t) && rawTokens.length > 1) {
                continue;
            }

            // Check audience intent
            if (detectedAudience == null) {
                if (t.equals("men") || t.equals("man") || t.equals("male") || t.equals("mens") || t.equals("boy") || t.equals("boys")) {
                    detectedAudience = Audience.MEN;
                } else if (t.equals("women") || t.equals("woman") || t.equals("female") || t.equals("womens") || t.equals("girl") || t.equals("girls") || t.equals("ladies")) {
                    detectedAudience = Audience.WOMEN;
                } else if (t.equals("kids") || t.equals("kid") || t.equals("child") || t.equals("children")) {
                    detectedAudience = Audience.KIDS;
                } else if (t.equals("unisex")) {
                    detectedAudience = Audience.UNISEX;
                }
            }

            // Correct typos
            String corrected = TYPO_DICTIONARY.getOrDefault(t, t);
            normalizedTokens.add(corrected);
            expandedTokens.add(corrected);

            // Add synonyms if available
            List<String> synonyms = SYNONYM_DICTIONARY.get(corrected);
            if (synonyms != null) {
                for (String syn : synonyms) {
                    if (!expandedTokens.contains(syn)) {
                        expandedTokens.add(syn);
                    }
                }
            }
        }

        String normalizedQuery = String.join(" ", normalizedTokens);

        return ProcessedSearchQuery.builder()
                .rawQuery(rawQuery.trim())
                .normalizedQuery(normalizedQuery)
                .tokens(normalizedTokens)
                .expandedTokens(expandedTokens)
                .detectedAudience(detectedAudience)
                .hasTypoCorrection(!cleaned.equals(normalizedQuery))
                .build();
    }

    @lombok.Getter
    @lombok.Builder
    public static class ProcessedSearchQuery {
        private String rawQuery;
        private String normalizedQuery;
        private List<String> tokens;
        private List<String> expandedTokens;
        private Audience detectedAudience;
        private boolean hasTypoCorrection;
    }
}
