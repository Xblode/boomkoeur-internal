import type { Budget, BudgetCategory, BudgetProject, BudgetProjectLine } from '@/types/finance'
import { getFromStorage, saveToStorage, generateId, updateInStorage, deleteFromStorage } from './storage'

const BUDGETS_KEY = 'finance_budgets'
const BUDGET_CATEGORIES_KEY = 'finance_budget_categories'
const BUDGET_PROJECTS_KEY = 'finance_budget_projects'
const BUDGET_PROJECT_LINES_KEY = 'finance_budget_project_lines'

// Annual Budgets
export function getBudgets(): (Budget & { categories: BudgetCategory[] })[] {
  const budgets = getFromStorage<Budget[]>(BUDGETS_KEY, [])
  const categories = getFromStorage<BudgetCategory[]>(BUDGET_CATEGORIES_KEY, [])
  
  return budgets.map((budget) => ({
    ...budget,
    categories: categories.filter((c) => c.budget_id === budget.id),
  })).sort((a, b) => b.year - a.year)
}

export function getBudgetByYear(year: number): (Budget & { categories: BudgetCategory[] }) | null {
  const budgets = getFromStorage<Budget[]>(BUDGETS_KEY, [])
  const budget = budgets.find((b) => b.year === year)
  
  if (!budget) return null
  
  const categories = getFromStorage<BudgetCategory[]>(BUDGET_CATEGORIES_KEY, [])
  return {
    ...budget,
    categories: categories.filter((c) => c.budget_id === budget.id),
  }
}

export function createBudget(data: {
  budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>
  categories: Omit<BudgetCategory, 'id' | 'budget_id' | 'created_at' | 'updated_at'>[]
}): Budget & { categories: BudgetCategory[] } {
  const budgets = getFromStorage<Budget[]>(BUDGETS_KEY, [])
  const categories = getFromStorage<BudgetCategory[]>(BUDGET_CATEGORIES_KEY, [])
  
  const newBudget: Budget = {
    ...data.budget,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  const newCategories: BudgetCategory[] = data.categories.map((cat) => ({
    ...cat,
    id: generateId(),
    budget_id: newBudget.id,
    spent_amount: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
  
  budgets.push(newBudget)
  categories.push(...newCategories)
  
  saveToStorage(BUDGETS_KEY, budgets)
  saveToStorage(BUDGET_CATEGORIES_KEY, categories)
  
  return { ...newBudget, categories: newCategories }
}

export function updateBudget(
  id: string,
  data: {
    total_budget?: number
    description?: string
    target_events_count?: number
    target_revenue?: number
    target_margin?: number
    categories?: { category: string; allocated_amount: number; notes?: string }[]
  }
): Budget & { categories: BudgetCategory[] } {
  const budgets = getFromStorage<Budget[]>(BUDGETS_KEY, [])
  const categories = getFromStorage<BudgetCategory[]>(BUDGET_CATEGORIES_KEY, [])
  const index = budgets.findIndex((b) => b.id === id)
  if (index === -1) throw new Error(`Budget with id "${id}" not found`)

  const budgetUpdates: Partial<Budget> = {}
  if (data.total_budget !== undefined) budgetUpdates.total_budget = data.total_budget
  if (data.description !== undefined) budgetUpdates.description = data.description
  if (data.target_events_count !== undefined) budgetUpdates.target_events_count = data.target_events_count
  if (data.target_revenue !== undefined) budgetUpdates.target_revenue = data.target_revenue
  if (data.target_margin !== undefined) budgetUpdates.target_margin = data.target_margin
  const updatedBudget = updateInStorage<Budget>(BUDGETS_KEY, id, budgetUpdates)

  if (data.categories !== undefined) {
    const filtered = categories.filter((c) => c.budget_id !== id)
    const newCategories: BudgetCategory[] = data.categories.map((cat) => ({
      id: generateId(),
      budget_id: id,
      category: cat.category,
      allocated_amount: cat.allocated_amount,
      spent_amount: 0,
      notes: cat.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    saveToStorage(BUDGET_CATEGORIES_KEY, [...filtered, ...newCategories])
    return { ...updatedBudget, categories: newCategories }
  }

  const budgetCategories = categories.filter((c) => c.budget_id === id)
  return { ...updatedBudget, categories: budgetCategories }
}

// Budget Projects
export function getBudgetProjects(filters?: { status?: string; year?: number }): BudgetProject[] {
  let projects = getFromStorage<BudgetProject[]>(BUDGET_PROJECTS_KEY, [])
  
  if (filters?.status && filters.status !== 'all') {
    projects = projects.filter((p) => p.status === filters.status)
  }
  
  if (filters?.year) {
    projects = projects.filter((p) => {
      if (!p.start_date) return true
      const year = new Date(p.start_date).getFullYear()
      return year === filters.year
    })
  }
  
  return projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getBudgetProject(projectId: string): BudgetProject | null {
  const projects = getFromStorage<BudgetProject[]>(BUDGET_PROJECTS_KEY, [])
  return projects.find((p) => p.id === projectId) || null
}

export function getProjectBudgetLines(projectId: string): BudgetProjectLine[] {
  const lines = getFromStorage<BudgetProjectLine[]>(BUDGET_PROJECT_LINES_KEY, [])
  return lines.filter((l) => l.project_id === projectId)
}

export function createBudgetProject(data: Omit<BudgetProject, 'id' | 'created_at' | 'updated_at'>): BudgetProject {
  const projects = getFromStorage<BudgetProject[]>(BUDGET_PROJECTS_KEY, [])
  
  const newProject: BudgetProject = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  projects.push(newProject)
  saveToStorage(BUDGET_PROJECTS_KEY, projects)
  
  return newProject
}

export function createProjectBudgetLine(data: Omit<BudgetProjectLine, 'id' | 'created_at' | 'updated_at'>): BudgetProjectLine {
  const lines = getFromStorage<BudgetProjectLine[]>(BUDGET_PROJECT_LINES_KEY, [])
  
  const newLine: BudgetProjectLine = {
    ...data,
    id: generateId(),
    actual_amount: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  lines.push(newLine)
  saveToStorage(BUDGET_PROJECT_LINES_KEY, lines)
  
  return newLine
}

export function updateBudgetProject(projectId: string, updates: Partial<BudgetProject>): BudgetProject {
  return updateInStorage<BudgetProject>(BUDGET_PROJECTS_KEY, projectId, updates)
}

export function deleteBudgetProject(projectId: string): void {
  deleteFromStorage<BudgetProject>(BUDGET_PROJECTS_KEY, projectId)
  
  // Delete associated lines
  const lines = getFromStorage<BudgetProjectLine[]>(BUDGET_PROJECT_LINES_KEY, [])
  const filteredLines = lines.filter((l) => l.project_id !== projectId)
  saveToStorage(BUDGET_PROJECT_LINES_KEY, filteredLines)
}

export function deleteProjectBudgetLines(projectId: string): void {
  const lines = getFromStorage<BudgetProjectLine[]>(BUDGET_PROJECT_LINES_KEY, [])
  const filteredLines = lines.filter((l) => l.project_id !== projectId)
  saveToStorage(BUDGET_PROJECT_LINES_KEY, filteredLines)
}
