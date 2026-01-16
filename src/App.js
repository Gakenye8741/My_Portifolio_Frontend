import { jsx as _jsx } from "react/jsx-runtime";
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
            element: _jsx(Home, {}),
        },
        {
            // 2. DEDICATED PROJECTS REGISTRY (The "See More" Page)
            path: "/projects",
            element: _jsx(ProjectsRegistry, {}),
        },
        {
            // 3. INDIVIDUAL PROJECT DEEP DIVE
            // The ':id' acts as a placeholder for the project's UUID
            path: "/project/:id",
            element: _jsx(ProjectDetailsPage, {}),
        },
        {
            // 3. INDIVIDUAL PROJECT DEEP DIVE
            // The ':id' acts as a placeholder for the project's UUID
            path: "/Auth",
            element: _jsx(Login, {}),
        },
        {
            // 4. FALLBACK / 404
            path: "*",
            element: _jsx(Home, {}),
        },
        {
            path: '/admin-dashboard',
            element: (_jsx(ProtectedRoutes, { children: _jsx(AdminDashBoard, {}) })),
            children: [
                { path: "manage-projects", element: _jsx(ProjectManager, {}) },
                { path: "media-manager", element: _jsx(MediaManager, {}) },
                { path: "manage-links", element: _jsx(ProjectLinksManager, {}) },
                { path: "skills-manager", element: _jsx(SkillsManager, {}) },
                { path: "ProjectTech-manager", element: _jsx(ProjectTechManager, {}) },
                { path: "Section-manager", element: _jsx(ProjectSectionManager, {}) },
                { path: "Project-timeline", element: _jsx(TimelineManager, {}) },
            ],
        },
    ]);
    return (_jsx(ThemeProvider, { children: _jsx("div", { className: "app min-h-screen transition-colors duration-500", children: _jsx(RouterProvider, { router: router }) }) }));
};
export default App;
