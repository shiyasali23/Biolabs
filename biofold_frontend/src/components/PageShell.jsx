import HeaderComponent from './HeaderComponent.jsx'
import FooterComponent from './FooterComponent.jsx'

const VARIANT = {
  default: 'app-shell',
  lab:     'lab-shell',
  bare:    '',
}

export default function PageShell(props) {
  const variant = VARIANT[props.variant ?? 'default']
  const showHeader = props.header !== false
  const showFooter = props.footer !== false

  return (
    <main class={`${variant} relative isolate flex min-h-screen flex-col overflow-x-hidden`}>
      {showHeader && <HeaderComponent />}
      {props.children}
      {showFooter && <FooterComponent />}
    </main>
  )
}
