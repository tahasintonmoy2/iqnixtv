"use client";

import { useEffect, useState } from "react";
//import { VoiceSearchModal } from "../models/voice-search-modal";
import { CreatePlaylistModal } from "../models/create-playlist-modal";
import { AuthModal } from "../models/auth-modal";
import { CreateNewSeries } from "../models/create-series-modal";

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
      <CreateNewSeries />
      <CreatePlaylistModal />
      <AuthModal />
    </>
  );
};
