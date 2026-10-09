"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Sparkles, UserRound, ChartNoAxesCombined, Database, Apple, Microscope, Stethoscope, HeartPulse, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/contexts/userContext";
import { useIntelligence } from "@/contexts/intelligenceContext";
import { useRecord } from "@/contexts/recordContext";
import BrandLogo from "./BrandLogo";
import { rememberToolOpener } from "./clinical-tools/navigation";
// The chat panel is only needed once Intelligence is opened.
const Intelligence = dynamic(() => import("./Intelligence"), { ssr: false });
const items = [["/workspace/analytics","Analytics",ChartNoAxesCombined],["/workspace/vault","Vault",Database],["/workspace/food","Nutrition",Apple],["/workspace/detection","Disease detection",Microscope],["/workspace/diagnosis","Diagnostics",Stethoscope],["/health","Health check-in",HeartPulse]];
export default function Header({ pagePath }) {
  const currentPath = usePathname();
  const path = pagePath ?? currentPath;
  const workspace = !["/", "/info", "/sign-in", "/sign-up"].includes(path);
  const { isLogined, isSample, logOutUser, exitSample } = useUser();
  const { resetRecords } = useRecord();
  const { isOpen, intelligenceSeed, openIntelligence, closeIntelligence } = useIntelligence();
  const [menu, setMenu] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const headerRef = useRef(null);
  const menuTriggerRef = useRef(null);
  const [intelligenceUsed, setIntelligenceUsed] = useState(false);
  if (isOpen && !intelligenceUsed) setIntelligenceUsed(true);
  const hideHeader = path === "/" && headerHidden && !menu && !isOpen;
  useEffect(()=>setMenu(false),[path]);
  useEffect(() => {
    if (path !== "/") { setHeaderHidden(false); return; }
    let previousY = Math.max(0, window.scrollY);
    let travel = 0;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - previousY;
      previousY = y;
      if (y <= 80 || headerRef.current?.contains(document.activeElement)) {
        travel = 0;
        setHeaderHidden(false);
        return;
      }
      if (!delta) return;
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (Math.abs(travel) >= 12) {
        setHeaderHidden(travel > 0);
        travel = 0;
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onKey = event => { if (event.key === "Tab") setHeaderHidden(false); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(frame);
    };
  }, [path]);
  const brand = () => <BrandLogo priority={path === "/"} />;
  const links = <>{items.map(([href,label,Icon])=><Link key={href} href={href} scroll={false} onClick={event => { if (["/workspace/detection", "/workspace/diagnosis"].includes(href)) rememberToolOpener(menu ? document.querySelector(".nav-menu-trigger") : event.currentTarget); }} aria-current={path===href?"page":undefined} className="workspace-nav-link"><Icon size={18}/>{label}</Link>)}</>;
  const account = <><Link className="workspace-nav-link" href="/profile"><UserRound size={18}/>Profile</Link><Link className="workspace-nav-link" href="/info">About Biolabs <ArrowUpRight size={15}/></Link>{isLogined || isSample ? <button className="workspace-nav-link" onClick={() => { resetRecords(); (isSample ? exitSample : logOutUser)(); }}>{isSample ? "Exit sample workspace" : "Sign out"}</button> : <Link className="bio-button-primary" href={`/sign-in?next=${encodeURIComponent(path)}`}>Sign in</Link>}</>;
  return <>
    <header ref={headerRef} inert={hideHeader || undefined} onFocusCapture={() => setHeaderHidden(false)} className={workspace?"workspace-topbar":path==="/"?`public-topbar home-topbar${hideHeader ? " is-scroll-hidden" : ""}`:"public-topbar"}>
      <div className={workspace?"workspace-topbar-inner":"bio-container public-nav-inner"}>
        <div className="topbar-brand-controls">{brand()}</div>
        {!workspace && <nav className="public-nav" aria-label="Primary navigation"><Link href="/#products">Products</Link><Link href="/#solutions">Platform</Link><Link href="/info">About</Link></nav>}
        <div className="topbar-actions"><button aria-label="Open Intelligence" className="intelligence-trigger" onClick={()=>openIntelligence()}><Sparkles size={16}/><span>Intelligence</span></button><button ref={menuTriggerRef} className="bio-icon-button nav-menu-trigger" aria-label="Open navigation" aria-expanded={menu} aria-controls="workspace-navigation" onClick={()=>setMenu(true)}><Menu size={18}/></button></div>
      </div>
    </header>
    {workspace && isSample && <div className="sample-banner"><span><strong>Sample workspace</strong> · Demonstration data, not your medical records.</span><Link href="/sign-in">Sign in to save your own data →</Link></div>}
    {workspace && <nav className="mobile-bottom-nav" aria-label="Mobile workspace navigation">{items.slice(0,3).map(([href,label,Icon])=><Link href={href} key={href} aria-current={path===href?"page":undefined}><Icon size={19}/>{label}</Link>)}<button onClick={()=>setMenu(true)} aria-label="More workspace tools"><Menu size={19}/>More</button></nav>}
    <Dialog open={menu} onOpenChange={setMenu}><DialogContent id="workspace-navigation" className="bio-redesign navigation-drawer workspace-navigation-drawer" aria-describedby={undefined} onCloseAutoFocus={event=>{event.preventDefault();menuTriggerRef.current?.focus();}}><DialogTitle>Biolabs Workspace</DialogTitle><nav aria-label="All pages" onClick={()=>setMenu(false)}>{links}<div className="border-t mt-6 pt-4">{account}</div></nav></DialogContent></Dialog>
    {intelligenceUsed && <Intelligence isOpen={isOpen} onClose={closeIntelligence} text={intelligenceSeed.text} extractedTexts={intelligenceSeed.extractedTexts}/>}
  </>;
}
