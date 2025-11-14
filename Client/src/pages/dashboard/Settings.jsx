import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/components/ui/notification";

export default function Settings() {
  const base_url = import.meta.env.VITE_BACKEND_URL || "/api";
  const { success, error } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState({ name: "", image: "" });
  const fileRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        // fetch profile
        const me = await axios.get(`${base_url}/me`, { withCredentials: true });
  setUser(me.data);
  setName(me.data?.name || "");
        setEmail(me.data?.email || "");
        setAvatar(me.data?.image || "");
        setSelectedModel({ name: me.data?.aiModelName || "", image: me.data?.aiModelImage || "" });
      } catch (e) {
        error("Failed to load profile");
      }
      try {
        const res = await axios.get(`${base_url}/settings/ai-models`, { withCredentials: true });
        setModels(res.data || []);
      } catch (e) {
        // fallback static list
        const base = "https://avatar.iran.liara.run/public";
        setModels([
          { name: "Arista-PlayAI", image: `${base}/23` },
          { name: "Atlas-PlayAI", image: `${base}/24` },
          { name: "Basil-PlayAI", image: `${base}/25` },
          { name: "Briggs-PlayAI", image: `${base}/26` },
          { name: "Calum-PlayAI", image: `${base}/27` },
          { name: "Celeste-PlayAI", image: `${base}/28` },
          { name: "Cheyenne-PlayAI", image: `${base}/29` },
          { name: "Chip-PlayAI", image: `${base}/30` },
          { name: "Cillian-PlayAI", image: `${base}/31` },
          { name: "Deedee-PlayAI", image: `${base}/32` },
          { name: "Fritz-PlayAI", image: `${base}/33` },
          { name: "Gail-PlayAI", image: `${base}/34` },
          { name: "Indigo-PlayAI", image: `${base}/35` },
          { name: "Mamaw-PlayAI", image: `${base}/36` },
          { name: "Mason-PlayAI", image: `${base}/37` },
          { name: "Mikail-PlayAI", image: `${base}/38` },
          { name: "Mitch-PlayAI", image: `${base}/39` },
          { name: "Quinn-PlayAI", image: `${base}/40` },
          { name: "Thunder-PlayAI", image: `${base}/41` },
        ]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [base_url, error]);

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    try {
      const res = await axios.post(`${base_url}/settings/avatar`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatar(res.data?.image || avatar);
      success("Profile image updated");
    } catch (e) {
      error(e?.response?.data?.message || "Failed to upload image");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSaveEmail = async () => {
    try {
      await axios.patch(`${base_url}/settings/email`, { email }, { withCredentials: true });
      success("Email updated");
    } catch (e) {
      error(e?.response?.data?.message || "Failed to update email");
    }
  };

  const onSaveName = async () => {
    try {
      await axios.patch(`${base_url}/settings/name`, { name }, { withCredentials: true });
      success("Name updated");
    } catch (e) {
      error(e?.response?.data?.message || "Failed to update name");
    }
  };

  const onSavePassword = async () => {
    if (!currentPassword || !newPassword) return error("Enter current and new password");
    if (newPassword !== confirmPassword) return error("Passwords do not match");
    try {
      await axios.patch(`${base_url}/settings/password`, { currentPassword, newPassword }, { withCredentials: true });
      success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      error(e?.response?.data?.message || "Failed to update password");
    }
  };

  const onSaveModel = async () => {
    try {
      await axios.patch(`${base_url}/settings/ai-model`, selectedModel, { withCredentials: true });
      success("AI model saved");
    } catch (e) {
      error(e?.response?.data?.message || "Failed to save model");
    }
  };

  const onDeleteAccount = async () => {
    const confirm1 = window.confirm("Delete your account? This will permanently remove your data, posts, and interviews.");
    if (!confirm1) return;
    try {
      await axios.delete(`${base_url}/settings/account`, { withCredentials: true });
      success("Account deleted");
      navigate("/login");
    } catch (e) {
      error(e?.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="h-full w-full px-6 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your profile, security, and AI preferences.</p>
        </div>

        {/* Glassmorphic wrapper */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile card */}
          <Card className="col-span-1 border-gray-200 bg-white/60 backdrop-blur-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border border-gray-200 shadow-sm">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                <Button onClick={onPickFile} className="bg-[#DFFF00] text-black hover:bg-[#c7e600]">Change photo</Button>

                <div className="mt-2 w-full space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="flex gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/70" />
                    <Button onClick={onSaveName} className="bg-[#DFFF00] text-black hover:bg-[#c7e600]">Save</Button>
                  </div>
                </div>

                <div className="mt-2 w-full space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/70" />
                    <Button onClick={onSaveEmail} className="bg-[#DFFF00] text-black hover:bg-[#c7e600]">Save</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security card */}
          <Card className="col-span-1 border-gray-200 bg-white/60 backdrop-blur-xl shadow-md">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <Label>Current password</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-white/70" />
                </div>
                <div>
                  <Label>New password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/70" />
                </div>
                <div>
                  <Label>Confirm new password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/70" />
                </div>
                <div>
                  <Button onClick={onSavePassword} className="mt-1 w-full bg-[#DFFF00] text-black hover:bg-[#c7e600]">Update password</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Model selection card */}
          <Card className="col-span-1 border-gray-200 bg-white/60 backdrop-blur-xl shadow-md">
            <CardContent className="p-6">
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700">Preferred AI Model</div>
                <div className="text-xs text-gray-500">Choose the interviewer model used in your sessions.</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {models.map((m) => {
                  const active = selectedModel.name === m.name;
                  return (
                    <button
                      type="button"
                      key={m.name}
                      onClick={() => setSelectedModel({ name: m.name, image: m.image })}
                      className={`rounded-xl border p-3 text-left transition ${
                        active ? 'border-[#DFFF00] bg-[#ffffcc] shadow-[0_0_0_3px_rgba(223,255,0,0.15)]' : 'border-gray-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md border border-gray-200">
                          <img src={m.image} alt={m.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="text-sm font-medium text-gray-800">{m.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <Button onClick={onSaveModel} className="w-full bg-[#DFFF00] text-black hover:bg-[#c7e600]">Save Model</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Danger zone */}
        <div className="mt-6">
          <Card className="border-red-200 bg-white/60 backdrop-blur-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-red-700">Delete account</div>
                  <div className="text-xs text-gray-600 max-w-xl mt-1">
                    This action permanently deletes your profile, interviews, posts, and comments. This cannot be undone.
                  </div>
                </div>
                <Button variant="destructive" onClick={onDeleteAccount}>Delete account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
