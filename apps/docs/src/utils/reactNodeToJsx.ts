import React from 'react';

interface ComponentWithMetadata {
  displayName?: string;
  name?: string;
  render?: { displayName?: string; name?: string };
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
    let tagName = 'Component';
    if (typeof type === 'string') {
      tagName = type;
    } else if (typeof type === 'function' || (typeof type === 'object' && type !== null)) {
      const meta = type as unknown as ComponentWithMetadata;
      tagName =
        meta.displayName ||
        meta.name ||
        meta.render?.displayName ||
        meta.render?.name ||
        'Component';

      // Map compound fallback if name matches known pattern (e.g. FieldRoot -> Field.Root)
      if (!meta.displayName) {
        if (tagName.startsWith('Field') && tagName !== 'Field') {
          tagName = `Field.${tagName.slice(5)}`;
        } else if (tagName.startsWith('Table') && tagName !== 'Table' && tagName !== 'TableRoot') {
          tagName = `Table.${tagName.slice(5)}`;
        } else if (tagName === 'TableRoot') {
          tagName = 'Table';
        }
      }
    } else if (typeof type === 'symbol') {
      if (type === Symbol.for('react.fragment')) {
        tagName = '';
      }
    }

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
