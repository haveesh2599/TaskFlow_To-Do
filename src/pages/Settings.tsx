import { useEffect, useState, type FormEvent } from 'react';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import {
  MAX_DISPLAY_NAME_LENGTH,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type TaskCategory,
  type TaskPriority,
} from '../types/task';

export function Settings() {
  const { user, profile, updateSettings } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(
    profile?.displayName || user?.displayName || ''
  );
  const [defaultCategory, setDefaultCategory] = useState<TaskCategory>(
    profile?.defaultCategory || 'Personal'
  );
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>(
    profile?.defaultPriority || 'Medium'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setDefaultCategory(profile.defaultCategory);
      setDefaultPriority(profile.defaultPriority);
    }
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Display name is required.');
      return;
    }
    if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
      setError(`Display name cannot exceed ${MAX_DISPLAY_NAME_LENGTH} characters.`);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await updateSettings({
        displayName: trimmed,
        defaultCategory,
        defaultPriority,
      });
      showToast('Settings saved successfully.', 'success');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not update settings.';
      setError(msg);
      showToast('Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-6 space-y-5"
        noValidate
      >
        <div>
          <h2 className="text-base font-semibold text-[#252A26]">
            Profile &amp; Preferences
          </h2>
          <p className="text-sm text-[#777F78] mt-0.5">
            Update how your name appears and set defaults for new tasks.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="px-3.5 py-2.5 text-sm text-[#B3433E] bg-[#FBECEB] border border-[#EBC3C1] rounded-lg"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label
            htmlFor="settings-name"
            className="block text-sm font-medium text-[#252A26] mb-1.5"
          >
            Display name
          </label>
          <input
            id="settings-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={MAX_DISPLAY_NAME_LENGTH}
            className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:border-[#52765D] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="settings-email"
            className="block text-sm font-medium text-[#252A26] mb-1.5"
          >
            Email address
          </label>
          <input
            id="settings-email"
            type="email"
            value={user?.email || profile?.email || ''}
            disabled
            className="w-full px-3.5 py-2.5 text-sm bg-[#F6F7F4] border border-[#E5E9E4] rounded-lg text-[#777F78] cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label
              htmlFor="settings-default-category"
              className="block text-sm font-medium text-[#252A26] mb-1.5"
            >
              Default category
            </label>
            <select
              id="settings-default-category"
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value as TaskCategory)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:border-[#52765D] focus:outline-none cursor-pointer"
            >
              {TASK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="settings-default-priority"
              className="block text-sm font-medium text-[#252A26] mb-1.5"
            >
              Default priority
            </label>
            <select
              id="settings-default-priority"
              value={defaultPriority}
              onChange={(e) => setDefaultPriority(e.target.value as TaskPriority)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:border-[#52765D] focus:outline-none cursor-pointer"
            >
              {TASK_PRIORITIES.map((pri) => (
                <option key={pri} value={pri}>
                  {pri}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-[#52765D] hover:bg-[#42634C] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
