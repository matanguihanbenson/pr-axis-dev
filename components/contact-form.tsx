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
  const [need, setNeed] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!requestedService) return;
    setNeed(`${requestedService.pillarId}:${requestedService.serviceId}`);
    setSubmitted(false);
  }, [requestedService]);

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
    if (!need) {
      setError("Pick the one thing you need, or choose Not sure yet.");
      return;
    }

    setError(null);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="form-confirmation" role="status">
        <p className="p p--strong">
          Thanks — we&apos;ll get back to you within one business day.
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
        <p className="p">Pick exactly one. One thing is enough.</p>
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
                value={need === key}
                onChange={(checked) => setNeed(checked ? key : null)}
                htmlName={`need-${service.id}`}
              />
            );
          })}
          <CheckboxInput
            label="Not sure yet"
            value={need === NOT_SURE}
            onChange={(checked) => setNeed(checked ? NOT_SURE : null)}
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
            label="Let's build yours"
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
      <h2 className="h2">Tell us the one thing.</h2>
      <p className="p">
        No account, no newsletter. One form, and a person reads it.
      </p>
    </div>
  );
}
