import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../shared/components/Button/Button'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import CategoryFormModal from '../components/CategoryFormModal/CategoryFormModal'
import CategoryList from '../components/CategoryList/CategoryList'
import DeleteCategoryModal from '../components/DeleteCategoryModal/DeleteCategoryModal'
import { useCategories } from '../hooks/useCategories'
import type { CategoryResponseDto } from '../types/CategoryDtos'
import { CATEGORY_IN_USE_CODE, CATEGORY_NOT_FOUND_CODE } from '../validation/categoryErrorMap'
import type { CategoryFormValues } from '../validation/categorySchema'
import './CategoriesPage.css'

type FormTarget = { mode: 'create' } | { mode: 'edit'; category: CategoryResponseDto }

function CategoriesPage() {
  const { t: translate } = useTranslation(['finance', 'common'])
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const categories = useCategories()
  const { reload, createCategory, updateCategory, deleteCategory } = categories
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponseDto | null>(null)

  async function handleSubmitForm(values: CategoryFormValues) {
    if (formTarget?.mode === 'edit') {
      await updateCategory(formTarget.category.id, values)
      showToast(translate('finance:categories.toasts.updated'))
    } else {
      await createCategory(values)
      showToast(translate('finance:categories.toasts.created'))
    }
    setFormTarget(null)
  }

  async function handleConfirmDelete(category: CategoryResponseDto) {
    try {
      await deleteCategory(category.id)
      showToast(translate('finance:categories.toasts.deleted'))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      } else if (err.code === CATEGORY_NOT_FOUND_CODE) {
        showErrorModal(translate('finance:categories.delete.errorTitle'), translate('finance:categories.validation.notFound'))
        reload()
      } else if (err.code === CATEGORY_IN_USE_CODE) {
        showErrorModal(translate('finance:categories.delete.errorTitle'), translate('finance:categories.delete.inUse'))
      } else {
        showErrorModal(translate('finance:categories.delete.errorTitle'), translate('common:errors.generic'))
      }
    }
    setDeleteTarget(null)
  }

  return (
    <main className="lm-categories-page">
      <div className="lm-categories-page__header">
        <div className="lm-categories-page__heading">
          <span className="lm-categories-page__eyebrow">{translate('finance:module.name')}</span>
          <h1 className="lm-categories-page__title">{translate('finance:categories.title')}</h1>
        </div>
        <Button variant="primary" icon="plus" onClick={() => setFormTarget({ mode: 'create' })}>
          {translate('finance:categories.newButton')}
        </Button>
      </div>

      <CategoryList
        data={categories.data}
        status={categories.status}
        isFetching={categories.isFetching}
        searchInput={categories.searchInput}
        onSearchChange={categories.setSearchInput}
        appliedSearch={categories.search}
        sortDirection={categories.sortDirection}
        onToggleSort={categories.toggleSortDirection}
        onPageChange={categories.setPage}
        onRetry={reload}
        onCreate={() => setFormTarget({ mode: 'create' })}
        onEdit={(category) => setFormTarget({ mode: 'edit', category })}
        onDelete={setDeleteTarget}
      />

      {formTarget ? (
        <CategoryFormModal
          category={formTarget.mode === 'edit' ? formTarget.category : undefined}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteCategoryModal
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleConfirmDelete(deleteTarget)}
        />
      ) : null}
    </main>
  )
}

export default CategoriesPage
