// app/legal/terms-conditions/page.tsx
import { Metadata } from 'next';
import { SectionContainer } from '@/components/core/layout/Section';
import { MainContent } from '@/components/sections/templates/MainContent';
import data from './page.data.json';

export const metadata: Metadata = {
  title: data.seo.title,
  description: data.seo.description,
  keywords: data.seo.keywords,
  robots: data.seo.robots,
  canonical: data.seo.canonical,
  openGraph: {
    title: data.seo.title,
    description: data.seo.description,
    url: data.seo.canonical,
    type: 'website',
    siteName: 'TBH Digital Solutions'
  },
  twitter: {
    card: 'summary',
    title: data.seo.title,
    description: data.seo.description
  }
};

export default function TermsConditionsPage() {
  return (
    <main className="terms-conditions-page">
      {/* Hero Section */}
      <SectionContainer className="hero-section section-padding">
        <div className="container">
          <div className="hero-content text-center">
            <h1>{data.hero.title}</h1>
            <p className="hero-subtitle">{data.hero.subtitle}</p>
            <p className="last-updated">Last Updated: {data.hero.lastUpdated}</p>
          </div>
        </div>
      </SectionContainer>

      {/* Table of Contents */}
      <SectionContainer className="toc-section section-padding">
        <div className="container">
          <h2>Table of Contents</h2>
          <nav className="table-of-contents" role="navigation" aria-label="Table of Contents">
            <ul>
              {data.tableOfContents.map((item, index) => (
                <li key={index}>
                  <a href={`#${item.anchor}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SectionContainer>

      {/* Main Content */}
      <MainContent className="legal-content">
        <div className="container" style={{ maxWidth: '800px' }}>
          {data.sections.map((section, index) => (
            <section key={index} id={section.id} className="legal-section">
              <h2>{section.title}</h2>
              
              {section.content && (
                <div 
                  className="section-content"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}

              {section.items && (
                <ul className="section-list">
                  {section.items.map((item, itemIndex) => (
                    <li 
                      key={itemIndex}
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              )}

              {section.subsections && (
                <div className="subsections">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="subsection">
                      <h3>{subsection.title}</h3>
                      <div 
                        className="subsection-content"
                        dangerouslySetInnerHTML={{ __html: subsection.content }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {section.footer && (
                <p 
                  className="section-footer"
                  dangerouslySetInnerHTML={{ __html: section.footer }}
                />
              )}
            </section>
          ))}

          {/* Closing Notes */}
          {data.footer && (
            <section className="closing-section">
              <div 
                className="closing-content"
                dangerouslySetInnerHTML={{ __html: data.footer.content }}
              />
              <p 
                className="thank-you"
                dangerouslySetInnerHTML={{ __html: data.footer.thank_you }}
              />
            </section>
          )}
        </div>
      </MainContent>

      {/* Contact Section */}
      <SectionContainer className="contact-section section-padding gradient-section">
        <div className="container text-center">
          <h2>Questions About These Terms?</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <div className="contact-info">
            <p>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>
            </p>
            <p>
              <strong>Address:</strong> {data.contact.address}
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data.seo.schema)
        }}
      />

      <style jsx>{`
        .terms-conditions-page {
          --content-max-width: 800px;
        }

        .hero-content h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: var(--brand-blue);
        }

        .hero-subtitle {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          color: var(--text-muted);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .last-updated {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .table-of-contents ul {
          list-style: none;
          padding: 0;
          columns: 2;
          gap: 2rem;
        }

        .table-of-contents li {
          margin-bottom: 0.5rem;
          break-inside: avoid;
        }

        .table-of-contents a {
          color: var(--brand-blue);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .table-of-contents a:hover {
          color: var(--brand-blue-dark);
          text-decoration: underline;
        }

        .legal-section {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
        }

        .legal-section:last-child {
          border-bottom: none;
        }

        .legal-section h2 {
          color: var(--brand-blue);
          font-size: 1.5rem;
          margin-bottom: 1rem;
          border-bottom: 2px solid var(--brand-blue);
          padding-bottom: 0.5rem;
        }

        .legal-section h3 {
          color: var(--text-primary);
          font-size: 1.25rem;
          margin: 1.5rem 0 1rem 0;
        }

        .section-content,
        .subsection-content {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .section-list {
          list-style: none;
          padding-left: 0;
        }

        .section-list li {
          margin-bottom: 0.75rem;
          padding-left: 1rem;
          position: relative;
        }

        .section-list li::before {
          content: "•";
          color: var(--brand-blue);
          position: absolute;
          left: 0;
        }

        .subsections {
          margin-top: 1.5rem;
        }

        .subsection {
          margin-bottom: 1.5rem;
          padding-left: 1rem;
          border-left: 3px solid var(--border-color);
        }

        .section-footer {
          margin-top: 1rem;
          font-style: italic;
          color: var(--text-muted);
          padding: 1rem;
          background-color: var(--background-secondary);
          border-radius: 4px;
          border-left: 4px solid var(--brand-blue);
        }

        .closing-section {
          margin-top: 3rem;
          padding: 2rem;
          background-color: var(--background-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .closing-content {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .thank-you {
          text-align: center;
          font-size: 1.125rem;
          color: var(--brand-blue);
          margin-bottom: 0;
        }

        .contact-section h2 {
          margin-bottom: 1rem;
        }

        .contact-info {
          margin-top: 1rem;
        }

        .contact-info p {
          margin-bottom: 0.5rem;
        }

        .contact-info a {
          color: var(--brand-blue);
          text-decoration: none;
        }

        .contact-info a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .table-of-contents ul {
            columns: 1;
          }

          .hero-content h1 {
            font-size: 2rem;
          }

          .legal-section h2 {
            font-size: 1.25rem;
          }

          .subsection {
            padding-left: 0.5rem;
          }
        }
      `}</style>
    </main>
  );
}