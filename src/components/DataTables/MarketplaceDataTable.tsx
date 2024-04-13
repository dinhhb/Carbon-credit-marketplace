import Link from "next/link";
import React, { useMemo } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  usePagination,
  Column,
} from "react-table";
import CreditInfoModal from "../Modals/CreditInfoModal";
import OwnersModal from "../Modals/OwnersModal";

interface Credit {
  creditId: string;
  projectName: string;
  projectType: string;
  standard: string;
  vintage: string;
  quantityIssued: string;
  pricePerCredit: string;
  numberOfOwners: number;
}

const dataCredit: Credit[] = [
  {
    creditId: "1",
    projectName: "Brielle Kuphal",
    projectType: "Senior Javascript Developer",
    standard: "Edinburgh",
    vintage: "25",
    quantityIssued: "2012/03/29",
    pricePerCredit: "$433,060",
    numberOfOwners: 2,
  },
  {
    creditId: "2",
    projectName: "Barney Murray",
    projectType: "Senior Backend Developer",
    standard: "amsterdam",
    vintage: "29",
    quantityIssued: "2010/05/01",
    pricePerCredit: "$424,785",
    numberOfOwners: 1,
  },
  {
    creditId: "3",
    projectName: "Ressie Ruecker",
    projectType: "Senior Frontend Developer",
    standard: "Jakarta",
    vintage: "27",
    quantityIssued: "2013/07/01",
    pricePerCredit: "$785,210",
    numberOfOwners: 3,
  },
  {
    creditId: "4",
    projectName: "Teresa Mertz",
    projectType: "Senior Designer",
    standard: "New Caledonia",
    vintage: "25",
    quantityIssued: "2014/05/30",
    pricePerCredit: "$532,126",
    numberOfOwners: 1,
  },
  {
    creditId: "5",
    projectName: "Chelsey Hackett",
    projectType: "Product Manager",
    standard: "NewYork",
    vintage: "26",
    quantityIssued: "2011/09/30",
    pricePerCredit: "$421,541",
    numberOfOwners: 2,
  },
  {
    creditId: "6",
    projectName: "Tatyana Metz",
    projectType: "Senior Product Manvintager",
    standard: "NewYork",
    vintage: "28",
    quantityIssued: "2009/09/30",
    pricePerCredit: "$852,541",
    numberOfOwners: 1,
  },
  {
    creditId: "7",
    projectName: "Oleta Harvey",
    projectType: "Junior Product Manvintager",
    standard: "California",
    vintage: "25",
    quantityIssued: "2015/10/30",
    pricePerCredit: "$654,444",
    numberOfOwners: 3,
  },
  {
    creditId: "8",
    projectName: "Bette Haag",
    projectType: "Junior Product Manvintager",
    standard: "Carolina",
    vintage: "29",
    quantityIssued: "2017/12/31",
    pricePerCredit: "$541,111",
    numberOfOwners: 1,
  },
  {
    creditId: "9",
    projectName: "Meda Ebert",
    projectType: "Junior Web Developer",
    standard: "Amsterdam",
    vintage: "27",
    quantityIssued: "2015/10/31",
    pricePerCredit: "$651,456",
    numberOfOwners: 2,
  },
  {
    creditId: "10",
    projectName: "Elissa Stroman",
    projectType: "Junior React Developer",
    standard: "Kuala Lumpur",
    vintage: "29",
    quantityIssued: "2008/05/31",
    pricePerCredit: "$566,123",
    numberOfOwners: 1,
  },
  {
    creditId: "11",
    projectName: "Sid Swaniawski",
    projectType: "Senior React Developer",
    standard: "Las Vegas",
    vintage: "29",
    quantityIssued: "2009/09/01",
    pricePerCredit: "$852,456",
    numberOfOwners: 3,
  },
  {
    creditId: "12",
    projectName: "Madonna Hahn",
    projectType: "Senior Vue Developer",
    standard: "New York",
    vintage: "27",
    quantityIssued: "2006/10/01",
    pricePerCredit: "$456,147",
    numberOfOwners: 1,
  },
  {
    creditId: "13",
    projectName: "Waylon Kihn",
    projectType: "Senior HTML Developer",
    standard: "Amsterdam",
    vintage: "23",
    quantityIssued: "2017/11/01",
    pricePerCredit: "$321,254",
    numberOfOwners: 2,
  },
  {
    creditId: "14",
    projectName: "Jaunita Lindgren",
    projectType: "Senior Backend Developer",
    standard: "Jakarta",
    vintage: "25",
    quantityIssued: "2018/12/01",
    pricePerCredit: "$321,254",
    numberOfOwners: 1,
  },
  {
    creditId: "15",
    projectName: "Lenora MacGyver",
    projectType: "Junior HTML Developer",
    standard: "Carolina",
    vintage: "27",
    quantityIssued: "2015/09/31",
    pricePerCredit: "$852,254",
    numberOfOwners: 3,
  },
  {
    creditId: "16",
    projectName: "Edyth McCullough",
    projectType: "Senior Javascript Developer",
    standard: "Edinburgh",
    vintage: "25",
    quantityIssued: "2012/03/29",
    pricePerCredit: "$433,060",
    numberOfOwners: 1,
  },
  {
    creditId: "17",
    projectName: "Ibrahim Stroman",
    projectType: "Senior Backend Developer",
    standard: "amsterdam",
    vintage: "29",
    quantityIssued: "2010/05/01",
    pricePerCredit: "$424,785",
    numberOfOwners: 2,
  },
  {
    creditId: "18",
    projectName: "Katelynn Reichert",
    projectType: "Senior Frontend Developer",
    standard: "Jakarta",
    vintage: "27",
    quantityIssued: "2013/07/01",
    pricePerCredit: "$785,210",
    numberOfOwners: 1,
  },
  {
    creditId: "19",
    projectName: "Logan Kiehn",
    projectType: "Senior Designer",
    standard: "New Caledonia",
    vintage: "25",
    quantityIssued: "2014/05/30",
    pricePerCredit: "$532,126",
    numberOfOwners: 3,
  },
  {
    creditId: "20",
    projectName: "Rogers Stanton",
    projectType: "Product Manvintager",
    standard: "NewYork",
    vintage: "26",
    quantityIssued: "2011/09/30",
    pricePerCredit: "$421,541",
    numberOfOwners: 1,
  },
  {
    creditId: "21",
    projectName: "Alanis Torp",
    projectType: "Senior Product Manvintager",
    standard: "NewYork",
    vintage: "28",
    quantityIssued: "2009/09/30",
    pricePerCredit: "$852,541",
    numberOfOwners: 2,
  },
  {
    creditId: "22",
    projectName: "Jarvis Bauch",
    projectType: "Junior Product Manvintager",
    standard: "California",
    vintage: "25",
    quantityIssued: "2015/10/30",
    pricePerCredit: "$654,444",
    numberOfOwners: 1,
  },
  {
    creditId: "23",
    projectName: "Trey Ritchie",
    projectType: "Junior Product Manvintager",
    standard: "Carolina",
    vintage: "29",
    quantityIssued: "2017/12/31",
    pricePerCredit: "$541,111",
    numberOfOwners: 3,
  },
  {
    creditId: "24",
    projectName: "Ronny Dietrich",
    projectType: "Junior Web Developer",
    standard: "Amsterdam",
    vintage: "27",
    quantityIssued: "2015/10/31",
    pricePerCredit: "$651,456",
    numberOfOwners: 1,
  },
  {
    creditId: "25",
    projectName: "Isabella Christiansen",
    projectType: "Junior React Developer",
    standard: "Kuala Lumpur",
    vintage: "29",
    quantityIssued: "2008/05/31",
    pricePerCredit: "$566,123",
    numberOfOwners: 2,
  },
];

// table header
const columns: Column<Credit>[] = [
  {
    Header: "Credit ID",
    accessor: "creditId",
  },
  {
    Header: "Project name",
    accessor: "projectName",
  },
  {
    Header: "Project type",
    accessor: "projectType",
  },
  {
    Header: "Standard",
    accessor: "standard",
  },
  {
    Header: "Vintage",
    accessor: "vintage",
  },
  {
    Header: "Quantity",
    accessor: "quantityIssued",
  },
  {
    Header: "Price/credit",
    accessor: "pricePerCredit",
  },
  {
    Header: "Numbers of owners",
    accessor: "numberOfOwners",
    Cell: ({ value }) => <OwnersModal numberOfOwners={value} />,
  },
];

const MarketplaceDataTable = () => {
  const data = useMemo(() => dataCredit, []);

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    setPageSize,
    gotoPage,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;

  return (
    <section className="data-table-common data-table-two rounded-sm border border-stroke bg-white py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between border-b border-stroke px-8 pb-4 dark:border-strokedark">
        <div className="w-100">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-md border border-stroke px-5 py-2.5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
            placeholder="Search..."
          />
        </div>

        <div className="flex items-center font-medium">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-transparent pl-2"
          >
            {[5, 10, 20, 50].map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
          <p className="pl-2 text-black dark:text-white">Entries Per Page</p>
        </div>
      </div>

      <table
        {...getTableProps()}
        className="datatable-table w-full table-auto !border-collapse overflow-hidden break-words px-4 md:table-fixed md:overflow-auto md:px-8"
      >
        <thead>
          {headerGroups.map((headerGroup, key) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={key}>
              {headerGroup.headers.map((column, key) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  key={key}
                >
                  <div className="flex items-center">
                    <span> {column.render("Header")}</span>

                    <div className="ml-2 inline-flex flex-col space-y-[2px]">
                      <span className="inline-block">
                        <svg
                          className="fill-current"
                          width="10"
                          height="5"
                          viewBox="0 0 10 5"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5 0L0 5H10L5 0Z" fill="" />
                        </svg>
                      </span>
                      <span className="inline-block">
                        <svg
                          className="fill-current"
                          width="10"
                          height="5"
                          viewBox="0 0 10 5"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 5L10 0L-4.37114e-07 8.74228e-07L5 5Z"
                            fill=""
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </th>
              ))}
              <th></th>
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, key) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={key}>
                {row.cells.map((cell, key) => {
                  return (
                    <td {...cell.getCellProps()} key={key}>
                      {cell.render("Cell")}
                    </td>
                  );
                })}
                <td>
                  <div className="flex">
                    <div>
                      <CreditInfoModal />
                    </div>
                    {/* <div>
                      <OwnersModal />
                    </div> */}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-between border-t border-stroke px-8 pt-5 dark:border-strokedark">
        <p className="font-medium">
          Showing {pageIndex + 1} 0f {pageOptions.length} pages
        </p>
        <div className="flex">
          <button
            className="flex cursor-pointer items-center justify-center rounded-md p-1 px-2 hover:bg-primary hover:text-whiter"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.1777 16.1156C12.009 16.1156 11.8402 16.0593 11.7277 15.9187L5.37148 9.44995C5.11836 9.19683 5.11836 8.80308 5.37148 8.54995L11.7277 2.0812C11.9809 1.82808 12.3746 1.82808 12.6277 2.0812C12.8809 2.33433 12.8809 2.72808 12.6277 2.9812L6.72148 8.99995L12.6559 15.0187C12.909 15.2718 12.909 15.6656 12.6559 15.9187C12.4871 16.0312 12.3465 16.1156 12.1777 16.1156Z"
                fill=""
              />
            </svg>
          </button>

          {pageOptions.map((_page, index) => (
            <button
              key={index}
              onClick={() => {
                gotoPage(index);
              }}
              className={`${
                pageIndex === index && "bg-primary text-white"
              } mx-1 flex cursor-pointer items-center justify-center rounded-md p-1 px-3 hover:bg-primary hover:text-white`}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="flex cursor-pointer items-center justify-center rounded-md p-1 px-2 hover:bg-primary hover:text-white"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.82148 16.1156C5.65273 16.1156 5.51211 16.0593 5.37148 15.9468C5.11836 15.6937 5.11836 15.3 5.37148 15.0468L11.2777 8.99995L5.37148 2.9812C5.11836 2.72808 5.11836 2.33433 5.37148 2.0812C5.62461 1.82808 6.01836 1.82808 6.27148 2.0812L12.6277 8.54995C12.8809 8.80308 12.8809 9.19683 12.6277 9.44995L6.27148 15.9187C6.15898 16.0312 5.99023 16.1156 5.82148 16.1156Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceDataTable;
