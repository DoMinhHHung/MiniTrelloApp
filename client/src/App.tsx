import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import BoardManagement from './pages/BoardManagement';
import GithubCallback from './components/Auth/GithubCallback';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/boards" element={<BoardManagement />} />
          <Route path="/auth/github/callback" element={<GithubCallback />} />
        </Routes>
      </BrowserRouter>
    </DndProvider>
  );
}

export default App;