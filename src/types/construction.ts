export interface Construction {
  id: string
  slug: string
  name: string
  category: string
  difficulty: 1 | 2 | 3
  form: string
  meaning: string
  description?: string
  examples: string[]
  verbs?: string[]
  relatedConstructions?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ConstructionCardData {
  slug: string
  name: string
  category: string
  difficulty: 1 | 2 | 3
  form: string
  meaning: string
  example: string
}
