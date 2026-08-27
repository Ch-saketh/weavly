import * as React from "react";

const Table = React.forwardRef(({ className = "", ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={`w-full caption-bottom text-xs text-left ${className}`} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef(({ className = "", ...props }, ref) => (
  <thead ref={ref} className={`border-b border-[#E4E4E7] bg-[#FAFAF9] text-[11px] font-extrabold uppercase text-[#71717A] tracking-wider ${className}`} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className = "", ...props }, ref) => (
  <tbody ref={ref} className={`divide-y divide-[#E4E4E7] ${className}`} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef(({ className = "", ...props }, ref) => (
  <tr ref={ref} className={`hover:bg-[#FAFAF9] transition-colors ${className}`} {...props} />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({ className = "", ...props }, ref) => (
  <th ref={ref} className={`h-10 px-4 text-left align-middle font-extrabold text-[#71717A] ${className}`} {...props} />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className = "", ...props }, ref) => (
  <td ref={ref} className={`p-4 align-middle text-[#18181B] ${className}`} {...props} />
));
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell };
