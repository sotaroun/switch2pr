import React from 'react';
import CategoryFilter from '../../molecules/Navigation/CategoryFilter';

interface CategoryFilterOrgProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onReset: () => void;
}

const CategoryFilterOrg: React.FC<CategoryFilterOrgProps> = (props) => {
  return <CategoryFilter {...props} />;
};

export default CategoryFilterOrg;