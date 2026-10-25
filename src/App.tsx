import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Home from "./Pages/Home";
import ProjectsRegistry from "./Pages/ProjectPage";
import ProjectDetailsPage from "./Components/Home components/ProjectModal";
import Login from "./Pages/Login";
import ProtectedRoutes from "./Components/ProtectedRoutes";
import { AdminDashBoard } from "./Pages/AdminDashBoard";
import ProjectManager from "./DashBoard/AdminDashBoard/ProjectManager";
import MediaManager from "./DashBoard/AdminDashBoard/MediaManager";
import ProjectLinksManager from "./DashBoard/AdminDashBoard/ProjectLinks";
import ProjectSectionManager from "./DashBoard/AdminDashBoard/ProjectSection";
import SkillsManager from "./DashBoard/AdminDashBoard/SkillsManager";
import ProjectTechManager from "./DashBoard/AdminDashBoard/ProjectTechManager";
import TimelineManager from "./DashBoard/AdminDashBoard/TimeLineManager";
import StackPage from "./Pages/StackPAge";
import ContactPage from "./Pages/Contatc";
import ServicesPage from "./Pages/Services";

// ✅ NEW — blog pages
import BlogPage from "./Pages/BlogPage";
import BlogPostPage from "./Pages/BlogPostPage";
import TechnologiesManager from "./DashBoard/AdminDashBoard/TechnologiesManager";
import ContactManager from "./DashBoard/AdminDashBoard/ContactManager";
import BlogManager from "./DashBoard/AdminDashBoard/BlogManager";
import TestimonialsManager from "./DashBoard/AdminDashBoard/TestimonialsManager";
import FAQsManager from "./DashBoard/AdminDashBoard/FAQsManager";
import FAQsPage from "./Pages/FAQsPage";
import Analytics from "./DashBoard/AdminDashBoard/AdminAnalytics";

const App = () => {
  const router = createBrowserRouter([
    {
      // 1. MAIN LANDING PAGE
      path: "/",
      element: <Home />,
    },
    {
      // 2. DEDICATED PROJECTS REGISTRY (The "See More" Page)
      path: "/projects",
      element: <ProjectsRegistry />,
    },
    {
      // 3. INDIVIDUAL PROJECT DEEP DIVE
      // The ':slug' acts as a placeholder for the project's slug
      path: "/project/:slug",
      element: <ProjectDetailsPage />,
    },
    {
      // LOGIN PAGE
      path: "/Auth",
      element: <Login />,
    },
    {
      path: "/tech",
      element: <StackPage />,
    },
    {
      path: "/services",
      element: <ServicesPage />,
    },
    {
      path: "/contact",
      element: <ContactPage />,
    },
    // ✅ NEW — BLOG LISTING
    {
      path: "/blog",
      element: <BlogPage />,
    },
    // ✅ NEW — INDIVIDUAL BLOG POST
    {
      path: "/blog/:slug",
      element: <BlogPostPage />,
    },
     {
      path: "/faqs",
      element: <FAQsPage />,
    },
    {
      // 4. FALLBACK / 404
      path: "*",
      element: <Home />,
    },

    {
      path: "/admin-dashboard",
      element: (
        <ProtectedRoutes>
          <AdminDashBoard />
        </ProtectedRoutes>
      ),
      children: [
        { path: "analytics", element: <Analytics /> },
        { path: "manage-projects", element: <ProjectManager /> },
        { path: "media-manager", element: <MediaManager /> },
        { path: "manage-tech", element: <TechnologiesManager /> },
        { path: "contact-manager", element: <ContactManager /> },
        { path: "blog-manager", element: <BlogManager /> },
        { path: "skills-manager", element: <SkillsManager /> },
        { path: "Testimony-managers", element: <TestimonialsManager /> },
        { path: "Section-manager", element: <ProjectSectionManager /> },
        { path: "Project-timeline", element: <TimelineManager /> },
        { path: "FAQ-manager", element: <FAQsManager /> },
      ],
    },
  ]);

  return (
    <ThemeProvider>
      <div className="app min-h-screen transition-colors duration-500">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
};

export default App;