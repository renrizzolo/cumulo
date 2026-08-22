import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { useFocus, UseFocusOptions } from './useFocus';

// Mock requestAnimationFrame to be synchronous for testing autoFocus
beforeAll(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(performance.now());
    return 1;
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const NavigationTest = (props: Partial<UseFocusOptions>) => {
  const ref = useFocus<HTMLDivElement>({
    type: 'navigation',
    navigation: 'vertical',
    itemSelector: 'button',
    ...props,
  } as any);

  return (
    <div data-testid="container" ref={ref} tabIndex={-1}>
      <button data-testid="b1">1</button>
      <button data-testid="b2">2</button>
      <button data-testid="b3">3</button>
    </div>
  );
};

const ModalityTest = (props: Partial<UseFocusOptions>) => {
  const ref = useFocus<HTMLDivElement>({
    type: 'modality',
    trap: true,
    ...props,
  } as any);

  return (
    <div data-testid="container" ref={ref} tabIndex={-1}>
      <button data-testid="b1">1</button>
      <button data-testid="b2">2</button>
      <button data-testid="b3">3</button>
    </div>
  );
};

describe('useFocus', () => {
  test('focusOnMount focuses the first focusable element', async () => {
    render(<ModalityTest focusOnMount />);
    expect(screen.getByTestId('b1')).toHaveFocus();
  });

  test('trap focuses correctly when pressing Tab', async () => {
    const user = userEvent.setup();
    render(<ModalityTest trap={true} />);

    const b1 = screen.getByTestId('b1');
    const b3 = screen.getByTestId('b3');

    // Tab into the container
    await user.tab();
    expect(b1).toHaveFocus();

    // Test looping forward
    // Tab from b1 -> b2 -> b3
    await user.tab();
    await user.tab();
    expect(b3).toHaveFocus();

    // Tab from b3 should loop back to b1
    await user.tab();
    expect(b1).toHaveFocus();

    // Test looping backwards
    // Shift+Tab from b1 should loop to b3
    await user.tab({ shift: true });
    expect(b3).toHaveFocus();
  });

  test('navigation works correctly with arrow keys', async () => {
    const user = userEvent.setup();
    render(<NavigationTest navigation="vertical" />);

    const b1 = screen.getByTestId('b1');
    const b2 = screen.getByTestId('b2');
    const b3 = screen.getByTestId('b3');

    // Start by tabbing into the container
    await user.tab();
    expect(b1).toHaveFocus();

    // Navigate down
    await user.keyboard('{ArrowDown}');
    expect(b2).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(b3).toHaveFocus();

    // Navigate down with loop=true (default) wraps to start
    await user.keyboard('{ArrowDown}');
    expect(b1).toHaveFocus();

    // Navigate up with loop=true wraps to end
    await user.keyboard('{ArrowUp}');
    expect(b3).toHaveFocus();

    // Navigate to start/end using Home/End
    await user.keyboard('{Home}');
    expect(b1).toHaveFocus();

    await user.keyboard('{End}');
    expect(b3).toHaveFocus();
  });

  test('rovingTabIndex updates tabIndex correctly', async () => {
    const user = userEvent.setup();
    render(<NavigationTest rovingTabIndex={true} itemSelector="button" />);

    const b1 = screen.getByTestId('b1');
    const b2 = screen.getByTestId('b2');
    const b3 = screen.getByTestId('b3');

    // On mount with rovingTabIndex, first element gets tabIndex=0, others -1
    expect(b1).toHaveAttribute('tabindex', '0');
    expect(b2).toHaveAttribute('tabindex', '-1');
    expect(b3).toHaveAttribute('tabindex', '-1');

    // Tab into the container (will focus b1 because tabIndex=0)
    await user.tab();
    expect(b1).toHaveFocus();

    // Navigate down updates tabIndex
    await user.keyboard('{ArrowDown}');
    expect(b2).toHaveFocus();
    expect(b1).toHaveAttribute('tabindex', '-1');
    expect(b2).toHaveAttribute('tabindex', '0');
    expect(b3).toHaveAttribute('tabindex', '-1');

    // Clicking an item updates tabIndex via focusin
    b3.focus();
    expect(b1).toHaveAttribute('tabindex', '-1');
    expect(b2).toHaveAttribute('tabindex', '-1');
    expect(b3).toHaveAttribute('tabindex', '0');
  });

  test('onEscape callback is fired when pressing Escape', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<ModalityTest onEscape={onEscape} />);

    // Need to be focused inside the container to trigger keydown
    await user.tab();

    expect(onEscape).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});
