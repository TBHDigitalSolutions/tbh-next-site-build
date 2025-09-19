// shared-ui/components/common/SanitizedHTML.tsx
import React, { useEffect, useState } from 'react';
import './SanitizedHTML.module.css';

type AttributeMap = Record<string, string[]>;

export interface SanitizedHTMLProps {
  /** Raw HTML string to sanitize and render */
  html: string;
  /** Additional CSS classes for the wrapper element */
  className?: string;
  /** Extra tags to allow beyond the default safe set */
  allowedTags?: string[];
  /** Map of tag → allowed attributes for that tag */
  allowedAttributes?: AttributeMap;
  /** Render inline (span) instead of block (div) */
  inline?: boolean;
}

/**
 * SanitizedHTML safely injects user-supplied HTML after sanitization.
 * Uses DOMPurify client-side only to avoid SSR issues.
 */
export const SanitizedHTML: React.FC<SanitizedHTMLProps> = ({
  html,
  className = '',
  allowedTags = ['iframe'],
  allowedAttributes = { iframe: ['allowfullscreen', 'frameborder', 'allow', 'src', 'title', 'width', 'height'] },
  inline = false,
}) => {
  const [cleanHtml, setCleanHtml] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    // Dynamically import DOMPurify in the browser only
    import('dompurify')
      .then(({ default: DOMPurify }) => {
        // Flatten all allowed attributes into one array
        const extraAttrs = Object.values(allowedAttributes).flat();
        const config: DOMPurify.Config = {
          ADD_TAGS: allowedTags,
          ADD_ATTR: extraAttrs,
        };
        const sanitized = DOMPurify.sanitize(html, config);
        if (isMounted) {
          setCleanHtml(sanitized as string);
        }
      })
      .catch((err) => {
        console.error('DOMPurify load error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [html, allowedTags, allowedAttributes]);

  const WrapperTag = inline ? 'span' : 'div';
  const classes = ['sanitized-html', className].filter(Boolean).join(' ');

  return (
    <WrapperTag
      className={classes}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};
