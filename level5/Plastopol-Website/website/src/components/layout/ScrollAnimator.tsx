'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollAnimator() {
  const pathname = usePathname();

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            intersectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    function observe(el: Element) {
      el.classList.remove('is-visible');
      intersectionObserver.observe(el);
    }

    // Observe everything already in the DOM
    document.querySelectorAll<Element>('.animate-on-scroll').forEach(observe);

    // Watch for new elements added by React re-renders (e.g. search results)
    function handleAddedNode(node: Node) {
      if (!(node instanceof Element)) return;
      if (node.classList.contains('animate-on-scroll')) {
        observe(node);
      }
      node.querySelectorAll<Element>('.animate-on-scroll').forEach(observe);
    }

    function handleMutation(mutation: MutationRecord) {
      mutation.addedNodes.forEach(handleAddedNode);
    }

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(handleMutation);
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
