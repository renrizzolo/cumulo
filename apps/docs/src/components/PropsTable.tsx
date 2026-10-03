import React from 'react';
import { Table, Badge, Code, Text, HStack, vars } from '@cumulo/core';
import { style } from '@cumulo/css';

export interface DocgenPropType {
  name: string;
  raw?: string;
  value?: Array<{ value: string }>;
}

export interface DocgenProp {
  name: string;
  description?: string;
  required: boolean;
  type: DocgenPropType;
  defaultValue?: { value: string } | null;
  shortPropTypeName?: string | null;
}

export interface DocgenData {
  name: string;
  path?: string;
  fileName?: string;
  description?: string;
  props?: Record<string, DocgenProp>;
}

export interface PropsTableProps {
  data?: DocgenData | null;
  excludeProps?: string[];
}

function formatTypeValue(type: DocgenPropType): React.ReactNode {
  if (type.value && Array.isArray(type.value)) {
    // Enum or union
    const cleanValues = type.value
      .map((v) => v.value.replace(/^["']|["']$/g, ''))
      .filter((v) => v !== 'undefined');

    if (cleanValues.length > 0) {
      return (
        <HStack gap="2xs" wrap="wrap" align="center">
          {cleanValues.map((val) => (
            <Code key={val} variant="subtle">
              {val}
            </Code>
          ))}
        </HStack>
      );
    }
  }

  const raw = type.raw || type.name;
  return <Code variant="subtle">{raw.replace(/\s*\|\s*undefined/g, '')}</Code>;
}

const DEFAULT_EXCLUDE_PROPS = ['ref', 'className', 'style'];

/* -------------------------------------------------------------------------------------------------
 * Description rendering (minimal markdown subset used in JSDoc comments)
 * -----------------------------------------------------------------------------------------------*/

const descriptionStyle = style(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.spacing.xs,
  },
  'props-table-description',
);

const descriptionListStyle = style(
  {
    margin: 0,
    paddingInlineStart: vars.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: vars.spacing['2xs'],
  },
  'props-table-description-list',
);

type DescriptionBlock = { type: 'paragraph'; text: string } | { type: 'list'; items: string[] };

const LIST_ITEM_PATTERN = /^\s*[-*]\s+/;

function parseDescriptionBlocks(source: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    const last = blocks.at(-1);

    if (line === '') {
      // Blank line terminates the current block.
      if (last) blocks.push({ type: 'paragraph', text: '' });
      continue;
    }

    if (LIST_ITEM_PATTERN.test(line)) {
      const item = line.replace(LIST_ITEM_PATTERN, '');
      if (last?.type === 'list') last.items.push(item);
      else blocks.push({ type: 'list', items: [item] });
      continue;
    }

    if (last?.type === 'list' && /^\s{2,}/.test(rawLine)) {
      // Indented continuation of the previous list item.
      last.items[last.items.length - 1] += ` ${line}`;
    } else if (last?.type === 'paragraph') {
      last.text = last.text ? `${last.text} ${line}` : line;
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  }

  return blocks.filter((block) => block.type === 'list' || block.text !== '');
}

const INLINE_PATTERN = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const [full, code, bold, linkText, href] = match;
    const index = match.index;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    if (code !== undefined) {
      nodes.push(
        <Code key={index} variant="subtle">
          {code.replace(/^'|'$/g, '')}
        </Code>,
      );
    } else if (bold !== undefined) {
      nodes.push(<strong key={index}>{bold}</strong>);
    } else if (linkText !== undefined && href !== undefined) {
      nodes.push(
        <a key={index} href={href}>
          {linkText}
        </a>,
      );
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function Description({ source }: { source: string }): React.JSX.Element {
  const blocks = parseDescriptionBlocks(source);

  return (
    <div className={descriptionStyle.className}>
      {blocks.map((block, i) =>
        block.type === 'list' ? (
          // oxlint-disable-next-line react/no-array-index-key
          <ul key={`list-${i}`} className={descriptionListStyle.className}>
            {block.items.map((item, j) => (
              // oxlint-disable-next-line react/no-array-index-key
              <li key={`list-${i}-${j}`}>
                <Text as="span" type="body" size="xs">
                  {renderInline(item)}
                </Text>
              </li>
            ))}
          </ul>
        ) : (
          // oxlint-disable-next-line react/no-array-index-key
          <Text key={i} as="p" type="body" size="xs">
            {renderInline(block.text)}
          </Text>
        ),
      )}
    </div>
  );
}

export function PropsTable({
  data,
  excludeProps = DEFAULT_EXCLUDE_PROPS,
}: PropsTableProps): React.JSX.Element {
  const propKeys = Object.keys(data?.props || {}).filter((key) => !excludeProps.includes(key));

  if (propKeys.length === 0) {
    return (
      <Text type="caption" color="muted">
        No custom props documented for this component.
      </Text>
    );
  }

  return (
    <Table interactive>
      <Table.Header>
        <Table.Row>
          <Table.Head>Prop</Table.Head>
          <Table.Head>Type</Table.Head>
          <Table.Head>Default</Table.Head>
          <Table.Head>Description</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {propKeys.map((key) => {
          const prop = data?.props?.[key];
          if (!prop) return null;
          const defaultValue = prop.defaultValue?.value;
          const cleanDefault = defaultValue?.replace(/^["']|["']$/g, '');

          return (
            <Table.Row key={key}>
              <Table.Cell>
                <HStack gap="xs" align="center">
                  <Code variant="primary">{prop.name}</Code>
                  {prop.required ? (
                    <Badge variant="primary" intent="error">
                      required
                    </Badge>
                  ) : null}
                </HStack>
              </Table.Cell>
              <Table.Cell>{formatTypeValue(prop.type)}</Table.Cell>
              <Table.Cell>
                {cleanDefault ? (
                  <Code variant="subtle">{cleanDefault}</Code>
                ) : (
                  <Text as="span" type="caption" color="muted">
                    —
                  </Text>
                )}
              </Table.Cell>
              <Table.Cell>
                {prop.description ? (
                  <Description source={prop.description} />
                ) : (
                  <Text as="span" type="caption" color="muted">
                    —
                  </Text>
                )}
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}
