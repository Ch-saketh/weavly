package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.ProductAdminCreateRequest;
import com.luxzera.server.admin.dto.request.ProductAdminInventoryUpdateRequest;
import com.luxzera.server.admin.dto.request.ProductAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.service.ProductAdminService;
import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.enums.ProductStatus;
import com.luxzera.server.products.service.ProductCatalogImportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class ProductAdminController {

    private final ProductAdminService productAdminService;
    private final ProductCatalogImportService catalogImportService;

    @GetMapping
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.read')")
    public ResponseEntity<Page<ProductAdminSummaryResponse>> listProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) ProductStatus status,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "audience", required = false) Audience audience,
            @RequestParam(value = "priceMin", required = false) BigDecimal priceMin,
            @RequestParam(value = "priceMax", required = false) BigDecimal priceMax,
            @RequestParam(value = "createdFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
            @RequestParam(value = "createdTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo,
            Pageable pageable
    ) {
        return ResponseEntity.ok(productAdminService.listProducts(
                search, status, category, brand, audience, priceMin, priceMax, createdFrom, createdTo, pageable
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.read')")
    public ResponseEntity<ProductAdminDetailResponse> getProductDetail(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(productAdminService.getProductDetail(id));
    }

    @PostMapping
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.create')")
    public ResponseEntity<ProductAdminDetailResponse> createProduct(
            @Valid @RequestBody ProductAdminCreateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(productAdminService.createProduct(request, actor, ip, userAgent));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.update')")
    public ResponseEntity<ProductAdminDetailResponse> updateProduct(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ProductAdminUpdateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(productAdminService.updateProduct(id, request, actor, ip, userAgent));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.publish')")
    public ResponseEntity<ProductAdminDetailResponse> publishProduct(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(productAdminService.publishProduct(id, actor, ip, userAgent));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.archive')")
    public ResponseEntity<ProductAdminDetailResponse> archiveProduct(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(productAdminService.archiveProduct(id, actor, ip, userAgent));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.delete')")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        productAdminService.deleteProduct(id, actor, ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "Product archived and deactivated safely."));
    }

    @GetMapping("/{id}/inventory")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.inventory')")
    public ResponseEntity<List<ProductVariantSummaryDto>> getInventory(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(productAdminService.getInventory(id));
    }

    @PatchMapping("/{id}/inventory")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.inventory')")
    public ResponseEntity<ProductVariantSummaryDto> updateInventory(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ProductAdminInventoryUpdateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(productAdminService.updateInventory(id, request, actor, ip, userAgent));
    }

    @GetMapping("/{id}/media")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.media')")
    public ResponseEntity<List<ProductAdminMediaResponse>> getMedia(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(productAdminService.getMedia(id));
    }

    @PostMapping("/{id}/media")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.media')")
    public ResponseEntity<ProductAdminMediaResponse> addMedia(
            @PathVariable("id") UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "setPrimary", defaultValue = "false") boolean setPrimary,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(productAdminService.addMedia(id, file, setPrimary, actor, ip, userAgent));
    }

    @DeleteMapping("/{id}/media")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.media')")
    public ResponseEntity<Map<String, String>> deleteMedia(
            @PathVariable("id") UUID id,
            @RequestParam("mediaUrl") String mediaUrl,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        productAdminService.deleteMedia(id, mediaUrl, actor, ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "Media asset removed from product gallery."));
    }

    @PostMapping("/import")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.create')")
    public ResponseEntity<Map<String, Object>> importCatalog(
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        int count = catalogImportService.importCatalogFromCsv();
        return ResponseEntity.ok(Map.of(
                "message", "Catalog import completed successfully",
                "count", count
        ));
    }

    @GetMapping("/export")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'products.read')")
    public ResponseEntity<byte[]> exportProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) ProductStatus status,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "audience", required = false) Audience audience,
            @RequestParam(value = "priceMin", required = false) BigDecimal priceMin,
            @RequestParam(value = "priceMax", required = false) BigDecimal priceMax,
            @RequestParam(value = "createdFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
            @RequestParam(value = "createdTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo
    ) {
        byte[] csv = productAdminService.exportProductsCsv(
                search, status, category, brand, audience, priceMin, priceMax, createdFrom, createdTo
        );
        String filename = "weavly-products-export-" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
