import { DataTable } from "@/components/ui/data-table";
import { columns, SeasonColumn } from "./columns";

interface SeriesViewProps {
  data: SeasonColumn[];
}

export const SeasonView = ({ data }: SeriesViewProps) => {
  return (
    <div>
      <DataTable searchKey="name" columns={columns} data={data} />
    </div>
  );
};
