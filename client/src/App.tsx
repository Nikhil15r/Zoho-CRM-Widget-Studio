import React, { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { projectActions } from './store/projectStore';

export const App: React.FC = () => {
  useEffect(() => {
    projectActions.fetchProjects();
  }, []);

  return <MainLayout />;
};

export default App;
