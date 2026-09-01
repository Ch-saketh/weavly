"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/modules/auth/store/useAuth";
import { isLoggedIn } from "@/shared/utils/token";
import {
  getMyRecommendations,
  generateUserRecommendations,
} from "@/modules/recommendations/services/recommendationService";

/**
 * Hook to retrieve and manage the user's latest Zera recommendation collection.
 * 
 * Rules:
 * - When unauthenticated: sets isEmpty=true, loading=false, DOES NOT make protected API calls.
 * - When authenticated: fetches GET /api/recommendations/my (read-only, does not trigger inference).
 * - Avoids duplicate calls on component re-renders.
 */
export function useZeraRecommendations() {
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  const fetchRecommendations = useCallback(async (occasion = null) => {
    setLoading(true);
    setError(null);
    try {
      if (isLoggedIn() || user) {
        const data = await getMyRecommendations(occasion);
        if (data && data.recommendations && data.recommendations.length > 0) {
          setCollection(data);
          setRecommendations(data.recommendations);
          return;
        }
      }
      // Guest or first-time user fallback: fetch curated benchmark Zyra recommendations
      const { getProductRecommendations } = await import("@/modules/recommendations/services/recommendationService");
      const publicRecs = await getProductRecommendations("10009781", 50);
      if (publicRecs && publicRecs.length > 0) {
        setCollection({
          generationId: "public-curated",
          productId: "10009781",
          modelVersion: "zyra-v1-p9",
          count: publicRecs.length,
          recommendations: publicRecs,
        });
        setRecommendations(publicRecs);
      } else {
        setCollection(null);
        setRecommendations([]);
      }
    } catch (err) {
      console.warn("Zera recommendation retrieval note:", err.message);
      setError(err.message);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchRecommendations();
    }
  }, [fetchRecommendations]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchRecommendations();
    };
    window.addEventListener("weavly:profileUpdated", handleProfileUpdate);
    window.addEventListener("weavly:fitDataUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("weavly:profileUpdated", handleProfileUpdate);
      window.removeEventListener("weavly:fitDataUpdated", handleProfileUpdate);
    };
  }, [fetchRecommendations]);

  const triggerGeneration = useCallback(
    async (params = {}, topK = 50) => {
      if (!isLoggedIn() && !user) return null;
      setLoading(true);
      setError(null);
      try {
        const data = await generateUserRecommendations(params, topK);
        setCollection(data);
        setRecommendations(data.recommendations || []);
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const isEmpty = !loading && (!recommendations || recommendations.length === 0);

  return {
    collection,
    recommendations,
    loading,
    error,
    isEmpty,
    refetch: () => fetchRecommendations(true),
    triggerGeneration,
  };
}
