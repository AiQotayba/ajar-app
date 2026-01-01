import { useCallback, useRef } from "react"

/**
 * Hook to preserve scroll position when performing actions
 * Optimized to avoid unnecessary DOM calculations
 */
export function useScrollPreservation() {
	const scrollCacheRef = useRef<Map<HTMLElement, { top: number; left: number }>>(new Map())

	/**
	 * Finds all scrollable containers efficiently
	 */
	const findScrollContainers = useCallback((element: HTMLElement | null): HTMLElement[] => {
		const containers: HTMLElement[] = []
		let current: HTMLElement | null = element

		while (current && current !== document.body && current !== document.documentElement) {
			// Use cached style check if available
			const style = window.getComputedStyle(current)
			if (
				style.overflow === "auto" ||
				style.overflow === "scroll" ||
				style.overflowY === "auto" ||
				style.overflowY === "scroll" ||
				style.overflowX === "auto" ||
				style.overflowX === "scroll"
			) {
				containers.push(current)
			}
			current = current.parentElement
		}

		if (window.scrollY > 0 || window.scrollX > 0) {
			containers.push(document.documentElement)
		}

		return containers
	}, [])

	/**
	 * Saves current scroll positions
	 */
	const saveScrollPositions = useCallback(
		(element: HTMLElement | null): Array<{ element: HTMLElement; top: number; left: number }> => {
			const scrollPositions: Array<{ element: HTMLElement; top: number; left: number }> = []
			const containers = findScrollContainers(element)

			containers.forEach((container) => {
				const position = {
					top: container.scrollTop,
					left: container.scrollLeft,
				}
				scrollCacheRef.current.set(container, position)
				scrollPositions.push({
					element: container,
					...position,
				})
			})

			// Save window scroll
			const windowScroll = {
				top: window.scrollY || window.pageYOffset || 0,
				left: window.scrollX || window.pageXOffset || 0,
			}
			scrollCacheRef.current.set(document.documentElement, windowScroll)

			return scrollPositions
		},
		[findScrollContainers]
	)

	/**
	 * Restores scroll positions
	 */
	const restoreScrollPositions = useCallback(
		(scrollPositions: Array<{ element: HTMLElement; top: number; left: number }>) => {
			scrollPositions.forEach(({ element, top, left }) => {
				try {
					if (element && (element.scrollTop !== top || element.scrollLeft !== left)) {
						element.scrollTop = top
						element.scrollLeft = left
					}
				} catch (error) {
					console.error("Error restoring scroll position", error)
				}
			})

			// Restore window scroll
			const cached = scrollCacheRef.current.get(document.documentElement)
			if (cached) {
				const currentWindowTop = window.scrollY || window.pageYOffset || 0
				const currentWindowLeft = window.scrollX || window.pageXOffset || 0
				if (Math.abs(currentWindowTop - cached.top) > 1 || Math.abs(currentWindowLeft - cached.left) > 1) {
					window.scrollTo(cached.left, cached.top)
				}
			}
		},
		[]
	)

	/**
	 * Preserves scroll and executes callback
	 */
	const preserveScroll = useCallback(
		<T extends (...args: unknown[]) => void>(callback: T, event?: React.MouseEvent, containerRef?: React.RefObject<HTMLDivElement | null>) => {
			const startElement = (event?.currentTarget as HTMLElement) || containerRef?.current || null
			const scrollPositions = saveScrollPositions(startElement)

			// Execute callback
			callback()

			// Restore scroll after render
			requestAnimationFrame(() => {
				restoreScrollPositions(scrollPositions)
				requestAnimationFrame(() => {
					restoreScrollPositions(scrollPositions)
					setTimeout(() => {
						restoreScrollPositions(scrollPositions)
					}, 10)
				})
			})
		},
		[saveScrollPositions, restoreScrollPositions]
	)

	return { preserveScroll }
}

