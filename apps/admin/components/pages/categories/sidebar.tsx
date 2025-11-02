"use client"

import * as React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Folder, FolderOpen, FolderTree } from "lucide-react"
import type { Category as BaseCategory } from "@/lib/types/category"
import { Button } from "@/components/ui/button"

type Category = Pick<BaseCategory, "id" | "parent_id" | "icon"> & { name: { ar: string } }

interface CategoriesSidebarProps {
	categories: BaseCategory[]
	selectedCategory: BaseCategory | null
	onSelectCategory: (category: BaseCategory) => void
	onBackToRoot: () => void
	onReorder?: (payload: { id: number; newParentId: number | null; newIndex: number }) => Promise<void> | void
}

interface TreeNode extends Category {
	children: TreeNode[]
}

function buildTree(categories: BaseCategory[]): TreeNode[] {
	console.group("[buildTree] بناء شجرة الفئات")
	console.info("عدد الفئات:", categories.length)
	
	// تحويل BaseCategory إلى TreeNode بشكل مباشر (بما أن BaseCategory يحتوي على children بالفعل)
	const convertToTreeNode = (category: BaseCategory): TreeNode => {
		return {
			id: category.id,
			name: { ar: category.name.ar },
			parent_id: category.parent_id,
			icon: category.icon,
			children: category.children ? category.children.map(convertToTreeNode) : []
		}
	}
	
	// العثور على الفئات الجذر فقط (parent_id === null)
	const roots = categories
		.filter((c) => c.parent_id === null)
		.map(convertToTreeNode)
	
	console.info("عدد الفئات الجذر:", roots.length)
	roots.forEach((root) => {
		console.debug(`✓ فئة جذر: ${root.name.ar} (ID: ${root.id}) - ${root.children.length} ابن`)
		if (root.children.length > 0) {
			root.children.forEach((child) => {
				console.debug(`  ↳ ${child.name.ar} (ID: ${child.id}) - ${child.children.length} ابن`)
			})
		}
	})
	
	console.table(roots.map(r => ({ id: r.id, name: r.name.ar, children: r.children.length })))
	console.groupEnd()
	
	return roots
}

export function CategoriesSidebar({ categories, selectedCategory, onSelectCategory, onBackToRoot, onReorder }: CategoriesSidebarProps) {
	console.group("[CategoriesSidebar] Render المكون الرئيسي")
	console.info("عدد الفئات المدخلة:", categories.length)
	console.info("الفئة المحددة:", selectedCategory ? `${selectedCategory.name.ar} (ID: ${selectedCategory.id})` : "لا يوجد")
	
	const tree = React.useMemo(() => {
		console.debug("[useMemo] إعادة بناء الشجرة")
		return buildTree(categories)
	}, [categories])
	
	console.info("الشجرة الناتجة:", tree.length, "فئة جذر")
	const [dragId, setDragId] = useState<number | null>(null)
	
	React.useEffect(() => {
		console.debug("[CategoriesSidebar] تم render المكون")
		return () => {
			console.debug("[CategoriesSidebar] تم unmount المكون")
		}
	}, [])
	
	console.groupEnd()

	const handleDragStart = (id: number) => setDragId(id)
	const handleDragEnd = () => setDragId(null)

	const handleDropOnNode = async (target: TreeNode) => {
		if (dragId == null || dragId === target.id) return
		await onReorder?.({ id: dragId, newParentId: target.id, newIndex: target.children.length })
		setDragId(null)
	}

	const SiblingDropZone = ({ parentId, index }: { parentId: number | null; index: number }) => (
		<div
			onDragOver={(e) => e.preventDefault()}
			onDrop={async () => {
				if (dragId == null) return
				await onReorder?.({ id: dragId, newParentId: parentId, newIndex: index })
				setDragId(null)
			}}
			className="h-2 mx-4 rounded bg-transparent data-[active=true]:bg-primary/20"
			data-active={dragId != null}
		/>
	)

	const renderIcon = (icon: string | null | undefined, isOpen: boolean, hasChildren: boolean) => {
		if (icon) {
			const iconUrl = icon.startsWith('http') ? icon : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${icon}`
			return (
				<img
					src={iconUrl}
					alt=""
					className="w-5 h-5 object-cover rounded flex-shrink-0 pointer-events-none"
					draggable={false}
					onError={(e) => {
						// إذا فشل تحميل الصورة، أخفها
						e.currentTarget.style.display = 'none'
					}}
				/>
			)
		}
		return hasChildren ? (
			isOpen ? (
				<FolderOpen className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
			) : (
				<Folder className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
			)
		) : (
			<Folder className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
		)
	}

	function TreeNodeComponent({ node, level = 0 }: { node: TreeNode; level?: number }) {
		console.debug(`[TreeNode] Render: ${node.name.ar} (ID: ${node.id}, Level: ${level})`)
		
		const [isOpen, setIsOpen] = useState(() => {
			const initial = false
			console.debug(`[TreeNode] useState initial: ${node.name.ar} (ID: ${node.id}) = ${initial}`)
			return initial
		})
		
		const hasChildren = node.children.length > 0
		const isSelected = selectedCategory?.id === node.id

		// تتبع حالة الفتح/الطي للاختبار
		React.useEffect(() => {
			console.group(`[TreeNode Effect] ${node.name.ar} (ID: ${node.id})`)
			console.info("التغييرات:", { 
				isOpen, 
				hasChildren, 
				childrenCount: node.children.length,
				isSelected,
				level 
			})
			
			if (hasChildren) {
				if (isOpen) {
					console.info(`✓ الفئة مفتوحة - سيتم عرض ${node.children.length} فئة فرعية`)
				} else {
					console.info("✗ الفئة مغلقة - لن يتم عرض الأبناء")
				}
			}
			
			console.groupEnd()
		}, [isOpen, node.id, node.name.ar, hasChildren, node.children.length, isSelected, level])

		if (!hasChildren) {
			return (
				<div style={{ marginRight: `${level * 1.5}rem` }}>
					<SiblingDropZone parentId={node.parent_id} index={0} />
					<div
						draggable
						onDragStart={() => handleDragStart(node.id)}
						onDragEnd={handleDragEnd}
						className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
							isSelected
								? "bg-primary/10 border border-primary/20"
								: "hover:bg-slate-50 dark:hover:bg-slate-700/50"
						}`}
					>
						<div className="flex-shrink-0">{renderIcon(node.icon, false, false)}</div>
						<span
							onClick={() => onSelectCategory(categories.find((c) => c.id === node.id)!)}
							className={`text-sm cursor-pointer flex-1 ${
								isSelected
									? "text-primary font-semibold"
									: "text-slate-700 dark:text-slate-300"
							}`}
						>
							{node.name.ar}
						</span>
					</div>
					<SiblingDropZone parentId={node.parent_id} index={1} />
				</div>
			)
		}

		return (
			<div style={{ marginRight: `${level * 1.5}rem` }}>
				<SiblingDropZone parentId={node.parent_id} index={0} />
				<div
					className={`rounded-lg transition-colors ${
						isSelected
							? "bg-primary/10 border border-primary/20"
							: "hover:bg-slate-50 dark:hover:bg-slate-700/50"
					}`}
				>
					<div
						draggable
						onDragStart={() => handleDragStart(node.id)}
						onDragEnd={handleDragEnd}
						onDragOver={(e) => e.preventDefault()}
						onDrop={() => handleDropOnNode(node)}
						className="flex items-center gap-3 py-3 px-4"
					>
						{/* أيقونة الفولدر/الصورة - النقر عليها يوسع/يطوي */}
						<div className="flex items-center gap-1 flex-shrink-0">
							{/* سهم التوسيع/الطي */}
							<ChevronRight
								className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
									isOpen ? "rotate-90" : ""
								}`}
							/>
							<button
								type="button"
								onClick={(e) => {
									console.group(`[Button Click] ${node.name.ar} (ID: ${node.id})`)
									console.info("حدث النقر:", {
										timestamp: new Date().toISOString(),
										currentState: isOpen,
										targetState: !isOpen,
										hasChildren,
										childrenCount: node.children.length
									})
									
									e.preventDefault()
									e.stopPropagation()
									
									const newState = !isOpen
									console.info(`تغيير الحالة: ${isOpen ? "مفتوح" : "مغلق"} → ${newState ? "مفتوح" : "مغلق"}`)
									
									setIsOpen(newState)
									
									console.info("✓ تم استدعاء setIsOpen")
									console.groupEnd()
								}}
								onMouseDown={(e) => {
									// منع drag عند النقر على الزر
									e.stopPropagation()
								}}
								className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
								aria-label={isOpen ? "طي" : "توسيع"}
								data-testid={`toggle-category-${node.id}`}
							>
								{renderIcon(node.icon, isOpen, hasChildren)}
							</button>
						</div>

						{/* النص - النقر عليه يعرض التفاصيل */}
						<span
							onClick={() => {
								const found = categories.find((c) => c.id === node.id)
								console.group(`[Text Click] ${node.name.ar} (ID: ${node.id})`)
								console.info("النقر على النص - عرض التفاصيل")
								console.info("الفئة المُعثرة:", found ? `${found.name.ar} (ID: ${found.id})` : "غير موجودة!")
								
								if (found) {
									onSelectCategory(found)
									console.info("✓ تم استدعاء onSelectCategory")
								} else {
									console.error("✗ لم يتم العثور على الفئة في categories!")
								}
								console.groupEnd()
							}}
							className={`font-medium text-right flex-1 cursor-pointer transition-colors ${
								isSelected
									? "text-primary font-semibold"
									: "text-slate-900 dark:text-slate-100 hover:text-primary"
							}`}
						>
							{node.name.ar}
						</span>

						{/* عداد الأبناء */}
						<span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full flex-shrink-0">
							{node.children.length}
						</span>
					</div>

					{/* محتوى الأبناء - يظهر عند التوسيع */}
					{isOpen && (() => {
						console.group(`[Render Children] ${node.name.ar} (ID: ${node.id})`)
						console.info("عرض الأبناء:", {
							childrenCount: node.children.length,
							level: level + 1,
							isOpen: true
						})
						
						if (node.children.length === 0) {
							console.warn("⚠ الفئة مفتوحة لكن لا يوجد أبناء!")
						} else {
							console.table(node.children.map(c => ({ id: c.id, name: c.name.ar, hasChildren: c.children.length > 0 })))
						}
						
						console.groupEnd()
						
						return (
							<div 
								className="space-y-1 pb-2 animate-in slide-in-from-top-2 fade-in duration-200" 
								onDragOver={(e) => e.preventDefault()} 
								onDrop={() => handleDropOnNode(node)}
								data-testid={`children-${node.id}`}
							>
								{node.children.length > 0 ? (
									<>
										{node.children.map((child, idx) => {
											console.debug(`[Map Child] ${idx + 1}/${node.children.length}: ${child.name.ar} (ID: ${child.id})`)
											return (
												<div key={child.id}>
													<SiblingDropZone parentId={node.id} index={idx} />
													<TreeNodeComponent node={child} level={level + 1} />
												</div>
											)
										})}
										<SiblingDropZone parentId={node.id} index={node.children.length} />
									</>
								) : (
									<div className="text-xs text-muted-foreground px-4 py-2">لا توجد فئات فرعية</div>
								)}
							</div>
						)
					})()}
				</div>
			</div>
		)
	}

	return (
		<aside className="w-[320px] border-l bg-card overflow-y-auto p-4 hidden md:block" aria-label="شجرة الفئات" dir="rtl">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2 text-sm font-semibold">
					<FolderTree className="h-4 w-4" />
					شجرة الفئات
				</div>
				<Button variant="ghost" size="sm" onClick={onBackToRoot}>عودة للقائمة</Button>
			</div>
			<div className="space-y-2">
				{tree.map((node) => (
					<TreeNodeComponent key={node.id} node={node} />
				))}
			</div>
		</aside>
	)
}
