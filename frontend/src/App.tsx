import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ContentEditor } from './components/ContentEditor';
import { ContentList } from './components/ContentList';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/content" element={<ContentList />} />
              <Route path="/content/new" element={<ContentEditor />} />
              <Route path="/content/edit/:id" element={<ContentEditor />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
