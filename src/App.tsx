import { BrowserRouter } from 'react-router-dom';
import Routing from '@/routes';
import i18nInstall from '@/i18n';

function App() {
  i18nInstall();
  return (
    <BrowserRouter>
      <Routing />
    </BrowserRouter>
  );
}

export default App;
