"use client";

import { useEffect, useState } from "react";
//import { VoiceSearchModal } from "../models/voice-search-modal";
import { AuthModal } from "../models/auth-modal";
import { CreateCommunityModel } from "../models/create-community-model";
import { CreatePlaylistModal } from "../models/create-playlist-modal";
import { CreateNewSeries } from "../models/create-series-modal";
import { RequestDramaDialog } from "../models/request-drama-model";
import { CreateNewTrailer } from "../models/create-trailer-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <RequestDramaDialog />
      <CreateCommunityModel />
      <CreateNewSeries />
      <CreateNewTrailer />
      <CreatePlaylistModal />
      <AuthModal />
    </>
  );
};
