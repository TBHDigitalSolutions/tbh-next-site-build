/**
 * Adapter normalization tests
 */
import { normalizeProps } from "../adapters";

describe("adapters.normalizeProps", () => {
  it("passes through final props and cleans arrays", () => {
    const out = normalizeProps({
      title: "T",
      intro: "I",
      pillars: [{ id: "p", title: "P" }, { id: "x" } as any], // bad record ignored
      bullets: ["One", { label: "Two", href: "/two" }, { foo: "bar" } as any],
      expandable: [
        { id: "a", title: "A", details: ["d1", 42 as any] },
        { title: "B" }, // id slugified
        { foo: "bar" } as any, // ignored
      ],
    } as any);

    expect(out.title).toBe("T");
    expect(out.pillars?.length).toBe(1);
    expect(out.pillars?.[0].id).toBe("p");
    expect(out.bullets?.length).toBe(2);
    expect(out.bullets?.[0].label).toBe("One");
    expect(out.expandable?.length).toBe(2);
    expect(out.expandable?.[1].id).toBe("b");
  });

  it("maps { block: ... } wrapper", () => {
    const out = normalizeProps({
      block: {
        title: "Capabilities",
        description: "Desc",
        pillars: [{ title: "APIs" }],
        bullets: ["RBAC", { label: "Obs", href: "#obs" }],
        expandable: [{ title: "RESTful API", summary: "S1", details: "Longer text." }],
      },
      analyticsId: "ns",
      className: "c",
    });

    expect(out.title).toBe("Capabilities");
    expect(out.intro).toBe("Desc");
    expect(out.pillars?.[0].title).toBe("APIs");
    expect(out.bullets?.[0].label).toBe("RBAC");
    expect(out.expandable?.[0].title).toBe("RESTful API");
    expect(out.analyticsId).toBe("ns");
    expect(out.className).toBe("c");
  });

  it("accepts objects with nested capabilities", () => {
    const out = normalizeProps({
      title: "Top",
      description: "Top desc",
      capabilities: {
        title: "Inner",
        description: "Inner desc",
        pillars: [{ title: "Dashboards" }],
        bullets: ["CRO"],
        expandable: [{ title: "Real-time charts", details: ["SSE", "WebSocket"] }],
      },
    });

    expect(out.title).toBe("Inner");          // inner wins if present
    expect(out.intro).toBe("Inner desc");
    expect(out.pillars?.[0].title).toBe("Dashboards");
    expect(out.bullets?.[0].label).toBe("CRO");
    expect(out.expandable?.[0].id).toBe("real-time-charts");
  });

  it("returns empty props when input is malformed", () => {
    const out = normalizeProps(42 as any);
    expect(out).toEqual({});
  });
});
