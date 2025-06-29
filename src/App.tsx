// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Editor from './pages/Editor';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/create" element={<Editor mode="create" />} />
        <Route path="/edit/:id" element={<Editor mode="edit" />} />
        <Route path="/view/:id" element={<Editor mode="view" />} />
      </Routes>
    </Router>
  );
};

export default App;
