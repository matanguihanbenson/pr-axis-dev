"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@astryxdesign/core/Button";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import {
  PACKAGES,
  addOnKey,
  findPackage,
  formatAddOnPrice,
  packageKey,
  packageSaving,
} from "@/lib/packages";
import { ESTIMATE_SERVICES } from "@/lib/estimate-helpers";
import { PILLARS, formatMoney, serviceKey } from "@/lib/services";
import { buildQuote } from "@/lib/quote";
import { Estimate } from "./estimate";
import { usePillar } from "./pillar-context";

const NOT_SURE = "not-sure";

/**
 * Reads ?package= and ?services= after hydration and on client-side navigation,
 * so a link from the pricing cards, a demo page, or Ask Marcus works from the
 * same page as well as from another route. It lives in its own component
 * because useSearchParams needs a Suspense boundary on a statically rendered
 * page. It is mounted before the form fields on purpose: on a fresh load the
 * browser jumps to #contact before React hydrates.
 */
function StartFromQuery({
  onPackage,
  onServices,
}: {
  onPackage: (slug: string) => void;
  onServices: (keys: string[]) => void;
}) {
  const params = useSearchParams();
  const slug = params.get("package");
  const services = params.get("services");

  useEffect(() => {
    if (slug && findPackage(slug)) {
      onPackage(slug);
      return;
    }
    if (!services) return;
    const keys = services
      .split(",")
      .map((key) => key.trim())
      .filter((key) =>
        ESTIMATE_SERVICES.some((service) => service.key === key),
      );
    if (keys.length > 0) onServices([...new Set(keys)]);
  }, [slug, services, onPackage, onServices]);

  return null;
}

export function ContactForm() {
  const { requestedService } = usePillar();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [choice, setChoice] = useState<string>(NOT_SURE);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const packageSlug = choice === NOT_SURE ? null : choice;
  const selectedPackage = packageSlug ? findPackage(packageSlug) : undefined;

  useEffect(() => {
    if (!requestedService) return;
    setServices([
      serviceKey(requestedService.pillarId, requestedService.serviceId),
    ]);
    setSubmitted(false);
  }, [requestedService]);

  // A package link replaces the current choices: one clear starting point.
  const startFromPackage = useCallback((slug: string) => {
    setChoice(slug);
    setServices([]);
    setAddOns([]);
    setSubmitted(false);
  }, []);

  // A service link does the same, for a project that fits no package.
  const startFromServices = useCallback((keys: string[]) => {
    setChoice(NOT_SURE);
    setServices(keys);
    setAddOns([]);
    setSubmitted(false);
  }, []);

  const choosePackage = (value: string) => {
    setChoice(value);
    // Add-ons belong to a package, so a different package starts clean.
    setAddOns([]);
  };

  const toggleService = (key: string, checked: boolean) => {
    setServices((current) =>
      checked
        ? [...current.filter((item) => item !== key), key]
        : current.filter((item) => item !== key),
    );
  };

  const toggleAddOn = (key: string, checked: boolean) => {
    setAddOns((current) =>
      checked
        ? [...current.filter((item) => item !== key), key]
        : current.filter((item) => item !== key),
    );
  };

  const selections = [
    ...services,
    ...(packageSlug ? [packageKey(packageSlug)] : []),
    ...addOns,
  ];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Add your name so we know who we are replying to.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Add an email address we can reply to.");
      return;
    }

    const quote = buildQuote(selections.length ? selections : [NOT_SURE]);
    setError(null);
    setSending(true);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          selections: selections.length ? selections : [NOT_SURE],
          estimate: quote ? { low: quote.low, high: quote.high } : null,
        }),
      });
      if (!response.ok) throw new Error("not sent");
      setSubmitted(true);
    } catch {
      setError(
        "That did not send. Check your connection and try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="form-confirmation" role="status">
        <p className="p p--strong">Thanks, your inquiry is in.</p>
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
      <Suspense fallback={null}>
        <StartFromQuery
          onPackage={startFromPackage}
          onServices={startFromServices}
        />
      </Suspense>

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
        <p className="p">
          Pick the services you need. If you would rather take a bundle, choose
          a package below instead.
        </p>
        <div
          className="service-picker"
          role="group"
          aria-label="What do you need?"
        >
          {PILLARS.map((pillar) => (
            <div key={pillar.id} className="service-picker__group">
              <span className="service-picker__label">{pillar.label}</span>
              {pillar.services.map((service) => {
                const key = serviceKey(pillar.id, service.id);
                return (
                  <CheckboxInput
                    key={key}
                    label={service.name}
                    value={services.includes(key)}
                    onChange={(checked) => toggleService(key, checked)}
                    htmlName={`need-${service.id}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="form-grid__full">
        <p className="p p--strong">Or start from a package</p>
        <p className="p">
          One pick. A package costs less than booking the same work piece by
          piece.
        </p>
        <RadioList
          label="Package"
          isLabelHidden
          value={choice}
          onChange={choosePackage}
          htmlName="package-choice"
        >
          <RadioListItem label="Not sure yet" value={NOT_SURE} />
          {PACKAGES.map((bundle) => (
            <RadioListItem
              key={bundle.slug}
              value={bundle.slug}
              label={bundle.name}
              description={`${formatMoney(bundle.price)}. Saves ${formatMoney(packageSaving(bundle))}.`}
            />
          ))}
        </RadioList>
      </div>

      {selectedPackage ? (
        <div className="form-grid__full package-addons">
          <p className="p p--strong">Anything else for this package?</p>
          <p className="p">
            Optional. These are priced on top of the {selectedPackage.name}.
          </p>
          <div className="package-addons__grid">
            {selectedPackage.addOns.map((addOn) => {
              const key = addOnKey(selectedPackage.slug, addOn.id);
              return (
                <CheckboxInput
                  key={key}
                  label={`${addOn.label}, ${formatAddOnPrice(addOn)}`}
                  value={addOns.includes(key)}
                  onChange={(checked) => toggleAddOn(key, checked)}
                  htmlName={`need-addon-${selectedPackage.slug}-${addOn.id}`}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="form-grid__full">
        <Estimate selected={selections} />
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
            label={sending ? "Sending" : "Send inquiry"}
            variant="primary"
            type="submit"
            size="lg"
            isDisabled={sending}
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
