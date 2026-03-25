import { Outlet } from 'react-router';
import { Header } from './components/Header';

export function Root() {
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />
      <Outlet />
    </div>
  );
}
