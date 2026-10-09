"use client";
import { useSelectedLayoutSegments } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
export default function AppShell({ children, fontClass, modal }) {
  const segments = useSelectedLayoutSegments();
  const path = "/" + segments.filter(segment => !segment.startsWith("(")).join("/");
  if (["/workspace/detection", "/workspace/diagnosis"].includes(path)) return <>{children}{modal}</>;
  if (path?.startsWith("/fold")) return <>{children}{modal}</>;
  if (path === "/customer") return <div className={`bio-redesign ${fontClass}`}><a href="#customer-content" className="skip-link">Skip to content</a>{children}<Footer/>{modal}</div>;
  const workspace = !["/", "/info", "/sign-in", "/sign-up"].includes(path);
  const shellClass = workspace ? "workspace-shell" : path === "/" ? "public-shell home-shell" : "public-shell";
  return <div className={`bio-redesign ${fontClass} ${shellClass}`}><a href="#page-content" className="skip-link">Skip to content</a><Header pagePath={path}/><div id="page-content" className="app-content" tabIndex={-1}>{children}</div>{!workspace && <Footer homepage={path === "/"}/>}{modal}</div>;
}
