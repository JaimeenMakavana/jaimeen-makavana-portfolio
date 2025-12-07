"use client";

import React, { useState } from "react";
import { ContactHeader } from "../components/contact/ContactHeader";
import { ContactInfoSection } from "../components/contact/ContactInfoSection";
import { ContactForm } from "../components/contact/ContactForm";
import { FormState } from "../components/contact/constants";

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    message: "",
    intent: "project",
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormStateChange = (newState: Partial<FormState>) => {
    setFormState((prev) => ({ ...prev, ...newState }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      // Success - reset form and show success message
      setIsSuccess(true);
      setFormState({
        name: "",
        email: "",
        message: "",
        intent: "project",
      });

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8 pt-24 pb-32 md:px-28"
      style={{ backgroundColor: "var(--bg-canvas)" }}
    >
      <ContactHeader />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24">
        <ContactInfoSection activeField={activeField} />

        <ContactForm
          formState={formState}
          activeField={activeField}
          onFormStateChange={handleFormStateChange}
          onActiveFieldChange={setActiveField}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isSuccess={isSuccess}
          error={error}
        />
      </div>
    </div>
  );
}
