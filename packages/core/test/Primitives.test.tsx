import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Heading } from '../src/components/Heading';
import { Text } from '../src/components/Text';
import { Code, Container, Divider, Stack, Table } from '../src';

afterEach(() => {
  cleanup();
});

describe('Layout and Typography Primitives', () => {
  it('renders Heading with semantic heading element and supports as prop', () => {
    const { rerender } = render(<Heading>Section Title</Heading>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');

    rerender(<Heading as="h1">Main Title</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders Text with semantic tag and supports as prop', () => {
    const { rerender } = render(<Text>Paragraph text</Text>);
    expect(screen.getByText('Paragraph text').tagName).toBe('P');

    rerender(<Text as="span">Span text</Text>);
    expect(screen.getByText('Span text').tagName).toBe('SPAN');
  });

  it('renders Code element', () => {
    render(<Code>const x = 1;</Code>);
    const el = screen.getByText('const x = 1;');
    expect(el.tagName).toBe('CODE');
  });

  it('renders Divider element', () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });

  it('renders Stack with children', () => {
    render(
      <Stack>
        <span>Item 1</span>
        <span>Item 2</span>
      </Stack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders Container with children', () => {
    render(
      <Container>
        <p>Container content</p>
      </Container>,
    );
    expect(screen.getByText('Container content')).toBeInTheDocument();
  });

  it('renders Table structure', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
