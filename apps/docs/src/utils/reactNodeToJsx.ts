import React from 'react';

interface ComponentWithMetadata {
  displayName?: string;
  name?: string;
  render?: { displayName?: string; name?: string };
}

function extractComponentName(type: unknown): string {
  if (typeof type === 'string') {
    return type;
  }

  if (typeof type === 'symbol') {
    if (type === Symbol.for('react.fragment')) {
      return '';
    }
    return 'Component';
  }

  if (typeof type === 'function' || (typeof type === 'object' && type !== null)) {
    const rec = type as Record<string, unknown>;
    const meta = type as ComponentWithMetadata;

    // 1. Direct explicit display name or function name
    let name = meta.displayName || meta.name || meta.render?.displayName || meta.render?.name;

    // 2. Client reference RSC metadata ($$id, $$exportName, $$name, exportName, _name)
    if (!name || name === 'ClientReference' || name === 'Component') {
      if (typeof rec.$$name === 'string' && rec.$$name) {
        name = rec.$$name;
      } else if (typeof rec.$$exportName === 'string' && rec.$$exportName) {
        name = rec.$$exportName;
      } else if (typeof rec.exportName === 'string' && rec.exportName) {
        name = rec.exportName;
      } else if (typeof rec._name === 'string' && rec._name) {
        name = rec._name;
      } else if (typeof rec.$$id === 'string' && rec.$$id) {
        const hashPart = rec.$$id.includes('#') ? rec.$$id.split('#').pop() : undefined;
        if (hashPart && hashPart !== 'default') {
          name = hashPart;
        } else {
          const cleanPath = rec.$$id.replace(/[?#].*$/, '');
          const fileBase = cleanPath
            .split(/[/\\]/)
            .pop()
            ?.replace(/\.[^.]+$/, '');
          if (fileBase) name = fileBase;
        }
      } else if (typeof rec.id === 'string' && rec.id.includes('#')) {
        name = rec.id.split('#').pop();
      }
    }

    if (!name || name === 'ClientReference') {
      name = 'Component';
    }

    // 3. Normalize compound component names (e.g. FieldRoot -> Field.Root, CollapsibleTrigger -> Collapsible.Trigger)
    if (name.startsWith('Field.') || name.startsWith('Collapsible.') || name.startsWith('Table.')) {
      return name;
    }
    if (name.startsWith('Field') && name !== 'Field') {
      return `Field.${name.slice(5)}`;
    }
    if (name.startsWith('Collapsible') && name !== 'Collapsible' && name !== 'CollapsibleRoot') {
      return `Collapsible.${name.slice(11)}`;
    }
    if (name === 'CollapsibleRoot') {
      return 'Collapsible.Root';
    }
    if (name.startsWith('Table') && name !== 'Table' && name !== 'TableRoot') {
      return `Table.${name.slice(5)}`;
    }
    if (name === 'TableRoot') {
      return 'Table';
    }

    return name;
  }

  return 'Component';
}

/**
 * Converts a ReactNode tree into a clean, formatted JSX string representation.
 */
export function reactNodeToJsx(node: React.ReactNode, indent = 0): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    const validChildren = node.filter(
      (child) =>
        child !== null &&
        child !== undefined &&
        typeof child !== 'boolean' &&
        !(typeof child === 'string' && child.trim() === ''),
    );
    return validChildren.map((child) => reactNodeToJsx(child, indent)).join('\n');
  }

  if (React.isValidElement(node)) {
    const { type, props } = node as React.ReactElement<Record<string, unknown>>;
    const indentStr = ' '.repeat(indent);

    // Resolve component name
    const tagName = extractComponentName(type);

    // Format props
    const propEntries = Object.entries(props || {}).filter(([key, val]) => {
      if (key === 'children' || key === 'key' || key === 'ref' || key.startsWith('__')) {
        return false;
      }
      return val !== undefined;
    });

    const formattedProps = propEntries.map(([key, val]) => {
      if (typeof val === 'boolean') {
        return val ? key : `${key}={false}`;
      }
      if (typeof val === 'string') {
        return `${key}="${val}"`;
      }
      if (typeof val === 'number') {
        return `${key}={${val}}`;
      }
      if (typeof val === 'function') {
        const fnName = val.name ? `${val.name}` : '() => {}';
        return `${key}={${fnName}}`;
      }
      if (React.isValidElement(val)) {
        return `${key}={${reactNodeToJsx(val, 0)}}`;
      }
      try {
        return `${key}={${JSON.stringify(val)}}`;
      } catch {
        return `${key}={${String(val)}}`;
      }
    });

    const propsString = formattedProps.length > 0 ? ` ${formattedProps.join(' ')}` : '';

    // Handle React Fragment
    if (!tagName) {
      const children = (props as { children?: React.ReactNode })?.children;
      if (!children) return '';
      return `<>\n${reactNodeToJsx(children, indent + 2)}\n${indentStr}</>`;
    }

    const children = (props as { children?: React.ReactNode })?.children;
    const childArray = React.Children.toArray(children).filter((c) => {
      if (typeof c === 'string' && c.trim() === '') return false;
      return true;
    });

    if (childArray.length === 0) {
      return `${indentStr}<${tagName}${propsString} />`;
    }

    // Single inline primitive child (e.g. <Button variant="primary">Click me</Button>)
    if (
      childArray.length === 1 &&
      (typeof childArray[0] === 'string' || typeof childArray[0] === 'number')
    ) {
      const childText = String(childArray[0]).trim();
      const singleLine = `${indentStr}<${tagName}${propsString}>${childText}</${tagName}>`;
      if (!childText.includes('\n') && singleLine.length <= 80) {
        return singleLine;
      }
    }

    // Multi-line / nested children
    const formattedChildren = childArray
      .map((child) => reactNodeToJsx(child, indent + 2))
      .filter(Boolean)
      .join('\n');

    return `${indentStr}<${tagName}${propsString}>\n${formattedChildren}\n${indentStr}</${tagName}>`;
  }

  return '';
}
