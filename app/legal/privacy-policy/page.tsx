// app/legal/privacy-policy/page.tsx
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

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-policy-page">
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
                      {subsection.items && (
                        <ul>
                          {subsection.items.map((item, itemIndex) => (
                            <li 
                              key={itemIndex}
                              dangerouslySetInnerHTML={{ __html: item }}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.cookieTable && (
                <div className="cookie-table-wrapper">
                  <table className="cookie-table">
                    <thead>
                      <tr>
                        <th>Cookie Type</th>
                        <th>Purpose</th>
                        <th>Duration</th>
                        <th>First/Third Party</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.cookieTable.map((cookie, cookieIndex) => (
                        <tr key={cookieIndex}>
                          <td><strong>{cookie.type}</strong></td>
                          <td>{cookie.purpose}</td>
                          <td>{cookie.duration}</td>
                          <td>{cookie.party}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.cookieManagement && (
                <div className="cookie-management">
                  <h3>{section.cookieManagement.title}</h3>
                  <p>{section.cookieManagement.content}</p>
                  <ul className="cookie-links">
                    {section.cookieManagement.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
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
        </div>
      </MainContent>

      {/* Contact Section */}
      <SectionContainer className="contact-section section-padding gradient-section">
        <div className="container text-center">
          <h2>Questions About This Policy?</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            <strong>
              <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>
            </strong>
          </p>
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
        .privacy-policy-page {
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

        .section-content {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .section-list,
        .subsection ul {
          list-style: none;
          padding-left: 0;
        }

        .section-list li,
        .subsection li {
          margin-bottom: 0.75rem;
          padding-left: 1rem;
          position: relative;
        }

        .section-list li::before,
        .subsection li::before {
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
        }

        .cookie-table-wrapper {
          margin: 1.5rem 0;
          overflow-x: auto;
        }

        .cookie-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .cookie-table th,
        .cookie-table td {
          border: 1px solid var(--border-color);
          padding: 0.75rem;
          text-align: left;
        }

        .cookie-table th {
          background-color: var(--background-secondary);
          font-weight: 600;
          color: var(--brand-blue);
        }

        .cookie-management {
          margin-top: 1.5rem;
        }

        .cookie-links {
          list-style: none;
          padding: 0;
        }

        .cookie-links li {
          margin-bottom: 0.5rem;
        }

        .cookie-links a {
          color: var(--brand-blue);
          text-decoration: none;
        }

        .cookie-links a:hover {
          text-decoration: underline;
        }

        .section-footer {
          margin-top: 1rem;
          font-style: italic;
          color: var(--text-muted);
        }

        .contact-section h2 {
          margin-bottom: 1rem;
        }

        .contact-section a {
          color: var(--brand-blue);
          text-decoration: none;
        }

        .contact-section a:hover {
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
        }
      `}</style>
    </main>
  );
}