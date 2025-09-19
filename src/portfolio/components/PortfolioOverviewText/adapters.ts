// ===================================================================
// /src/components/portfolio/PortfolioOverviewText/adapters.ts
// ===================================================================
import type {
  OverviewTextInput,
  PortfolioOverviewTextProps,
} from "./PortfolioOverviewText.types";
import { TEXT_DEFAULTS } from "./PortfolioOverviewText.types";
import { parseOverviewTextInput } from "./utils/portfolioOverviewTextValidator";

export interface TextNormalizeOptions {
  fillDefaults?: boolean;  // apply title/variant defaults
  requireParagraph?: boolean; // ensure at least one paragraph
  strictValidate?: boolean;   // throw on invalid input
}

const DEFAULT_OPTS: TextNormalizeOptions = {
  fillDefaults: true,
  requireParagraph: false,
  strictValidate: false,
};

/** Authoring input → presentational props */
export function overviewTextFromInput(
  raw: unknown,
  opts: TextNormalizeOptions = DEFAULT_OPTS
): PortfolioOverviewTextProps {
  const { fillDefaults, requireParagraph, strictValidate } = {
    ...DEFAULT_OPTS,
    ...opts,
  };

  const input = parseOverviewTextInput(raw, strictValidate);

  const paragraphs: string[] = [];
  if (input.description) paragraphs.push(input.description);
  if (Array.isArray(input.highlights) && input.highlights.length) {
    paragraphs.push(...input.highlights.filter(Boolean));
  }
  if (requireParagraph && paragraphs.length === 0) {
    paragraphs.push(
      "We deliver work that moves the needle—clean builds, strong creative, and measurable performance."
    );
  }

  return {
    title: input.headline ?? (fillDefaults ? TEXT_DEFAULTS.title : undefined),
    subtitle: input.subtitle,
    paragraphs: paragraphs.length ? paragraphs : (fillDefaults ? TEXT_DEFAULTS.paragraphs : undefined),
    variant: input.variant ?? (fillDefaults ? TEXT_DEFAULTS.variant : undefined),
    className: input.className,
    showCTA: !!input.cta,
    ctaText: input.cta?.label,
    ctaHref: input.cta?.href,
  };
}

/** Pass-through helper when you already have component props */
export function normalizeOverviewTextProps(
  props: Partial<PortfolioOverviewTextProps>,
  opts: Pick<TextNormalizeOptions, "fillDefaults" | "requireParagraph"> = {
    fillDefaults: true,
    requireParagraph: false,
  }
): PortfolioOverviewTextProps {
  const fillDefaults = opts.fillDefaults ?? true;
  const requireParagraph = opts.requireParagraph ?? false;

  const paragraphs = props.paragraphs?.filter(Boolean) ?? [];
  if (requireParagraph && paragraphs.length === 0) {
    paragraphs.push(
      "We deliver work that moves the needle—clean builds, strong creative, and measurable performance."
    );
  }

  return {
    title: props.title ?? (fillDefaults ? TEXT_DEFAULTS.title : undefined),
    subtitle: props.subtitle,
    paragraphs: paragraphs.length ? paragraphs : (fillDefaults ? TEXT_DEFAULTS.paragraphs : undefined),
    variant: props.variant ?? (fillDefaults ? TEXT_DEFAULTS.variant : undefined),
    className: props.className,
    showCTA: !!props.showCTA && !!(props.ctaText || props.ctaHref),
    ctaText: props.ctaText,
    ctaHref: props.ctaHref,
  };
}
