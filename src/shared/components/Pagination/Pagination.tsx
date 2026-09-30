import { useTranslation } from 'react-i18next'
import { getPageItems } from '../../utils/getPageItems'
import IconButton from '../IconButton/IconButton'
import './Pagination.css'

interface PaginationProps {
  page: number
  totalPages: number
  /** Already-translated summary, e.g. "1–8 of 42 categories" — the caller knows the noun. */
  rangeLabel: string
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, rangeLabel, onPageChange }: PaginationProps) {
  const { t: translate } = useTranslation('common')

  return (
    <div className="lm-pagination">
      <span className="lm-pagination__range">{rangeLabel}</span>

      <nav className="lm-pagination__pages" aria-label={translate('common:pagination.navAria')}>
        <IconButton
          icon="chevron-left"
          size="sm"
          label={translate('common:pagination.previous')}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        {getPageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="lm-pagination__gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`lm-pagination__page${item === page ? ' lm-pagination__page--current' : ''}`}
              aria-current={item === page ? 'page' : undefined}
              aria-label={translate('common:pagination.page', { page: item })}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}
        <IconButton
          icon="chevron-right"
          size="sm"
          label={translate('common:pagination.next')}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </nav>
    </div>
  )
}

export default Pagination
