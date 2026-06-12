import { Navigate, Outlet, useOutletContext, useParams } from 'react-router-dom';
import type { Card, Subject } from '../types';
import { getSubject } from '../lib/subjects';
import { useSubjectData } from '../hooks/useSubjectData';

export interface SubjectCtx {
  subject: Subject;
  cards: Card[];
}

export function useSubjectCtx(): SubjectCtx {
  return useOutletContext<SubjectCtx>();
}

export function SubjectLayout() {
  const { subject: id } = useParams();
  const subject = getSubject(id);
  const cards = useSubjectData(subject);

  if (!subject) return <Navigate to="/" replace />;
  if (cards === null) return null; // data chunk loading — render nothing briefly

  return <Outlet context={{ subject, cards } satisfies SubjectCtx} />;
}
