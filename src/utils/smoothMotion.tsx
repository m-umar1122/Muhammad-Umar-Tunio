import React, { useEffect, useLayoutEffect, useRef } from 'react';

interface TransitionConfig {
  type?: 'spring' | 'tween';
  stiffness?: number;
  damping?: number;
  mass?: number;
  duration?: number;
  delay?: number;
  ease?: number[] | string;
}

interface MotionState {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  width?: string | number;
  filter?: string;
}

export interface MotionProps extends React.HTMLAttributes<HTMLElement> {
  initial?: MotionState | false;
  animate?: MotionState;
  exit?: MotionState;
  transition?: TransitionConfig;
  whileHover?: MotionState;
  whileTap?: MotionState;
  layout?: boolean;
  layoutId?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  title?: string;
}

// Store previous bounding boxes by layoutId for smooth FLIP sliding indicator transitions
const lastLayoutRects = new Map<string, DOMRect>();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function buildTransform(state?: MotionState): string {
  if (!state) return 'translate3d(0px, 0px, 0px) scale(1) rotate(0deg)';
  const x = state.x ?? 0;
  const y = state.y ?? 0;
  const scale = state.scale ?? 1;
  const rotate = state.rotate ?? 0;
  return `translate3d(${x}px, ${y}px, 0px) scale(${scale}) rotate(${rotate}deg)`;
}

function createMotionComponent<T extends keyof React.JSX.IntrinsicElements>(tag: T) {
  const Component = React.forwardRef<HTMLElement, MotionProps>((props, externalRef) => {
    const {
      initial,
      animate,
      exit: _exit,
      transition,
      whileHover,
      whileTap,
      layout,
      layoutId,
      style,
      children,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      ...rest
    } = props;

    const internalRef = useRef<HTMLElement | null>(null);
    const hasAnimatedMount = useRef(false);
    const prevSelfRect = useRef<DOMRect | null>(null);

    const setRef = (node: HTMLElement | null) => {
      internalRef.current = node;
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef && typeof externalRef === 'object') {
        (externalRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    };

    // FLIP animation for shared layoutId pills AND layout={true} grid/card reflows
    useLayoutEffect(() => {
      const el = internalRef.current;
      if (!el || prefersReducedMotion()) return;

      if (layoutId) {
        const currentRect = el.getBoundingClientRect();
        const prevRect = lastLayoutRects.get(layoutId);
        lastLayoutRects.set(layoutId, currentRect);

        if (
          prevRect &&
          (Math.abs(prevRect.left - currentRect.left) > 0.5 ||
            Math.abs(prevRect.top - currentRect.top) > 0.5 ||
            Math.abs(prevRect.width - currentRect.width) > 0.5)
        ) {
          const dx = prevRect.left - currentRect.left;
          const dy = prevRect.top - currentRect.top;
          const dw = prevRect.width / Math.max(currentRect.width, 1);
          const dh = prevRect.height / Math.max(currentRect.height, 1);

          if (typeof el.animate === 'function') {
            el.animate(
              [
                {
                  transformOrigin: '0 0',
                  transform: `translate3d(${dx}px, ${dy}px, 0) scale(${dw}, ${dh})`,
                },
                {
                  transformOrigin: '0 0',
                  transform: 'translate3d(0, 0, 0) scale(1, 1)',
                },
              ],
              {
                duration: 320,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.06)',
              }
            );
          }
        }
      } else if (layout) {
        const currentRect = el.getBoundingClientRect();
        const prevRect = prevSelfRect.current;
        prevSelfRect.current = currentRect;

        if (
          prevRect &&
          hasAnimatedMount.current &&
          (Math.abs(prevRect.left - currentRect.left) > 2 ||
            Math.abs(prevRect.top - currentRect.top) > 2)
        ) {
          const dx = prevRect.left - currentRect.left;
          const dy = prevRect.top - currentRect.top;

          if (typeof el.animate === 'function') {
            el.animate(
              [
                {
                  transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.985)`,
                },
                {
                  transform: 'translate3d(0, 0, 0) scale(1)',
                },
              ],
              {
                duration: 340,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.05)',
              }
            );
          }
        }
      }
    });

    // Spring-based entrance & state animation with subtle blur-to-crisp reveal
    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;

      if (animate?.width !== undefined) {
        el.style.width =
          typeof animate.width === 'number' ? `${animate.width}px` : animate.width;
      }

      if (prefersReducedMotion()) {
        el.style.opacity = String(animate?.opacity ?? 1);
        el.style.transform = buildTransform(animate);
        el.style.filter = 'none';
        return;
      }

      const isSpring = transition?.type === 'spring' || !transition?.type;
      const springEasing = isSpring
        ? 'cubic-bezier(0.175, 0.885, 0.32, 1.06)'
        : 'cubic-bezier(0.22, 1, 0.36, 1)';
      const durationMs = Math.round((transition?.duration ?? 0.34) * 1000);
      const delayMs = Math.round((transition?.delay ?? 0) * 1000);

      if (!hasAnimatedMount.current && initial && typeof el.animate === 'function') {
        hasAnimatedMount.current = true;
        prevSelfRect.current = el.getBoundingClientRect();
        el.animate(
          [
            {
              opacity: initial.opacity ?? 0,
              transform: buildTransform(initial),
              filter: initial.filter ?? 'blur(4px)',
              ...(initial.width !== undefined ? { width: String(initial.width) } : {}),
            },
            {
              opacity: animate?.opacity ?? 1,
              transform: buildTransform(animate),
              filter: animate?.filter ?? 'blur(0px)',
              ...(animate?.width !== undefined ? { width: String(animate.width) } : {}),
            },
          ],
          {
            duration: durationMs,
            delay: delayMs,
            easing: springEasing,
            fill: 'both',
          }
        );
      } else if (animate) {
        el.style.transition = `transform ${durationMs}ms ${springEasing}, opacity ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1), width ${durationMs}ms ${springEasing}, filter ${durationMs}ms ease`;
        el.style.opacity = String(animate.opacity ?? 1);
        el.style.transform = buildTransform(animate);
        if (animate.filter) {
          el.style.filter = animate.filter;
        }
      }
    }, [initial, animate, transition]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      if (whileHover && internalRef.current && !prefersReducedMotion()) {
        internalRef.current.style.transition =
          'transform 260ms cubic-bezier(0.175, 0.885, 0.32, 1.12), box-shadow 260ms cubic-bezier(0.22, 1, 0.36, 1)';
        internalRef.current.style.transform = buildTransform(whileHover);
      }
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
      if ((whileHover || whileTap) && internalRef.current && !prefersReducedMotion()) {
        internalRef.current.style.transition =
          'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1)';
        internalRef.current.style.transform = buildTransform(animate);
      }
      onMouseLeave?.(e);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
      if (whileTap && internalRef.current && !prefersReducedMotion()) {
        internalRef.current.style.transition =
          'transform 120ms cubic-bezier(0.22, 1, 0.36, 1)';
        internalRef.current.style.transform = buildTransform(whileTap);
      }
      onMouseDown?.(e);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
      if (whileTap && internalRef.current && !prefersReducedMotion()) {
        internalRef.current.style.transition =
          'transform 220ms cubic-bezier(0.175, 0.885, 0.32, 1.12)';
        internalRef.current.style.transform = buildTransform(whileHover || animate);
      }
      onMouseUp?.(e);
    };

    const mergedStyle: React.CSSProperties = {
      ...style,
      ...(animate?.width !== undefined ? { width: animate.width } : {}),
    };

    return React.createElement(
      tag,
      {
        ...rest,
        ref: setRef,
        style: mergedStyle,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
      },
      children
    );
  });

  Component.displayName = `motion.${String(tag)}`;
  return Component;
}

const componentCache = new Map<string, ReturnType<typeof createMotionComponent>>();

const baseMotion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  button: createMotionComponent('button'),
  article: createMotionComponent('article'),
  aside: createMotionComponent('aside'),
  section: createMotionComponent('section'),
  nav: createMotionComponent('nav'),
  header: createMotionComponent('header'),
  footer: createMotionComponent('footer'),
  main: createMotionComponent('main'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
  p: createMotionComponent('p'),
  a: createMotionComponent('a'),
  form: createMotionComponent('form'),
};

export const motion = new Proxy(baseMotion, {
  get(target, prop: string) {
    if (prop in target) {
      return target[prop as keyof typeof target];
    }
    if (!componentCache.has(prop)) {
      componentCache.set(
        prop,
        createMotionComponent(prop as keyof React.JSX.IntrinsicElements)
      );
    }
    return componentCache.get(prop)!;
  },
}) as typeof baseMotion &
  Record<string, ReturnType<typeof createMotionComponent>>;

export const AnimatePresence: React.FC<{
  children: React.ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
}> = ({ children }) => {
  return <>{children}</>;
};
