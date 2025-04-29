import React from 'react';

interface GroupBadgeProps {
  name: string;
  isHighlighted?: boolean;
}

const GroupBadge: React.FC<GroupBadgeProps> = ({ name, isHighlighted = false }) => {
  const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
  
  // Determine classes based on highlight status and group name
  const classes = isHighlighted 
    ? `${baseClasses} bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300`
    : `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
  
  return (
    <span className={classes}>
      {name}
    </span>
  );
};

export default GroupBadge;