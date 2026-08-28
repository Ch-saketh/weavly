package com.luxzera.server.products;

import com.luxzera.server.products.controller.ProductController;
import com.luxzera.server.products.dto.response.ProductResponse;
import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.service.ProductCatalogImportService;
import com.luxzera.server.products.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProductCatalogTest {

    @Mock
    private ProductService productService;

    @Mock
    private ProductCatalogImportService productCatalogImportService;

    @InjectMocks
    private ProductController productController;

    private ProductResponse sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = ProductResponse.builder()
                .id(UUID.randomUUID())
                .productId("10009781")
                .name("SPYKAR Women Pink Alexa Super Skinny Fit High-Rise Clean Look Stretchable Cropped Jeans")
                .brand("spykar")
                .category("jeans")
                .audience(Audience.WOMEN)
                .gender("WOMEN")
                .basePrice(BigDecimal.valueOf(899))
                .salePrice(BigDecimal.valueOf(899))
                .imageUrl("http://assets.myntassets.com/sample.jpg")
                .productUrl("/product/10009781")
                .build();
    }

    @Test
    void testGetProductsPagination() {
        when(productService.getFilteredProducts(eq("Women"), isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of(sampleProduct), PageRequest.of(0, 50), 1));

        ResponseEntity<Map<String, Object>> response = productController.getProducts("Women", null, null, 50, 0, null, null);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        Map<String, Object> body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.get("total")).isEqualTo(1L);
        assertThat(body.get("products")).isInstanceOf(List.class);
        List<?> products = (List<?>) body.get("products");
        assertThat(products).hasSize(1);
    }

    @Test
    void testGetProductByIdOrProductId() {
        when(productService.getProductByIdOrProductId("10009781"))
                .thenReturn(sampleProduct);

        ResponseEntity<ProductResponse> response = productController.getProductById("10009781");

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getProductId()).isEqualTo("10009781");
        assertThat(response.getBody().getBrand()).isEqualTo("spykar");
    }

    @Test
    void testGetProductCount() {
        when(productService.getProductCount()).thenReturn(12465L);

        ResponseEntity<Map<String, Object>> response = productController.getProductCount();

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("count")).isEqualTo(12465L);
    }
}
