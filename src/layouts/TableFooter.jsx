import React from "react";
import { useTranslation } from "react-i18next";

const TableFooter = ({
  page,
  perPage,
  totalRecords,
  onPageChange,
  onPerPageChange,
}) => {
  const { t } = useTranslation();

  const totalPages = Math.ceil(totalRecords / perPage);
  const start = totalRecords === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(start + perPage - 1, totalRecords);
  console.log(totalPages, start, end);

  const renderPagination = () => {
    const pages = [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);

    let startPage = Math.max(1, page - half);
    let endPage = Math.min(totalPages, page + half);

    if (page <= half) {
      endPage = Math.min(totalPages, maxButtons);
    }

    if (page + half >= totalPages) {
      startPage = Math.max(1, totalPages - maxButtons + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => onPageChange(1)}>
          1
        </button>
      );
      if (startPage > 2) pages.push(<span key="start-ellipsis">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={page === i ? "active" : ""}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1)
        pages.push(<span key="end-ellipsis">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="table-footer">
      <div className="left">
        {t("common.show")}{" "}
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>{" "}
        {t("common.entries")}
      </div>

      <div className="center">
        {totalRecords > 0 ? (
          <span>
            {t("common.result.showing")} {start} {t("common.result.to")} {end}{" "}
            {t("common.result.of")} {totalRecords} {t("common.result.entries")}
          </span>
        ) : (
          <span>{t("common.result.no_record")}</span>
        )}
      </div>

      <div className="right">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="previous-btn"
        >
          {t("common.previous")}
        </button>

        {renderPagination()}

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="next-btn"
        >
          {t("common.next")}
        </button>
      </div>
    </div>
  );
};

export default TableFooter;
