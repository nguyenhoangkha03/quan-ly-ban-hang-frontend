import type React from "react";
import Link from "next/link";

interface DropdownItemProps {
  tag?: "a" | "button";
  href?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  baseClassName?: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = "button",
  href,
  onClick,
  onItemClick,
  baseClassName = "flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
  className = "",
  disabled = false,
  children,
}) => {
  const combinedClasses = `${baseClassName} ${className}`.trim();

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (tag === "button") {
      event.preventDefault();
    }
    if (onClick) onClick();
    if (onItemClick) onItemClick();
  };

  if (tag === "a" && href) {
    return (
      <Link 
        href={href} 
        className={combinedClasses}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          handleClick(e);
        }}
        aria-disabled={disabled}
      >
        {children}
      </Link>
    );
  }

  return (
    <button 
      onClick={handleClick} 
      className={combinedClasses}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
