import { onMount } from 'solid-js'
import { setPageMeta } from '../utils/PageMeta.js'
import PageShell from '../components/PageShell.jsx'
import HeaderComponent from '../components/HeaderComponent.jsx'
import HeroComponent from '../components/HeroComponent.jsx'
import KnowledgeGraphSectionComponent from '../components/KnowledgeGraphSectionComponent.jsx'
import TechStackSectionComponent from '../components/TechStackSectionComponent.jsx'
import AccelerationSectionComponent from '../components/AccelerationSectionComponent.jsx'
import TargetsSectionComponent from '../components/TargetsSectionComponent.jsx'
import RoadmapSectionComponent from '../components/RoadmapSectionComponent.jsx'

export default function HomePage() {
  onMount(() => setPageMeta({
    title: 'Biofold — Unified Biomedicine Platform',
    description: 'Biofold unifies a 15M+ node biomedical knowledge graph with structure, binding prediction, and literature evidence to accelerate drug discovery.',
  }))

  return (
    <PageShell variant="default" header={false}>
      <section class="flex min-h-[54vh] flex-col lg:min-h-[85vh]">
        <HeaderComponent />
        <div class="flex flex-1 flex-col justify-center">
          <HeroComponent />
        </div>
      </section>

      <KnowledgeGraphSectionComponent />
      <TechStackSectionComponent />
      <AccelerationSectionComponent />
      <TargetsSectionComponent />
      <RoadmapSectionComponent />
    </PageShell>
  )
}
