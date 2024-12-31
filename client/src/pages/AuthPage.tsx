import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useUser();
  const { toast } = useToast();

  const handleSubmit = async (isLogin: boolean) => {
    try {
      const result = await (isLogin ? login : register)({ username, password });
      if (!result.ok) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-[350px] bg-black border-[rgb(40,254,20)]">
        <CardHeader>
          <CardTitle className="text-[rgb(40,254,20)]">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent text-[rgb(40,254,20)] border-[rgb(40,254,20)]"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent text-[rgb(40,254,20)] border-[rgb(40,254,20)]"
            />
            <div className="flex space-x-2">
              <Button
                onClick={() => handleSubmit(true)}
                className="flex-1 bg-transparent text-[rgb(40,254,20)] border-[rgb(40,254,20)] hover:bg-[rgb(40,254,20)] hover:text-black"
                variant="outline"
              >
                Login
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                className="flex-1 bg-transparent text-[rgb(40,254,20)] border-[rgb(40,254,20)] hover:bg-[rgb(40,254,20)] hover:text-black"
                variant="outline"
              >
                Register
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
