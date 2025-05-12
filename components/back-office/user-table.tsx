"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-context";

interface User {
  id: number;
  name: string;
  firstName: string;
  email: string;
  phone: string;
  status: string;
  statusColor: string;
  justificatives: string[];
}

interface UserTableProps {
  data: User[];
  showJustificative: boolean;
  onStatusClick: (user: User) => void;
  onDelete: (userId: number) => void;
}

export function UserTable({ data, showJustificative, onStatusClick, onDelete }: UserTableProps) {
  const { t } = useLanguage();
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.userName")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.userFirstName")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.userEmail")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.userPhone")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.userStatus")}</th>
            {showJustificative && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.userJustificative")}</th>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.action")}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.firstName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Button
                  variant="ghost"
                  className={`px-3 py-1 rounded-full ${user.statusColor}`}
                  onClick={() => onStatusClick(user)}
                >
                  {user.status}
                </Button>
              </td>
              {showJustificative && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.justificatives.length} document(s)
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(user.id)}
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
