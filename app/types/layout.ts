import { ReactNode } from "react";

// Base component props interface
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Header component specific props
export interface HeaderProps extends Omit<BaseComponentProps, 'children'> {
  // Additional header-specific props can be added here
  // e.g., logoUrl?: string; currentPath?: string;
}

// Footer component specific props
export interface FooterProps extends Omit<BaseComponentProps, 'children'> {
  // Additional footer-specific props can be added here
  // e.g., copyrightText?: string; socialLinks?: SocialLink[];
}

// Layout component specific props
export interface LayoutProps extends BaseComponentProps {
  children: ReactNode; // Required for Layout
  // Additional layout-specific props can be added here
  // e.g., showHeader?: boolean; showFooter?: boolean;
}

// Navigation item interface
export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
  children?: NavItem[];
}

// Breaking news item interface
export interface BreakingNewsItem {
  id: string;
  title: string;
  url: string;
}

// Social media link interface
export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}