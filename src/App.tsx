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
      // The ':id' acts as a placeholder for the project's UUID
      path: "/project/:id",
      element: <ProjectDetailsPage />,
    },
    {
      // 3. INDIVIDUAL PROJECT DEEP DIVE
      // The ':id' acts as a placeholder for the project's UUID
      path: "/Auth",
      element: <Login />,
    },
    
    {
      // 4. FALLBACK / 404
      path: "*",
      element: <Home />,
    },
     {
      path: '/admin-dashboard',
      element: (
        <ProtectedRoutes>
          <AdminDashBoard />
        </ProtectedRoutes>
      ),
      children: [
        { path: "manage-projects", element:  <ProjectManager /> },
        { path: "media-manager", element:  <MediaManager /> },
        { path: "manage-links", element:  <ProjectLinksManager /> },
        { path: "skills-manager", element:  <SkillsManager /> },
        { path: "ProjectTech-manager", element:  <ProjectTechManager /> },
        { path:  "Section-manager" , element: <ProjectSectionManager/> },
        { path:  "Project-timeline" , element: <TimelineManager/> },
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