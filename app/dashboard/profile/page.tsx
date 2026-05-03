"use client";

import React, { useEffect, useState } from "react";
export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/user/me');
                if (!res.ok) return;
                const data = await res.json();
                const u = data?.user ?? null;
                setUser(u);
                setName(u?.name ?? "");
                setAvatar(u?.avatar ?? u?.image ?? "");
            } catch (err) { }
        };
        load();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            const res = await fetch('/api/user/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, avatar }) });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data?.message || 'Update failed');
            } else {
                setMessage('Profile updated');
                setUser(data.user ?? user);
            }
        } catch (err) {
            setMessage('Server error');
        }
        setSaving(false);
    };

    return (
        <div className="py-6">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-lg font-semibold mb-4">Profile</h2>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium">Email</label>
                            <div className="mt-1 text-sm text-slate-700">{user?.email ?? '-'}</div>
                        </div>

                        <div>
                            <label className="text-xs font-medium">Full name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 border rounded" />
                        </div>

                        <div>
                            <label className="text-xs font-medium">Avatar URL</label>
                            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="w-full mt-1 p-2 border rounded" />
                        </div>

                        {message && <div className="text-sm text-slate-700">{message}</div>}

                        <div>
                            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
