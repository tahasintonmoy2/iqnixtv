import { DataTable } from "@/components/ui/data-table";
import { columns, TrailerColumn } from "./columns";

interface SeriesViewProps {
  data: TrailerColumn[];
}

export const TrailerView = ({ data }: SeriesViewProps) => {
  return (
    <div>
      <DataTable searchKey="name" columns={columns} data={data} />
    </div>
  );
};
