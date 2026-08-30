import { style, cx, props } from '@cumulo/css';

export const baseCardStyle = style(
  {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
  },
  'override-base',
);

export const highlightedCardStyle = style(
  {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    color: '#1e40af',
  },
  'override-highlight',
);

export const customBoxProps = props(baseCardStyle, {
  style: {
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
  className: highlightedCardStyle.className,
});

export const mergedClassNames = cx(baseCardStyle, highlightedCardStyle);
