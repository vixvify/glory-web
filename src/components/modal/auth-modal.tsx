"use client";

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUserSchema, loginUserSchema } from "@/core/schema/auth";
import { User } from "@/core/domain/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegisterMutation, useLoginMutation } from "@/hooks/use-auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
};

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();

  const activeSchema = isSignUp
    ? registerUserSchema
    : registerUserSchema.extend({ name: z.string().optional() });

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(activeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: AuthFormValues) => {
    setError("");

    try {
      if (isSignUp) {
        const user = await registerMutation.mutateAsync({
          name: data.name!,
          email: data.email,
          password: data.password,
        });
        onLoginSuccess(user);
      } else {
        const user = await loginMutation.mutateAsync({
          email: data.email,
          password: data.password,
        });
        onLoginSuccess(user);
      }
      onClose();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    reset({
      name: "",
      email: "",
      password: "",
    });
    setError("");
    setIsSignUp(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 animate-scale-up z-10 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer"
        >
          <CloseIcon className="text-xl" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {isSignUp ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
          </h2>
          <p className="text-xs text-zinc-400">
            {isSignUp ? "เข้าร่วม ThaiFlix เพื่อให้คะแนนและรีวิว" : "ยินดีต้อนรับกลับสู่ ThaiFlix"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs rounded-lg animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          {isSignUp && (
            <Input
              label="ชื่อเต็ม"
              placeholder="เช่น สมชาย Dev"
              icon={<PersonIcon className="text-zinc-500 text-lg" />}
              error={errors.name?.message}
              {...register("name")}
            />
          )}

          <Input
            label="ที่อยู่อีเมล"
            placeholder="you@example.com"
            type="email"
            icon={<EmailIcon className="text-zinc-500 text-lg" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="รหัสผ่าน"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            icon={<LockIcon className="text-zinc-500 text-lg" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-500 hover:text-white cursor-pointer flex items-center justify-center"
              >
                {showPassword ? (
                  <VisibilityOffIcon className="text-lg" />
                ) : (
                  <VisibilityIcon className="text-lg" />
                )}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            isLoading={isSubmitting || registerMutation.isPending || loginMutation.isPending}
            className="w-full mt-2"
          >
            {isSignUp ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </Button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-zinc-800/80"></div>
          <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Or</span>
          <div className="flex-grow border-t border-zinc-800/80"></div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              reset({
                name: "",
                email: "",
                password: "",
              });
            }}
            className="text-xs text-zinc-400 hover:text-brand transition-colors cursor-pointer"
          >
            {isSignUp ? "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ" : "ใหม่กับ ThaiFlix? สมัครสมาชิกเลย"}
          </button>
        </div>
      </div>
    </div>
  );
}
