import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import Pagination from '../../../shared/components/Pagination/Pagination'
import type { PagedResponse, SortDirection } from '../../../shared/types/Paging'
import type { CategoriesStatus } from '../../hooks/useCategories'
import type { CategoryResponseDto } from '../../types/CategoryDtos'
import './CategoryList.css'

interface CategoryListProps {
  /** The current page from the server; kept while the next one loads. */
  data: PagedResponse<CategoryResponseDto> | undefined
  status: CategoriesStatus
  isFetching: boolean
  searchInput: string
  onSearchChange: (value: string) => void
  /** The search applied to `data` — tells "no categories yet" apart from "no results". */
  appliedSearch: string
  sortDirection: SortDirection
  onToggleSort: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onCreate: () => void
  onEdit: (category: CategoryResponseDto) => void
  onDelete: (category: CategoryResponseDto) => void
}

function CategoryList({
  data,
  status,
  isFetching,
  searchInput,
  onSearchChange,
  appliedSearch,
  sortDirection,
  onToggleSort,
  onPageChange,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const { t: translate } = useTranslation('finance')
  const hasSearch = appliedSearch !== ''

  function renderRows() {
    if (status === 'loading') {
      return <div className="lm-category-list__state">{translate('finance:categories.list.loading')}</div>
    }

    if (status === 'error' || !data) {
      return (
        <div className="lm-category-list__state">
          <span>{translate('finance:categories.list.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('finance:categories.list.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) {
      return (
        <div className="lm-category-list__state">
          <span>{translate(hasSearch ? 'finance:categories.list.noResults' : 'finance:categories.list.empty')}</span>
          {!hasSearch ? (
            <Button variant="secondary" size="sm" icon="plus" onClick={onCreate}>
              {translate('finance:categories.newButton')}
            </Button>
          ) : null}
        </div>
      )
    }

    return data.items.map((category) => (
      <div key={category.id} className="lm-category-list__row">
        <span className="lm-category-list__name">{category.name}</span>
        <div className="lm-category-list__actions">
          <IconButton icon="pencil" size="sm" label={translate('finance:categories.list.edit')} onClick={() => onEdit(category)} />
          <IconButton icon="trash-2" size="sm" label={translate('finance:categories.list.delete')} onClick={() => onDelete(category)} />
        </div>
      </div>
    ))
  }

  function rangeLabel(page: PagedResponse<CategoryResponseDto>) {
    if (page.totalCount === 0) return translate('finance:categories.pagination.none')

    const from = (page.page - 1) * page.pageSize + 1
    return translate('finance:categories.pagination.range', {
      from,
      to: from + page.items.length - 1,
      count: page.totalCount,
    })
  }

  return (
    <section
      className={`lm-category-list${isFetching && status === 'ready' ? ' lm-category-list--fetching' : ''}`}
      aria-busy={isFetching}
    >
      <div className="lm-category-list__toolbar">
        <div className="lm-category-list__heading">
          <h2 className="lm-category-list__title">{translate('finance:categories.list.title')}</h2>
          {status === 'ready' && data ? (
            <span className="lm-category-list__count">
              {translate(hasSearch ? 'finance:categories.list.results' : 'finance:categories.list.count', {
                count: data.totalCount,
              })}
            </span>
          ) : null}
        </div>
        <Input
          type="search"
          size="sm"
          icon="search"
          placeholder={translate('finance:categories.list.searchPlaceholder')}
          aria-label={translate('finance:categories.list.searchPlaceholder')}
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          containerClassName="lm-category-list__search"
        />
      </div>

      <div className="lm-category-list__columns">
        <button type="button" className="lm-category-list__sort" onClick={onToggleSort}>
          {translate('finance:categories.list.columns.name')}
          <Icon name={sortDirection === 'Asc' ? 'chevron-up' : 'chevron-down'} size={12} />
        </button>
        <span className="lm-category-list__column-actions">{translate('finance:categories.list.columns.actions')}</span>
      </div>

      <div className="lm-category-list__rows">{renderRows()}</div>

      {status === 'ready' && data ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default CategoryList
