import { useNavigate, useSearchParams } from "react-router-dom";
import { Settings as SettingsIcon, Bell, Lock, Languages, Moon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";

const settingsSections = [
  { id: "general", icon: SettingsIcon, label: "General Settings" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "privacy", icon: Lock, label: "Privacy and Security" },
  { id: "language", icon: Languages, label: "Language" }
];

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") || "general";
  const { theme, setTheme } = useTheme();

  const setActiveSection = (section: string) => {
    setSearchParams({ section });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Settings Sidebar */}
      <aside className="w-72 border-r border-border p-6">
        <Button
          variant="ghost"
          className="mb-6 -ml-2 text-foreground hover:bg-muted"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chat
        </Button>

        <h2 className="text-xl font-semibold text-foreground mb-6">Settings</h2>

        <nav className="space-y-1">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </nav>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-foreground" />
              <Label htmlFor="dark-mode" className="text-sm font-medium text-foreground cursor-pointer">
                Dark Mode
              </Label>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>
      </aside>

      {/* Settings Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeSection === "general" && <GeneralSettings />}
        {activeSection === "notifications" && <NotificationSettings />}
        {activeSection === "privacy" && <PrivacySettings />}
        {activeSection === "language" && <LanguageSettings />}
      </main>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">General Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your account settings and preferences</p>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Display Name</Label>
              <input
                type="text"
                defaultValue="Savannah Nguyen"
                className="w-full mt-2 px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">Status</Label>
              <input
                type="text"
                defaultValue="Product Designer"
                className="w-full mt-2 px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">Bio</Label>
              <textarea
                rows={3}
                defaultValue="I'm a product designer passionate about creating beautiful user experiences."
                className="w-full mt-2 px-4 py-2 rounded-lg bg-muted border border-border text-foreground resize-none"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Chat Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Show online status</Label>
                <p className="text-sm text-muted-foreground">Let others see when you're online</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Read receipts</Label>
                <p className="text-sm text-muted-foreground">Send read receipts to message senders</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Typing indicators</Label>
                <p className="text-sm text-muted-foreground">Show when you're typing</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Notifications</h1>
      <p className="text-muted-foreground mb-8">Choose what notifications you receive</p>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Message Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Direct messages</Label>
                <p className="text-sm text-muted-foreground">Get notified for new direct messages</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Group messages</Label>
                <p className="text-sm text-muted-foreground">Get notified for group messages</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Mentions</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Sound & Vibration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Message sounds</Label>
                <p className="text-sm text-muted-foreground">Play sound for incoming messages</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Notification sound</Label>
                <p className="text-sm text-muted-foreground">Play sound for notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Do Not Disturb</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Enable Do Not Disturb</Label>
                <p className="text-sm text-muted-foreground">Silence all notifications</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Privacy and Security</h1>
      <p className="text-muted-foreground mb-8">Control who can see your information and contact you</p>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Privacy</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground mb-2 block">Who can see my profile photo</Label>
              <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground">
                <option>Everyone</option>
                <option>My contacts</option>
                <option>Nobody</option>
              </select>
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Who can see my status</Label>
              <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground">
                <option>Everyone</option>
                <option>My contacts</option>
                <option>Nobody</option>
              </select>
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Who can add me to groups</Label>
              <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground">
                <option>Everyone</option>
                <option>My contacts</option>
                <option>Nobody</option>
              </select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Two-factor authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">End-to-end encryption</Label>
                <p className="text-sm text-muted-foreground">Encrypt all your messages</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Blocked Users</h3>
          <p className="text-sm text-muted-foreground mb-4">You haven't blocked anyone yet</p>
          <Button variant="outline" className="border-border text-foreground hover:bg-muted">
            View Blocked Users
          </Button>
        </div>

        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function LanguageSettings() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Language</h1>
      <p className="text-muted-foreground mb-8">Select your preferred language</p>

      <div className="space-y-6">
        <div>
          <Label className="text-foreground mb-3 block">App Language</Label>
          <div className="space-y-2">
            {[
              { code: "en", name: "English", native: "English" },
              { code: "es", name: "Spanish", native: "Español" },
              { code: "fr", name: "French", native: "Français" },
              { code: "de", name: "German", native: "Deutsch" },
              { code: "it", name: "Italian", native: "Italiano" },
              { code: "pt", name: "Portuguese", native: "Português" },
              { code: "ru", name: "Russian", native: "Русский" },
              { code: "ja", name: "Japanese", native: "日本語" },
              { code: "ko", name: "Korean", native: "한국어" },
              { code: "zh", name: "Chinese", native: "中文" },
              { code: "ar", name: "Arabic", native: "العربية" },
              { code: "hi", name: "Hindi", native: "हिन्दी" },
            ].map((lang) => (
              <label
                key={lang.code}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="language"
                  value={lang.code}
                  defaultChecked={lang.code === "en"}
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="text-foreground font-medium">{lang.name}</p>
                  <p className="text-sm text-muted-foreground">{lang.native}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Regional Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground mb-2 block">Date format</Label>
              <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Time format</Label>
              <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground">
                <option>12-hour</option>
                <option>24-hour</option>
              </select>
            </div>
          </div>
        </div>

        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
