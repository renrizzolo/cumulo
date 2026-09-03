import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '../src/components/Table.js';

describe('Table Component', () => {
  it('renders a full table structure with compound subcomponents', () => {
    render(
      <Table data-testid="table-root" variant="bordered">
        <Table.Caption data-testid="caption">User List</Table.Caption>
        <Table.Header data-testid="thead">
          <Table.Row data-testid="header-row">
            <Table.Head data-testid="th-name">Name</Table.Head>
            <Table.Head data-testid="th-role">Role</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body data-testid="tbody">
          <Table.Row data-testid="body-row" interactive>
            <Table.Cell data-testid="td-name">Alice</Table.Cell>
            <Table.Cell data-testid="td-role">Admin</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    const tableRoot = screen.getByTestId('table-root');
    expect(tableRoot).toBeInTheDocument();
    expect(tableRoot.tagName).toBe('TABLE');

    expect(screen.getByTestId('caption')).toHaveTextContent('User List');
    expect(screen.getByTestId('thead').tagName).toBe('THEAD');
    expect(screen.getByTestId('th-name').tagName).toBe('TH');
    expect(screen.getByTestId('th-name')).toHaveTextContent('Name');

    expect(screen.getByTestId('tbody').tagName).toBe('TBODY');
    expect(screen.getByTestId('td-name').tagName).toBe('TD');
    expect(screen.getByTestId('td-name')).toHaveTextContent('Alice');
    expect(screen.getByTestId('td-role')).toHaveTextContent('Admin');
  });

  it('supports direct named component imports', () => {
    render(
      <TableRoot data-testid="direct-table">
        <TableCaption>Direct Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Col</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow interactive>
            <TableCell>Val</TableCell>
          </TableRow>
        </TableBody>
      </TableRoot>,
    );

    const table = screen.getByTestId('direct-table');
    expect(table).toBeInTheDocument();
  });
});
