"use client";
import { useEffect } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
export default function AppShell({ children, fontClass, modal }) {
  const segments = useSelectedLayoutSegments();
  const path = "/" + segments.filter(segment => !segment.startsWith("(")).join("/");
  // Scroll reveal for [data-reveal] sections (styles in globals.css). One observer per route; content that mounts
  // later (data, dialogs) is picked up by the mutation observer. Under reduced motion the CSS makes it a plain fade.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.setAttribute("data-revealed", ""); reveal.unobserve(entry.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    const track = element => {
      if (element.hasAttribute("data-revealed")) return;
      const box = element.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) element.setAttribute("data-revealed", "instant");
      else reveal.observe(element);
    };
    document.querySelectorAll("[data-reveal]").forEach(track);
    document.documentElement.classList.add("motion-reveal");
    const added = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.hasAttribute("data-reveal")) track(node);
        node.querySelectorAll?.("[data-reveal]").forEach(track);
      }
    });
    added.observe(document.body, { childList: true, subtree: true });
    return () => { reveal.disconnect(); added.disconnect(); };
  }, [path]);
  if (["/workspace/detection", "/workspace/diagnosis"].includes(path)) return <>{children}{modal}</>;
  if (path?.startsWith("/fold")) return <>{children}{modal}</>;
  if (path === "/customer") return <div className={`bio-redesign ${fontClass}`}><a href="#customer-content" className="skip-link">Skip to content</a>{children}<Footer/>{modal}</div>;
  const workspace = !["/", "/info", "/sign-in", "/sign-up"].includes(path);
  const shellClass = workspace ? "workspace-shell" : path === "/" ? "public-shell home-shell" : "public-shell";
  return <div className={`bio-redesign ${fontClass} ${shellClass}`}><a href="#page-content" className="skip-link">Skip to content</a><Header pagePath={path}/><div id="page-content" className="app-content" tabIndex={-1}>{children}</div>{!workspace && <Footer homepage={path === "/"}/>}{modal}</div>;
}
