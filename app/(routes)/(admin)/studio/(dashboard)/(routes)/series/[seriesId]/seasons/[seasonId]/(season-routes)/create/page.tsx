import { SeasonForm } from '@/components/series/seasons/seasons/season-form'
import { db } from '@/lib/db';
import React from 'react'

const CreateSeason = async () => {
  const seasons = await db.season.findMany({
    orderBy: {
      seasonNumber: "asc",
    },
  });

  return (
    <SeasonForm season={seasons[0]} seriesOptions={[]} />
  )
}

export default CreateSeason