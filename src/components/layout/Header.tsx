
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();

  if (!user) return null;

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 truncate">{title}</h1>
        
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="text-right hidden sm:block">
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
          </div>
          
          <Avatar>
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            ) : null}
            <AvatarFallback className="bg-[#004aad] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
