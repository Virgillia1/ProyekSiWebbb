import { useEffect } from 'react';

export function useMetadata(title: string, description: string) {
  useEffect(() => {
    // Set document title
    document.title = `${title} | CargoLite`;

    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
  }, [title, description]);
}
