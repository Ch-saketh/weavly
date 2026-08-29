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
    if (!isLoggedIn() && !user) {
      setCollection(null);
      setRecommendations([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getMyRecommendations(occasion);
      setCollection(data);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.warn("Zera recommendation retrieval note:", err.message);
      setError(err.message);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!fetchedRef.current && (isLoggedIn() || user)) {
      fetchedRef.current = true;
      fetchRecommendations();
    }
  }, [fetchRecommendations, user]);

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
