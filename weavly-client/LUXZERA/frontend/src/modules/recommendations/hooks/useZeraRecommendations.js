"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/modules/auth/store/useAuth";
import { isLoggedIn } from "@/shared/utils/token";
import {
  getMyRecommendations,
  generateUserRecommendations,
  getOccasionRecommendations,
} from "@/modules/recommendations/services/recommendationService";

/**
 * Hook to retrieve and manage Zyra V2 recommendation collections across discovery surfaces.
 * 
 * Supports:
 * - Homepage personalization (inheriting user profile gender)
 * - Section-specific context (e.g. Women section -> gender: "Women", Men section -> gender: "Men")
 * - Occasion conditioning
 * - Pure Zyra V2 intelligence without mock data or random fallbacks
 *
 * @param {Object} [options]
 * @param {string} [options.gender] - Explicit section gender constraint ('Men' or 'Women')
 * @param {string} [options.occasion] - Target occasion ('casual', 'formal', 'festive', etc.)
 * @param {boolean} [options.autoFetch=true] - Whether to fetch automatically on mount/context change
 */
export function useZeraRecommendations(options = {}) {
  const { gender: explicitGender = null, occasion = null, autoFetch = true } = options || {};
  const { user } = useAuth();

  const [collection, setCollection] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine effective gender context
  const effectiveGender = (() => {
    if (explicitGender && typeof explicitGender === "string") {
      const g = explicitGender.trim().toLowerCase();
      if (g.startsWith("men") || g.startsWith("male")) return "Men";
      if (g.startsWith("wom") || g.startsWith("female")) return "Women";
    }
    const userGender = (user?.gender || user?.fitData?.gender || "").trim().toLowerCase();
    if (userGender.startsWith("men") || userGender.startsWith("male")) return "Men";
    if (userGender.startsWith("wom") || userGender.startsWith("female")) return "Women";
    return "Women";
  })();

  const fetchRecommendations = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      try {
        const targetOccasion = occasion || "casual";

        if (isLoggedIn() || user) {
          // If forceRefresh is requested, generate fresh personalized recommendations directly
          if (forceRefresh) {
            try {
              const freshData = await generateUserRecommendations(
                { occasion: targetOccasion, gender: effectiveGender, topK: 50 },
                50
              );
              if (freshData?.recommendations?.length > 0) {
                setCollection(freshData);
                setRecommendations(freshData.recommendations);
                return;
              }
            } catch (genErr) {
              console.warn("Personalized generation on refresh note:", genErr.message);
            }
          }

          // 1. Retrieve latest user recommendations for this gender/occasion context
          const data = await getMyRecommendations({ occasion: targetOccasion, gender: effectiveGender });
          if (data?.recommendations?.length > 0) {
            setCollection(data);
            setRecommendations(data.recommendations);
            return;
          }

          // 2. If no persisted recommendations yet, trigger initial generation
          try {
            const initialGen = await generateUserRecommendations(
              { occasion: targetOccasion, gender: effectiveGender, topK: 50 },
              50
            );
            if (initialGen?.recommendations?.length > 0) {
              setCollection(initialGen);
              setRecommendations(initialGen.recommendations);
              return;
            }
          } catch (initErr) {
            console.warn("Initial user recommendation generation notice:", initErr.message);
          }
        }

        // 3. Guest or public curation: fetch live occasion recommendations from Zyra V2 via proxy
        const publicRecs = await getOccasionRecommendations(targetOccasion, effectiveGender, 50);
        if (publicRecs && publicRecs.length > 0) {
          setCollection({
            generationId: `zyra-v2-${effectiveGender.toLowerCase()}-${targetOccasion}`,
            productId: null,
            modelVersion: "zyra-v2-beta",
            count: publicRecs.length,
            recommendations: publicRecs,
          });
          setRecommendations(publicRecs);
        } else {
          setCollection(null);
          setRecommendations([]);
        }
      } catch (err) {
        console.warn("Zyra V2 recommendation hook notice:", err.message);
        setError(err.message);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    },
    [user, effectiveGender, occasion]
  );

  // Trigger fetch when context changes (prevents cross-section/cross-user stale state)
  useEffect(() => {
    if (autoFetch) {
      fetchRecommendations(false);
    }
  }, [autoFetch, fetchRecommendations]);

  // Listen for profile or fitData updates to refresh recommendations
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchRecommendations(true);
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
      setLoading(true);
      setError(null);
      try {
        const generationParams = {
          gender: effectiveGender,
          occasion: occasion || "casual",
          ...params,
        };
        const data = await generateUserRecommendations(generationParams, topK);
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
    [effectiveGender, occasion]
  );

  const isEmpty = !loading && (!recommendations || recommendations.length === 0);

  return {
    collection,
    recommendations,
    loading,
    error,
    isEmpty,
    refetch: (force = true) => fetchRecommendations(force),
    triggerGeneration,
  };
}

