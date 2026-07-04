import {
  type ActionHandlerDetail,
  type ActionHandlerOptions,
  deepEqual,
  fireEvent,
} from 'custom-card-helpers'
import { Directive, directive, type ElementPart } from 'lit/directive.js'

const isTouch =
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  ('msMaxTouchPoints' in navigator &&
    (navigator as Navigator & { msMaxTouchPoints: number }).msMaxTouchPoints >
      0)

interface ActionHandler extends HTMLElement {
  holdTime: number
  cancelled: boolean
  held: boolean
  timer?: number
  dblClickTimeout?: number
  isRepeating: boolean
  repeatTimeout?: number
  bind(element: ActionHandlerElement, options?: ActionHandlerOptions): void
  startAnimation(x: number, y: number): void
  stopAnimation(): void
}

interface ActionHandlerElement extends HTMLElement {
  actionHandler?: {
    options: ActionHandlerOptions
    start?: (ev: Event) => void
    end?: (ev: Event) => void
    handleTouchMove?: (ev: TouchEvent) => void
    handleKeyDown?: (ev: KeyboardEvent) => void
  }
}

declare global {
  interface HASSDomEvents {
    action: ActionHandlerDetail
  }
}

const DOCUMENT_CANCEL_EVENTS = [
  'touchcancel',
  'mouseout',
  'mouseup',
  'touchmove',
  'mousewheel',
  'wheel',
  'scroll',
] as const

let documentListenersAttached = false
let activeActionHandler: ActionHandler | null = null

function attachDocumentListeners(): void {
  if (documentListenersAttached) return
  documentListenersAttached = true

  const handleDocumentEvent = (): void => {
    const actionHandler = activeActionHandler
    if (!actionHandler) return

    actionHandler.cancelled = true
    if (actionHandler.timer) {
      actionHandler.stopAnimation()
      clearTimeout(actionHandler.timer)
      actionHandler.timer = undefined
      if (actionHandler.isRepeating && actionHandler.repeatTimeout) {
        window.clearInterval(actionHandler.repeatTimeout)
        actionHandler.isRepeating = false
      }
    }
  }

  for (const eventName of DOCUMENT_CANCEL_EVENTS) {
    document.addEventListener(eventName, handleDocumentEvent, {
      passive: true,
    })
  }
}

function setupActionHandlerMethods(element: HTMLElement): ActionHandler {
  const actionHandler = element as ActionHandler

  actionHandler.startAnimation = (x: number, y: number): void => {
    Object.assign(actionHandler.style, {
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(-50%, -50%) scale(1)',
    })
  }

  actionHandler.stopAnimation = (): void => {
    Object.assign(actionHandler.style, {
      left: '',
      top: '',
      transform: 'translate(-50%, -50%) scale(0)',
    })
  }

  actionHandler.bind = (
    element: ActionHandlerElement,
    options: ActionHandlerOptions = {},
  ): void => {
    if (
      element.actionHandler &&
      deepEqual(options, element.actionHandler.options)
    ) {
      return
    }

    const previous = element.actionHandler
    if (previous) {
      const { start, end, handleKeyDown, handleTouchMove } = previous
      if (start) {
        element.removeEventListener('touchstart', start)
        element.removeEventListener('mousedown', start)
      }
      if (end) {
        element.removeEventListener('touchend', end)
        element.removeEventListener('touchcancel', end)
        element.removeEventListener('click', end)
      }
      if (handleKeyDown) {
        element.removeEventListener('keydown', handleKeyDown)
      }
      if (handleTouchMove) {
        element.removeEventListener('touchmove', handleTouchMove)
      }
    } else {
      element.addEventListener('contextmenu', (ev: Event) => {
        ev.preventDefault()
        ev.stopPropagation()
        return false
      })
    }

    element.actionHandler = { options }

    if (options.disabled) return

    element.actionHandler.start = (ev: Event) => {
      if ((ev as CustomEvent).detail?.ignore) return

      actionHandler.cancelled = false
      actionHandler.held = false

      let x = 0
      let y = 0
      if ((ev as TouchEvent).touches) {
        x = (ev as TouchEvent).touches[0].clientX
        y = (ev as TouchEvent).touches[0].clientY
      } else {
        x = (ev as MouseEvent).clientX
        y = (ev as MouseEvent).clientY
      }

      if (options.hasHold) {
        actionHandler.timer = window.setTimeout(() => {
          actionHandler.startAnimation(x, y)
          actionHandler.held = true
          fireEvent(element, 'action', { action: 'hold' })

          if (options.repeat && options.repeat > 0) {
            let repeatCount = 0
            actionHandler.isRepeating = true
            actionHandler.repeatTimeout = window.setInterval(() => {
              repeatCount++
              fireEvent(element, 'action', { action: 'hold' })
              if (options.repeatLimit && repeatCount >= options.repeatLimit) {
                const repeatTimeout = actionHandler.repeatTimeout
                if (repeatTimeout) {
                  window.clearInterval(repeatTimeout)
                }
                actionHandler.isRepeating = false
              }
            }, options.repeat)
          }
        }, actionHandler.holdTime)
      }
    }

    element.actionHandler.end = (ev: Event) => {
      if ((ev as CustomEvent).detail?.ignore) return

      if (
        ['touchend', 'touchcancel'].includes(ev.type) &&
        actionHandler.cancelled
      ) {
        if (actionHandler.isRepeating && actionHandler.repeatTimeout) {
          window.clearInterval(actionHandler.repeatTimeout)
          actionHandler.isRepeating = false
        }
        return
      }

      if (ev.type === 'touchcancel') return

      if (['touchend', 'touchcancel', 'mouseup'].includes(ev.type)) {
        actionHandler.stopAnimation()
      }

      if (actionHandler.isRepeating && actionHandler.repeatTimeout) {
        window.clearInterval(actionHandler.repeatTimeout)
        actionHandler.isRepeating = false
      }

      if (actionHandler.timer) {
        clearTimeout(actionHandler.timer)
        actionHandler.timer = undefined
      }

      if (actionHandler.held) return

      if (options.hasDoubleClick) {
        if (
          (ev.type === 'click' && (ev as MouseEvent).detail < 2) ||
          !actionHandler.dblClickTimeout
        ) {
          actionHandler.dblClickTimeout = window.setTimeout(() => {
            actionHandler.dblClickTimeout = undefined
            fireEvent(element, 'action', { action: 'tap' })
          }, 250)
        } else {
          clearTimeout(actionHandler.dblClickTimeout)
          actionHandler.dblClickTimeout = undefined
          fireEvent(element, 'action', { action: 'double_tap' })
        }
      } else {
        fireEvent(element, 'action', { action: 'tap' })
      }
    }

    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0]
      if (!touch) return

      const rect = element.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) {
        actionHandler.cancelled = true
      }
    }

    element.actionHandler.handleTouchMove = handleTouchMove

    const { start, end } = element.actionHandler
    if (start) {
      element.addEventListener('touchstart', start, { passive: true })
      element.addEventListener('mousedown', start, { passive: true })
    }
    if (end) {
      element.addEventListener('touchend', end)
      element.addEventListener('touchcancel', end)
      element.addEventListener('click', end)
    }
    element.addEventListener('touchmove', handleTouchMove, { passive: true })

    if (!options.disableKbd) {
      const handleKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault()
          element.click()
        }
      }
      element.actionHandler.handleKeyDown = handleKeyDown
      element.addEventListener('keydown', handleKeyDown)
    }
  }

  attachDocumentListeners()

  return actionHandler
}

function getActionHandler(): ActionHandler {
  const existing = document.body.querySelector('.action-handler-hypnogram-card')
  if (existing) {
    activeActionHandler = existing as ActionHandler
    return activeActionHandler
  }

  const div = document.createElement('div')
  div.className = 'action-handler-hypnogram-card'
  Object.assign(div.style, {
    position: 'absolute',
    width: isTouch ? '100px' : '50px',
    height: isTouch ? '100px' : '50px',
    transform: 'translate(-50%, -50%) scale(0)',
    pointerEvents: 'none',
    zIndex: '999',
    transition: 'transform 0.1s ease-out',
    borderRadius: '50%',
    background: 'rgba(var(--rgb-primary-color), 0.3)',
  })

  const actionHandler = div as unknown as ActionHandler
  actionHandler.holdTime = 500
  actionHandler.cancelled = false
  actionHandler.held = false
  actionHandler.isRepeating = false

  document.body.appendChild(div)
  activeActionHandler = setupActionHandlerMethods(div)
  return activeActionHandler
}

function actionHandlerBind(
  element: ActionHandlerElement,
  options?: ActionHandlerOptions,
): void {
  getActionHandler().bind(element, options)
}

class ActionHandlerDirective extends Directive {
  previousOptions?: ActionHandlerOptions

  render(_options?: ActionHandlerOptions) {
    return undefined
  }

  update(part: ElementPart, [options]: [ActionHandlerOptions?]) {
    if (!deepEqual(options, this.previousOptions)) {
      actionHandlerBind(part.element as ActionHandlerElement, options)
      this.previousOptions = options ? { ...options } : undefined
    }
    return this.render(options)
  }
}

export const actionHandler = directive(ActionHandlerDirective)
