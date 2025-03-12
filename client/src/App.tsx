import { Switch, Route, useLocation } from "wouter";
import { useUser } from "./hooks/use-user";
import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { Loader2 } from "lucide-react";
// import { TteokbokkiGame } from "./components/games/TteokbokkiGame";
// import { KartRiderGame } from "./components/games/KartRiderGame";
import { LoadingTransition } from "./components/LoadingTransition";
import { useLoading } from "./hooks/use-loading";
import { useEffect } from "react";

function App() {
  const { user, isLoading: isUserLoading } = useUser();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [location] = useLocation();

  useEffect(() => {
    startLoading();
    const timer = setTimeout(() => {
      stopLoading();
    }, 1500); // Show loading for at least 1.5 seconds for effect

    return () => clearTimeout(timer);
  }, [location, startLoading, stopLoading]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(40,254,20)]" />
      </div>
    );
  }

  return (
    <>
      <LoadingTransition isLoading={isLoading} />
      {user ? (
        <Switch>
          <Route path="/admin" component={AdminPage} />
          <Route path="/post/:id" component={BlogPostPage} />
          <Route path="/easter-egg/tteokbokki" component={TteokbokkiGame} />
          <Route path="/easter-egg/kart-rider" component={KartRiderGame} />
          <Route component={AdminPage} />
        </Switch>
      ) : (
        <Switch>
          <Route path="/login" component={AuthPage} />
          <Route path="/post/:id" component={BlogPostPage} />
          <Route path="/" component={HomePage} />
          <Route component={HomePage} />
        </Switch>
      )}
    </>
  );
}

export default App;
