import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useDismissible } from './useDismissible';

afterEach(() => {
  cleanup();
});

const DismissibleBox = ({
  onDismiss,
  dismissOnClickOutside = true,
  id,
  children,
}: {
  onDismiss: () => void;
  dismissOnClickOutside?: boolean;
  id: string;
  children?: React.ReactNode;
}) => {
  const ref = useDismissible({ onDismiss, dismissOnClickOutside });
  return (
    <div data-testid={id} ref={ref} tabIndex={-1}>
      <button data-testid={`btn-${id}`}>Button {id}</button>
      {children}
    </div>
  );
};

describe('useDismissible', () => {
  test('does not dismiss on Escape key if it does not have focus', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<DismissibleBox id="box1" onDismiss={onDismiss} />);

    // Not focusing the box
    await user.keyboard('{Escape}');
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test('dismisses on Escape key if it is top layer and has focus', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<DismissibleBox id="box1" onDismiss={onDismiss} />);

    // Focus the box
    screen.getByTestId('btn-box1').focus();

    await user.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('does not dismiss on click outside if it did not have focus', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <div>
        <button data-testid="outside">Outside</button>
        <DismissibleBox id="box1" onDismiss={onDismiss} />
      </div>,
    );

    await user.click(screen.getByTestId('outside'));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test('dismisses on click outside if it is top layer and had focus', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <div>
        <button data-testid="outside">Outside</button>
        <DismissibleBox id="box1" onDismiss={onDismiss} />
      </div>,
    );

    // Focus inside first
    screen.getByTestId('btn-box1').focus();

    await user.click(screen.getByTestId('outside'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('does not dismiss on click inside even if it has focus', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<DismissibleBox id="box1" onDismiss={onDismiss} />);

    const btn = screen.getByTestId('btn-box1');
    btn.focus();
    await user.click(btn);

    expect(onDismiss).not.toHaveBeenCalled();
  });

  test('multiple layers: Escape does NOT dismiss if the focused layer is not the top layer', async () => {
    const user = userEvent.setup();
    const onDismiss1 = vi.fn();
    const onDismiss2 = vi.fn();

    render(
      <div>
        <DismissibleBox id="box1" onDismiss={onDismiss1} />
        <DismissibleBox id="box2" onDismiss={onDismiss2} />
      </div>,
    );

    // Focus inside box1 (which is NOT the top layer, box2 is top layer)
    const btn1 = screen.getByTestId('btn-box1');
    btn1.focus();

    await user.keyboard('{Escape}');

    // Box1 should NOT dismiss because it's not the top layer
    expect(onDismiss1).not.toHaveBeenCalled();

    // Box2 should NOT dismiss because it doesn't have focus
    expect(onDismiss2).not.toHaveBeenCalled();
  });

  test('nested layers: Escape from inside child dismisses child and not parent', async () => {
    const user = userEvent.setup();
    const onDismissParent = vi.fn();
    const onDismissChild = vi.fn();

    const ParentComponent = () => {
      const [showChild, setShowChild] = useState(false);
      return (
        <DismissibleBox id="parent" onDismiss={onDismissParent}>
          <button data-testid="open-child" onClick={() => setShowChild(true)}>
            Open
          </button>
          {showChild && <DismissibleBox id="child" onDismiss={onDismissChild} />}
        </DismissibleBox>
      );
    };

    render(<ParentComponent />);

    // Open child, so it mounts AFTER parent, making it the top layer
    await user.click(screen.getByTestId('open-child'));

    // Focus inside child
    const btnChild = screen.getByTestId('btn-child');
    btnChild.focus();

    await user.keyboard('{Escape}');

    // Child should dismiss (it is top layer and has focus)
    expect(onDismissChild).toHaveBeenCalledTimes(1);

    // Parent should NOT dismiss
    expect(onDismissParent).not.toHaveBeenCalled();
  });
});
