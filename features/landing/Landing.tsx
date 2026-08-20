import { Brand } from "../../components/Brand";
import { institutionConfig } from "../../config/institution";

export function Landing({ onCreate, onOpen, onAbout }: { onCreate: () => void; onOpen: () => void; onAbout: () => void }) {
  return (
    <main className="landing">
      <nav className="landing__nav">
        <Brand />
        <div className="landing__links">
          <button type="button" className="nav-link" onClick={onAbout}>Sobre o método</button>
          <button type="button" className="button button--secondary" onClick={onOpen}>Meus projetos</button>
        </div>
      </nav>
      <section className="hero">
        <div className="hero__copy">
          <span className="hero__kicker">Instrumento acadêmico digital · PPGEGC/UFSC</span>
          <h1>Transforme sua pesquisa em um sistema <em>visível e coerente.</em></h1>
          <p>{institutionConfig.tagline} Organize problema, propósito, abordagem e planejamento em uma mesma superfície de reflexão.</p>
          <div className="hero__actions">
            <button type="button" className="button button--primary button--large" onClick={onCreate}>Criar novo Canvas <span>→</span></button>
            <button type="button" className="button button--ghost button--large" onClick={onOpen}>Abrir projeto</button>
          </div>
          <div className="hero__trust"><span>✓ Salvamento local</span><span>✓ Sem conta</span><span>✓ Dados no navegador</span></div>
        </div>
        <div className="hero__visual" aria-label="Visão conceitual do Research Canvas EGC">
          <div className="hero-canvas">
            <div className="hero-canvas__header"><span>Research Canvas</span><small>Prévia ao vivo</small></div>
            <div className="hero-canvas__columns">
              <div className="hero-block hero-block--context"><strong>Contexto</strong><span>Problemática</span><span>Pergunta</span><span>Construtos</span></div>
              <div className="hero-block hero-block--purpose"><strong>Propósito</strong><span>Objetivo geral</span><span>Metas parciais</span><span>Escopo</span></div>
              <div className="hero-block hero-block--approach"><strong>Abordagem</strong><span>Paradigmas</span><span>Classificação</span><span>Métodos</span></div>
            </div>
            <div className="hero-block hero-block--planning"><strong>Planejamento</strong><span>Procedimentos</span><span>Cronograma</span><span>Trajetória</span></div>
            <div className="hero-canvas__pulse"><i /> Coerência em construção</div>
          </div>
        </div>
      </section>
      <section className="benefits">
        <article><span>01</span><h2>Estruture a pesquisa</h2><p>Avance por etapas guiadas sem reduzir seu projeto a um formulário administrativo.</p></article>
        <article><span>02</span><h2>Verifique as relações</h2><p>Visualize perguntas de reflexão sobre o alinhamento entre problema, objetivos e método.</p></article>
        <article><span>03</span><h2>Comunique com clareza</h2><p>Use o Canvas, o modo apresentação e exportações para dialogar com orientação e banca.</p></article>
      </section>
      <footer className="landing__footer">{institutionConfig.disclaimer}</footer>
    </main>
  );
}

export function About({ onBack, onCreate }: { onBack: () => void; onCreate: () => void }) {
  return (
    <main className="about-page">
      <nav className="landing__nav"><Brand /><button type="button" className="button button--secondary" onClick={onBack}>Voltar</button></nav>
      <article className="about-article">
        <span className="eyebrow">Sobre o Research Canvas</span>
        <h1>Uma superfície para pensar a pesquisa como um sistema.</h1>
        <p className="lead">O Research Canvas EGC sintetiza os elementos sugeridos pelo PPGEGC para projetos de tese e dissertação e os transforma em uma estrutura visual para reflexão, diálogo e revisão contínua.</p>
        <div className="about-grid">
          <section><h2>Não é preenchimento de campos</h2><p>Problemática, pergunta, construtos, objetivos, escopo, abordagem, método e planejamento precisam conversar entre si. O Canvas torna essas relações observáveis.</p></section>
          <section><h2>É um instrumento de reflexão</h2><p>As orientações e heurísticas ajudam a formular perguntas melhores. Elas não classificam a qualidade científica do trabalho e não substituem julgamento acadêmico.</p></section>
          <section><h2>É um artefato vivo</h2><p>O projeto evolui do plano inicial às versões de seminário, qualificação e banca. O estudante pode revisar, duplicar e registrar snapshots ao longo da trajetória.</p></section>
          <section><h2>É base para o diálogo</h2><p>O Canvas pode ser apresentado a colegas e orientadores para obtenção de feedback e aprimoramento contínuo.</p></section>
        </div>
        <div className="academic-flow" aria-label="Fluxo lógico da pesquisa"><span>Problemática</span><b>→</b><span>Pergunta</span><b>→</b><span>Objetivos</span><b>→</b><span>Métodos</span><b>→</b><span>Resultados</span></div>
        <aside className="academic-note"><strong>Caráter auxiliar</strong><p>{institutionConfig.disclaimer}</p></aside>
        <button type="button" className="button button--primary button--large" onClick={onCreate}>Começar um Canvas</button>
      </article>
    </main>
  );
}
