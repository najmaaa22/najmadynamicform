"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import api from "@/lib/api";

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

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert(
        "Email and password are required"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      const token =
        res.data?.token ||
        res.data?.data?.token;

      const user =
        res.data?.user ||
        res.data?.data?.user;

      if (!token) {
        alert("Token not received");
        return;
      }

      localStorage.setItem(
        "token",
        token
      );
      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      alert("Login successful ");

    
      router.push("/forms");
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Login failed "
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl rounded-3xl border-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl text-center font-bold">
            Welcome Back
          </CardTitle>

          <CardDescription className="text-center text-slate-500">
            Login to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Email
            </label>

            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Password
            </label>

            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </Button>

          <p className="text-sm text-slate-500 text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-black font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}