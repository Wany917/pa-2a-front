"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Download, Upload, ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
// ✅ NOUVEAUX IMPORTS - Architecture moderne
import { useApiCall, useApiCallWithSuccess } from '@/hooks/use-api-call';
import { livreurService } from '@/services/livreurService';
import { toast } from 'sonner';

// ✅ NOUVEAU - Interface pour utilisateur multi-rôles
interface MultiRoleUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  livreur?: {
    id: number;
    licenseDocument?: string;
    idDocument?: string;
    verificationStatus?: string;
  };
}

export default function DeliverymanEditJustificative() {
  const { t } = useLanguage()
  const [user, setUser] = useState<MultiRoleUser | null>(null);
  const [files, setFiles] = useState({
    licence: {
      current: "",
      new: null as File | null,
    },
    id: {
      current: "",
      new: null as File | null,
    },
  })
  const [isUploading, setIsUploading] = useState(false);

  // ✅ NOUVEAUX HOOKS - Architecture moderne
  const { execute: executeGetProfile, loading: profileLoading } = useApiCall<MultiRoleUser>();
  const { execute: executeUploadDocument } = useApiCallWithSuccess('Document téléchargé avec succès !');

  // ✅ NOUVEAU - Fonction de chargement des données utilisateur
  const loadUserData = async () => {
    try {
      console.log('Chargement du profil utilisateur...');
      const userResponse: MultiRoleUser = await executeGetProfile(
        livreurService.getProfile().then(res => res.data)
      );
      console.log('Profil utilisateur récupéré:', userResponse);
      setUser(userResponse);
      
      // ✅ NOUVEAU - Pré-remplir les documents existants
      setFiles({
        licence: {
          current: userResponse.livreur?.licenseDocument || '',
          new: null,
        },
        id: {
          current: userResponse.livreur?.idDocument || '',
          new: null,
        },
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // ✅ NOUVEAU - Fonction d'upload de document
  const uploadDocument = async (file: File, documentType: 'license' | 'id') => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      // ✅ CORRIGÉ - Upload de document via API
      await executeUploadDocument(
        livreurService.uploadDocument(formData)
      );
      
      // Recharger les données après upload
      await loadUserData();
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors du téléchargement du document');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection for licence
  const handleLicenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles((prev) => ({
        ...prev,
        licence: {
          ...prev.licence,
          new: file,
        },
      }))
    }
  }

  // Handle file selection for ID
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles((prev) => ({
        ...prev,
        id: {
          ...prev.id,
          new: file,
        },
      }))
    }
  }

  // ✅ NOUVEAU - Fonction de confirmation des uploads
  const handleConfirm = async () => {
    try {
      if (files.licence.new) {
        await uploadDocument(files.licence.new, 'license');
      }
      if (files.id.new) {
        await uploadDocument(files.id.new, 'id');
      }
      
      if (!files.licence.new && !files.id.new) {
        toast.info('Aucun nouveau document à télécharger');
      }
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/app_deliveryman" className="flex items-center">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
        </Link>

        <div className="flex items-center mr-20">
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">

        <div className="mb-6">
          <Link href="/app_deliveryman/edit-account" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("common.back")}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 my-8">
          <h1 className="text-2xl font-semibold text-center mb-12">
            {t("deliveryman.editJustificative.editYourJustificativePieces")}
          </h1>

          {/* Licence Section */}
          <div className="mb-10">
            <h2 className="text-center font-medium mb-4">{t("deliveryman.editJustificative.yourLicence")}</h2>

            <div className="flex items-center justify-center mb-4">
              <button 
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-l-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                disabled={!files.licence.current}
                onClick={() => {
                  if (files.licence.current) {
                    // ✅ NOUVEAU - Télécharger le document existant
                    window.open(`/api/documents/${files.licence.current}`, '_blank');
                  }
                }}
              >
                <Download className="h-5 w-5 inline mr-2" />
                {t("deliveryman.editJustificative.download")}
              </button>
              <div className="bg-gray-100 px-4 py-2 rounded-r-md flex-grow max-w-md">
                {files.licence.current || 'Aucun document'}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <label
                htmlFor="licence-upload"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-l-md hover:bg-gray-300 transition-colors cursor-pointer"
              >
                <Upload className="h-5 w-5 inline mr-2" />
                {t("deliveryman.editJustificative.upload")}
              </label>
              <div className="bg-gray-100 px-4 py-2 rounded-r-md flex-grow max-w-md text-gray-500">
                {files.licence.new ? files.licence.new.name : t("deliveryman.editJustificative.uploadNewLicence")}
              </div>
              <input id="licence-upload" type="file" accept=".pdf" onChange={handleLicenceUpload} className="hidden" />
            </div>
          </div>

          {/* ID Section */}
          <div className="mb-12">
            <h2 className="text-center font-medium mb-4">{t("deliveryman.editJustificative.yourID")}</h2>

            <div className="flex items-center justify-center mb-4">
              <button 
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-l-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                disabled={!files.id.current}
                onClick={() => {
                  if (files.id.current) {
                    // ✅ NOUVEAU - Télécharger le document existant
                    window.open(`/api/documents/${files.id.current}`, '_blank');
                  }
                }}
              >
                <Download className="h-5 w-5 inline mr-2" />
                {t("deliveryman.editJustificative.download")}
              </button>
              <div className="bg-gray-100 px-4 py-2 rounded-r-md flex-grow max-w-md">
                {files.id.current || 'Aucun document'}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <label
                htmlFor="id-upload"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-l-md hover:bg-gray-300 transition-colors cursor-pointer"
              >
                <Upload className="h-5 w-5 inline mr-2" />
                {t("deliveryman.editJustificative.upload")}
              </label>
              <div className="bg-gray-100 px-4 py-2 rounded-r-md flex-grow max-w-md text-gray-500">
                {files.id.new ? files.id.new.name : t("deliveryman.editJustificative.uploadNewID")}
              </div>
              <input id="id-upload" type="file" accept=".pdf" onChange={handleIdUpload} className="hidden" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isUploading || profileLoading || (!files.licence.new && !files.id.new)}
              className="px-8 py-2 bg-green-50 text-white rounded-md hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Téléchargement...
                </>
              ) : (
                t("deliveryman.editJustificative.confirm")
              )}
            </button>
            <Link
              href="/app_deliveryman/edit-account"
              className="px-8 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              {t("deliveryman.editJustificative.quit")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}