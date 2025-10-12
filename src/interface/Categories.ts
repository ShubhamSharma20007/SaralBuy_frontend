interface SubCategory {
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  categoryName: string;
  subCategories: SubCategory[];
  __v: number;
  image: string;
  updatedAt: string; 
}


export const CategoryType = {
  automobile: "automobile",
  furniture: "furniture",
  fashion: "fashion",
  sports: "sports",
  home: "home",
  beauty: "beauty",
  industrial: "industrial",
  service: "service",
  electronics: "electronics",
} as const;

export type CategoryNames = (typeof CategoryType)[keyof typeof CategoryType]