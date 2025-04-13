import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import ShareModal from './ShareModal';

type ShareModalContextType = {
  openShareModal: (screenshotPngData: string) => void;
};

const ShareContext = createContext<ShareModalContextType | undefined>(undefined);

export const ShareModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [opened, modal] = useDisclosure(false);
    const [content, setContent] = useState<string>()

  const openShareModal = (screenshotPngData: string) => {
    modal.open()
    setContent(screenshotPngData)
  };

    return (
        <>
            <ShareContext.Provider value={{openShareModal}}>
                {children}
            </ShareContext.Provider>
            <Modal opened={opened} size="xl" 
                onClose={modal.close} title="Share" centered>
                <ShareModal pngImage={content} />
            </Modal>
        </>
    );
};

export const useShareModal = (): ShareModalContextType => {
  const context = useContext(ShareContext);
  if (!context) {
    throw new Error("useShare must be used within a ShareProvider");
  }
  return context;
};
