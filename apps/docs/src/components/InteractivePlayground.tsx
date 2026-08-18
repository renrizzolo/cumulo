"use client";

import React, { useState } from "react";
import { style, cx, keyframes } from "@cumulo/css";
import { vars } from "@cumulo/core";

const pulse = keyframes({
  "0%, 100%": { transform: "scale(1)" },
  "50%": { transform: "scale(1.05)" },
});

const interactiveStyles = {
  container: style({
    padding: "24px",
    borderRadius: "12px",
    backgroundColor: vars.color.bgSubtle,
    border: `1px solid ${vars.color.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  }),
  button: style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: vars.color.primary,
    color: vars.color.primaryFg,
    border: "none",
    transition: `all ${vars.transition.fast}`,
    ":hover": {
      backgroundColor: vars.color.primaryHover,
      boxShadow: vars.shadow.glow,
    },
    ":active": {
      backgroundColor: vars.color.primaryActive,
      transform: "scale(0.98)",
    },
  }),
  pulseBadge: style({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: vars.color.primarySubtle,
    color: vars.color.primary,
    animation: `${pulse} 2s infinite ease-in-out`,
  }),
};

export function InteractivePlayground() {
  const [count, setCount] = useState(0);

  return (
    <div className={interactiveStyles.container.className}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h4
            style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}
          >
            Live `@cumulo/css` Playground
          </h4>
          <p style={{ fontSize: "13px", color: "var(--docs-muted)" }}>
            This component was styled directly using <code>@cumulo/css</code>{" "}
            and <code>@cumulo/core</code> tokens!
          </p>
        </div>
        <span className={interactiveStyles.pulseBadge.className}>Active</span>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className={cx(interactiveStyles.button)}
        >
          Clicked {count} {count === 1 ? "time" : "times"} ☁️
        </button>

        <button
          type="button"
          onClick={() => setCount(0)}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid var(--docs-border)",
            background: "transparent",
            color: "var(--docs-fg)",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
