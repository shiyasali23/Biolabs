import ToolSurface from "@/components/clinical-tools/ToolSurface";
import Home from "../../page";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// A direct visit keeps the same homepage context as the intercepted dialog.
export default function Page() {
  return <><div className="bio-redesign public-shell home-shell" inert aria-hidden="true">
    <Header pagePath="/"/><div id="page-content" tabIndex={-1}><Home/></div><Footer homepage/>
  </div><ToolSurface kind="detection" modal dismissHref="/"/></>;
}
