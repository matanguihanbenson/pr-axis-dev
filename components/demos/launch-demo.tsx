"use client";

import { useState } from "react";

type Lead = { name: string; email: string };

export function LaunchDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Add a name and an email address.");
      return;
    }
    setError(null);
    setLeads((current) => [{ name: name.trim(), email: email.trim() }, ...current]);
    setName("");
    setEmail("");
  };

  return (
    <div className="launch-demo">
      <div className="mock-browser">
        <div className="mock-browser__bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <span className="mock-browser__url">northline.example</span>
        </div>

        <div className="mock-site">
          <div className="mock-site__nav">
            <strong>Northline Coffee</strong>
            <span>Menu</span>
            <span>Visit</span>
            <span className="mock-site__nav-cta">Order</span>
          </div>

          <div className="mock-site__hero">
            <span className="eyebrow">Sample site</span>
            <h3 className="mock-site__title">
              Small-batch coffee, roasted the same morning it ships.
            </h3>
            <p className="p">
              A one-page site for a sample business, using the same type,
              colors, and spacing as this one.
            </p>
          </div>

          <form className="mock-form" onSubmit={submit}>
            <p className="p p--strong">Get the first bag</p>
            <div className="mock-form__fields">
              <label className="mock-field">
                <span>Name</span>
                <input
                  className="demo-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label className="mock-field">
                <span>Email</span>
                <input
                  className="demo-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                />
              </label>
              <button className="demo-button demo-button--primary" type="submit">
                Send
              </button>
            </div>
            {error ? (
              <p className="demo-error" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </div>

      <aside className="launch-demo__inbox" aria-live="polite">
        <span className="eyebrow">Sample inbox</span>
        {leads.length === 0 ? (
          <p className="p">
            Fill the form on the sample site and watch the inquiry land here.
          </p>
        ) : (
          <>
            <p className="p demo-success">
              Inquiry captured. This is where the Lead Capture Agent files it.
            </p>
            <ul className="launch-demo__leads">
              {leads.map((lead, index) => (
                <li key={`${lead.email}-${index}`}>
                  <strong>{lead.name}</strong>
                  <span>{lead.email}</span>
                  <span className="launch-demo__source">Website form</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}
