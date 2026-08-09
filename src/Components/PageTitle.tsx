import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
  useEffect(() => {
    // If the title is "Home", keep the main brand title clean
    document.title = title.toLowerCase() === "home" 
      ? "Gakenye Ndiritu | Full-Stack Software Engineer & CS Student" 
      : `${title} | Gakenye Ndiritu`;
  }, [title]);

  return null;
}