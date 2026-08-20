import { useState } from "react";
import { uid, type NamedItem } from "../domain/models/project";

export function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="field">
      <span className="field__label">{label}{required && <em> *</em>}</span>
      {hint && <span className="field__hint">{hint}</span>}
      {children}
    </label>
  );
}

export function TextArea({ value, onChange, placeholder, rows = 4, maxLength, ariaLabel }: { value: string; onChange: (value: string) => void; placeholder?: string; rows?: number; maxLength?: number; ariaLabel?: string }) {
  return (
    <span className="textarea-wrap">
      <textarea aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} maxLength={maxLength} />
      {maxLength && <small>{value.length} / {maxLength}</small>}
    </span>
  );
}

export function HelpDisclosure({ title, questions }: { title: string; questions: readonly string[] }) {
  return (
    <details className="help-disclosure">
      <summary>Entenda este campo</summary>
      <strong>{title}</strong>
      <ul>{questions.map((question) => <li key={question}>{question}</li>)}</ul>
    </details>
  );
}

export function ItemList({ items, onChange, placeholder, ordered = false }: { items: NamedItem[]; onChange: (items: NamedItem[]) => void; placeholder: string; ordered?: boolean }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...items, { id: uid(), text: draft.trim() }]);
    setDraft("");
  };
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <div className="item-list">
      {items.map((item, index) => (
        <div className="item-row" key={item.id}>
          <span className="item-row__number">{ordered ? index + 1 : "•"}</span>
          <input aria-label={`${placeholder} ${index + 1}`} value={item.text} onChange={(event) => onChange(items.map((current) => current.id === item.id ? { ...current, text: event.target.value } : current))} />
          <div className="item-row__actions">
            {ordered && <button type="button" className="icon-button" aria-label="Mover para cima" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>}
            {ordered && <button type="button" className="icon-button" aria-label="Mover para baixo" onClick={() => move(index, 1)} disabled={index === items.length - 1}>↓</button>}
            <button type="button" className="icon-button icon-button--danger" aria-label="Excluir item" onClick={() => onChange(items.filter((current) => current.id !== item.id))}>×</button>
          </div>
        </div>
      ))}
      <div className="add-row">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} placeholder={placeholder} />
        <button type="button" className="button button--secondary" onClick={add}>Adicionar</button>
      </div>
    </div>
  );
}

export function SectionIntro({ eyebrow, title, description, tone }: { eyebrow: string; title: string; description: string; tone: string }) {
  return (
    <header className="section-intro" style={{ "--section-tone": tone } as React.CSSProperties}>
      <span className="section-intro__icon" aria-hidden="true">{eyebrow.slice(0, 1)}</span>
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
    </header>
  );
}
