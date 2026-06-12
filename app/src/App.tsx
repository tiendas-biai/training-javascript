import { Navigate, Route, Routes } from 'react-router-dom';
import { SubjectPicker } from './screens/SubjectPicker';
import { SubjectLayout } from './screens/SubjectLayout';
import { SubjectHome } from './screens/SubjectHome';
import { CardLibrary } from './screens/CardLibrary';
import { CardDetail } from './screens/CardDetail';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<SubjectPicker />} />
      <Route path="/:subject" element={<SubjectLayout />}>
        <Route index element={<SubjectHome />} />
        <Route path="card-library" element={<CardLibrary />} />
        <Route path="card/:id" element={<CardDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
