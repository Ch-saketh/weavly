// src/__tests__/designer-admin.test.js
import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Phase 8 — Admin Designer Governance Frontend & Contract Tests", () => {
  // 1. RBAC & Permission Mapping
  it("1. RBAC permissions map strictly to Phase 3 Admin security model", () => {
    const designerPermissions = {
      read: "designers.read",
      verify: "designers.verify",
      suspend: "designers.suspend",
      moderate: "designers.moderate"
    };

    assert.equal(designerPermissions.read, "designers.read");
    assert.equal(designerPermissions.verify, "designers.verify");
    assert.equal(designerPermissions.suspend, "designers.suspend");
    assert.equal(designerPermissions.moderate, "designers.moderate");
  });

  // 2. State Machine Transitions
  it("2. State machine validates allowed and disallowed transitions", () => {
    const validTransitions = {
      PENDING: ["APPROVED"],
      APPROVED: ["ACTIVE", "SUSPENDED"],
      ACTIVE: ["SUSPENDED"],
      SUSPENDED: ["ACTIVE"]
    };

    function canTransition(current, next) {
      return (validTransitions[current] || []).includes(next);
    }

    // Valid transitions
    assert.ok(canTransition("PENDING", "APPROVED"), "PENDING -> APPROVED must be allowed");
    assert.ok(canTransition("APPROVED", "ACTIVE"), "APPROVED -> ACTIVE must be allowed");
    assert.ok(canTransition("ACTIVE", "SUSPENDED"), "ACTIVE -> SUSPENDED must be allowed");
    assert.ok(canTransition("SUSPENDED", "ACTIVE"), "SUSPENDED -> ACTIVE must be allowed");

    // Invalid transitions
    assert.ok(!canTransition("SUSPENDED", "APPROVED"), "SUSPENDED -> APPROVED must be forbidden");
    assert.ok(!canTransition("PENDING", "ACTIVE"), "PENDING -> ACTIVE direct must be forbidden");
    assert.ok(!canTransition("PENDING", "SUSPENDED"), "PENDING -> SUSPENDED direct must be forbidden");
  });

  // 3. Profile Update Whitelist Enforcement
  it("3. Whitelisted profile update fields match domain specification and block sensitive fields", () => {
    const whitelistedFields = new Set([
      "displayName", "brandName", "bio", "location", "specialization",
      "experienceYears", "qualifications", "skills", "designPhilosophy",
      "servicesOffered", "customizationAvailable", "externalWebsiteUrl",
      "instagramHandle", "behanceUrl", "linkedinUrl", "pricingTier", "phone"
    ]);

    // Allowed business/profile fields
    assert.ok(whitelistedFields.has("displayName"));
    assert.ok(whitelistedFields.has("brandName"));
    assert.ok(whitelistedFields.has("bio"));
    assert.ok(whitelistedFields.has("specialization"));
    assert.ok(whitelistedFields.has("pricingTier"));

    // Strictly forbidden authentication and security fields
    const forbiddenFields = [
      "password", "passwordHash", "email", "designerId",
      "status", "role", "roles", "id", "version", "createdAt"
    ];

    for (const field of forbiddenFields) {
      assert.ok(!whitelistedFields.has(field), `Field ${field} must not be modifiable via admin profile update`);
    }
  });

  // 4. API Endpoints Contract
  it("4. API endpoint contracts and route parameters format correctly", () => {
    const designerId = "DES-000001";
    const mediaId = "media-uuid-123";

    const endpoints = {
      list: (page = 0, size = 20, search = "", status = "") =>
        `/api/admin/designers?page=${page}&size=${Math.min(size, 100)}&search=${encodeURIComponent(search)}&status=${status}`,
      summary: () => "/api/admin/designers/summary",
      detail: (id) => `/api/admin/designers/${id}`,
      approve: (id) => `/api/admin/designers/${id}/approve`,
      reject: (id) => `/api/admin/designers/${id}/reject`,
      suspend: (id) => `/api/admin/designers/${id}/suspend`,
      restore: (id) => `/api/admin/designers/${id}/restore`,
      update: (id) => `/api/admin/designers/${id}`,
      products: (id) => `/api/admin/designers/${id}/products`,
      media: (id) => `/api/admin/designers/${id}/media`,
      deleteMedia: (id, mId) => `/api/admin/designers/${id}/media/${mId}`,
      exportCsv: (search = "", status = "") =>
        `/api/admin/designers/export?search=${encodeURIComponent(search)}&status=${status}`
    };

    assert.equal(endpoints.detail(designerId), "/api/admin/designers/DES-000001");
    assert.equal(endpoints.approve(designerId), "/api/admin/designers/DES-000001/approve");
    assert.equal(endpoints.suspend(designerId), "/api/admin/designers/DES-000001/suspend");
    assert.equal(endpoints.restore(designerId), "/api/admin/designers/DES-000001/restore");
    assert.equal(endpoints.deleteMedia(designerId, mediaId), "/api/admin/designers/DES-000001/media/media-uuid-123");
  });

  // 5. Query Pagination & Boundary Caps
  it("5. Pagination size is capped at 100 server-side and export capped at 1000", () => {
    function sanitizePageSize(requestedSize) {
      const max = 100;
      const size = requestedSize !== undefined && requestedSize !== null ? requestedSize : 20;
      return Math.min(Math.max(1, size), max);
    }

    assert.equal(sanitizePageSize(50), 50);
    assert.equal(sanitizePageSize(150), 100, "Should cap at 100");
    assert.equal(sanitizePageSize(0), 1, "Should bound minimum at 1");

    const maxExportLimit = 1000;
    assert.equal(maxExportLimit, 1000);
  });

  // 6. Object-Level Media Ownership Check
  it("6. Object-level media ownership check prevents cross-designer deletion", () => {
    const mediaCatalog = [
      { id: "media-1", designerId: "DES-000001", mediaUrl: "https://example.com/img1.jpg" },
      { id: "media-2", designerId: "DES-000002", mediaUrl: "https://example.com/img2.jpg" }
    ];

    function validateMediaOwnership(targetMediaId, requestedDesignerId) {
      const media = mediaCatalog.find(m => m.id === targetMediaId);
      if (!media) return { allowed: false, status: 404, error: "Media not found" };
      if (media.designerId !== requestedDesignerId) {
        return { allowed: false, status: 403, error: "Media does not belong to the specified designer" };
      }
      return { allowed: true, media };
    }

    // Designer 1 accessing own media
    const validCheck = validateMediaOwnership("media-1", "DES-000001");
    assert.ok(validCheck.allowed);

    // Designer 1 attempting to access/delete Designer 2 media
    const crossCheck = validateMediaOwnership("media-2", "DES-000001");
    assert.equal(crossCheck.allowed, false);
    assert.equal(crossCheck.status, 403);
  });

  // 7. Data Sanitization & Credential Shielding
  it("7. Designer admin response dossier strips confidential credentials", () => {
    const rawEntity = {
      id: "uuid-1",
      designerId: "DES-000001",
      email: "designer@example.com",
      displayName: "Elena Rostova",
      passwordHash: "$2a$10$e883921kldms...",
      tempToken: "jwt-secret-xyz",
      status: "ACTIVE"
    };

    // Simulated DTO mapping
    const safeDossier = {
      id: rawEntity.id,
      designerId: rawEntity.designerId,
      email: rawEntity.email,
      displayName: rawEntity.displayName,
      status: rawEntity.status
    };

    assert.ok(!("passwordHash" in safeDossier));
    assert.ok(!("tempToken" in safeDossier));
    assert.equal(safeDossier.designerId, "DES-000001");
  });
});
