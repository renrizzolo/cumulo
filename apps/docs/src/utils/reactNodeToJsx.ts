import React from 'react';

function getStringProp(obj: object, key: string): string | undefined {
  const val: unknown = Reflect.get(obj, key);
  return typeof val === 'string' && val ? val : undefined;
}

function getObjectProp(obj: object, key: string): object | undefined {
  const val: unknown = Reflect.get(obj, key);
  return (typeof val === 'object' || typeof val === 'function') && val !== null ? val : undefined;
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
    const renderObj = getObjectProp(type, 'render');

    // 1. Direct explicit display name or function name
    let name =
      getStringProp(type, 'displayName') ||
      getStringProp(type, 'name') ||
      (renderObj
        ? getStringProp(renderObj, 'displayName') || getStringProp(renderObj, 'name')
        : undefined);

    // 2. Client reference RSC metadata ($$id, $$exportName, $$name, exportName, _name)
    if (!name || name === 'ClientReference' || name === 'Component') {
      const $$name = getStringProp(type, '$$name');
      const $$exportName = getStringProp(type, '$$exportName');
      const exportName = getStringProp(type, 'exportName');
      const _name = getStringProp(type, '_name');
      const $$id = getStringProp(type, '$$id');
      const id = getStringProp(type, 'id');

      if ($$name) {
        name = $$name;
      } else if ($$exportName) {
        name = $$exportName;
      } else if (exportName) {
        name = exportName;
      } else if (_name) {
        name = _name;
      } else if ($$id) {
        const hashPart = $$id.includes('#') ? $$id.split('#').pop() : undefined;
        if (hashPart && hashPart !== 'default') {
          name = hashPart;
        } else {
          const cleanPath = $$id.replace(/[?#].*$/, '');
          const fileBase = cleanPath
            .split(/[/\\]/)
            .pop()
            ?.replace(/\.[^.]+$/, '');
          if (fileBase) name = fileBase;
        }
      } else if (id && id.includes('#')) {
        name = id.split('#').pop();
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
    const { type, props } = node;
    const indentStr = ' '.repeat(indent);

    // Resolve component name
    const tagName = extractComponentName(type);

    // Format props
    const propRecord = typeof props === 'object' && props !== null ? props : {};
    const propEntries = Object.entries(propRecord).filter(([key, val]) => {
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
        const fnName = val.name ? val.name : '() => {}';
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

    const rawChildren: unknown = Reflect.get(propRecord, 'children');
    const children: React.ReactNode =
      rawChildren === null ||
      rawChildren === undefined ||
      typeof rawChildren === 'string' ||
      typeof rawChildren === 'number' ||
      typeof rawChildren === 'boolean' ||
      React.isValidElement(rawChildren) ||
      Array.isArray(rawChildren)
        ? rawChildren
        : undefined;

    // Handle React Fragment
    if (!tagName) {
      if (!children) return '';
      return `<>\n${reactNodeToJsx(children, indent + 2)}\n${indentStr}</>`;
    }

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
