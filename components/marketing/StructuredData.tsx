interface StructuredDataProps {
  type: "organization" | "website" | "service";
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = "https://viotech.com.co";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VioTech Pro",
    alternateName: "VioTech Solutions",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "Consultoría TI de nivel enterprise y desarrollo de software premium para PyMEs en Colombia",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CO",
      addressLocality: "Colombia",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Spanish", "English"],
    },
    sameAs: [
      "https://twitter.com/viotech",
      "https://linkedin.com/company/viotech",
    ],
    areaServed: {
      "@type": "Country",
      name: "Colombia",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VioTech Pro",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "VioTech Pro",
    description: "Consultoría TI de nivel enterprise, desarrollo de software premium, infraestructura cloud y soporte técnico 24/7",
    provider: {
      "@type": "Organization",
      name: "VioTech Pro",
      url: baseUrl,
    },
    areaServed: {
      "@type": "Country",
      name: "Colombia",
    },
    serviceType: "IT Consulting",
    offers: {
      "@type": "Offer",
      priceCurrency: "COP",
      availability: "https://schema.org/InStock",
    },
  };

  let schema;
  switch (type) {
    case "organization":
      schema = organizationSchema;
      break;
    case "website":
      schema = websiteSchema;
      break;
    case "service":
      schema = serviceSchema;
      break;
    default:
      schema = organizationSchema;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

