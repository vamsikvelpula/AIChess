import { Navigate, Route, Routes } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import ChessBackground from "./components/layout/ChessBackground";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import PlayPage from "./pages/PlayPage";
import AnalysisPage from "./pages/AnalysisPage";
import HistoryPage from "./pages/HistoryPage";
import PuzzlesPage from "./pages/PuzzlesPage";
import PuzzleSolvePage from "./pages/PuzzleSolvePage";
import LessonsPage from "./pages/LessonsPage";
import LessonDetailPage from "./pages/LessonDetailPage";

function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <ChessBackground loggedIn={!!user} />
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/play/:level" element={<PlayPage />} />
            <Route path="/analysis/:gameId" element={<AnalysisPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/puzzles" element={<PuzzlesPage />} />
            <Route path="/puzzles/:puzzleId" element={<PuzzleSolvePage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lessons/:slug" element={<LessonDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
