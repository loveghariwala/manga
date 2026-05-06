"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { User, Camera, Lock, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Password state
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passLoading, setPassLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      if (res.ok) {
        setName(data.name || "");
        setImage(data.image || "");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image must be less than 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    let updateSuccess = false;

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      if (res.ok) {
        updateSuccess = true;
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (error: any) {
      console.error("Update API error:", error);
      setMessage({ type: "error", text: "Failed to connect to the server." });
    } finally {
      setLoading(false);
    }

    // Only proceed with UI refreshes if the DB update was successful
    if (updateSuccess) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      try {
        // Update the NextAuth session safely (this often throws if the network is busy)
        await update({ name });
      } catch (e) {
        console.warn("Session update threw an error, but DB is saved.");
      }

      // Refresh the UI data directly from the DB
      await fetchProfile();
      
      try {
        router.refresh();
      } catch (e) {
        console.warn("Router refresh failed.");
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setShowPasswordModal(false);
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setPassLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 relative z-10">
        <h1 className="text-5xl font-black tracking-tighter mb-3 text-gradient inline-block">Account Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your identity and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Profile Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass p-8 rounded-3xl border-0 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:flex-row gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center">
                    {image ? (
                      <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-muted-foreground" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                    <Camera className="text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange} 
                    />
                  </label>
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-xl">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">Click the icon to upload a photo from your computer. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Username</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl bg-background border-white/5"
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-2 opacity-50">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                  <Input 
                    value={session.user?.email || ""} 
                    disabled 
                    className="rounded-xl bg-background border-white/5 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Email cannot be changed.</p>
                </div>
              </div>

              {message.text && (
                <div className={`flex items-center gap-2 p-4 rounded-2xl text-sm font-medium ${
                  message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                }`}>
                  {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto px-12 rounded-2xl font-bold h-12 shadow-lg shadow-primary/20"
              >
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Security / Activity */}
        <div className="space-y-6">
          <Card className="glass p-8 rounded-3xl border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                <Lock size={16} />
                Security
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Keep your account secure by updating your password regularly.
              </p>
              <Button 
                variant="outline" 
                className="w-full rounded-2xl font-bold py-6 border-white/5 hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setShowPasswordModal(false)}
          />
          <Card className="glass relative w-full max-w-md p-8 rounded-[2rem] border-0 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-black tracking-tighter text-gradient inline-block">Update Password</h2>
              <p className="text-sm text-muted-foreground mt-1">Secure your account with a new password.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Password</label>
                <Input 
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="rounded-xl bg-white/5 border-white/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                <Input 
                  type="password"
                  required
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="rounded-xl bg-white/5 border-white/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirm New Password</label>
                <Input 
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="rounded-xl bg-white/5 border-white/5"
                />
              </div>

              <Button 
                type="submit" 
                disabled={passLoading}
                className="w-full rounded-2xl font-bold h-14 shadow-xl shadow-primary/20"
              >
                {passLoading ? "Updating..." : "Confirm Update"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
