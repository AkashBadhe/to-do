import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
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

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }

      // For Android, set the notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
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
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Cancel any existing notification for this todo
      await this.cancelNotification(todoId);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: `${title}${body ? ` - ${body}` : ''}`,
          sound: true, // Use default system sound
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { todoId },
        },
        trigger: {
          date: scheduledTime,
          channelId: 'default',
        },
        identifier: todoId, // Use todoId as identifier for easy cancellation
      });

      console.log('Notification scheduled:', { notificationId, scheduledTime });
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
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
