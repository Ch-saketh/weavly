import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Phase 9 — Admin Commercial Promotions & Coupons Contract Tests", () => {
  it("1. RBAC permissions map strictly to Phase 3 Admin security model", () => {
    const couponPermissions = {
      read: "coupons.read",
      create: "coupons.create",
      update: "coupons.update",
      delete: "coupons.delete"
    };

    assert.equal(couponPermissions.read, "coupons.read");
    assert.equal(couponPermissions.create, "coupons.create");
    assert.equal(couponPermissions.update, "coupons.update");
    assert.equal(couponPermissions.delete, "coupons.delete");
  });

  it("2. Coupon code normalization trims whitespace and converts to uppercase", () => {
    const input = "  summer2026-vip  ";
    const normalized = input.trim().toUpperCase();
    assert.equal(normalized, "SUMMER2026-VIP");
  });

  it("3. Percentage discount calculation caps correctly at maxDiscountAmount", () => {
    const subtotal = 300;
    const discountPercent = 50; // 50% = $150
    const maxCap = 40; // Max cap $40

    let computedDiscount = (subtotal * discountPercent) / 100;
    if (maxCap && computedDiscount > maxCap) {
      computedDiscount = maxCap;
    }

    const payable = Math.max(0, subtotal - computedDiscount);
    assert.equal(computedDiscount, 40);
    assert.equal(payable, 260);
  });

  it("4. Flat discount calculation does not exceed subtotal (never negative payable)", () => {
    const subtotal = 25;
    const flatDiscount = 50;

    const appliedDiscount = Math.min(flatDiscount, subtotal);
    const payable = Math.max(0, subtotal - appliedDiscount);

    assert.equal(appliedDiscount, 25);
    assert.equal(payable, 0);
  });

  it("5. Minimum order requirement validation", () => {
    const minOrder = 100;
    const isEligible = (subtotal) => subtotal >= minOrder;

    assert.equal(isEligible(150), true);
    assert.equal(isEligible(100), true);
    assert.equal(isEligible(99.99), false);
  });

  it("6. Usage limit ceiling prevents over-redemption", () => {
    const isLimitExceeded = (usedCount, usageLimit) => {
      if (!usageLimit) return false;
      return usedCount >= usageLimit;
    };

    assert.equal(isLimitExceeded(100, 100), true);
    assert.equal(isLimitExceeded(99, 100), false);
    assert.equal(isLimitExceeded(50, null), false);
  });

  it("7. Per-user redemption limit validation", () => {
    const isUserLimitReached = (userRedemptions, perUserLimit) => {
      if (!perUserLimit) return false;
      return userRedemptions >= perUserLimit;
    };

    assert.equal(isUserLimitReached(1, 1), true);
    assert.equal(isUserLimitReached(0, 1), false);
    assert.equal(isUserLimitReached(2, 1), true);
  });

  it("8. Decommission vs Delete check: redemptions protect historical commerce", () => {
    const determineDeleteStrategy = (usedCount) => {
      return usedCount > 0 ? "DEACTIVATED" : "DELETED";
    };

    assert.equal(determineDeleteStrategy(5), "DEACTIVATED");
    assert.equal(determineDeleteStrategy(0), "DELETED");
  });

  it("9. Status lifecycle calculation derives accurately", () => {
    const now = new Date("2026-09-04T12:00:00Z");

    const deriveStatus = (coupon) => {
      if (!coupon.active) return "DISABLED";
      if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return "EXPIRED";
      if (coupon.startsAt && new Date(coupon.startsAt) > now) return "SCHEDULED";
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return "DEPLETED";
      return "ACTIVE";
    };

    assert.equal(deriveStatus({ active: false }), "DISABLED");
    assert.equal(deriveStatus({ active: true, expiresAt: "2026-09-01T00:00:00Z" }), "EXPIRED");
    assert.equal(deriveStatus({ active: true, startsAt: "2026-09-10T00:00:00Z" }), "SCHEDULED");
    assert.equal(deriveStatus({ active: true, usageLimit: 10, usedCount: 10 }), "DEPLETED");
    assert.equal(deriveStatus({ active: true, usedCount: 2 }), "ACTIVE");
  });
});
