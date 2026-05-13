"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
 CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const register = async () => {
    try {
      if (!name || !email || !password) {
        alert("All fields are required");
        return;
      }

      setLoading(true);

      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful ");

      router.push("/login");
    } catch (err: any) {
      console.log("REGISTER ERROR:", err);

      alert(
        err?.response?.data?.message ||
          "Register failed "
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            Register
          </CardTitle>

          <CardDescription className="text-center">
            Create your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          
          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={register}
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}