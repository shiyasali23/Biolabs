import { createMemo } from 'solid-js'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })

export default function AnswerCardLab(props) {
  const html = createMemo(() => {
    const markdown = props.state.finalAnswer
    return markdown ? marked.parse(markdown) : ''
  })

  return (
    <section class="flex flex-col gap-3">
      <span class="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-5">Answer</span>
      <article class="lab-answer max-w-none" innerHTML={html()} />
    </section>
  )
}
