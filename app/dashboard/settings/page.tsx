"use client";

import React, { useState } from "react";

export default function SettingsPage() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        if (newPassword !== confirmPassword) {
            setMessage('New passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setMessage('New password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/user/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPassword, newPassword }) });
            const data = await res.json();
            if (!res.ok) setMessage(data?.message || 'Failed');
            else setMessage('Password updated successfully');
        } catch (err) {
            setMessage('Server error');
        }
        setLoading(false);
    };

    return (
        <div className="py-6">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold mb-4">Settings</h2>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium">Old password</label>
                            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full mt-1 p-2 border rounded" />
                        </div>

                        <div>
                            <label className="text-xs font-medium">New password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full mt-1 p-2 border rounded" />
                        </div>

                        <div>
                            <label className="text-xs font-medium">Confirm new password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full mt-1 p-2 border rounded" />
                        </div>

                        {message && <div className="text-sm text-slate-700">{message}</div>}

                        <div>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Updating...' : 'Change password'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
