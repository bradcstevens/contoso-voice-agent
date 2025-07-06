import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { Badge } from '../../atoms/Badge/Badge';
import { FormField } from '../FormField/FormField';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { Label } from '../../atoms/Label/Label';
import { ScreenReaderText } from '../../atoms/ScreenReaderText/ScreenReaderText';
import styles from './UserProfile.module.css';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator' | 'guest';
  status: 'online' | 'offline' | 'away' | 'busy';
  joinDate: Date;
  lastActive?: Date;
  preferences?: {
    voiceEnabled: boolean;
    cameraEnabled: boolean;
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

export interface UserStats {
  sessionsCount: number;
  totalDuration: number; // seconds
  interactionsCount: number;
  averageSessionDuration: number; // seconds
  favoriteFeatures: string[];
  achievementLevel: number; // 1-10
}

export interface UserProfileProps {
  /** User profile data */
  user?: UserProfileData;
  /** User statistics */
  stats?: UserStats;
  /** Whether the profile is editable */
  editable?: boolean;
  /** Whether to show detailed statistics */
  showStats?: boolean;
  /** Whether to show preferences */
  showPreferences?: boolean;
  /** Whether to show activity status */
  showActivity?: boolean;
  /** Whether to show role badge */
  showRole?: boolean;
  /** Whether the profile is loading */
  loading?: boolean;
  /** Whether profile update is in progress */
  saving?: boolean;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Available roles for role editing */
  availableRoles?: Array<{ value: string; label: string; }>;
  /** Available languages */
  availableLanguages?: Array<{ code: string; name: string; }>;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Layout orientation */
  layout?: 'vertical' | 'horizontal' | 'compact' | 'card';
  /** Display variant */
  variant?: 'default' | 'minimal' | 'detailed' | 'professional';
  /** Callback when profile is updated */
  onProfileUpdate?: (updates: Partial<UserProfileData>) => void;
  /** Callback when avatar is changed */
  onAvatarChange?: (file: File) => void;
  /** Callback when status is changed */
  onStatusChange?: (status: UserProfileData['status']) => void;
  /** Callback when preferences are updated */
  onPreferencesUpdate?: (preferences: UserProfileData['preferences']) => void;
  /** Callback when profile is saved */
  onSave?: () => void;
  /** Callback when editing is cancelled */
  onCancel?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * UserProfile Molecule
 * 
 * Comprehensive user management interface combining Avatar, Badge, FormField,
 * and user controls for complete profile management.
 * 
 * Features:
 * - User avatar display with upload functionality
 * - Role and status badges with editing capabilities
 * - Profile information editing (name, email, preferences)
 * - User statistics and activity tracking
 * - Multi-modal preferences (voice, camera, notifications)
 * - Status management (online, offline, away, busy)
 * - Achievement and engagement metrics
 * - Professional profile layouts
 * - Real-time status updates
 * - WCAG AAA accessibility compliance
 * - Multiple layout options (vertical, horizontal, compact, card)
 * - Responsive design with mobile optimization
 * - Screen reader optimization for profile changes
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    status: 'online',
    joinDate: new Date('2023-01-15'),
    lastActive: new Date(),
    preferences: {
      voiceEnabled: true,
      cameraEnabled: true,
      notifications: true,
      theme: 'auto',
      language: 'en-US'
    }
  },
  stats = {
    sessionsCount: 42,
    totalDuration: 15600, // 4.33 hours
    interactionsCount: 156,
    averageSessionDuration: 371, // ~6 minutes
    favoriteFeatures: ['Voice Chat', 'Visual Search'],
    achievementLevel: 3
  },
  editable = false,
  showStats = true,
  showPreferences = false,
  showActivity = true,
  showRole = true,
  loading = false,
  saving = false,
  error = '',
  success = '',
  availableRoles = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Administrator' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'guest', label: 'Guest' }
  ],
  availableLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' }
  ],
  size = 'medium',
  layout = 'vertical',
  variant = 'default',
  onProfileUpdate,
  onAvatarChange,
  onStatusChange,
  onPreferencesUpdate,
  onSave,
  onCancel,
  className = '',
  testId = 'user-profile'
}) => {
  // Internal state
  const [localUser, setLocalUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedPreferences, setExpandedPreferences] = useState(showPreferences);
  const [expandedStats, setExpandedStats] = useState(showStats);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Size mapping helper
  const mapSize = (profileSize: 'small' | 'medium' | 'large'): 'sm' | 'md' | 'lg' => {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' } as const;
    return sizeMap[profileSize];
  };
  
  const atomSize = mapSize(size);
  
  // Update local user when props change
  useEffect(() => {
    setLocalUser(user);
  }, [user]);
  
  // Handle field updates
  const handleFieldUpdate = useCallback((field: string, value: any) => {
    const updatedUser = { ...localUser, [field]: value };
    setLocalUser(updatedUser);
    
    let message = '';
    switch (field) {
      case 'name':
        message = `Name updated to ${value}`;
        break;
      case 'email':
        message = `Email updated to ${value}`;
        break;
      case 'role':
        message = `Role changed to ${value}`;
        break;
      case 'status':
        message = `Status changed to ${value}`;
        break;
      default:
        message = `${field} updated`;
    }
    
    setStatusMessage(message);
    onProfileUpdate?.(updatedUser);
  }, [localUser, onProfileUpdate]);
  
  // Handle preferences update
  const handlePreferencesUpdate = useCallback((key: string, value: any) => {
    const updatedPreferences = { ...localUser.preferences, [key]: value };
    const updatedUser = { ...localUser, preferences: updatedPreferences };
    setLocalUser(updatedUser);
    
    let message = '';
    switch (key) {
      case 'voiceEnabled':
        message = `Voice ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'cameraEnabled':
        message = `Camera ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'notifications':
        message = `Notifications ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'theme':
        message = `Theme set to ${value}`;
        break;
      case 'language':
        message = `Language set to ${value}`;
        break;
      default:
        message = `${key} preference updated`;
    }
    
    setStatusMessage(message);
    onPreferencesUpdate?.(updatedPreferences);
  }, [localUser, onPreferencesUpdate]);
  
  // Handle status change
  const handleStatusChange = useCallback((status: UserProfileData['status']) => {
    handleFieldUpdate('status', status);
    onStatusChange?.(status);
  }, [handleFieldUpdate, onStatusChange]);
  
  // Handle avatar change
  const handleAvatarChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStatusMessage('Uploading new avatar...');
      onAvatarChange?.(file);
    }
  }, [onAvatarChange]);
  
  // Handle edit toggle
  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      setIsEditing(false);
      setStatusMessage('Edit mode disabled');
      onCancel?.();
    } else {
      setIsEditing(true);
      setStatusMessage('Edit mode enabled');
    }
  }, [isEditing, onCancel]);
  
  // Handle save
  const handleSave = useCallback(() => {
    setIsEditing(false);
    setStatusMessage('Profile saved successfully');
    onSave?.();
  }, [onSave]);
  
  // Format duration
  const formatDuration = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, []);
  
  // Get status color
  const getStatusColor = useCallback((status: UserProfileData['status']) => {
    switch (status) {
      case 'online': return 'success';
      case 'away': return 'warning';
      case 'busy': return 'danger';
      case 'offline': return 'neutral';
      default: return 'neutral';
    }
  }, []);
  
  // Get role color
  const getRoleColor = useCallback((role: UserProfileData['role']) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'moderator': return 'warning';
      case 'user': return 'info';
      case 'guest': return 'neutral';
      default: return 'neutral';
    }
  }, []);
  
  return (
    <div 
      className={`${styles.userProfile} ${styles[size]} ${styles[layout]} ${styles[variant]} ${className}`}
      data-testid={testId}
      data-status={localUser.status}
      data-editing={isEditing}
    >
      {/* Screen reader announcements */}
      <ScreenReaderText 
        type="status"
        priority="medium"
        atomic={true}
        immediate={true}
        modality="multimodal"
      >
        {statusMessage}
      </ScreenReaderText>
      
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className={styles.hiddenFileInput}
        data-testid={`${testId}-file-input`}
      />
      
      <div className={styles.profileContainer}>
        {/* Header Section */}
        <div className={styles.header}>
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <Avatar
                src={localUser.avatar}
                alt={`${localUser.name}'s avatar`}
                size={atomSize}
                status={localUser.status}
                showStatus={showActivity}
                className={styles.avatar}
              />
              
              {editable && (
                <button
                  className={styles.avatarUpload}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || saving}
                  data-testid={`${testId}-avatar-upload`}
                >
                  <Icon name="camera" size="sm" />
                </button>
              )}
            </div>
            
            {showActivity && (
              <div className={styles.statusControls}>
                {editable ? (
                  <select
                    value={localUser.status}
                    onChange={(e) => handleStatusChange(e.target.value as UserProfileData['status'])}
                    disabled={loading || saving}
                    className={styles.statusSelect}
                    data-testid={`${testId}-status-select`}
                  >
                    <option value="online">Online</option>
                    <option value="away">Away</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                ) : (
                  <Badge 
                    variant={getStatusColor(localUser.status) as any} 
                    size="sm"
                    className={styles.statusBadge}
                  >
                    {localUser.status.charAt(0).toUpperCase() + localUser.status.slice(1)}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className={styles.profileInfo}>
            <div className={styles.nameSection}>
              {isEditing ? (
                <FormField
                  label="Name"
                  type="text"
                  value={localUser.name}
                  onChange={(e) => handleFieldUpdate('name', e.target.value)}
                  disabled={loading || saving}
                  size={size}
                  required
                  testId={`${testId}-name-field`}
                />
              ) : (
                <h2 className={styles.userName}>{localUser.name}</h2>
              )}
              
              {showRole && (
                <div className={styles.roleBadge}>
                  {editable && isEditing ? (
                    <select
                      value={localUser.role}
                      onChange={(e) => handleFieldUpdate('role', e.target.value)}
                      disabled={loading || saving}
                      className={styles.roleSelect}
                      data-testid={`${testId}-role-select`}
                    >
                      {availableRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge 
                      variant={getRoleColor(localUser.role) as any} 
                      size="sm"
                    >
                      {localUser.role.charAt(0).toUpperCase() + localUser.role.slice(1)}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className={styles.emailSection}>
              {isEditing ? (
                <FormField
                  label="Email"
                  type="email"
                  value={localUser.email}
                  onChange={(e) => handleFieldUpdate('email', e.target.value)}
                  disabled={loading || saving}
                  size={size}
                  required
                  testId={`${testId}-email-field`}
                />
              ) : (
                <span className={styles.userEmail}>{localUser.email}</span>
              )}
            </div>
            
            {showActivity && (
              <div className={styles.activityInfo}>
                <div className={styles.activityItem}>
                  <Icon name="calendar" size="xs" className={styles.activityIcon} />
                  <span className={styles.activityText}>
                    Joined {localUser.joinDate.toLocaleDateString()}
                  </span>
                </div>
                
                {localUser.lastActive && (
                  <div className={styles.activityItem}>
                    <Icon name="clock" size="xs" className={styles.activityIcon} />
                    <span className={styles.activityText}>
                      Last active {localUser.lastActive.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className={styles.actions}>
            {editable && (
              <>
                {isEditing ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={loading || saving}
                      loading={saving}
                      data-testid={`${testId}-save`}
                    >
                      <Icon name="check" size="sm" />
                      Save
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditToggle}
                      disabled={loading || saving}
                      data-testid={`${testId}-cancel`}
                    >
                      <Icon name="x" size="sm" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditToggle}
                    disabled={loading}
                    data-testid={`${testId}-edit`}
                  >
                    <Icon name="edit" size="sm" />
                    Edit
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Statistics Section */}
        {(showStats || expandedStats) && stats && (
          <div className={styles.statsSection}>
            <button
              className={styles.sectionHeader}
              onClick={() => setExpandedStats(!expandedStats)}
              aria-expanded={expandedStats}
              data-testid={`${testId}-stats-toggle`}
            >
              <Icon name="bar-chart" size="sm" className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>Statistics</span>
              <Icon name={expandedStats ? 'chevron-down' : 'chevron-right'} size="sm" />
            </button>
            
            {expandedStats && (
              <div className={styles.statsContent}>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{stats.sessionsCount}</span>
                    <span className={styles.statLabel}>Sessions</span>
                  </div>
                  
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatDuration(stats.totalDuration)}</span>
                    <span className={styles.statLabel}>Total Time</span>
                  </div>
                  
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{stats.interactionsCount}</span>
                    <span className={styles.statLabel}>Interactions</span>
                  </div>
                  
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatDuration(stats.averageSessionDuration)}</span>
                    <span className={styles.statLabel}>Avg Session</span>
                  </div>
                </div>
                
                {stats.favoriteFeatures.length > 0 && (
                  <div className={styles.favoriteFeatures}>
                    <Label size="sm" className={styles.featuresLabel}>
                      Favorite Features:
                    </Label>
                    <div className={styles.featuresGrid}>
                      {stats.favoriteFeatures.map((feature, index) => (
                        <Badge key={index} variant="info" size="sm">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className={styles.achievementLevel}>
                  <Label size="sm" className={styles.achievementLabel}>
                    Achievement Level: {stats.achievementLevel}/10
                  </Label>
                  <div className={styles.achievementBar}>
                    <div 
                      className={styles.achievementProgress}
                      style={{ width: `${(stats.achievementLevel / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Preferences Section */}
        {(showPreferences || expandedPreferences) && localUser.preferences && (
          <div className={styles.preferencesSection}>
            <button
              className={styles.sectionHeader}
              onClick={() => setExpandedPreferences(!expandedPreferences)}
              aria-expanded={expandedPreferences}
              data-testid={`${testId}-preferences-toggle`}
            >
              <Icon name="settings" size="sm" className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>Preferences</span>
              <Icon name={expandedPreferences ? 'chevron-down' : 'chevron-right'} size="sm" />
            </button>
            
            {expandedPreferences && (
              <div className={styles.preferencesContent}>
                <div className={styles.preferencesGrid}>
                  <label className={styles.preferenceItem}>
                    <input
                      type="checkbox"
                      checked={localUser.preferences.voiceEnabled}
                      onChange={(e) => handlePreferencesUpdate('voiceEnabled', e.target.checked)}
                      disabled={!editable || loading || saving}
                      data-testid={`${testId}-voice-enabled`}
                    />
                    <span className={styles.preferenceText}>Voice Enabled</span>
                  </label>
                  
                  <label className={styles.preferenceItem}>
                    <input
                      type="checkbox"
                      checked={localUser.preferences.cameraEnabled}
                      onChange={(e) => handlePreferencesUpdate('cameraEnabled', e.target.checked)}
                      disabled={!editable || loading || saving}
                      data-testid={`${testId}-camera-enabled`}
                    />
                    <span className={styles.preferenceText}>Camera Enabled</span>
                  </label>
                  
                  <label className={styles.preferenceItem}>
                    <input
                      type="checkbox"
                      checked={localUser.preferences.notifications}
                      onChange={(e) => handlePreferencesUpdate('notifications', e.target.checked)}
                      disabled={!editable || loading || saving}
                      data-testid={`${testId}-notifications`}
                    />
                    <span className={styles.preferenceText}>Notifications</span>
                  </label>
                </div>
                
                <div className={styles.selectPreferences}>
                  <FormField
                    label="Theme"
                    type="select"
                    value={localUser.preferences.theme}
                    onChange={(e) => handlePreferencesUpdate('theme', e.target.value)}
                    disabled={!editable || loading || saving}
                    size={size}
                    testId={`${testId}-theme`}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </FormField>
                  
                  <FormField
                    label="Language"
                    type="select"
                    value={localUser.preferences.language}
                    onChange={(e) => handlePreferencesUpdate('language', e.target.value)}
                    disabled={!editable || loading || saving}
                    size={size}
                    testId={`${testId}-language`}
                  >
                    {availableLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </FormField>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Messages */}
        {(error || success) && (
          <div className={styles.messages}>
            {error && (
              <div className={styles.message} data-type="error">
                <Icon name="alert-circle" size="sm" className={styles.messageIcon} />
                <span className={styles.messageText}>{error}</span>
              </div>
            )}
            
            {success && (
              <div className={styles.message} data-type="success">
                <Icon name="check-circle" size="sm" className={styles.messageIcon} />
                <span className={styles.messageText}>{success}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 