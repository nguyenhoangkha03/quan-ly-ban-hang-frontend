/**
 * Avatar Utilities
 * Helper functions for managing user avatars
 */

type Gender = "male" | "female" | "other";

/**
 * Get default avatar URL based on user gender
 * @param gender - User's gender
 * @returns Avatar URL path
 */
export function getDefaultAvatar(gender?: Gender | null): string {
  switch (gender) {
    case "male":
      return "/images/user/user-01.jpg";
    case "female":
      return "/images/user/user-02.jpg";
    default:
      // For 'other' or undefined gender
      return "/images/user/owner.jpg";
  }
}

/**
 * Get user avatar URL with fallback to default
 * @param avatarUrl - Custom avatar URL from database
 * @param gender - User's gender for default avatar
 * @returns Avatar URL (custom or default based on gender)
 */
export function getUserAvatar(avatarUrl?: string | null, gender?: Gender | null): string {
  // Return custom avatar if exists and is valid
  if (avatarUrl && avatarUrl.trim() !== "") {
    return avatarUrl;
  }

  // Fallback to gender-based default avatar
  return getDefaultAvatar(gender);
}

/**
 * Get avatar initials from user's name
 * Used for avatar placeholders when no image is available
 * @param fullName - User's full name
 * @returns 1-2 character initials (uppercase)
 */
export function getAvatarInitials(fullName?: string | null): string {
  if (!fullName || fullName.trim() === "") {
    return "U"; // Default for "User"
  }

  const names = fullName.trim().split(" ").filter(Boolean);

  if (names.length === 0) {
    return "U";
  }

  if (names.length === 1) {
    // Single name: take first 2 characters
    return names[0].substring(0, 2).toUpperCase();
  }

  // Multiple names: take first character of first and last name
  const firstInitial = names[0][0];
  const lastInitial = names[names.length - 1][0];

  return `${firstInitial}${lastInitial}`.toUpperCase();
}

/**
 * Get avatar background color based on name (for initial avatars)
 * Generates consistent color for same name
 * @param name - User's name
 * @returns Tailwind CSS color class
 */
export function getAvatarColor(name?: string | null): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  if (!name) {
    return colors[0];
  }

  // Generate index based on name hash
  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
