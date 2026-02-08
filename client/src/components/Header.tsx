
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Plus, LogIn, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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

  const handleLogout = () => {
    logout();
    navigate('/');
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

        <div className="hidden md:flex items-center space-x-4">
          <nav className="flex items-center space-x-2 text-sm font-medium">
            <Link to="/" className="px-3 py-2 transition-colors rounded-md hover:bg-gray-100">Home</Link>
            <Link to="/" className="px-3 py-2 transition-colors rounded-md hover:bg-gray-100">Events</Link>
            <Link to="/" className="px-3 py-2 transition-colors rounded-md hover:bg-gray-100">Opportunities</Link>
            <Link to="/" className="px-3 py-2 transition-colors rounded-md hover:bg-gray-100">Announcements</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          {/* Only show Submit button if logged in */}
          {isAuthenticated && (
            <Button
              onClick={openSubmitModal}
              className="bg-campus-purple hover:bg-campus-lightPurple"
            >
              <Plus size={18} className="mr-1" /> Submit
            </Button>
          )}

          {/* Show Login or User info based on auth state */}
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">
                Hi, {user?.username}
              </span>
              <Button variant="outline" onClick={handleLogout}>
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
        </div>
      </div>
    </header>
  );
};

export default Header;
