import { DataTable } from "@/components/ui/data-table";
import { columns, SeriesColumn } from "./columns";

interface SeriesViewProps {
  data: SeriesColumn[];
}

export const SeriesView = ({ data }: SeriesViewProps) => {
  return (
    <div>
      <DataTable searchKey="name" columns={columns} data={data} />
    </div>
  );
};
