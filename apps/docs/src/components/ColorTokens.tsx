import { Text } from '@cumulo/core';

export function ColorTokens() {
  return ['primary', 'success', 'warning', 'error', 'info', 'grey'].map((intent) => (
    <div key={intent}>
      <Text className="capitalize font-semibold mb-2 text-xs text-surface-muted">{intent}</Text>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => (
          <div
            key={step}
            className="flex flex-col items-center justify-center p-2 rounded-md border border-surface-border text-center transition-transform hover:scale-105"
            style={{
              backgroundColor: `var(--theme-${intent}-${step})`,
              color: `contrast-color(var(--theme-${intent}-${step}))`,
            }}
          >
            <span className="text-xs font-bold">{step}</span>
          </div>
        ))}
      </div>
    </div>
  ));
}
