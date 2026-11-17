import React, { useState } from 'react';
import { Database, CheckCircle2, ShieldAlert, Cloud, HardDrive, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  isFirestoreEnabledByUser,
  setFirestoreEnabledByUser,
  isFirebaseConfigured,
  getFirestoreInstance,
} from '../../services/firebase';
import type { FirebaseConfigParams } from '../../services/firebase';
import { fetchNouns, fetchVerbs, fetchSentences, resetLocalStorageToDefaults } from '../../services/vocabularyService';
import { collection, addDoc, getDocs } from 'firebase/firestore';

interface FirestoreConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: () => void;
}

export const FirestoreConfigModal: React.FC<FirestoreConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChange,
}) => {
  const [config, setConfig] = useState<FirebaseConfigParams>(() => getFirebaseConfig());
  const [enabled, setEnabled] = useState<boolean>(() => isFirestoreEnabledByUser());
  const [testStatus, setTestStatus] = useState<{ message: string; success?: boolean } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  const handleSave = () => {
    saveFirebaseConfig(config);
    setFirestoreEnabledByUser(enabled);
    onConfigChange();
    setTestStatus({
      success: true,
      message: enabled
        ? 'Settings saved! Firestore mode enabled.'
        : 'Settings saved! Running in Local Storage mode.',
    });
  };

  const handleTestConnection = async () => {
    saveFirebaseConfig(config);
    setTestStatus({ message: 'Testing Firestore connection to cloud...' });

    if (!config.apiKey || !config.projectId) {
      setTestStatus({
        success: false,
        message: 'Missing API Key or Project ID. Please provide Firebase credentials.',
      });
      return;
    }

    try {
      const db = getFirestoreInstance();
      if (!db) {
        setTestStatus({
          success: false,
          message: 'Unable to initialize Firebase. Please check configuration.',
        });
        return;
      }

      // Probe Firestore with a real read
      await getDocs(collection(db, 'nouns'));

      setTestStatus({
        success: true,
        message: 'Connected successfully to your Firestore database!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      let userFriendly = msg;
      if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
        userFriendly = 'Permission denied: Please update your Firestore Security Rules in Firebase Console to allow read/write.';
      } else if (msg.includes('API key not valid')) {
        userFriendly = 'Invalid API Key: Please verify the Web API Key in your Firebase Project Settings.';
      } else if (msg.includes('project')) {
        userFriendly = `Project error: Please verify project ID "${config.projectId}" exists in Firebase Console.`;
      }
      setTestStatus({
        success: false,
        message: userFriendly,
      });
    }
  };

  const handleSyncToFirestore = async () => {
    if (!enabled || !isFirebaseConfigured()) {
      alert('Please enable and configure Firestore first before syncing.');
      return;
    }

    const confirmSync = window.confirm(
      'Do you want to upload all local vocabulary (nouns, verbs, sentences) to your live Firestore database?'
    );
    if (!confirmSync) return;

    setIsMigrating(true);
    setMigrationStatus('Uploading vocabulary entries to Firestore...');

    try {
      const db = getFirestoreInstance();
      if (!db) throw new Error('Firestore is not available.');

      const [nouns, verbs, sentences] = await Promise.all([
        fetchNouns(),
        fetchVerbs(),
        fetchSentences(),
      ]);

      let count = 0;
      for (const n of nouns) {
        await addDoc(collection(db, 'nouns'), {
          article: n.article,
          german: n.german,
          plural: n.plural,
          english: n.english,
          createdAt: n.createdAt || Date.now(),
        });
        count++;
      }
      for (const v of verbs) {
        await addDoc(collection(db, 'verbs'), {
          german: v.german,
          english: v.english,
          conjugation: v.conjugation || '',
          createdAt: v.createdAt || Date.now(),
        });
        count++;
      }
      for (const s of sentences) {
        await addDoc(collection(db, 'sentences'), {
          german: s.german,
          english: s.english,
          remark: s.remark || '',
          createdAt: s.createdAt || Date.now(),
        });
        count++;
      }

      setMigrationStatus(`Successfully uploaded ${count} items to Firestore!`);
      onConfigChange();
    } catch (err: unknown) {
      setMigrationStatus(
        'Upload failed: ' + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsMigrating(false);
    }
  };

  const handleResetLocal = () => {
    if (window.confirm('Reset local storage data back to default sample German vocabulary?')) {
      resetLocalStorageToDefaults();
      onConfigChange();
      alert('Local storage has been reset to defaults.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Database & Storage Settings" maxWidth="lg">
      <div className="space-y-6">
        {/* Mode Selector Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  enabled && isFirebaseConfigured()
                    ? 'bg-red-100 text-red-700'
                    : 'bg-zinc-100 text-zinc-900'
                }`}
              >
                {enabled && isFirebaseConfigured() ? (
                  <Cloud className="w-5 h-5 text-red-600" />
                ) : (
                  <HardDrive className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {enabled && isFirebaseConfigured()
                    ? 'Active: Firebase Firestore'
                    : 'Active: Local Storage (Offline / In-Browser)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {enabled && isFirebaseConfigured()
                    ? 'Connected to your cloud Firestore database.'
                    : 'Vocabulary is safely stored in your browser without requiring internet.'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {enabled && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-900 text-xs rounded-lg border border-amber-200 font-medium">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <span>
                <strong>User Notice:</strong> Firestore mode requires valid credentials.
                Make sure Firestore security rules in your Firebase Console allow read/write.
              </span>
            </div>
          )}
        </div>

        {/* Credentials Form */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-red-600" />
            Firebase Firestore Credentials
          </h5>
          <p className="text-xs text-slate-500">
            You can fill these fields directly or define them in your <code>.env</code> file (e.g.{' '}
            <code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_PROJECT_ID</code>).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">API Key</label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Project ID</label>
              <input
                type="text"
                value={config.projectId || ''}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                placeholder="german-words-bank"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Auth Domain</label>
              <input
                type="text"
                value={config.authDomain || ''}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                placeholder="project.firebaseapp.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">App ID</label>
              <input
                type="text"
                value={config.appId || ''}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                placeholder="1:123456789:web:abcdef"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Status message */}
        {testStatus && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              testStatus.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {testStatus.success && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            <span>{testStatus.message}</span>
          </div>
        )}

        {migrationStatus && (
          <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-lg border border-amber-200 font-medium">
            {migrationStatus}
          </div>
        )}

        {/* Buttons / Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Test Connection
            </button>
            <button
              type="button"
              disabled={isMigrating || !enabled}
              onClick={handleSyncToFirestore}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isMigrating ? 'animate-spin' : ''}`} />
              Push Local to Firestore
            </button>
            <button
              type="button"
              onClick={handleResetLocal}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Reset Seed Data
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
