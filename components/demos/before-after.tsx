"use client";

import { useState } from "react";

export function BeforeAfter() {
  const [value, setValue] = useState(50);

  return (
    <div className="compare">
      <div className="compare__stage">
        <div className="compare__pane compare__pane--before">
          <div className="compare__label">Before</div>
          <div className="dated-site">
            <div className="dated-site__nav">
              <strong>NORTHLINE COFFEE CO.</strong>
              <span>Home | Products | About Us | Contact</span>
            </div>
            <div className="dated-site__hero">
              <h3>Welcome to our website!</h3>
              <p>
                We are a coffee company serving customers since 2009. Click here
                to learn more about our products and services.
              </p>
              <span className="dated-site__button">CLICK HERE</span>
            </div>
            <div className="dated-site__columns">
              <div>
                <strong>Our Products</strong>
                <p>Beans, bags, and boxes.</p>
              </div>
              <div>
                <strong>About Us</strong>
                <p>A short history of the company.</p>
              </div>
              <div>
                <strong>Contact</strong>
                <p>Phone, fax, and email.</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="compare__pane compare__pane--after"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          <div className="compare__label">After</div>
          <div className="fresh-site">
            <div className="fresh-site__nav">
              <strong>
                Northline<span> coffee</span>
              </strong>
              <span>Menu</span>
              <span>Visit</span>
              <span className="fresh-site__cta">Order</span>
            </div>
            <div className="fresh-site__hero">
              <span className="eyebrow">Roasted this morning</span>
              <h3>Small-batch coffee, shipped the day it is roasted.</h3>
              <p className="p">
                One clear page: what it is, where it comes from, and one button
                to start.
              </p>
              <span className="fresh-site__button">Get the first bag</span>
            </div>
          </div>
        </div>

        <span
          className="compare__handle"
          style={{ left: `${value}%` }}
          aria-hidden="true"
        />
      </div>

      <label className="compare__control">
        <span>Drag to compare</span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          aria-label="Before and after comparison"
          onChange={(event) => setValue(Number(event.target.value))}
        />
      </label>

      <p className="p compare__note">
        Sample site for a sample business. Same content, rebuilt with a clear
        hierarchy, real type, and one path to the inquiry.
      </p>
    </div>
  );
}
