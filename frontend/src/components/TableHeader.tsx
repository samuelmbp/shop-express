import React from "react";

const TableHeader = ({ label }) => {
    return (
        <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
        >
            {label}
        </th>
    );
};

export default TableHeader;
