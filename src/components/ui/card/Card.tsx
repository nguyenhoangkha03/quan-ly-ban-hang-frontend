import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg border border-gray-200 bg-white p-6 shadow-sm
        dark:border-gray-700 dark:bg-gray-800
        ${hoverable || onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
