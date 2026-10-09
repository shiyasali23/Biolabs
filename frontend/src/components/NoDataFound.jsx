"use client";
import WorkspaceEntry, { WorkspaceEntryPanel } from "./WorkspaceEntry";
export default function NoDataFound({isOpen,onClose,isModal,route="analytics"}) {
  const destination = ["analytics", "food", "vault"].includes(route) ? `/workspace/${route}` : `/${route}`;
  if (isModal) return <WorkspaceEntry open={Boolean(isOpen)} onOpenChange={value=>{if(!value)onClose?.();}} destination={destination}/>;
  return <div className="bio-container py-12"><section className="bio-card mx-auto max-w-xl"><WorkspaceEntryPanel destination={destination}/></section></div>;
}
