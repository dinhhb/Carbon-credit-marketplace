import React, { ReactNode } from 'react';
import { useAccount, useAccounts } from '@/hooks/web3';
import UnregisteredAccountNotification from '../Notifications/UnregisteredAccountNotification';

interface CheckUserRegistrationProps {
  children: ReactNode;
}

const CheckUserRegistration: React.FC<CheckUserRegistrationProps> = ({ children }) => {
  const { account } = useAccount();
  const { accounts } = useAccounts();

  let isUserRegistered = false;

  for (let i = 0; i < accounts.data!.length; i++) {
    if (accounts.data![i].address === account.data) {
      isUserRegistered = true;
    }
  }

  return (
    <>
      {isUserRegistered ? children : <UnregisteredAccountNotification />}
    </>
  );
};

export default CheckUserRegistration;
