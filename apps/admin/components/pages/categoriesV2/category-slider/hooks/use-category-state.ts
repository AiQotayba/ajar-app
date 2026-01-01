import { useReducer, useEffect, useMemo, useRef } from "react"
import type { Category } from "@/lib/types/category"

/**
 * State management for categories using useReducer
 * Consolidates all category-related state into a single reducer
 */

interface CategoryState {
	categories: Category[]
	expandedCategories: Set<number>
	isDragEnabled: boolean
	draggedIndex: number | null
	hoveredIndex: number | null
	draggedChildIndex: { parentId: number; index: number } | null
	hoveredChildIndex: { parentId: number; index: number } | null
}

type CategoryAction =
	| { type: "SET_CATEGORIES"; payload: Category[] }
	| { type: "TOGGLE_EXPANDED"; payload: number }
	| { type: "SET_EXPANDED"; payload: Set<number> }
	| { type: "TOGGLE_DRAG_ENABLED" }
	| { type: "SET_DRAG_ENABLED"; payload: boolean }
	| { type: "SET_DRAGGED_INDEX"; payload: number | null }
	| { type: "SET_HOVERED_INDEX"; payload: number | null }
	| { type: "SET_DRAGGED_CHILD_INDEX"; payload: { parentId: number; index: number } | null }
	| { type: "SET_HOVERED_CHILD_INDEX"; payload: { parentId: number; index: number } | null }
	| { type: "UPDATE_CATEGORIES"; payload: Category[] }
	| { type: "RESET_DRAG_STATE" }

const initialState: CategoryState = {
	categories: [],
	expandedCategories: new Set(),
	isDragEnabled: false,
	draggedIndex: null,
	hoveredIndex: null,
	draggedChildIndex: null,
	hoveredChildIndex: null,
}

function categoryReducer(state: CategoryState, action: CategoryAction): CategoryState {
	switch (action.type) {
		case "SET_CATEGORIES":
			// Ensure payload is always an array
			const categoriesArray = Array.isArray(action.payload) ? action.payload : []
			return { ...state, categories: categoriesArray }
		case "UPDATE_CATEGORIES":
			// Ensure payload is always an array
			const updatedCategoriesArray = Array.isArray(action.payload) ? action.payload : []
			return { ...state, categories: updatedCategoriesArray }
		case "TOGGLE_EXPANDED":
			const newExpanded = new Set(state.expandedCategories)
			if (newExpanded.has(action.payload)) {
				newExpanded.delete(action.payload)
			} else {
				newExpanded.add(action.payload)
			}
			return { ...state, expandedCategories: newExpanded }
		case "SET_EXPANDED":
			return { ...state, expandedCategories: action.payload }
		case "TOGGLE_DRAG_ENABLED":
			return {
				...state,
				isDragEnabled: !state.isDragEnabled,
				draggedIndex: null,
				hoveredIndex: null,
				draggedChildIndex: null,
				hoveredChildIndex: null,
			}
		case "SET_DRAG_ENABLED":
			return {
				...state,
				isDragEnabled: action.payload,
				draggedIndex: action.payload ? state.draggedIndex : null,
				hoveredIndex: action.payload ? state.hoveredIndex : null,
				draggedChildIndex: action.payload ? state.draggedChildIndex : null,
				hoveredChildIndex: action.payload ? state.hoveredChildIndex : null,
			}
		case "SET_DRAGGED_INDEX":
			return { ...state, draggedIndex: action.payload }
		case "SET_HOVERED_INDEX":
			return { ...state, hoveredIndex: action.payload }
		case "SET_DRAGGED_CHILD_INDEX":
			return { ...state, draggedChildIndex: action.payload }
		case "SET_HOVERED_CHILD_INDEX":
			return { ...state, hoveredChildIndex: action.payload }
		case "RESET_DRAG_STATE":
			return {
				...state,
				draggedIndex: null,
				hoveredIndex: null,
				draggedChildIndex: null,
				hoveredChildIndex: null,
			}
		default:
			return state
	}
}

/**
 * Hook to manage category state
 */
export function useCategoryState(initialCategories: Category[] = []) {
	// Ensure initialCategories is always an array
	const safeInitialCategories = Array.isArray(initialCategories) ? initialCategories : []
	
	const [state, dispatch] = useReducer(categoryReducer, {
		...initialState,
		categories: safeInitialCategories,
	})

	// Use ref to track previous categories for comparison
	const prevCategoriesRef = useRef<string>('')
	
	// Sync with external categories - always update when categories change
	useEffect(() => {
		// Ensure initialCategories is always an array
		const safeCategories = Array.isArray(initialCategories) ? initialCategories : []
		
		// Create a string representation for comparison
		const categoriesString = JSON.stringify(safeCategories.map(c => ({ id: c.id, sort_order: c.sort_order })))
		
		// Always update, even if empty array (to handle deletions)
		
		
		// Always dispatch to ensure state is in sync, even if data appears unchanged
		dispatch({ type: "SET_CATEGORIES", payload: safeCategories })
		prevCategoriesRef.current = categoriesString 
	}, [initialCategories])

	// Memoized actions
	const actions = useMemo(
		() => ({
			setCategories: (categories: Category[]) => dispatch({ type: "SET_CATEGORIES", payload: categories }),
			updateCategories: (categories: Category[]) => dispatch({ type: "UPDATE_CATEGORIES", payload: categories }),
			toggleExpanded: (id: number) => dispatch({ type: "TOGGLE_EXPANDED", payload: id }),
			setExpanded: (expanded: Set<number>) => dispatch({ type: "SET_EXPANDED", payload: expanded }),
			toggleDragEnabled: () => dispatch({ type: "TOGGLE_DRAG_ENABLED" }),
			setDragEnabled: (enabled: boolean) => dispatch({ type: "SET_DRAG_ENABLED", payload: enabled }),
			setDraggedIndex: (index: number | null) => dispatch({ type: "SET_DRAGGED_INDEX", payload: index }),
			setHoveredIndex: (index: number | null) => dispatch({ type: "SET_HOVERED_INDEX", payload: index }),
			setDraggedChildIndex: (index: { parentId: number; index: number } | null) =>
				dispatch({ type: "SET_DRAGGED_CHILD_INDEX", payload: index }),
			setHoveredChildIndex: (index: { parentId: number; index: number } | null) =>
				dispatch({ type: "SET_HOVERED_CHILD_INDEX", payload: index }),
			resetDragState: () => dispatch({ type: "RESET_DRAG_STATE" }),
		}),
		[]
	)

	return { state, actions }
}

