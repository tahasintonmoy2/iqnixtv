import { CreateNewSeries } from "@/components/models/create-series-modal";
import React, { ReactNode } from "react";

const SeriesLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <CreateNewSeries />
      <main>{children}</main>
    </div>
  );
};

export default SeriesLayout;
