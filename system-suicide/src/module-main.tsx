import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LangProvider } from './i18n';
import ModuleApp from './ModuleApp';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <ModuleApp />
    </LangProvider>
  </StrictMode>
);
