let opener = null;
export function rememberToolOpener(element) { opener = element; }
export function restoreToolOpener() {
  requestAnimationFrame(() => {
    const target = opener?.isConnected ? opener : document.querySelector('.nav-menu-trigger, #page-content');
    target?.focus({ preventScroll: true });
  });
}
export function openClinicalTool(router, kind, element) {
  rememberToolOpener(element);
  router.push(`/workspace/${kind}`, { scroll: false });
}
