/**
 * Basic behavior tests for ServicesAndCapabilitiesExpandable
 * Requires: jest + @testing-library/react + @testing-library/jest-dom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("../../PillarCard", () => {
  // Minimal stub so the grid renders without pulling real styles
  return function PillarCardStub(props: any) {
    return <div data-testid="pillar-card">{props.title}</div>;
  };
});

// DS Link stub (if your project uses next/link, you may need next-router mocks)
jest.mock("@/components/ui/atoms/Link", () => {
  return function LinkStub(props: any) {
    return <a {...props} />;
  };
});

import ServicesAndCapabilitiesExpandable from "../..";
import type { ServicesAndCapabilitiesExpandableProps } from "../../types";

const baseProps: ServicesAndCapabilitiesExpandableProps = {
  title: "What we build",
  intro: "Quick overview",
  pillars: [
    { id: "api", title: "APIs", description: "REST/GraphQL" },
    { id: "dash", title: "Dashboards", description: "Analytics" },
  ],
  bullets: [
    { label: "RBAC setup", href: "#rbac" },
    { label: "Observability baseline", href: "#obs" },
  ],
  expandable: [
    {
      id: "rest",
      title: "RESTful API development",
      summary: "Design-first",
      details: ["OpenAPI", "Rate limiting"],
      cta: { label: "Request audit", href: "/contact" },
      tag: "API",
    },
  ],
  defaultOpen: 0,
  analyticsId: "test:capabilities",
};

describe("ServicesAndCapabilitiesExpandable", () => {
  it("renders title and intro", () => {
    render(<ServicesAndCapabilitiesExpandable {...baseProps} />);
    expect(screen.getByText("What we build")).toBeInTheDocument();
    expect(screen.getByText("Quick overview")).toBeInTheDocument();
  });

  it("renders pillars grid when pillars provided", () => {
    render(<ServicesAndCapabilitiesExpandable {...baseProps} />);
    const cards = screen.getAllByTestId("pillar-card");
    expect(cards.length).toBe(2);
    expect(cards[0]).toHaveTextContent("APIs");
  });

  it("renders inline bullets when bullets provided", () => {
    render(<ServicesAndCapabilitiesExpandable {...baseProps} />);
    expect(screen.getByRole("link", { name: "RBAC setup" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Observability baseline" })).toBeInTheDocument();
  });

  it("renders expandable list and toggles aria-expanded", () => {
    render(<ServicesAndCapabilitiesExpandable {...baseProps} />);
    const btn = screen.getByRole("button", { name: /RESTful API development/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("respects defaultOpen (first item open)", () => {
    render(<ServicesAndCapabilitiesExpandable {...baseProps} defaultOpen={1} />);
    const btn = screen.getByRole("button", { name: /RESTful API development/i });
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("renders null when no content provided", () => {
    const { container } = render(<ServicesAndCapabilitiesExpandable />);
    expect(container.firstChild).toBeNull();
  });
});
