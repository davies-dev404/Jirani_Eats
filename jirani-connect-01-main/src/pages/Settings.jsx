import React, { useState } from "react";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Shield, Save } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

const Settings = () => {
    const { setTheme, theme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);

    const handleSave = () => {
        toast.success("Preferences saved successfully");
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
                <div>
                     <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                     <p className="text-sm text-gray-500">Manage your application preferences.</p>
                </div>

                <div className="space-y-6">
                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Moon className="h-5 w-5 text-purple-500" />
                                <CardTitle>Appearance</CardTitle>
                            </div>
                            <CardDescription>Customize how the app looks on your device.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Dark Mode</Label>
                                    <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
                                </div>
                                <Switch 
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card>
                         <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-500" />
                                <CardTitle>Notifications</CardTitle>
                            </div>
                            <CardDescription>Choose what updates you want to receive.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Push Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Receive real-time alerts on your dashboard.</p>
                                </div>
                                <Switch 
                                    checked={notifications}
                                    onCheckedChange={setNotifications} 
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Alerts</Label>
                                    <p className="text-xs text-muted-foreground">Receive digest emails about activity.</p>
                                </div>
                                <Switch 
                                    checked={emailAlerts}
                                    onCheckedChange={setEmailAlerts}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security */}
                     <Card>
                         <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-500" />
                                <CardTitle>Privacy & Security</CardTitle>
                            </div>
                            <CardDescription>Manage your data sharing preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Public Profile</Label>
                                    <p className="text-xs text-muted-foreground">Allow others to see your username and badge.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} className="flex gap-2">
                            <Save className="h-4 w-4" /> Save Preferences
                        </Button>
                    </div>
                </div>
             </div>
    );
};

export default Settings;
