"use client";
import { useEffect,useRef } from "react";
// Legacy small dialogs use this hook; new drawers use the installed Radix dialog.
const stack=[];
export function useModalA11y(isOpen,onClose) {
 const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{
  if(!isOpen)return;
  const previous=document.activeElement;const token={};stack.push(token);
  const overflow=document.body.style.overflow;document.body.style.overflow="hidden";
  const dialog=()=>Array.from(document.querySelectorAll('[role="dialog"]')).filter(node=>node.getClientRects().length).at(-1);
  const controls=()=>Array.from(dialog()?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')||[]).filter(node=>node.getClientRects().length);
  const timer=requestAnimationFrame(()=>controls()[0]?.focus());
  const key=e=>{if(stack.at(-1)!==token)return;if(e.key==="Escape"){e.preventDefault();closeRef.current?.();}if(e.key==="Tab"){const list=controls();const first=list[0],last=list.at(-1);if(!list.length){e.preventDefault();return;}if(e.shiftKey&&(document.activeElement===first||!dialog()?.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!dialog()?.contains(document.activeElement))){e.preventDefault();first.focus();}}};
  document.addEventListener("keydown",key);
  return()=>{cancelAnimationFrame(timer);stack.splice(stack.indexOf(token),1);document.body.style.overflow=overflow;document.removeEventListener("keydown",key);if(previous?.isConnected)previous.focus();};
 },[isOpen]);
}
