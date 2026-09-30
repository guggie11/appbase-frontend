// Mock framer-motion for test environments (jsdom)
// framer-motion's bundle references the global React object which is not
// present in the vitest/jsdom environment. Replace with passthrough wrappers.
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

const motion = new Proxy({} as Record<string, unknown>, {
  get: (_target, tag: string) =>
    forwardRef<HTMLElement, ComponentPropsWithoutRef<'div'> & Record<string, unknown>>(
      ({ children, initial: _i, animate: _a, transition: _t, exit: _e, ...rest }, ref) => {
        const Tag = tag as keyof JSX.IntrinsicElements
        return <Tag ref={ref as never} {...(rest as ComponentPropsWithoutRef<typeof Tag>)}>{children}</Tag>
      },
    ),
})

function AnimatePresence({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export { motion, AnimatePresence }
export const useAnimation = () => ({ start: () => {}, stop: () => {} })
export const useMotionValue = (initial: unknown) => ({ get: () => initial, set: () => {} })
export const useTransform = () => ({ get: () => 0 })
