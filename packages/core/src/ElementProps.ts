import type React from 'react';

/** Narrow down the given react element types */
type HTMLAttributesFor<T> = T extends HTMLInputElement
  ? React.InputHTMLAttributes<T>
  : T extends HTMLButtonElement
    ? React.ButtonHTMLAttributes<T>
    : T extends HTMLAnchorElement
      ? React.AnchorHTMLAttributes<T>
      : T extends HTMLTextAreaElement
        ? React.TextareaHTMLAttributes<T>
        : T extends HTMLSelectElement
          ? React.SelectHTMLAttributes<T>
          : React.HTMLAttributes<T>;

/**
 * Components that extend HTML elements omit noisy/rarely-used global HTML attributes,
 * while automatically including element-specific attributes (e.g., input, button, anchor attributes).
 */
export type ElementProps<T> = Omit<
  HTMLAttributesFor<T>,
  | 'title'
  | 'contentEditable'
  | 'dangerouslySetInnerHTML'
  | 'suppressContentEditableWarning'
  | 'suppressHydrationWarning'
  | 'accessKey'
  | 'autoCapitalize'
  | 'autoFocus'
  | 'contextMenu'
  | 'enterKeyHint'
  | 'lang'
  | 'nonce'
  | 'slot'
  | 'spellCheck'
  | 'translate'
  | 'radioGroup'
  | 'inputMode'
  | 'is'
  | 'about'
  | 'content'
  | 'datatype'
  | 'inlist'
  | 'part'
  | 'prefix'
  | 'property'
  | 'rel'
  | 'resource'
  | 'rev'
  | 'typeof'
  | 'vocab'
  | 'autoCorrect'
  | 'autoSave'
  | 'color'
  | 'results'
  | 'security'
  | 'unselectable'
  | 'itemProp'
  | 'itemScope'
  | 'itemType'
  | 'itemID'
  | 'itemRef'
  | 'popover'
  | 'popoverTargetAction'
  | 'popoverTarget'
  | 'exportparts'
  | 'defaultChecked'
  | 'defaultValue'
  | 'size'
> & {
  ref?: React.Ref<T>;
};
