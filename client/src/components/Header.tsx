import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Plus, LogIn, LogOut, Menu, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const Header = ({ openSubmitModal }: { openSubmitModal: () => void }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentCategory = searchParams.get('category') || 'all';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/', category: 'all' },
    { label: 'Events', to: '/?category=events', category: 'events' },
    { label: 'Opportunities', to: '/?category=opportunities', category: 'opportunities' },
    { label: 'Announcements', to: '/?category=announcements', category: 'announcements' },
  ];

  const isActive = (cat: string) => {
    if (cat === 'all') return currentCategory === 'all' && !searchParams.has('category');
    return currentCategory === cat;
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-campus-purple">
            <span className="font-bold text-white">C</span>
          </div>
          <span className="text-xl font-bold gradient-text">SEEUConnect</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-4">
          <nav className="flex items-center space-x-1 text-sm font-medium">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className={`px-3 py-2 transition-colors rounded-md ${
                  isActive(link.category)
                    ? 'bg-campus-purple/10 text-campus-purple font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          {isAuthenticated && (
            <Button
              onClick={openSubmitModal}
              className="bg-campus-purple hover:bg-campus-lightPurple hidden sm:flex"
            >
              <Plus size={18} className="mr-1" /> Submit
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">
                Hi, {user?.username}
              </span>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut size={18} className="mr-1" /> Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button className="bg-campus-purple hover:bg-campus-lightPurple">
                <LogIn size={18} className="mr-1" /> Login
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Bell size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">New CS workshop added</span>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Your submission was approved</span>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">
                <span className="text-xs text-campus-purple">View all</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive(link.category)
                  ? 'bg-campus-purple/10 text-campus-purple'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => { openSubmitModal(); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-campus-purple hover:bg-campus-purple/10"
            >
              + Submit Event
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
