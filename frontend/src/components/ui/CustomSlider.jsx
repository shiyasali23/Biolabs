"use client";

export default function CustomSlider({ input, selectedValue, setSelectedValue, onInteractionEnd }) {
  if (Array.isArray(input)) {
    return (
      <div className={`grid gap-3 ${input.length > 3 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`} role="group" aria-label="Response options">
        {input.map((option) => {
          const selected = selectedValue === option;
          return (
            <button
              key={option}
              type="button"
              className={`min-h-14 rounded-lg border px-4 py-3 text-sm font-semibold transition ${selected ? "border-[var(--biolabs-teal)] bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal-dark)] shadow-sm" : "border-[var(--biolabs-cloud)] bg-white text-[var(--biolabs-slate)] hover:border-[var(--biolabs-teal)] hover:text-[var(--biolabs-ink)]"}`}
              aria-pressed={selected}
              onClick={() => {
                setSelectedValue?.(option);
                onInteractionEnd?.(option);
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  const maximum = typeof input === "number" ? input : 10;
  const numericOptions = Array.from({ length: maximum + 1 }, (_, index) => index);
  return (
    <div className="rounded-lg border bg-[var(--biolabs-mist)] p-5">
      <p className="mb-4 text-sm font-semibold">Approximate hours per day</p>
      <div className="grid grid-cols-4 gap-2" role="group" aria-label="Approximate hours per day">
        {numericOptions.map((option) => {
          const selected = selectedValue === option;
          return <button key={option} type="button" className={`min-h-12 rounded-md border text-sm font-semibold transition ${selected ? "border-[var(--biolabs-teal)] bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal-dark)]" : "bg-white text-[var(--biolabs-slate)] hover:border-[var(--biolabs-teal)]"}`} aria-pressed={selected} onClick={() => { setSelectedValue?.(option); onInteractionEnd?.(option); }}>{option === maximum ? `${option}+` : option}</button>;
        })}
      </div>
    </div>
  );
}
