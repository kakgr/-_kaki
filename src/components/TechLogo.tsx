interface TechLogoProps {
  name: string;
}

export function TechLogo({ name }: TechLogoProps) {
  const key = name.trim().toLowerCase();

  // Vulkan (also matches "Valkan")
  if (key.includes('vulkan') || key.includes('valkan')) {
    return (
      <svg className="swiss-tech-logo" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3.5 5.5L11.2 19.5h1.6L20.5 5.5h-3.1L12 15.6 6.6 5.5H3.5z"
          fill="currentColor"
        />
        <path
          d="M2.5 14.8c2.6-2.8 7.5-4.8 13.6-5.2 2.2-.15 4.1-.05 5.4.2-2.2.7-4.8 1.7-7.7 3.1-4.2 2-7.8 4.1-10.1 5.9l-1.2-4z"
          fill="currentColor"
          opacity="0.55"
        />
      </svg>
    );
  }

  // Metal / Metal.API
  if (key.includes('metal')) {
    return (
      <svg className="swiss-tech-logo" viewBox="0 0 24 24" aria-hidden="true">
        <polygon
          points="12,2.5 21,7.5 21,16.5 12,21.5 3,16.5 3,7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M7.5 16V8.5l4.5 4.2 4.5-4.2V16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Swift
  if (key.includes('swift')) {
    return (
      <svg className="swiss-tech-logo" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20.2 16.4c.9-2.2.5-5.3-1.4-8.1-1.3-1.9-3.1-3.3-4.8-4.3 1.7 2.4 2.1 5.5 1 8.1-2.5-1.5-5.1-3.9-7.1-6.5 1.1 2.7 3.2 5.4 5.6 7.4-2.8-1-5.6-3-7.8-5.3 1.5 3.1 4.1 6.1 7.6 7.8-2.9.9-6.2.4-9.1-1.4 2.2 3.1 5.8 5.1 9.8 5.1 2.4 0 4.6-.7 6.3-2 1 .2 1.8.8 2.2 1.6.1-1-.3-2.1-2.3-2.4z"
          fill="currentColor"
        />
      </svg>
    );
  }

  // C++
  if (key === 'c++' || key === 'cpp') {
    return (
      <svg className="swiss-tech-logo" viewBox="0 0 24 24" aria-hidden="true">
        <polygon
          points="12,2 20.6,7 20.6,17 12,22 3.4,17 3.4,7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M12.2 14.8a3.8 3.8 0 1 1 0-5.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <path
          d="M14.5 12h3M16 10.5v3M18.2 12h2.2M19.3 10.9v2.2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // C#
  if (key === 'c#' || key === 'csharp') {
    return (
      <svg className="swiss-tech-logo" viewBox="0 0 24 24" aria-hidden="true">
        <polygon
          points="12,2 20.6,7 20.6,17 12,22 3.4,17 3.4,7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M12.2 14.8a3.8 3.8 0 1 1 0-5.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <path
          d="M15.4 10.2l-.7 3.6M17.8 10.2l-.7 3.6M14.1 11.3h4.5M13.8 12.8h4.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return null;
}
