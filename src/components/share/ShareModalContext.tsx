import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';

type ShareModalContextType = {
  openShareModal: (content: ReactNode) => void;
};

const ShareContext = createContext<ShareModalContextType | undefined>(undefined);

export const ShareModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [opened, modal] = useDisclosure(false);
    const [content, setContent] = useState<ReactNode>(<></>)

  const openShareModal = (content: ReactNode) => {
    modal.open()
    console.log("Sharing:", content);
    setContent(content)
  };

    return (
        <>
            <ShareContext.Provider value={{openShareModal}}>
                {children}
            </ShareContext.Provider>
            <Modal opened={opened} onClose={modal.close} title="Share" centered>
                {content}
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
