import { Switch, Route } from "wouter";
import { useUser } from "./hooks/use-user";
import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { Loader2 } from "lucide-react";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(40,254,20)]" />
      </div>
    );
  }

  if (user) {
    return (
      <Switch>
        <Route path="/admin" component={AdminPage} />
        <Route component={AdminPage} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <Route component={HomePage} />
    </Switch>
  );
}

export default App;