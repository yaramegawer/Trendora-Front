import React from 'react';
import MainLayout from './components/layout/MainLayout.fixed';

const TestLayoutApp = () => {
  const currentUser = { id: 1, name: "Admin User", role: "Admin" };

  return (
    <MainLayout
      currentUser={currentUser}
      initialRoute="/hr"
    />
  );
};

export default TestLayoutApp;
