import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return false;
      }

      // Request all necessary permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: true,
            provideAppNotificationSettings: true,
            allowProvisional: true,
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied!');
        return false;
      }

      console.log('✅ Notification permissions granted');

      // For Android, set up a high-priority notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('task-reminders', {
          name: 'Task Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
        });

        console.log('✅ Android notification channel created');
      }

      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(
    todoId: string,
    title: string,
    body: string,
    scheduledTime: Date
  ): Promise<string | null> {
    try {
      console.log('🔄 Scheduling notification:', {
        todoId,
        title,
        scheduledTime: scheduledTime.toISOString(),
        currentTime: new Date().toISOString(),
        timeUntilNotification: Math.floor((scheduledTime.getTime() - Date.now()) / 1000 / 60),
      });

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('❌ Permission not granted');
        return null;
      }

      // Cancel any existing notification for this todo
      await this.cancelNotification(todoId);

      // Check if the scheduled time is in the future
      if (scheduledTime <= new Date()) {
        console.log('⚠️ Scheduled time is in the past, adjusting to 30 seconds from now for testing...');
        scheduledTime = new Date(Date.now() + 30000); // 30 seconds from now for testing
      }

      const notificationContent = {
        title: '⏰ Task Reminder',
        body: `${title}${body ? `\n${body}` : ''}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: false,
        autoDismiss: false,
        data: { 
          todoId,
          type: 'task-reminder',
          actions: ['snooze', 'complete', 'dismiss']
        },
        categoryIdentifier: 'task-reminder',
      };

      // Add action buttons for iOS
      if (Platform.OS === 'ios') {
        await Notifications.setNotificationCategoryAsync('task-reminder', [
          {
            identifier: 'snooze',
            buttonTitle: 'Snooze 5min',
            options: {
              opensAppToForeground: false,
            },
          },
          {
            identifier: 'complete',
            buttonTitle: 'Mark Complete',
            options: {
              opensAppToForeground: false,
            },
          },
          {
            identifier: 'dismiss',
            buttonTitle: 'Dismiss',
            options: {
              opensAppToForeground: false,
            },
          },
        ]);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          seconds: Math.max(1, Math.floor((scheduledTime.getTime() - Date.now()) / 1000)),
        },
        identifier: todoId,
      });

      // For immediate testing, use presentNotificationAsync
      if (scheduledTime <= new Date(Date.now() + 60000)) {
        console.log('⚡ Presenting notification immediately for testing');
        await Notifications.presentNotificationAsync({
          title: notificationContent.title,
          body: notificationContent.body,
          data: notificationContent.data,
        });
      }

      console.log('✅ Notification scheduled successfully:', {
        notificationId,
        scheduledTime: scheduledTime.toISOString(),
        channelId: Platform.OS === 'android' ? 'task-reminders' : 'default'
      });

      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(todoId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(todoId);
      console.log('Notification cancelled for todo:', todoId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  static calculateReminderTime(dueDate: Date, reminderTime: string): Date {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const reminderDate = new Date(dueDate);
    reminderDate.setHours(hours, minutes, 0, 0);
    
    // If the reminder time is after the current time on the due date, schedule for that day
    // Otherwise, schedule for the day before (if due date is tomorrow or later)
    const now = new Date();
    if (reminderDate <= now) {
      // If the reminder time has passed today, schedule for tomorrow (if due date allows)
      if (dueDate.toDateString() !== now.toDateString()) {
        reminderDate.setDate(reminderDate.getDate() - 1);
      }
    }
    
    return reminderDate;
  }

  static formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  static parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  }
}
