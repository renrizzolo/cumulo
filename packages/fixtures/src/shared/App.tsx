import React from 'react';
import { darkTheme } from './theme.js';
import { basicBoxStyle, animatedBadgeStyle } from './basic.js';
import { baseCardStyle, customBoxProps, mergedClassNames } from './overrides.js';
import { baseButtonRecipe, extendedButtonRecipe } from './recipes.js';

export function App() {
  return (
    <div
      data-testid="fixture-app"
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        fontFamily: 'sans-serif',
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      {/* 1. Basic CSS & Themes */}
      <section data-testid="section-basic">
        <h2>Basic CSS & Themes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div data-testid="basic-box-light" className={basicBoxStyle.className}>
            <span>Light Theme Box</span>
            <span data-testid="badge-light" className={animatedBadgeStyle.className}>
              Active Pulse
            </span>
          </div>

          <div
            data-testid="basic-box-dark"
            className={`${darkTheme.className} ${basicBoxStyle.className}`}
          >
            <span>Dark Theme Box</span>
            <span data-testid="badge-dark" className={animatedBadgeStyle.className}>
              Active Pulse
            </span>
          </div>
        </div>
      </section>

      {/* 2. CSS Overrides & Merging */}
      <section data-testid="section-overrides">
        <h2>CSS Overrides & Merging</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <div data-testid="override-base" className={baseCardStyle.className}>
            Base Card
          </div>
          <div data-testid="override-merged" className={mergedClassNames}>
            Merged (Highlight overrides Base)
          </div>
          <div
            data-testid="override-props"
            className={customBoxProps.className}
            style={customBoxProps.style}
          >
            Props Merged with Inline Style
          </div>
        </div>
      </section>

      {/* 3. Recipes with Variants & Extensions */}
      <section data-testid="section-recipes">
        <h2>Recipes & Extensions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {/* Default variants */}
          <button data-testid="btn-default" className={baseButtonRecipe()}>
            Default Button
          </button>

          {/* Explicit variants */}
          <button
            data-testid="btn-danger-sm"
            className={baseButtonRecipe({ intent: 'danger', size: 'sm' })}
          >
            Danger Small
          </button>

          <button
            data-testid="btn-secondary-lg"
            className={baseButtonRecipe({ intent: 'secondary', size: 'lg' })}
          >
            Secondary Large
          </button>

          {/* Compound variant: primary outline */}
          <button
            data-testid="btn-compound-primary"
            className={baseButtonRecipe({ intent: 'primary', variant: 'outline' })}
          >
            Primary Outline
          </button>

          {/* Compound variant: danger outline */}
          <button
            data-testid="btn-compound-danger"
            className={baseButtonRecipe({ intent: 'danger', variant: 'outline' })}
          >
            Danger Outline
          </button>

          {/* Extended recipe: pill shape, xl size */}
          <button
            data-testid="btn-ext-pill-xl"
            className={extendedButtonRecipe({
              intent: 'primary',
              size: 'xl',
              shape: 'pill',
            })}
          >
            Extended Pill XL
          </button>

          {/* Extended recipe: square shape, outline */}
          <button
            data-testid="btn-ext-square-outline"
            className={extendedButtonRecipe({
              intent: 'danger',
              variant: 'outline',
              shape: 'square',
              size: 'md',
            })}
          >
            Extended Square Outline
          </button>
        </div>
      </section>
    </div>
  );
}
