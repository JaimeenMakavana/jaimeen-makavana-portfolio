"use client";

import { useState, useEffect } from "react";
import CareerTimelineV3 from "../components/CareerJourneyParallax";
import type { CareerMilestone } from "../components/CareerJourneyParallax";

export default function AboutPage() {
  const [milestones, setMilestones] = useState<CareerMilestone[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const res = await fetch("/api/about");
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setMilestones(json.data);
        } else {
          setMilestones([]);
        }
      } catch (error) {
        console.error("Failed to fetch about milestones:", error);
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  if (loading) {
    return (
      <div
        className="relative min-h-[60vh] flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-canvas)" }}
      >
        <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <CareerTimelineV3 milestones={milestones ?? undefined} />
    </div>
  );
}
