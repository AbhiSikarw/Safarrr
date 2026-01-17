"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Cloud,
  Mountain,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface LocationSafety {
  id: string;
  location: string;
  description: string;
  overall_safety: number;
  safety_level: "SAFE" | "MODERATE" | "RISKY";
  weather_risk: "low" | "medium" | "high";
  terrain_risk: "low" | "medium" | "high";
  best_seasons: string[];
  warnings: string[];
}

export default function SafetyPage() {
  const [locations, setLocations] = useState<LocationSafety[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSafetyData = async () => {
      const { data, error } = await supabase
        .from("location_safety")
        .select("*")
        .order("overall_safety", { ascending: false });

      if (!error && data) {
        setLocations(data);
      }

      setLoading(false);
    };

    fetchSafetyData();
  }, []);

  const getSafetyColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getSafetyBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getRiskBadge = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading safety insights…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl sm:text-5xl mb-4">
            Location Safety Insights
          </h1>
          <p className="text-lg text-emerald-50 max-w-2xl mx-auto">
            Get comprehensive safety information about travel destinations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "SAFE", color: "emerald", count: locations.filter(l => l.safety_level === "SAFE").length },
            { label: "MODERATE", color: "amber", count: locations.filter(l => l.safety_level === "MODERATE").length },
            { label: "RISKY", color: "red", count: locations.filter(l => l.safety_level === "RISKY").length },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border p-6">
              <h3 className="text-gray-900 mb-2">{item.label}</h3>
              <p className={`text-3xl text-${item.color}-600`}>
                {item.count}
              </p>
            </div>
          ))}
        </div>

        {/* Locations */}
        <div className="space-y-6">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-xl border overflow-hidden"
            >
              <div className={`p-6 border-b ${getSafetyBg(location.overall_safety)}`}>
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-2xl text-gray-900">
                      {location.location}
                    </h2>
                    <p className="text-gray-600">{location.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-3xl ${getSafetyColor(location.overall_safety)}`}>
                      {location.overall_safety}
                    </span>
                    <span className="text-gray-500">/100</span>
                    <div className="mt-2 text-sm">
                      {location.safety_level}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border ${getRiskBadge(location.weather_risk)}`}>
                    <Cloud className="h-5 w-5 inline mr-2" />
                    Weather Risk: {location.weather_risk}
                  </div>
                  <div className={`p-4 rounded-lg border ${getRiskBadge(location.terrain_risk)}`}>
                    <Mountain className="h-5 w-5 inline mr-2" />
                    Terrain Risk: {location.terrain_risk}
                  </div>
                </div>

                <div>
                  <Calendar className="h-5 w-5 inline mr-2 text-emerald-600" />
                  Best Seasons:
                  <div className="mt-2 flex flex-wrap gap-2">
                    {location.best_seasons.map((season) => (
                      <span
                        key={season}
                        className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-sm"
                      >
                        {season}
                      </span>
                    ))}
                  </div>
                </div>

                {location.warnings.length > 0 && (
                  <div>
                    <AlertTriangle className="h-5 w-5 inline mr-2 text-amber-600" />
                    {location.warnings.map((warning, i) => (
                      <p key={i} className="text-sm text-gray-700 mt-1">
                        • {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-white rounded-xl border p-6 mt-8">
          <h2 className="text-xl mb-4">General Safety Tips</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Always inform someone about your travel plans",
              "Check weather forecasts before departure",
              "Carry emergency contact numbers",
              "Have comprehensive travel insurance",
            ].map((tip) => (
              <div key={tip} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
