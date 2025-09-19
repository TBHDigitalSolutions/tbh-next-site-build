# UI Hooks

A collection of React hooks for building interactive and performant user interfaces.

## Overview

The UI hooks directory contains specialized hooks for common UI patterns and interactions. These hooks help manage UI state, handle navigation, implement pagination, create filters, and build other complex interface elements.

## Available Hooks

| Hook | Description |
|------|-------------|
| `useFilters` | Manages filter state with URL sync and localStorage persistence |
| `useModal` | Manages modal state, props, and visibility |
| `usePagination` | Handles pagination logic for both offset-based and infinite scroll patterns |
| `useScrollRestoration` | Preserves and restores scroll position during navigation |
| `useScrollSpy` | Tracks scroll position to highlight active navigation items |
| `useTOC` | Builds and manages a table of contents from document headings |

## Installation

These hooks are part of the shared-ui package and don't need separate installation. Some hooks may have dependencies on Next.js-specific features.

## API Reference

### useFilters

```typescript
function useFilters<T = any>({
  initialFilters?: Record<string, string[]>;
  singleSelectGroups?: string[];
  syncToQueryParams?: boolean;
  localStorageKey?: string;
  filterFn?: (item: T, filters: Record<string, string[]>) => boolean;
} = {}): {
  filters: Record<string, string[]>;
  isActive: (group: string, value: string) => boolean;
  toggleFilter: (group: string, value: string) => void;
  setFilter: (group: string, values: string[]) => void;
  clearGroup: (group: string) => void;
  clearAll: () => void;
  getFilteredResults: (data: T[]) => T[];
};
```

### useModal

```typescript
function useModal(): {
  modalType: string | null;
  modalProps: Record<string, any> | null;
  isOpen: boolean;
  openModal: (type: string, props?: Record<string, any>) => void;
  closeModal: () => void;
  toggleModal: (type: string, props?: Record<string, any>) => void;
};
```

### usePagination

```typescript
function usePagination<T>({
  data?: T[];
  limit?: number;
  total?: number;
  initialPage?: number;
  infiniteScroll?: boolean;
  fetchFn?: (page: number, limit: number) => Promise<T[]>;
}): {
  currentPage: number;
  totalPages: number;
  data: T[];
  hasMore: boolean;
  isLoading: boolean;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
  triggerRef?: React.RefObject<HTMLDivElement>;
};
```

### useScrollRestoration

```typescript
function useScrollRestoration({
  manual?: boolean;
  behavior?: ScrollBehavior;
} = {}): {
  scrollY: number;
  savePosition: () => void;
  restorePosition: (overridePath?: string) => void;
};
```

### useScrollSpy

```typescript
function useScrollSpy({
  selector?: string;
  rootMargin?: string;
  debounceMs?: number;
  activeClass?: string;
} = {}): {
  activeId: string | null;
};
```

### useTOC

```typescript
function useTOC({
  selector?: string;
  rootMargin?: string;
  offset?: number;
  threshold?: number;
  debounceMs?: number;
} = {}): {
  items: Array<{
    id: string;
    text: string;
    level: number;
  }>;
  tree: Array<{
    id: string;
    text: string;
    level: number;
    children: Array<...>;
  }>;
  activeId: string | null;
  scrollTo: (id: string) => void;
};
```

## Usage Examples

### Filterable Product List

```tsx
import { useFilters } from '@/shared-ui/hooks/ui';

function ProductList({ products }) {
  const { 
    filters, isActive, toggleFilter, clearGroup, getFilteredResults 
  } = useFilters({
    initialFilters: { category: [], brand: [] },
    singleSelectGroups: ['sort'],
    syncToQueryParams: true,
    filterFn: (product, filters) => {
      // Check category filter
      if (filters.category?.length && !filters.category.includes(product.category)) {
        return false;
      }
      
      // Check brand filter
      if (filters.brand?.length && !filters.brand.includes(product.brand)) {
        return false;
      }
      
      return true;
    }
  });
  
  const filteredProducts = getFilteredResults(products);
  
  return (
    <div className="product-page">
      <aside className="filters">
        <div className="filter-group">
          <h3>Category</h3>
          {['Electronics', 'Clothing', 'Home'].map(category => (
            <label key={category}>
              <input
                type="checkbox"
                checked={isActive('category', category)}
                onChange={() => toggleFilter('category', category)}
              />
              {category}
            </label>
          ))}
          <button onClick={() => clearGroup('category')}>
            Clear Categories
          </button>
        </div>
        
        {/* More filter groups */}
      </aside>
      
      <main>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

### Modal System

```tsx
import { useModal } from '@/shared-ui/hooks/ui';

// Modal components
const modals = {
  'login': LoginModal,
  'signup': SignupModal,
  'productDetail': ProductDetailModal,
};

function ModalManager() {
  const { modalType, modalProps, isOpen, closeModal } = useModal();
  
  if (!isOpen || !modalType) {
    return null;
  }
  
  const ModalComponent = modals[modalType];
  
  if (!ModalComponent) {
    console.warn(`Modal type "${modalType}" not found`);
    return null;
  }
  
  return (
    <div className="modal-container">
      <div className="modal-backdrop" onClick={closeModal} />
      <div className="modal-content">
        <ModalComponent {...modalProps} onClose={closeModal} />
      </div>
    </div>
  );
}

// Using the modal
function ProductCard({ product }) {
  const { openModal } = useModal();
  
  const handleViewDetails = () => {
    openModal('productDetail', { productId: product.id });
  };
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <button onClick={handleViewDetails}>View Details</button>
    </div>
  );
}
```

### Paginated List with Server-Side Data

```tsx
import { usePagination } from '@/shared-ui/hooks/ui';

function PaginatedList() {
  const fetchItems = async (page, limit) => {
    const response = await fetch(`/api/items?page=${page}&limit=${limit}`);
    return response.json();
  };
  
  const {
    data,
    currentPage,
    totalPages,
    isLoading,
    nextPage,
    prevPage,
  } = usePagination({
    limit: 10,
    fetchFn: fetchItems,
  });
  
  return (
    <div className="paginated-list">
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <ul className="items">
            {data.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
          
          <div className="pagination-controls">
            <button 
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <span>
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Infinite Scroll

```tsx
import { usePagination } from '@/shared-ui/hooks/ui';

function InfiniteList() {
  const fetchItems = async (page, limit) => {
    const response = await fetch(`/api/items?page=${page}&limit=${limit}`);
    return response.json();
  };
  
  const {
    data,
    isLoading,
    hasMore,
    triggerRef,
  } = usePagination({
    limit: 10,
    fetchFn: fetchItems,
    infiniteScroll: true,
  });
  
  return (
    <div className="infinite-list">
      <ul className="items">
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      {hasMore && (
        <div ref={triggerRef} className="loading-trigger">
          {isLoading ? 'Loading more...' : 'Scroll to load more'}
        </div>
      )}
      
      {!hasMore && (
        <div className="end-message">
          End of results
        </div>
      )}
    </div>
  );
}
```

### Table of Contents with Scroll Spy

```tsx
import { useTOC } from '@/shared-ui/hooks/ui';

function ArticleWithTOC() {
  const { items, activeId, scrollTo } = useTOC({
    selector: 'h2, h3, h4',
    offset: 80, // Offset for fixed header
  });
  
  return (
    <div className="article-container">
      <aside className="toc-sidebar">
        <h2>Table of Contents</h2>
        <nav className="toc">
          <ul>
            {items.map(item => (
              <li 
                key={item.id}
                className={activeId === item.id ? 'active' : ''}
                style={{ paddingLeft: `${(item.level - 2) * 16}px` }}
              >
                <a 
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(item.id);
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      <article className="content">
        {/* Article content with headings that match the selector */}
      </article>
    </div>
  );
}
```

## Best Practices

### useFilters

- Consider whether URL syncing is appropriate for your use case
- Use filter groups that make sense for your data model
- Implement clear all buttons for individual filter groups and all filters
- Show active filter counts or badges

### useModal

- Keep modal content in separate components
- Pass only the data needed for the modal via props
- Implement keyboard navigation (Escape to close)
- Consider accessibility implications (focus trapping, aria attributes)

### usePagination

- Choose between traditional pagination and infinite scroll based on content type
- Implement proper loading states
- Cache fetched pages when appropriate
- Consider showing estimated total count for large datasets

### useScrollRestoration

- Use for improving user experience in multi-page applications
- Be careful with automatic restoration in forms or complex interactive pages
- Test behavior with browser back/forward navigation

### useScrollSpy & useTOC

- Use these together for long-form content like blogs and documentation
- Ensure heading structure is semantically correct (h1 > h2 > h3)
- Add sufficient spacing between headings for accurate tracking
- Consider mobile view adaptations

## Troubleshooting

### Common Issues

#### URL Syncing Not Working

- Ensure `syncToQueryParams` is enabled
- Check that your app uses the Next.js router correctly
- Verify URL structure in development tools

#### Infinite Scroll Loads Too Many Pages

- Implement proper `hasMore` logic in your fetchFn
- Use appropriate threshold values for the observer
- Consider adding a manual "Load More" button as fallback

#### Table of Contents Missing Items

- Verify that your headings have proper IDs
- Check the selector matches your document structure
- Ensure heading text is not empty