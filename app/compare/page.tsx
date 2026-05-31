import type { Metadata } from 'next';
import CompareClient from './CompareClient';

export const metadata: Metadata = {
  title: 'Compare | CommitPulse',
  description:
    'Compare two GitHub developers side-by-side — streaks, contributions, languages, and 3D monoliths.',
  openGraph: {
    title: 'Compare Developers | CommitPulse',
    description: 'Put two GitHub profiles head-to-head with rich visual comparison.',
  },
};

export default function ComparePage() {
  return <CompareClient />;
}
