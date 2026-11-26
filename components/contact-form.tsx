"use client";

import { useEffect, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { ALL_SERVICES } from "@/lib/services";
import { usePillar } from "./pillar-context";

const NOT_SURE = "not-sure";

export function ContactForm() {
  const { requestedService } = usePillar();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!requestedService) return;
    setNeeds([`${requestedService.pillarId}:${requestedService.serviceId}`]);
    setSubmitted(false);
  }, [requestedService]);

  // More than one service can be chosen. "Not sure yet" clears the rest, and
  // choosing a service again drops it.
  const chooseNeed = (key: string, checked: boolean) => {
    setNeeds((current) => {
      if (key === NOT_SURE) return checked ? [NOT_SURE] : [];
      const without = current.filter(
        (item) => item !== key && item !== NOT_SURE,
      );
      return checked ? [...without, key] : without;
    });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Add your name so we know who we are replying to.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Add an email address we can reply to.");
      return;
    }
    if (needs.length === 0) {
      setError("Select at least one service, or choose Not sure yet.");
      return;
    }

    setError(null);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="form-confirmation" role="status">
        <p className="p p--strong">
          Thanks, your inquiry is in. We&apos;ll reply within one business day.
        </p>
      </div>
    );
  }

  return (
    // Clarity masking: nothing typed into this form is recorded.
    <form
      className="form-grid"
      onSubmit={submit}
      noValidate
      data-clarity-mask="true"
      aria-label="Work with us"
    >
      <div className="form-grid__full stack-md">
        <TextInput
          label="Name"
          value={name}
          onChange={setName}
          isRequired
          htmlName="name"
          placeholder="Your name"
        />
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          isRequired
          htmlName="email"
          placeholder="you@company.com"
        />
      </div>

      <div className="form-grid__full">
        <p className="p p--strong">What do you need?</p>
        <p className="p">Select the services you want.</p>
        <div
          className="service-picker"
          role="group"
          aria-label="What do you need?"
        >
          {ALL_SERVICES.map(({ pillarId, service }) => {
            const key = `${pillarId}:${service.id}`;
            return (
              <CheckboxInput
                key={key}
                label={service.name}
                value={needs.includes(key)}
                onChange={(checked) => chooseNeed(key, checked)}
                htmlName={`need-${service.id}`}
              />
            );
          })}
          <CheckboxInput
            label="Not sure yet"
            value={needs.includes(NOT_SURE)}
            onChange={(checked) => chooseNeed(NOT_SURE, checked)}
            htmlName="need-not-sure"
          />
        </div>
      </div>

      <div className="form-grid__full">
        <TextArea
          label="Message"
          value={message}
          onChange={setMessage}
          isOptional
          rows={4}
          placeholder="Anything useful to know before we reply."
        />
      </div>

      <div className="form-grid__full stack-md">
        {error ? (
          <p className="p" style={{ color: "var(--color-error)" }} role="alert">
            {error}
          </p>
        ) : null}
        <div>
          <Button
            label="Send inquiry"
            variant="primary"
            type="submit"
            size="lg"
          />
        </div>
      </div>
    </form>
  );
}

export function ContactHeading() {
  return (
    <div className="section-head" style={{ marginBottom: 0 }}>
      <span className="eyebrow">Work with us</span>
      <h2 className="h2">Tell us what you need.</h2>
      <p className="p">
        No account, no newsletter. One form, and a person reads it.
      </p>
    </div>
  );
}
