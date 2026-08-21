const Frame = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-lg shadow-elegant overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 bg-primary">
      <span className="h-2 w-2 rounded-full bg-primary-foreground/30" />
      <span className="h-2 w-2 rounded-full bg-primary-foreground/30" />
      <span className="h-2 w-2 rounded-full bg-accent/70" />
      <span className="ml-2 text-[11px] text-primary-foreground/70">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const bars = [38, 62, 45, 78, 56, 90, 72];

export const PortalMock = ({ variant }: { variant: 0 | 1 | 2 }) => {
  if (variant === 0) {
    return (
      <Frame title="Portafolio">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { k: "Capital", v: "$420K" },
            { k: "Valor actual", v: "$512K" },
            { k: "Distribuido", v: "$86K" },
          ].map((m) => (
            <div key={m.k} className="rounded-md bg-secondary p-3 min-w-0">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{m.k}</div>
              <div className="font-display text-lg truncate">{m.v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2.5">
          {[
            { n: "Babylon", p: 46 },
            { n: "URBN Nunciatura", p: 31 },
            { n: "SECRT Escalante", p: 23 },
          ].map((r) => (

            <div key={r.n}>
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span className="truncate">{r.n}</span><span>{r.p}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: `${r.p}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  if (variant === 1) {
    return (
      <Frame title="Métricas avanzadas">
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { k: "TIR (XIRR)", v: "18.4%" },
            { k: "Cash-on-Cash", v: "9.2%" },
            { k: "Equity Multiple", v: "1.84x" },
            { k: "NOI anual", v: "$1.1M" },
          ].map((m) => (
            <div key={m.k} className="rounded-md border border-border p-3 min-w-0">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{m.k}</div>
              <div className="font-display text-xl text-accent truncate">{m.v}</div>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {bars.map((b, i) => (
            <div key={i} className="flex-1 rounded-t bg-accent/70" style={{ height: `${b}%` }} />
          ))}
        </div>
      </Frame>
    );
  }

  return (
    <Frame title="Avance de obra">
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="aspect-[4/3] rounded bg-gradient-to-br from-muted to-secondary" />
        ))}
      </div>
      <div className="space-y-2">
        {[
          { n: "Cimentación", p: 100 },
          { n: "Estructura", p: 74 },
          { n: "Acabados", p: 12 },
        ].map((f) => (
          <div key={f.n} className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground w-24 shrink-0 truncate">{f.n}</span>
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gold rounded-full" style={{ width: `${f.p}%` }} />
            </div>
            <span className="text-[11px] text-muted-foreground w-8 text-right">{f.p}%</span>
          </div>
        ))}
      </div>
    </Frame>
  );
};
