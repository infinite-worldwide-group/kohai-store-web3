"use client";
import { INFO } from "@/types/brand";
import React, { useState } from "react";

// InvoiceID
// Data (Buyer Name)
// Location
// Product Name
// Status 
// Email
// Phone Number

const brandData: INFO[] = [
  {
    InvoiceID: "231937",
    Name: "Bobby Brown",
    Location: "Kuala Lumpur",
    Product_Name: "AOT: Final Exhibition",
    Status: "Failed",
    Email: "NewUser@gmail.com",
    Phone_Number: "0123213411"
  },
  {
    InvoiceID: "231321",
    Name: "Calvin Soong",
    Location: "Johor Bahru",
    Product_Name: "Sailor Moon Exhibition",
    Status: "Completed",
    Email: "JB@gmail.com",
    Phone_Number: "0157318514"
  },
  {
    InvoiceID: "321313",
    Name: "Ah Leong",
    Location: "Kuala Lumpur",
    Product_Name: "Hello Kitty World",
    Status: "Refunded",
    Email: "KL@gmail.com",
    Phone_Number: "0125175151"
  },
  {
    InvoiceID: "353313",
    Name: "Wan Qi",
    Location: "Pulau Penang",
    Product_Name: "Junji Ito Exhibition",
    Status: "Processing",
    Email: "PP@gmail.com",
    Phone_Number: "0197517291"
  },
  {
    InvoiceID: "392194",
    Name: "Kysont Tan",
    Location: "Kota Kinabalu",
    Product_Name: "Doraemon Exhibition",
    Status: "Completed",
    Email: "BigBoey@gmail.com",
    Phone_Number: "0173816481"
  },
  {
    InvoiceID: "392194",
    Name: "Kysont Tan",
    Location: "Kota Kinabalu",
    Product_Name: "Solo Leveling Exhibition",
    Status: "Completed",
    Email: "BigBoey@gmail.com",
    Phone_Number: "0173816481"
  },
  {
    InvoiceID: "321313",
    Name: "Ah Leong",
    Location: "Kuala Lumpur",
    Product_Name: "Jujutsu No Kaisen Exhibition",
    Status: "Completed",
    Email: "KL@gmail.com",
    Phone_Number: "0125175151"
  },
];

const TableOne = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(brandData.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = brandData.slice(indexOfFirstItem, indexOfLastItem);

  // Fill remaining rows if less than itemsPerPage
  const rowsToFill = itemsPerPage - currentOrders.length;

  // Pagination Handlers
  const nextPage = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Transaction Table
      </h4>

      <div className="flex flex-col">
        {/* Table Headers */}
        <div className="grid grid-cols-7 rounded-sm bg-gray-2 dark:bg-meta-4">
          {["InvoiceID", "Name", "Location", "Product Name", "Status", "Email", "Phone Number"].map((header, index) => (
            <div key={index} className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">{header}</h5>
            </div>
          ))}
        </div>

        {/* Table Body */}
        {currentOrders.map((brand, key) => (
          <div
            className={`grid grid-cols-7 ${
              key === currentOrders.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.InvoiceID}</p>
            </div>
            
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.Name}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.Location}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.Product_Name}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p
                className={`${
                  brand.Status === "Completed"
                    ? "text-green-500"
                    : brand.Status === "Processing"
                    ? "text-yellow-500"
                    : brand.Status === "Failed"
                    ? "text-red-500"
                    : brand.Status === "Refunded"
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {brand.Status}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-5">{brand.Email}</p>
            </div>
            
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-5">{brand.Phone_Number}</p>
            </div>
          </div>
        ))}

        {/* Fill empty rows to maintain table height */}
        {rowsToFill > 0 &&
          Array.from({ length: rowsToFill }).map((_, index) => (
            <div key={`empty-${index}`} className="grid grid-cols-7 border-b border-stroke dark:border-strokedark">
              {Array.from({ length: 7 }).map((_, colIndex) => (
                <div key={colIndex} className="p-2.5 xl:p-5 text-center text-gray-400">
                  -
                </div>
              ))}
            </div>
          ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 border rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          Previous
        </button>

        <span className="flex items-center">{`Page ${currentPage} of ${totalPages}`}</span>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 border rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableOne;
